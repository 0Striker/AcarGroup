"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { getToken } from "@/lib/auth";

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

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isFeatured, setIsFeatured] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (Number.isNaN(id)) {
            setError("Geçersiz ürün.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Ürünü çek
                const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                    cache: "no-store",
                });
                if (!productRes.ok) {
                    setError("Ürün yüklenirken bir hata oluştu.");
                    setLoading(false);
                    return;
                }
                const productData: Product = await productRes.json();
                setProduct(productData);
                setName(productData.name);
                setDescription(productData.description ?? "");
                setPrice(productData.price);
                setIsActive(productData.isActive);
                setIsFeatured(productData.isFeatured);
                setImageUrl(productData.imageUrl ?? null);
                setCategoryId(productData.categoryId.toString());

                // Kategorileri çek
                const categoryRes = await fetch(`${API_BASE_URL}/api/categories`, {
                    cache: "no-store",
                });
                if (categoryRes.ok) {
                    const categoryData: Category[] = await categoryRes.json();
                    setCategories(categoryData);
                } else {
                    console.error(
                        "Kategori listesi yüklenirken hata:",
                        await categoryRes.text()
                    );
                }
            } catch (err) {
                console.error("Ürün/kategori fetch hatası:", err);
                setError("Veriler yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (Number.isNaN(id)) {
            setError("Geçersiz ürün.");
            return;
        }

        setSaving(true);
        setError(null);

        const payload = {
            id,
            name,
            description: description || null,
            price: price,
            isActive,
            isFeatured,
            imageUrl,
            categoryId: Number(categoryId),
        };

        console.log("Submitting product update with payload:", payload);

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                console.error("Ürün güncelleme hatası:", await res.text());
                setError("Ürün güncellenirken bir hata oluştu.");
                return;
            }

            router.push("/admin/products");
        } catch (err) {
            console.error("Ürün güncelleme hatası:", err);
            setError("Ürün güncellenirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">Ürün Düzenle</h1>
                <p className="text-slate-600">Yükleniyor...</p>
            </div>
        );
    }

    if (!product && !loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">
                    Ürün Bulunamadı
                </h1>
                <button
                    onClick={() => router.push("/admin/products")}
                    className="text-slate-600 hover:underline"
                >
                    Listeye Dön
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Ürün Düzenle</h1>

            <div className="bg-white p-6 rounded-lg shadow max-w-xl">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Kategori *
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-900"
                        >
                            <option value="">Kategori seçin</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Ürün Adı *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                            placeholder="Ürün adını girin"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Fiyat (TRY) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                            placeholder="0.00"
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
                        <ImageUpload
                            currentImageUrl={imageUrl}
                            onUploadSuccess={(url) => setImageUrl(url)}
                            endpoint="/api/upload/image"
                            label="Ürün Görseli"
                        />
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            id="isActive"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer bg-white"
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-700 cursor-pointer select-none">
                            Aktif
                        </label>
                    </div>

                    {/* Is Featured */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            id="isFeatured"
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-600 border-slate-300 rounded cursor-pointer bg-white"
                        />
                        <label htmlFor="isFeatured" className="text-sm text-slate-700 cursor-pointer select-none">
                            ⭐ Öne Çıkan (Ana sayfada göster)
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            {saving ? "Kaydediliyor..." : "Güncelle"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/admin/products")}
                            className="text-slate-600 hover:text-slate-800 hover:underline text-sm font-medium"
                            disabled={saving}
                        >
                            İptal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
