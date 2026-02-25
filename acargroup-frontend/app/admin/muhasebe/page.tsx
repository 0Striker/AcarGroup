"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Calculator } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface AccountingExpense {
    id: number;
    category: number; // 0=Business, 1=Personal
    description: string;
    amount: number;
    paymentDate: string;
    isRecurring: boolean;
    recurringPeriod?: number; // 0=Monthly, 1=Quarterly, 2=Yearly
    notes?: string;
    referenceNumber?: string;
    createdAt: string;
}

interface CompanyPayment {
    id: number;
    companyName: string;
    amount: number;
    paymentDate: string;
    description: string;
    paymentMethod?: string;
    referenceNumber?: string;
    notes?: string;
    category?: string;
    createdAt: string;
}

export default function MuhasebePage() {
    const [expenses, setExpenses] = useState<AccountingExpense[]>([]);
    const [companyPayments, setCompanyPayments] = useState<CompanyPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"business" | "personal" | "company" | "calendar">("business");
    const [showForm, setShowForm] = useState(false);
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<AccountingExpense | null>(null);

    const [formData, setFormData] = useState({
        category: 0,
        description: "",
        amount: "",
        paymentDate: "",
        isRecurring: false,
        recurringPeriod: 0,
        notes: "",
        referenceNumber: "",
    });

    const [companyFormData, setCompanyFormData] = useState({
        companyName: "",
        description: "",
        amount: "",
        paymentDate: "",
        paymentMethod: "",
        category: "",
        notes: "",
        referenceNumber: "",
    });

    const [stats, setStats] = useState({
        totalBusiness: 0,
        totalPersonal: 0,
        totalCompany: 0,
        monthlyBusiness: 0,
        monthlyPersonal: 0,
        monthlyCompany: 0,
    });

    useEffect(() => {
        fetchExpenses();
        fetchCompanyPayments();
    }, []);

    const fetchExpenses = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/accounting/expenses`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: AccountingExpense[] = await response.json();
                setExpenses(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyPayments = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/company-payments`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: CompanyPayment[] = await response.json();
                setCompanyPayments(data);
            }
        } catch (error) {
            console.error("Error fetching company payments:", error);
        }
    };

    const calculateStats = (data: AccountingExpense[]) => {
        const totalBusiness = data.filter(e => e.category === 0).reduce((sum, e) => sum + e.amount, 0);
        const totalPersonal = data.filter(e => e.category === 1).reduce((sum, e) => sum + e.amount, 0);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyBusiness = data
            .filter(e => {
                const date = new Date(e.paymentDate);
                return e.category === 0 && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const monthlyPersonal = data
            .filter(e => {
                const date = new Date(e.paymentDate);
                return e.category === 1 && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        setStats({
            totalBusiness,
            totalPersonal,
            totalCompany: companyPayments.reduce((sum, cp) => sum + cp.amount, 0),
            monthlyBusiness,
            monthlyPersonal,
            monthlyCompany: companyPayments.filter(cp => {
                const date = new Date(cp.paymentDate);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            }).reduce((sum, cp) => sum + cp.amount, 0)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const payload = {
                category: formData.category,
                description: formData.description,
                amount: parseFloat(formData.amount),
                paymentDate: new Date(formData.paymentDate).toISOString(),
                isRecurring: formData.isRecurring,
                recurringPeriod: formData.isRecurring ? formData.recurringPeriod : null,
                notes: formData.notes || null,
                referenceNumber: formData.referenceNumber || null,
            };

            const response = await fetch(`${API_BASE_URL}/api/accounting/expenses${editingExpense ? `/${editingExpense.id}` : ""}`, {
                method: editingExpense ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setShowForm(false);
                setEditingExpense(null);
                setFormData({
                    category: 0,
                    description: "",
                    amount: "",
                    paymentDate: "",
                    isRecurring: false,
                    recurringPeriod: 0,
                    notes: "",
                    referenceNumber: "",
                });
                fetchExpenses();
                alert(editingExpense ? "Gider başarıyla güncellendi!" : "Gider başarıyla eklendi!");
            } else {
                alert("Gider eklenemedi.");
            }
        } catch (error) {
            console.error("Error creating expense:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu gideri silmek istediğinizden emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/accounting/expenses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchExpenses();
                alert("Gider silindi.");
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const getCategoryLabel = (category: number) => (category === 0 ? "Dükkan" : "Kişisel");
    const getRecurringLabel = (period?: number) => {
        if (period === undefined) return "-";
        return ["Aylık", "3 Aylık", "Yıllık"][period];
    };

    const filteredExpenses = expenses.filter(e => {
        if (activeTab === "business") return e.category === 0;
        if (activeTab === "personal") return e.category === 1;
        return true; // calendar shows all
    });

    // Calendar view: group by month
    const groupByMonth = (data: AccountingExpense[]) => {
        const grouped: { [key: string]: AccountingExpense[] } = {};
        data.forEach(expense => {
            const month = new Date(expense.paymentDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
            if (!grouped[month]) grouped[month] = [];
            grouped[month].push(expense);
        });
        return grouped;
    };

    if (loading) return <div className="p-6">Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Calculator className="w-6 h-6" />
                        Muhasebe
                    </h1>
                    <p className="text-sm text-slate-600">Dükkan, kişisel ve firma giderleri</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowForm(!showForm); setShowCompanyForm(false); if (!showForm) setEditingExpense(null); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? "İptal" : "+ Gider Ekle"}
                    </button>
                    <button
                        onClick={() => { setShowCompanyForm(!showCompanyForm); setShowForm(false); }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                        {showCompanyForm ? "İptal" : "+ Firma Ödemesi"}
                    </button>
                </div>
            </div>

            {/* Expense Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-semibold mb-4">{editingExpense ? "Gider Düzenle" : "Yeni Gider Ekle"}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-2">Kategori *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={0}
                                        checked={formData.category === 0}
                                        onChange={() => setFormData({ ...formData, category: 0 })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-slate-900">Dükkan</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={1}
                                        checked={formData.category === 1}
                                        onChange={() => setFormData({ ...formData, category: 1 })}
                                        className="text-emerald-600"
                                    />
                                    <span className="text-slate-900">Kişisel</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Açıklama *</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Tutar (TRY) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Ödeme Tarihi *</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm font-medium text-slate-900">Tekrarlayan Ödeme</span>
                            </label>
                        </div>

                        {formData.isRecurring && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Periyot</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                    value={formData.recurringPeriod}
                                    onChange={(e) => setFormData({ ...formData, recurringPeriod: parseInt(e.target.value) })}
                                >
                                    <option value={0}>Aylık</option>
                                    <option value={1}>3 Aylık</option>
                                    <option value={2}>Yıllık</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Referans No</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.referenceNumber}
                                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Notlar</label>
                            <textarea
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                {editingExpense ? "Gideri Güncelle" : "Gideri Kaydet"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Company Payment Form */}
            {showCompanyForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Firma Ödemesi Ekle</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const token = getToken();
                        if (!token) return;

                        try {
                            const payload = {
                                companyName: companyFormData.companyName,
                                description: companyFormData.description,
                                amount: parseFloat(companyFormData.amount),
                                paymentDate: new Date(companyFormData.paymentDate).toISOString(),
                                paymentMethod: companyFormData.paymentMethod || null,
                                category: companyFormData.category || null,
                                notes: companyFormData.notes || null,
                                referenceNumber: companyFormData.referenceNumber || null,
                            };

                            const response = await fetch(`${API_BASE_URL}/api/admin/company-payments`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                            });

                            if (response.ok) {
                                setShowCompanyForm(false);
                                setCompanyFormData({
                                    companyName: "",
                                    description: "",
                                    amount: "",
                                    paymentDate: "",
                                    paymentMethod: "",
                                    category: "",
                                    notes: "",
                                    referenceNumber: "",
                                });
                                fetchCompanyPayments();
                                alert("Firma ödemesi başarıyla eklendi!");
                            } else {
                                alert("Firma ödemesi eklenemedi.");
                            }
                        } catch (error) {
                            console.error("Error creating company payment:", error);
                            alert("Bir hata oluştu.");
                        }
                    }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Firma Adı *</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.companyName}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, companyName: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Açıklama *</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.description}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Tutar (TRY) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.amount}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, amount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Ödeme Tarihi *</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.paymentDate}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, paymentDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Ödeme Yöntemi</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.paymentMethod}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, paymentMethod: e.target.value })}
                            >
                                <option value="">Seçiniz</option>
                                <option value="Nakit">Nakit</option>
                                <option value="Havale">Havale</option>
                                <option value="Kredi Kartı">Kredi Kartı</option>
                                <option value="Çek">Çek</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Kategori</label>
                            <input
                                type="text"
                                placeholder="Örn: Elektrik, Su, Internet"
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white placeholder-gray-500"
                                value={companyFormData.category}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, category: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Referans No</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.referenceNumber}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, referenceNumber: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-900 mb-1">Notlar</label>
                            <textarea
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={companyFormData.notes}
                                onChange={(e) => setCompanyFormData({ ...companyFormData, notes: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Firma Ödemesini Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Toplam Dükkan Gideri</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.totalBusiness.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Toplam Kişisel Gider</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {stats.totalPersonal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Toplam Firma Ödeme</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {stats.totalCompany.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Bu Ay Dükkan</p>
                    <p className="text-2xl font-bold text-blue-500">
                        {stats.monthlyBusiness.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">Bu Ay Kişisel</p>
                    <p className="text-2xl font-bold text-emerald-500">
                        {stats.monthlyPersonal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("business")}
                    className={`px-4 py-2 font-medium transition ${activeTab === "business"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    Dükkan Giderleri
                </button>
                <button
                    onClick={() => setActiveTab("personal")}
                    className={`px-4 py-2 font-medium transition ${activeTab === "personal"
                        ? "text-emerald-600 border-b-2 border-emerald-600"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    Kişisel Giderler
                </button>
                <button
                    onClick={() => setActiveTab("company")}
                    className={`px-4 py-2 font-medium transition ${activeTab === "company"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    Firma Ödemeleri
                </button>
                <button
                    onClick={() => setActiveTab("calendar")}
                    className={`px-4 py-2 font-medium transition ${activeTab === "calendar"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    Takvim Görünümü
                </button>
            </div>

            {/* Content */}
            {
                activeTab === "calendar" ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-700 mb-4">Ödeme Takvimi</h3>
                        {Object.entries(groupByMonth(expenses)).map(([month, monthExpenses]) => (
                            <div key={month} className="mb-6">
                                <h4 className="font-semibold text-slate-800 mb-3">{month}</h4>
                                <div className="space-y-2">
                                    {monthExpenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className={`p-3 rounded-lg border-l-4 ${expense.category === 0
                                                ? "bg-blue-50 border-blue-500"
                                                : "bg-emerald-50 border-emerald-500"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-slate-900">{expense.description}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {new Date(expense.paymentDate).toLocaleDateString("tr-TR")} •{" "}
                                                        {getCategoryLabel(expense.category)}
                                                        {expense.isRecurring && ` • ${getRecurringLabel(expense.recurringPeriod)}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900">
                                                        {expense.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === "company" ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-semibold text-slate-700">Firma Ödemeleri</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Tarih</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Firma</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Açıklama</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Kategori</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Tutar</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {companyPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(payment.paymentDate).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{payment.companyName}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div>{payment.description}</div>
                                                {payment.paymentMethod && (
                                                    <div className="text-xs text-slate-400 mt-1">{payment.paymentMethod}</div>
                                                )}
                                                {payment.referenceNumber && (
                                                    <div className="text-xs text-slate-400 mt-1">Ref: {payment.referenceNumber}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {payment.category || "-"}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-purple-600">
                                                {payment.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm("Bu firma ödemesini silmek istediğinizden emin misiniz?")) return;
                                                        const token = getToken();
                                                        if (!token) return;
                                                        try {
                                                            const response = await fetch(`${API_BASE_URL}/api/admin/company-payments/${payment.id}`, {
                                                                method: "DELETE",
                                                                headers: { Authorization: `Bearer ${token}` },
                                                            });
                                                            if (response.ok) {
                                                                fetchCompanyPayments();
                                                                alert("Firma ödemesi silindi.");
                                                            }
                                                        } catch (error) {
                                                            console.error("Error deleting company payment:", error);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Tarih</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Açıklama</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Tutar</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">Tekrarlayan</th>
                                        <th className="px-6 py-3 text-sm font-semibold text-slate-600">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(expense.paymentDate).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">{expense.description}</p>
                                                    {expense.referenceNumber && (
                                                        <p className="text-xs text-slate-500">Ref: {expense.referenceNumber}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {expense.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {expense.isRecurring ? getRecurringLabel(expense.recurringPeriod) : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingExpense(expense);
                                                            setFormData({
                                                                category: expense.category,
                                                                description: expense.description,
                                                                amount: expense.amount.toString(),
                                                                paymentDate: new Date(expense.paymentDate).toISOString().split('T')[0],
                                                                isRecurring: expense.isRecurring,
                                                                recurringPeriod: expense.recurringPeriod || 0,
                                                                notes: expense.notes || "",
                                                                referenceNumber: expense.referenceNumber || "",
                                                            });
                                                            setShowForm(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
