"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function AdminProfilePage() {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "Yeni şifreler eşleşmiyor." });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: "Yeni şifre en az 6 karakter olmalıdır." });
            return;
        }

        setLoading(true);
        setMessage(null);

        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message || "Şifre başarıyla güncellendi." });
                setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMessage({ type: 'error', text: data.message || "İşlem başarısız." });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Bir hata oluştu." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Profil Ayarları</h1>
            <p className="text-slate-500 mb-8">Hesap güvenliği ve şifre işlemlerinizi buradan yönetebilirsiniz.</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Şifre Değiştir
                </h2>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mevcut Şifre</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900 bg-slate-50 focus:bg-white"
                            value={formData.oldPassword}
                            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Yeni Şifre</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900 bg-slate-50 focus:bg-white"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900 bg-slate-50 focus:bg-white"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
