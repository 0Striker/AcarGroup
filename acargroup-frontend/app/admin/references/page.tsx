"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

// Admin CRUD surface for /api/admin/references using the unified token helper.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type ReferenceAdminListDto = {
    id: number;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    isFeatured: boolean;
};

type ReferenceAdminCreateUpdateDto = {
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    isFeatured: boolean;
};

const initialFormState: ReferenceAdminCreateUpdateDto = {
    name: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
    displayOrder: 0,
    isActive: true,
    isFeatured: false,
};

export default function AdminReferencesPage() {
    const router = useRouter();

    // State
    const [references, setReferences] = useState<ReferenceAdminListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRefId, setSelectedRefId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ReferenceAdminCreateUpdateDto>(initialFormState);
    const [saving, setSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchReferences();
    }, []);

    const fetchReferences = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/references`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setReferences(data);
            } else {
                setError("Referanslar yüklenirken hata oluştu.");
            }
        } catch (err) {
            console.error(err);
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setSelectedRefId(null);
        setIsModalOpen(true);
    };

    const handleEditClick = async (id: number) => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/references/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    logoUrl: data.logoUrl || "",
                    websiteUrl: data.websiteUrl || "",
                    description: data.description || "",
                    displayOrder: data.displayOrder,
                    isActive: true,
                    isFeatured: false, // Default fallback
                });

                // Fix missing fields from list state
                const listItem = references.find(r => r.id === id);
                if (listItem) {
                    setFormData(prev => ({
                        ...prev,
                        isActive: listItem.isActive,
                        isFeatured: listItem.isFeatured
                    }));
                }

                setIsEditing(true);
                setSelectedRefId(id);
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error(err);
            alert("Referans detayları yüklenemedi.");
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (!confirm("Bu referansı silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/references/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setReferences(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Silme işlemi başarısız.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            setSaving(false);
            return;
        }

        try {
            const url = isEditing
                ? `${API_BASE_URL}/api/admin/references/${selectedRefId}`
                : `${API_BASE_URL}/api/admin/references`;

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchReferences(); // Refresh list
            } else {
                const msg = await res.text();
                alert(`Kaydetme başarısız: ${msg}`);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Referans Yönetimi</h1>
                        <p className="text-slate-400">Referanslarınızı buradan yönetebilirsiniz.</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Yeni Referans Ekle
                    </button>
                </div>

                {/* Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-400">{error}</div>
                    ) : references.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">Henüz referans eklenmemiş.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Referans Adı</th>
                                        <th className="px-6 py-4">Web Sitesi</th>
                                        <th className="px-6 py-4 text-center">Sıra</th>
                                        <th className="px-6 py-4 text-center">Aktif</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {references.map((ref) => (
                                        <tr key={ref.id} className="bg-slate-900/40 hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                {ref.logoUrl && (
                                                    <img src={ref.logoUrl} alt="" className="w-8 h-8 object-contain bg-white rounded p-0.5" />
                                                )}
                                                {ref.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{ref.websiteUrl}</td>
                                            <td className="px-6 py-4 text-center font-mono text-slate-400">{ref.displayOrder}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`w-2 h-2 rounded-full mx-auto ${ref.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(ref.id)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(ref.id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Referansı Düzenle" : "Yeni Referans Ekle"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Referans Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <ImageUpload
                                    label="Logo"
                                    currentImageUrl={formData.logoUrl}
                                    onUploadSuccess={(url) => setFormData({ ...formData, logoUrl: url })}
                                    endpoint="/api/upload/image"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Web Sitesi URL</label>
                                <input
                                    type="text"
                                    value={formData.websiteUrl}
                                    onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <RichTextEditor
                                    label="Açıklama"
                                    value={formData.description || ""}
                                    onChange={(val) => setFormData({ ...formData, description: val })}
                                    placeholder="Referans hakkında kısa açıklama..."
                                />
                            </div>

                            <div className="flex gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-slate-300 cursor-pointer">Aktif</label>
                                </div>

                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm text-slate-300 cursor-pointer text-emerald-400 font-medium">Öne Çıkar</label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                                >
                                    {saving ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
