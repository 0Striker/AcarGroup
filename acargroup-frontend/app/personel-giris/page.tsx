"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setPersonnelAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function PersonelGirisPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("E-posta/Telefon ve şifre zorunludur.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/personnel-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usernameOrEmailOrPhone: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.token || !data.personnel) {
                setError(data.message || "Giriş başarısız, bilgilerinizi kontrol edin.");
                return;
            }

            setPersonnelAuth(data.token, data.personnel);
            router.push("/personel-panel");
        } catch (err) {
            console.error(err);
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                {/* Başlık */}
                <h1 className="text-xl font-semibold text-white mb-1">Personel Girişi</h1>
                <p className="text-sm text-slate-400 mb-6">
                    Personel paneline erişmek için giriş yapın.
                </p>

                {/* Hata mesajı */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email/Phone */}
                    <div>
                        <label htmlFor="email" className="block text-sm text-slate-300 mb-1">
                            E-posta veya Telefon
                        </label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="ornek@email.com veya 555..."
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm text-slate-300 mb-1">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold py-2.5 hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-500 mt-6">
                    <a href="/uye-giris" className="text-slate-400 hover:text-white transition">
                        Müşteri Girişi &rarr;
                    </a>
                </p>
            </div>
        </div>
    );
}
