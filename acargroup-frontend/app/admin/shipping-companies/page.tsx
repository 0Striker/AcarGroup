"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type ShippingCompany = {
    id: number;
    name: string;
    address?: string;
    phone?: string;
};

export default function ShippingCompaniesPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<ShippingCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(null);
    const [formData, setFormData] = useState({ name: "", address: "", phone: "" });
    const [message, setMessage] = useState({ type: "", text: "" });

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
            const res = await fetch(`${API_BASE_URL}/api/admin/shipping-companies`, {
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
                ? `${API_BASE_URL}/api/admin/shipping-companies/${editingCompany.id}`
                : `${API_BASE_URL}/api/admin/shipping-companies`;

            const method = editingCompany ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ type: "success", text: `Kargo firması başarıyla ${editingCompany ? "güncellendi" : "eklendi"}.` });
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
        if (!confirm("Bu kargo firmasını silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/shipping-companies/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setCompanies(companies.filter(c => c.id !== id));
                setMessage({ type: "success", text: "Kargo firması silindi." });
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (company?: ShippingCompany) => {
        if (company) {
            setEditingCompany(company);
            setFormData({ name: company.name, address: company.address || "", phone: company.phone || "" });
        } else {
            setEditingCompany(null);
            setFormData({ name: "", address: "", phone: "" });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Kargo Bilgileri</h1>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                    + Yeni Kargo Firması
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
                                <th className="px-6 py-4">Telefon</th>
                                <th className="px-6 py-4">Adres</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">Yükleniyor...</td>
                                </tr>
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{company.name}</td>
                                        <td className="px-6 py-4">{company.phone || "-"}</td>
                                        <td className="px-6 py-4">{company.address || "-"}</td>
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
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
                        <h2 className="text-xl font-bold text-white">
                            {editingCompany ? "Kargo Firmasını Düzenle" : "Yeni Kargo Firması Ekle"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Firma Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                <label className="block text-sm font-medium text-slate-400 mb-1">Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
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
