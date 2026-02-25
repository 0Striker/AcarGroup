"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

type Product = {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
    isFeatured: boolean;
    imageUrl?: string | null;
    categoryId: number;
    createdAt: string;
    updatedAt?: string | null;
};

type Category = {
    id: number;
    name: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE_URL}/api/products`, {
                    cache: "no-store",
                });
                if (!res.ok) {
                    setError("Ürünler yüklenirken bir hata oluştu.");
                    setProducts([]);
                    return;
                }
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Ürün fetch hatası:", err);
                setError("Ürünler yüklenirken bir hata oluştu.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/categories`, {
                    cache: "no-store",
                });
                if (!res.ok) {
                    console.error("Kategori listesi yüklenirken hata:", await res.text());
                    return;
                }
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Kategori fetch hatası:", err);
            }
        };

        fetchProducts();
        fetchCategories();
    }, []);

    const categoryMap = useMemo(
        () => new Map(categories.map((c) => [c.id, c.name])),
        [categories]
    );

    const groupedProducts = useMemo(() => {
        const groups: Record<string, Product[]> = {};
        // Initialize groups for all categories to ensure empty categories are shown (optional, but good for visibility)
        // Or just group existing products. Let's group existing products.

        products.forEach((p) => {
            const categoryName = categoryMap.get(p.categoryId) ?? "Diğer";
            if (!groups[categoryName]) {
                groups[categoryName] = [];
            }
            groups[categoryName].push(p);
        });

        // Sort categories alphabetically
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [products, categoryMap]);

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm(
            "Bu ürünü silmek istediğinizden emin misiniz?"
        );
        if (!confirmDelete) return;

        try {
            setDeletingId(id);
            setError(null);

            const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                setError("Ürün silinirken bir hata oluştu.");
                return;
            }

            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Silme hatası:", err);
            setError("Ürün silinirken bir hata oluştu.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">Ürünler</h1>
                <p className="text-slate-600">Yükleniyor...</p>
            </div>
        );
    }

    return (
        <section className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Ürünler</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                    Yeni Ürün
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Products List */}
            {products.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center border border-slate-200">
                    <p className="text-slate-600">Ürün bulunamadı.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedProducts.map(([categoryName, categoryProducts]) => (
                        <div key={categoryName} className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                {categoryName}
                                <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                    {categoryProducts.length}
                                </span>
                            </h2>
                            <div className="space-y-3">
                                {categoryProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all"
                                    >
                                        {/* Sol: Görsel + Bilgi */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Görsel Placeholder */}
                                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-slate-500 font-bold">
                                                        IMG
                                                    </span>
                                                )}
                                            </div>

                                            {/* Ürün Bilgileri */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {product.name}
                                                </p>
                                                {product.description && (
                                                    <p
                                                        className="text-xs text-slate-500 line-clamp-2 mt-0.5"
                                                        dangerouslySetInnerHTML={{
                                                            __html: product.description.replace(/<[^>]*>/g, '').substring(0, 100) + (product.description.length > 100 ? '...' : '')
                                                        }}
                                                    />
                                                )}
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sağ: Durum + Aksiyonlar */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {/* Öne Çıkan Badge */}
                                            {product.isFeatured && (
                                                <span className="text-[11px] px-2 py-1 rounded-full border font-medium bg-amber-50 text-amber-700 border-amber-200">
                                                    ⭐ Öne Çıkan
                                                </span>
                                            )}

                                            {/* Durum Badge */}
                                            <span
                                                className={`text-[11px] px-2 py-1 rounded-full border font-medium ${product.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                                    }`}
                                            >
                                                {product.isActive ? "Aktif" : "Pasif"}
                                            </span>

                                            {/* Düzenle Butonu */}
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="text-xs px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors font-medium"
                                            >
                                                Düzenle
                                            </Link>

                                            {/* Sil Butonu */}
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {deletingId === product.id ? "Siliniyor..." : "Sil"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

