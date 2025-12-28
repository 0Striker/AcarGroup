"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CloudinaryImageUpload from "@/components/admin/CloudinaryImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Category = {
    id: number;
    name: string;
    description?: string | null;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function NewProductPage() {
    const router = useRouter();

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Categories and loading states
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                    // Set first category as default if available
                    if (data.length > 0) {
                        setCategoryId(data[0].id.toString());
                    }
                }
            } catch (err) {
                console.error("Kategoriler yüklenemedi:", err);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description: description || null,
                    price: 0, // Backend still expects price, set to 0
                    isActive,
                    categoryId: Number(categoryId),
                    imageUrl: imageUrl || null,
                }),
            });

            if (!res.ok) {
                setError("Bir hata oluştu. Ürün kaydedilemedi.");
                setLoading(false);
                return;
            }

            // Success - redirect to products list
            router.push("/admin/products");
        } catch (err) {
            console.error("Ürün kaydetme hatası:", err);
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
            setLoading(false);
        }
    };



    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-900">
                Yeni Ürün Ekle
            </h1>

            <div className="bg-white p-6 rounded-lg shadow max-w-xl">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category */}
                    <div>
                        <label
                            htmlFor="categoryId"
                            className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                            Kategori *
                        </label>
                        <select
                            id="categoryId"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                            required
                            disabled={loading}
                        >
                            {categories.length === 0 ? (
                                <option value="">Kategori yükleniyor...</option>
                            ) : (
                                categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                            Ürün Adı *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                            placeholder="Ürün adını girin"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <RichTextEditor
                            label="Açıklama"
                            value={description}
                            onChange={(val) => setDescription(val)}
                            placeholder="Ürün açıklaması (opsiyonel)"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <CloudinaryImageUpload
                            label="Ürün Görseli"
                            currentImageUrl={imageUrl}
                            onUploadSuccess={(url) => setImageUrl(url)}
                            endpoint="/api/upload/image"
                        />
                    </div>

                    {/* Is Active Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer bg-white"
                            disabled={loading}
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-700 cursor-pointer select-none">
                            Aktif
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || categories.length === 0}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/products")}
                            className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                            disabled={loading}
                        >
                            İptal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
