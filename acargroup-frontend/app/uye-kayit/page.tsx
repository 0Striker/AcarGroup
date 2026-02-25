"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Sends CustomerRegisterDto to /api/auth/register so new members can join before using unified acargroup_* auth keys.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function MemberRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        passwordConfirm: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.passwordConfirm) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.message || "Kayıt oluşturulamadı.");
            }

            setSuccess("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
            setTimeout(() => router.push("/uye-giris"), 1200);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <h1 className="text-2xl font-semibold text-white mb-2">Üyelik Oluştur</h1>
                <p className="text-slate-400 text-sm mb-6">
                    Bilgilerinizi girerek üye paneline erişim sağlayabilirsiniz.
                </p>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Adınız Soyadınız"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">E-posta</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="ornek@sirket.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Telefon</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0555 123 45 67"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Şifre</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Şifre (Tekrar)</label>
                        <input
                            type="password"
                            name="passwordConfirm"
                            required
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-emerald-500 text-slate-950 font-semibold py-3 hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Kaydediliyor..." : "Hesap Oluştur"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-500 mt-6">
                    Zaten hesabınız var mı?{" "}
                    <a href="/uye-giris" className="text-emerald-400 hover:text-emerald-300 font-medium">
                        Giriş yapın
                    </a>
                </p>
            </div>
        </div>
    );
}
