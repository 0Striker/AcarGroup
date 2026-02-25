"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, setAuth, getCustomer } from "@/lib/auth";

// Handles /api/customer/profile GET/PUT to keep customer info aligned with acargroup_* storage.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type CustomerProfile = {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    tc?: string;
    vkn?: string;
};

export default function ProfileTab() {
    const router = useRouter();
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        tc: "",
        vkn: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setFormData({
                    fullName: data.fullName || "",
                    phone: data.phone || "",
                    tc: data.tc || "",
                    vkn: data.vkn || "",
                });
            } else {
                setErrorMessage("Profil bilgileri yüklenirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName) {
            setErrorMessage("Ad soyad alanı zorunludur.");
            return;
        }

        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setSuccessMessage("Profil bilgileriniz başarıyla güncellendi!");
                setAuth(token, { ...(getCustomer() || data), ...data });

                setTimeout(() => setSuccessMessage(""), 5000);
            } else {
                setErrorMessage("Profil güncellenirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Kişisel Bilgiler</h2>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm mb-6">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Ad Soyad <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Adınız ve soyadınız"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            E-posta
                        </label>
                        <input
                            type="email"
                            value={profile?.email || ""}
                            disabled
                            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-1">E-posta adresi değiştirilemez</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Telefon
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0555 123 45 67"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            TC Kimlik No
                        </label>
                        <input
                            type="text"
                            maxLength={11}
                            value={formData.tc}
                            onChange={(e) => setFormData({ ...formData, tc: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="11 haneli TC numarası (opsiyonel)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            VKN (Vergi Kimlik No)
                        </label>
                        <input
                            type="text"
                            maxLength={10}
                            value={formData.vkn}
                            onChange={(e) => setFormData({ ...formData, vkn: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="10 haneli vergi numarası (opsiyonel)"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
