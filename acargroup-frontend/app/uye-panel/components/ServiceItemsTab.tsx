"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type ServiceItem = {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt?: string | null;
    adminNote?: string | null;
    photoPath?: string | null;
};

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
    Pending: {
        label: "Beklemede",
        badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    InProgress: {
        label: "İşlemde",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    WaitingForCustomer: {
        label: "Müşteri Yanıtı Bekleniyor",
        badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    Completed: {
        label: "Tamamlandı",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    Canceled: {
        label: "İptal Edildi",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
    },
};

export default function ServiceItemsTab() {
    const router = useRouter();
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ title: "", description: "" });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/service-items`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Servis kayıtları yüklenemedi.");
            }

            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Servis kayıtları alınırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            setError("Başlık ve açıklama zorunludur.");
            return;
        }

        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("Title", form.title.trim());
            formData.append("Description", form.description.trim());
            if (photoFile) {
                formData.append("Photo", photoFile);
            }

            const response = await fetch(`${API_BASE_URL}/api/customer/service-items`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.text();
                throw new Error(payload || "Servis kaydı oluşturulamadı.");
            }

            setForm({ title: "", description: "" });
            setPhotoFile(null);
            await fetchItems();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Servis kaydı oluşturulamadı.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Yeni Servis Talebi</h2>
                {error && (
                    <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-400 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Başlık</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Örn. Kamera sistemi arızası"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Açıklama</label>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Yaşadığınız problemi detaylandırın"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Fotoğraf (opsiyonel)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                            className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                        {isSubmitting ? "Gönderiliyor..." : "Talebi Oluştur"}
                    </button>
                </form>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Servis Kayıtlarım</h3>
                    {items.length > 0 && (
                        <span className="text-sm text-slate-400">{items.length} kayıt</span>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-10 text-center text-slate-400">
                        Henüz servis kaydı bulunmuyor.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => {
                            const statusMeta = STATUS_MAP[item.status] ?? STATUS_MAP.Pending;
                            return (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                                            <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                                            {item.adminNote && (
                                                <p className="mt-2 text-xs text-amber-300">
                                                    Admin Notu: {item.adminNote}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-slate-500">
                                                {new Date(item.createdAt).toLocaleString("tr-TR")}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusMeta.badge}`}>
                                                {statusMeta.label}
                                            </span>
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="text-sm text-emerald-400 hover:text-emerald-300"
                                            >
                                                Detay
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h4 className="text-2xl font-semibold text-white">{selectedItem.title}</h4>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full border text-xs font-semibold ${(STATUS_MAP[selectedItem.status] ?? STATUS_MAP.Pending).badge}`}>
                                    {(STATUS_MAP[selectedItem.status] ?? STATUS_MAP.Pending).label}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-slate-200">{selectedItem.description}</p>
                        {selectedItem.adminNote && (
                            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                                <p className="font-semibold">Admin Notu</p>
                                <p>{selectedItem.adminNote}</p>
                            </div>
                        )}
                        {selectedItem.photoPath && (
                            <div className="mt-4">
                                <p className="text-sm text-slate-400 mb-2">Eklenen Fotoğraf</p>
                                <img
                                    src={`${API_BASE_URL}/${selectedItem.photoPath}`}
                                    alt="Servis fotoğrafı"
                                    className="max-h-64 w-full rounded-xl object-cover border border-slate-800"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
