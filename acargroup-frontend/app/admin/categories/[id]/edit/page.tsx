"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Category = {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [category, setCategory] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(id)) {
            setError("Geçersiz kategori ID.");
            setLoading(false);
            return;
        }

        const fetchCategory = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE_URL}/api/categories/${id}`);

                if (!res.ok) {
                    setError("Kategori yüklenirken bir hata oluştu.");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setCategory(data);
                setName(data.name);
                setDescription(data.description ?? "");
            } catch (err) {
                console.error("Kategori yükleme hatası:", err);
                setError("Kategori yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    name,
                    description: description || null,
                }),
            });

            if (!res.ok) {
                setError("Kategori güncellenirken bir hata oluştu.");
                return;
            }

            router.push("/admin/categories");
        } catch (err) {
            console.error("Kategori güncelleme hatası:", err);
            setError("Kategori güncellenirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">
                    Kategori Düzenle
                </h1>
                <p className="text-slate-600">Yükleniyor...</p>
            </div>
        );
    }

    if (!category && !loading && error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">Hata</h1>
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => router.push("/admin/categories")}
                    className="mt-4 text-slate-600 hover:underline"
                >
                    Listeye Dön
                </button>
            </div>
        );
    }

    if (!category && !loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-900">
                    Kategori Bulunamadı
                </h1>
                <button
                    onClick={() => router.push("/admin/categories")}
                    className="text-slate-600 hover:underline"
                >
                    Listeye Dön
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-900">
                Kategori Düzenle
            </h1>

            <div className="bg-white p-6 rounded-lg shadow max-w-xl">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Kategori Adı *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
                        />
                    </div>

                    <div>
                        <RichTextEditor
                            label="Açıklama (opsiyonel)"
                            value={description}
                            onChange={(val) => setDescription(val)}
                            placeholder="Kategori açıklaması..."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Kaydediliyor..." : "Güncelle"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/admin/categories")}
                            className="text-slate-600 hover:text-slate-800 hover:underline text-sm"
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
