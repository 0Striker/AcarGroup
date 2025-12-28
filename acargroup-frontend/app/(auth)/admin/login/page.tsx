"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuth, Customer } from "@/lib/auth";

// Consumes /api/auth/login (LoginResponseDto) and stores the JWT in acargroup_* keys for admin access.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function AdminLoginPage() {
    const router = useRouter();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usernameOrEmail: usernameOrEmail.trim(),
                    password,
                }),
            });

            const data: {
                success?: boolean;
                token?: string;
                isAdmin?: boolean;
                message?: string;
                customer?: Customer | null;
            } = await response.json();

            if (!response.ok || !data.success || !data.token || !data.customer) {
                throw new Error(data.message || "Geçersiz kullanıcı adı veya şifre.");
            }

            if (!(data.isAdmin || data.customer?.isAdmin)) {
                throw new Error("Bu hesap için admin yetkisi bulunamadı.");
            }

            setAuth(data.token, { ...data.customer, isAdmin: true });
            router.push("/admin");
        } catch (err) {
            console.error("Login error:", err);
            setError(err instanceof Error ? err.message : "Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Admin Girişi
                    </h1>
                    <p className="text-sm text-slate-600">
                        Bu alan sadece yetkili personel içindir.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email/Username Field */}
                    <div>
                        <label
                            htmlFor="usernameOrEmail"
                            className="block text-sm font-medium text-slate-600 mb-2"
                        >
                            E-posta veya Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            id="usernameOrEmail"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                            placeholder="admin@acargroup.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-600 mb-2"
                        >
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                {/* Optional: Forgot Password Link */}
                <div className="mt-6 text-center">
                    <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                        Şifremi unuttum
                    </a>
                </div>

                {/* Development Hint */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-600 text-center">
                            Test için: admin@acargroup.com / 123
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
