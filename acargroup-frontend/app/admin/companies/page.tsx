"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Company = {
    id: number;
    name: string;
    authorizedPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    sector?: string;
    notes?: string;
    stampNumber?: string;
    loginName?: string;
    loginCode?: string;
    loginPassword?: string;
    shippingCompanyId?: number;
    shippingCompanyName?: string;
};

type ShippingCompany = {
    id: number;
    name: string;
};

export default function CompaniesPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: "",
        authorizedPerson: "",
        phone: "",
        email: "",
        address: "",
        sector: "",
        notes: "",
        stampNumber: "",
        loginName: "",
        loginCode: "",
        loginPassword: "",
        shippingCompanyName: ""
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setIsLoading(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/companies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCompanies(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const url = editingCompany
                ? `${API_BASE_URL}/api/admin/companies/${editingCompany.id}`
                : `${API_BASE_URL}/api/admin/companies`;

            const method = editingCompany ? "PUT" : "POST";

            const payload = {
                ...formData,
                shippingCompanyName: formData.shippingCompanyName
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ type: "success", text: `Firma başarıyla ${editingCompany ? "güncellendi" : "eklendi"}.` });
                setIsModalOpen(false);
                fetchCompanies();
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } else {
                setMessage({ type: "error", text: "İşlem sırasında bir hata oluştu." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Bağlantı hatası." });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu firmayı silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/companies/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setCompanies(companies.filter(c => c.id !== id));
                setMessage({ type: "success", text: "Firma silindi." });
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                authorizedPerson: company.authorizedPerson || "",
                phone: company.phone || "",
                email: company.email || "",
                address: company.address || "",
                sector: company.sector || "",
                notes: company.notes || "",
                stampNumber: company.stampNumber || "",
                loginName: company.loginName || "",
                loginCode: company.loginCode || "",
                loginPassword: company.loginPassword || "",
                shippingCompanyName: company.shippingCompanyName || ""
            });
        } else {
            setEditingCompany(null);
            setFormData({
                name: "",
                authorizedPerson: "",
                phone: "",
                email: "",
                address: "",
                sector: "",
                notes: "",
                stampNumber: "",
                loginName: "",
                loginCode: "",
                loginPassword: "",
                shippingCompanyName: ""
            });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Firma Bilgileri</h1>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                    + Yeni Firma Ekle
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Firma Adı</th>
                                <th className="px-6 py-4">Yetkili</th>
                                <th className="px-6 py-4">Telefon</th>
                                <th className="px-6 py-4">Kaşe No</th>
                                <th className="px-6 py-4">Kargo</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">Yükleniyor...</td>
                                </tr>
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <a href={`/admin/companies/${company.id}`} className="hover:text-emerald-400 hover:underline">
                                                {company.name}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">{company.authorizedPerson || "-"}</td>
                                        <td className="px-6 py-4">{company.phone || "-"}</td>
                                        <td className="px-6 py-4">{company.stampNumber || "-"}</td>
                                        <td className="px-6 py-4 text-emerald-400">{company.shippingCompanyName || "-"}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => openModal(company)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(company.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white">
                            {editingCompany ? "Firmayı Düzenle" : "Yeni Firma Ekle"}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Firma Adı <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Yetkili Kişi</label>
                                <input
                                    type="text"
                                    value={formData.authorizedPerson}
                                    onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">E-Posta</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">İş Alanı (Sektör)</label>
                                <input
                                    type="text"
                                    value={formData.sector}
                                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Firma Kaşe No</label>
                                <input
                                    type="text"
                                    value={formData.stampNumber}
                                    onChange={(e) => setFormData({ ...formData, stampNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Kaşe Numarası"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Anlaşmalı Kargo</label>
                                <input
                                    type="text"
                                    value={formData.shippingCompanyName}
                                    onChange={(e) => setFormData({ ...formData, shippingCompanyName: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Aras, Yurtiçi vb."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="md:col-span-2 border-t border-slate-800 pt-4 mt-2">
                                <h3 className="text-sm font-bold text-white mb-3">Giriş Bilgileri (Diğer Sistemler)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Giriş Adı</label>
                                        <input
                                            type="text"
                                            value={formData.loginName}
                                            onChange={(e) => setFormData({ ...formData, loginName: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Giriş Kodu</label>
                                        <input
                                            type="text"
                                            value={formData.loginCode}
                                            onChange={(e) => setFormData({ ...formData, loginCode: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Giriş Şifresi</label>
                                        <input
                                            type="text" // Plain text as requested
                                            value={formData.loginPassword}
                                            onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Notlar</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
