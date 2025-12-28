"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface Personnel {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    tc?: string;
    specialization: string;
    bloodType?: string;
    hasDriverLicense: boolean;
    isActive: boolean;
}

export default function EditPersonnelPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        tc: "",
        specialization: "",
        bloodType: "",
        hasDriverLicense: false,
        isActive: true,
    });

    useEffect(() => {
        if (Number.isNaN(id)) {
            setError("Geçersiz personel ID.");
            setLoading(false);
            return;
        }
        fetchPersonnel();
    }, [id]);

    const fetchPersonnel = async () => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/personnel/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: Personnel = await response.json();
                setFormData({
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address || "",
                    tc: data.tc || "",
                    specialization: data.specialization || "",
                    bloodType: data.bloodType || "",
                    hasDriverLicense: data.hasDriverLicense,
                    isActive: data.isActive,
                });
            } else {
                setError("Personel bilgileri yüklenemedi.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = getToken();

        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/personnel/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push(`/admin/personnel/${id}`);
                router.refresh();
            } else {
                alert("Güncelleme başarısız oldu.");
            }
        } catch (error) {
            console.error("Error updating personnel:", error);
            alert("Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-slate-600">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                        {error}
                    </div>
                    <Link href="/admin/personnel" className="inline-block mt-4 text-slate-600 hover:text-slate-900">
                        ← Listeye Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href={`/admin/personnel/${id}`} className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
                            ← Geri
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">Personeli Düzenle</h1>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                                <textarea
                                    rows={2}
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Adres bilgisi (opsiyonel)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">TC Kimlik No</label>
                                <input
                                    type="text"
                                    maxLength={11}
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.tc}
                                    onChange={(e) => setFormData({ ...formData, tc: e.target.value })}
                                    placeholder="11 haneli TC numarası (opsiyonel)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Uzmanlık</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kan Grubu</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    value={formData.bloodType}
                                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                >
                                    <option value="">Seçiniz (opsiyonel)</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50 transition">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-600 border-slate-300 rounded"
                                        checked={formData.hasDriverLicense}
                                        onChange={(e) => setFormData({ ...formData, hasDriverLicense: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-slate-700">Ehliyeti var</span>
                                </label>
                            </div>

                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50 transition">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-600 border-slate-300 rounded"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-slate-700">Aktif Personel</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href={`/admin/personnel/${id}`}
                                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                            >
                                İptal
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
