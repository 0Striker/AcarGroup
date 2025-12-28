"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type Category = {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE_URL}/api/categories`, {
                    cache: "no-store",
                });
                if (!res.ok) {
                    setError("Kategoriler yüklenirken bir hata oluştu.");
                    setCategories([]);
                    return;
                }
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Kategori fetch hatası:", err);
                setError("Kategoriler yüklenirken bir hata oluştu.");
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm(
            "Bu kategoriyi silmek istediğinizden emin misiniz?"
        );
        if (!confirmDelete) return;

        try {
            setDeletingId(id);
            setError(null);

            const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                setError("Kategori silinirken bir hata oluştu.");
                return;
            }

            setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Kategori silme hatası:", err);
            setError("Kategori silinirken bir hata oluştu.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">Kategoriler</h1>
                <p className="text-slate-600">Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-slate-900">Kategoriler</h1>

            {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

            <Link
                href="/admin/categories/new"
                className="inline-flex items-center bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 mb-4 transition-colors"
            >
                Yeni Kategori
            </Link>

            {categories.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-slate-600">Kategori bulunamadı.</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                                    ID
                                </th>
                                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                                    Kategori Adı
                                </th>
                                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                                    Açıklama
                                </th>
                                <th className="p-3 text-left text-sm font-semibold text-slate-700">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-slate-100 hover:bg-slate-50"
                                >
                                    <td className="p-3 text-slate-900">{category.id}</td>
                                    <td className="p-3 text-slate-900 font-medium">
                                        {category.name}
                                    </td>
                                    <td className="p-3 text-slate-600">
                                        {category.description || "-"}
                                    </td>
                                    <td className="p-3 space-x-3">
                                        <Link
                                            href={`/admin/categories/${category.id}/edit`}
                                            className="text-slate-700 hover:underline text-sm"
                                        >
                                            Düzenle
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            disabled={deletingId === category.id}
                                            className="text-red-600 hover:underline cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingId === category.id ? "Siliniyor..." : "Sil"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
