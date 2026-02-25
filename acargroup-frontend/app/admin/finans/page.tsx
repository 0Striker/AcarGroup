"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface Transaction {
    id: number;
    customerId?: number;
    customerName?: string;
    jobId?: number;
    jobTitle?: string;
    type: number; // 0=Income, 1=Expense
    amount: number;
    description: string;
    referenceNumber?: string;
    notes?: string;
    vatRate?: number;
    vatAmount?: number;
    isVatIncluded: boolean;
    currency: string;
    paymentType?: string;
    externalCustomerName?: string;
    externalJobTitle?: string;
    createdAt: string;
}

interface CustomerBalance {
    customerId: number;
    customerName: string;
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    lastUpdated: string;
}

interface Customer {
    id: number;
    fullName: string;
}

interface Job {
    id: number;
    title: string;
    customerId: number;
    createdAt: string;
    estimatedCost: number;
    actualCost?: number;
}

export default function AdminFinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customerBalances, setCustomerBalances] = useState<CustomerBalance[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [formMode, setFormMode] = useState<"standard" | "external">("standard");

    // Form data
    const [formData, setFormData] = useState({
        customerId: "",
        jobId: "",
        externalCustomerName: "",
        externalJobTitle: "",
        type: 1, // Default to Expense (charge)
        amount: "",
        description: "",
        referenceNumber: "",
        vatRate: "",
        isVatIncluded: false,
        currency: "TRY",
        paymentType: "",
    });

    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            // Fetch transactions
            const txRes = await fetch(`${API_BASE_URL}/api/finance/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Fetch customers
            const custRes = await fetch(`${API_BASE_URL}/api/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Fetch jobs (for dropdown)
            const jobsRes = await fetch(`${API_BASE_URL}/api/jobs`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let transactionsData: Transaction[] = [];

            if (txRes.ok) {
                transactionsData = await txRes.json();
                setTransactions(transactionsData);

                // Calculate stats
                const income = transactionsData.filter(t => t.type === 0).reduce((acc, t) => acc + t.amount, 0);
                const expense = transactionsData.filter(t => t.type === 1).reduce((acc, t) => acc + t.amount, 0);

                setStats({
                    totalIncome: income,
                    totalExpense: expense,
                    netProfit: income - expense,
                });
            }

            if (custRes.ok) {
                const customersData: Customer[] = await custRes.json();
                setCustomers(customersData);

                // Fetch balances for each customer
                const balances = await Promise.all(
                    customersData.map(async (customer) => {
                        try {
                            const balRes = await fetch(
                                `${API_BASE_URL}/api/finance/customer/${customer.id}/balance`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (balRes.ok) {
                                return await balRes.json();
                            }
                        } catch (error) {
                            console.error(`Error fetching balance for customer ${customer.id}:`, error);
                        }
                        return null;
                    })
                );

                // Calculate External/General Transactions Balance
                const externalTransactions = transactionsData.filter(t => !t.customerId);
                if (externalTransactions.length > 0) {
                    const extIncome = externalTransactions.filter(t => t.type === 0).reduce((acc, t) => acc + t.amount, 0);
                    const extExpense = externalTransactions.filter(t => t.type === 1).reduce((acc, t) => acc + t.amount, 0);

                    balances.push({
                        customerId: -1, // Special ID for External
                        customerName: "Harici İşlemler",
                        totalBalance: extExpense - extIncome,
                        totalIncome: extIncome,
                        totalExpense: extExpense,
                        lastUpdated: new Date().toISOString()
                    });
                }

                setCustomerBalances(balances.filter((b) => b !== null) as CustomerBalance[]);
            }

            if (jobsRes.ok) {
                const jobsData: Job[] = await jobsRes.json();
                setJobs(jobsData);
            }
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const amount = parseFloat(formData.amount);
            const vatRate = formData.vatRate ? parseFloat(formData.vatRate) : null;
            let vatAmount = null;

            if (vatRate !== null) {
                if (formData.isVatIncluded) {
                    // KDV dahil: Extract VAT from amount
                    vatAmount = (amount * vatRate) / (1 + vatRate);
                } else {
                    // KDV hariç: Calculate VAT on top
                    vatAmount = amount * vatRate;
                }
            }

            const payload = {
                customerId: formMode === "standard" ? (formData.customerId ? parseInt(formData.customerId) : null) : null,
                jobId: formMode === "standard" ? (formData.jobId ? parseInt(formData.jobId) : null) : null,
                externalCustomerName: formMode === "external" ? formData.externalCustomerName : null,
                externalJobTitle: formMode === "external" ? formData.externalJobTitle : null,
                type: formData.type,
                amount: amount,
                description: formData.description,
                referenceNumber: formData.referenceNumber || null,
                notes: null,
                vatRate: vatRate,
                vatAmount: vatAmount,
                isVatIncluded: formData.isVatIncluded,
                currency: formData.currency,
                paymentType: formData.paymentType || null,
            };

            const response = await fetch(`${API_BASE_URL}/api/finance/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({
                    customerId: "",
                    jobId: "",
                    externalCustomerName: "",
                    externalJobTitle: "",
                    type: 1,
                    amount: "",
                    description: "",
                    referenceNumber: "",
                    vatRate: "",
                    isVatIncluded: false,
                    currency: "TRY",
                    paymentType: "",
                });
                fetchData(); // Refresh data
                alert("İşlem başarıyla eklendi!");
            } else {
                alert("İşlem eklenemedi.");
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Bir hata oluştu.");
        }
    };

    // Apply filters
    const filteredTransactions = transactions.filter((tx) => {
        if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        if (selectedCustomer && tx.customerId !== parseInt(selectedCustomer)) {
            return false;
        }
        if (selectedType && tx.type !== parseInt(selectedType)) {
            return false;
        }
        if (dateFrom && new Date(tx.createdAt) < new Date(dateFrom)) {
            return false;
        }
        if (dateTo && new Date(tx.createdAt) > new Date(dateTo)) {
            return false;
        }
        return true;
    });

    if (loading) return <div className="p-6">Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Finansal Yönetim</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setFormMode("external");
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        + Harici İşlem Ekle
                    </button>
                    <button
                        onClick={() => {
                            setFormMode("standard");
                            setShowForm(!showForm);
                        }}
                        className={`px-4 py-2 text-white rounded-lg transition ${showForm && formMode === "standard" ? "bg-slate-500 hover:bg-slate-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    >
                        {showForm && formMode === "standard" ? "İptal" : "+ Yeni İşlem Ekle"}
                    </button>
                </div>
            </div>

            {/* New Transaction Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            {formMode === "standard" ? "Yeni İşlem Ekle" : "Harici İşlem Ekle"}
                        </h2>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formMode === "standard" ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri (Opsiyonel)</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    >
                                        <option value="">Müşteri Seçiniz</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">İş (Opsiyonel)</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={formData.jobId}
                                        onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                                    >
                                        <option value="">İş Seçiniz (İsteğe Bağlı)</option>
                                        {jobs
                                            .filter(j => !formData.customerId || j.customerId === parseInt(formData.customerId))
                                            .map((j) => (
                                                <option key={j.id} value={j.id}>
                                                    {j.title} ({new Date(j.createdAt).toLocaleDateString('tr-TR')} - {(j.actualCost || j.estimatedCost).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri Adı *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={formData.externalCustomerName}
                                        onChange={(e) => setFormData({ ...formData, externalCustomerName: e.target.value })}
                                        placeholder="Örn: Ahmet Yılmaz"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Yapılan İş *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={formData.externalJobTitle}
                                        onChange={(e) => setFormData({ ...formData, externalJobTitle: e.target.value })}
                                        placeholder="Örn: Bilgisayar Tamiri"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">İşlem Tipi *</label>
                            <select
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                            >
                                <option value={1}>Gider (Müşteriye Ücret Tahakkuku)</option>
                                <option value={0}>Gelir (Müşteriden Ödeme Alındı)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TRY) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama *</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Para Birimi *</label>
                            <select
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="TRY">TRY (Türk Lirası)</option>
                                <option value="USD">USD (Amerikan Doları)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="GBP">GBP (İngiliz Sterlini)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Türü</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.paymentType}
                                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                            >
                                <option value="">Seçiniz</option>
                                <option value="Mail Order">Mail Order</option>
                                <option value="Havale-EFT">Havale-EFT</option>
                                <option value="POS">POS</option>
                                <option value="Nakit">Nakit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">KDV Oranı (%)</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.vatRate}
                                onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
                            >
                                <option value="">KDV Yok</option>
                                <option value="0.01">%1</option>
                                <option value="0.10">%10</option>
                                <option value="0.20">%20</option>
                            </select>
                        </div>

                        <div className="flex items-center pt-6">
                            <input
                                type="checkbox"
                                id="isVatIncluded"
                                className="h-4 w-4 text-emerald-600 rounded"
                                checked={formData.isVatIncluded}
                                onChange={(e) => setFormData({ ...formData, isVatIncluded: e.target.checked })}
                            />
                            <label htmlFor="isVatIncluded" className="ml-2 text-sm font-medium text-slate-700">
                                KDV Dahil
                            </label>
                        </div>

                        {formData.vatRate && formData.amount && (
                            <div className="md:col-span-2 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">
                                    {formData.isVatIncluded ? (
                                        <>
                                            <strong>KDV Dahil:</strong> Tutar içinde {(parseFloat(formData.amount) * parseFloat(formData.vatRate) / (1 + parseFloat(formData.vatRate))).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency} KDV var
                                        </>
                                    ) : (
                                        <>
                                            <strong>KDV Hariç:</strong> {(parseFloat(formData.amount) * parseFloat(formData.vatRate)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency} KDV eklenecek (Toplam: {(parseFloat(formData.amount) * (1 + parseFloat(formData.vatRate))).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency})
                                        </>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Referans No (Fatura/Makbuz)</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.referenceNumber}
                                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
                            >
                                İşlemi Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Toplam Gelir</p>
                    <p className="text-3xl font-bold text-emerald-600">
                        {stats.totalIncome.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Toplam Gider</p>
                    <p className="text-3xl font-bold text-red-600">
                        {stats.totalExpense.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Net Kâr</p>
                    <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? "text-slate-800" : "text-red-600"}`}>
                        {stats.netProfit.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
            </div>

            {/* Customer Balances Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Müşteri Bakiyeleri</h3>
                </div>
                <div className="divide-y divide-slate-200">
                    {customerBalances
                        .sort((a, b) => Math.abs(b.totalBalance) - Math.abs(a.totalBalance))
                        .map((cb) => (
                            <div key={cb.customerId} className="hover:bg-slate-50 transition">
                                {/* Compact Row - Click to expand */}
                                <div
                                    onClick={() => setExpandedCustomer(expandedCustomer === cb.customerId ? null : cb.customerId)}
                                    className="flex items-center justify-between px-6 py-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg
                                            className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedCustomer === cb.customerId ? 'rotate-90' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="font-medium text-slate-900">{cb.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`text-lg font-bold ${cb.totalBalance > 0
                                                ? 'text-red-600'
                                                : 'text-slate-400'
                                                }`}
                                        >
                                            {cb.totalBalance > 0
                                                ? `${cb.totalBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} Alacak`
                                                : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedCustomer === cb.customerId && (
                                    <div className="px-6 pb-4 pt-2 bg-slate-50/50 border-t border-slate-100">
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-1">Toplam Borç</p>
                                                <p className="text-lg font-semibold text-red-600">
                                                    {cb.totalExpense.toLocaleString('tr-TR', {
                                                        style: 'currency',
                                                        currency: 'TRY',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-1">Ödenen</p>
                                                <p className="text-lg font-semibold text-emerald-600">
                                                    {cb.totalIncome.toLocaleString('tr-TR', {
                                                        style: 'currency',
                                                        currency: 'TRY',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-1">Son Güncelleme</p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {new Date(cb.lastUpdated).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Filters for this customer */}
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-3">İşlem Filtreleri</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Ara</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Açıklama ara..."
                                                        className="w-full border rounded-lg px-2 py-1.5 text-slate-900 bg-white text-sm"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Tip</label>
                                                    <select
                                                        className="w-full border rounded-lg px-2 py-1.5 text-slate-900 bg-white text-sm"
                                                        value={selectedType}
                                                        onChange={(e) => setSelectedType(e.target.value)}
                                                    >
                                                        <option value="">Tümü</option>
                                                        <option value="0">Gelir</option>
                                                        <option value="1">Gider</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Başlangıç</label>
                                                    <input
                                                        type="date"
                                                        className="w-full border rounded-lg px-2 py-1.5 text-slate-900 bg-white text-sm"
                                                        value={dateFrom}
                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Bitiş</label>
                                                    <input
                                                        type="date"
                                                        className="w-full border rounded-lg px-2 py-1.5 text-slate-900 bg-white text-sm"
                                                        value={dateTo}
                                                        onChange={(e) => setDateTo(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transaction history for this customer */}
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                                <h4 className="text-sm font-semibold text-slate-700">İşlem Geçmişi</h4>
                                                <span className="text-xs text-slate-600">
                                                    {transactions.filter(tx => {
                                                        if (cb.customerId === -1) {
                                                            // For External Transactions: include if customerId is null
                                                            if (tx.customerId) return false;
                                                        } else {
                                                            // Standard: match customerId
                                                            if (tx.customerId !== cb.customerId) return false;
                                                        }

                                                        if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                                                        if (selectedType && tx.type !== parseInt(selectedType)) return false;
                                                        if (dateFrom && new Date(tx.createdAt) < new Date(dateFrom)) return false;
                                                        if (dateTo && new Date(tx.createdAt) > new Date(dateTo)) return false;
                                                        return true;
                                                    }).length} kayıt
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                                        <tr>
                                                            <th className="px-4 py-2 text-xs font-semibold text-slate-600">Tarih</th>
                                                            <th className="px-4 py-2 text-xs font-semibold text-slate-600">Açıklama</th>
                                                            <th className="px-4 py-2 text-xs font-semibold text-slate-600">Tür</th>
                                                            <th className="px-4 py-2 text-xs font-semibold text-slate-600 text-right">Tutar</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {transactions
                                                            .filter(tx => {
                                                                if (cb.customerId === -1) {
                                                                    if (tx.customerId) return false;
                                                                } else {
                                                                    if (tx.customerId !== cb.customerId) return false;
                                                                }

                                                                if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                                                                if (selectedType && tx.type !== parseInt(selectedType)) return false;
                                                                if (dateFrom && new Date(tx.createdAt) < new Date(dateFrom)) return false;
                                                                if (dateTo && new Date(tx.createdAt) > new Date(dateTo)) return false;
                                                                return true;
                                                            })
                                                            .map((tx) => (
                                                                <tr key={tx.id} className="hover:bg-slate-50">
                                                                    <td className="px-4 py-2 text-slate-600 text-xs">
                                                                        <div>{new Date(tx.createdAt).toLocaleDateString('tr-TR')}</div>
                                                                        <div className="text-xs text-slate-400">
                                                                            {new Date(tx.createdAt).toLocaleTimeString('tr-TR', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-slate-600 text-sm">
                                                                        <div className="font-medium text-slate-900">
                                                                            {tx.externalCustomerName || (tx.customerName && tx.customerName !== "Harici/Genel" ? tx.customerName : tx.description)}
                                                                        </div>
                                                                        {/* Description shown as subtext if we have a name */}
                                                                        {(tx.externalCustomerName || (tx.customerName && tx.customerName !== "Harici/Genel")) && (
                                                                            <div className="text-xs text-slate-500">{tx.description}</div>
                                                                        )}

                                                                        {tx.jobTitle && <div className="text-xs text-slate-400 mt-1">İş: {tx.jobTitle}</div>}
                                                                        {tx.externalJobTitle && <div className="text-xs text-slate-400 mt-1">İş: {tx.externalJobTitle}</div>}
                                                                        {tx.referenceNumber && (
                                                                            <div className="text-xs text-slate-400 mt-1">Ref: {tx.referenceNumber}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        <span
                                                                            className={`px-2 py-0.5 text-xs rounded-full ${tx.type === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                                                }`}
                                                                        >
                                                                            {tx.type === 0 ? 'Gelir' : 'Gider'}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`px-4 py-2 font-medium text-right text-sm ${tx.type === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {tx.type === 0 ? '+' : '-'}
                                                                        {tx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
