"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import ImageUpload from "@/components/admin/ImageUpload";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Brand = {
    id: number;
    name: string;
    logoUrl?: string | null;
    isActive: boolean;
    displayOrder: number;
};

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/brands/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setBrands(data);
            }
        } catch (err) {
            console.error("Error fetching brands:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setName(brand.name);
        setLogoUrl(brand.logoUrl || null);
        setIsActive(brand.isActive);
        setDisplayOrder(brand.displayOrder);
        setShowModal(true);
    };

    const handleNew = () => {
        setEditingBrand(null);
        setName("");
        setLogoUrl(null);
        setIsActive(true);
        setDisplayOrder(0);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) return;
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                fetchBrands();
            }
        } catch (err) {
            console.error("Error deleting brand:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        setSaving(true);
        try {
            const url = editingBrand
                ? `${API_BASE_URL}/api/brands/${editingBrand.id}`
                : `${API_BASE_URL}/api/brands`;

            const method = editingBrand ? "PUT" : "POST";

            const body = {
                id: editingBrand?.id,
                name,
                logoUrl,
                isActive,
                displayOrder,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowModal(false);
                fetchBrands();
            } else {
                alert("Kaydedilirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Error saving brand:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Marka Yönetimi</h1>
                <button
                    onClick={handleNew}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    Yeni Marka Ekle
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Sıra</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Logo</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Marka Adı</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Durum</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-600">{brand.displayOrder}</td>
                                <td className="px-6 py-4">
                                    {brand.logoUrl ? (
                                        <img
                                            src={brand.logoUrl}
                                            alt={brand.name}
                                            className="h-8 object-contain"
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-400">Logo yok</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{brand.name}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${brand.isActive
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {brand.isActive ? "Aktif" : "Pasif"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(brand)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(brand.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {brands.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    Henüz hiç marka eklenmemiş.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingBrand ? "Markayı Düzenle" : "Yeni Marka Ekle"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Marka Adı *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Sıralama
                                </label>
                                <input
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                                />
                            </div>

                            <div>
                                <ImageUpload
                                    label="Logo"
                                    currentImageUrl={logoUrl}
                                    onUploadSuccess={(url) => setLogoUrl(url)}
                                    endpoint="/api/upload/image"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer bg-white"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-700 cursor-pointer select-none">
                                    Aktif
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                    {saving ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
