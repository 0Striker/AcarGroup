"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setAuth } from "@/lib/auth";

// Türkçe login formu aynı /api/auth/login akışını kullanarak acargroup_* anahtarlarını besler.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function UyeGirisPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        // Basit doğrulama
        if (!email.trim() || !password.trim()) {
            setError("E-posta ve şifre zorunludur.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usernameOrEmail: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.token || !data.customer) {
                setError(data.message || "Giriş başarısız, lütfen e-posta veya şifrenizi kontrol edin.");
                return;
            }

            setAuth(data.token, data.customer);
            router.push("/uye-panel");
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
                <h1 className="text-xl font-semibold text-white mb-1">Üye Girişi</h1>
                <p className="text-sm text-slate-400 mb-6">
                    Müşteri paneline erişmek için e-posta ve şifrenizle giriş yapın.
                </p>

                {/* Hata mesajı */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm text-slate-300 mb-1">
                            E-posta
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="ornek@email.com"
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
                    Hesabınız yok mu?{" "}
                    <a href="/uye-kayit" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                        Üye Ol
                    </a>
                </p>
            </div>
        </div>
    );
}
