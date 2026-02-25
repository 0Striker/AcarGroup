"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function NewCategoryPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description: description || null,
                }),
            });

            if (!res.ok) {
                setError("Kategori kaydedilirken bir hata oluştu.");
                return;
            }

            router.push("/admin/categories");
        } catch (err) {
            console.error("Kategori kaydetme hatası:", err);
            setError("Kategori kaydedilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-900">
                Yeni Kategori Ekle
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
                            disabled={loading}
                            className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/admin/categories")}
                            className="text-slate-600 hover:text-slate-800 hover:underline text-sm"
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
