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
    specialization?: string;
    bloodType?: string;
    hasDriverLicense: boolean;
    isActive: boolean;
    createdAt: string;
}

interface Statistics {
    totalJobs: number;
    completedJobs: number;
    overdueJobs: number;
}

export default function PersonnelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);

    const [personnel, setPersonnel] = useState<Personnel | null>(null);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (Number.isNaN(id)) {
            setError("Geçersiz personel.");
            setLoading(false);
            return;
        }

        fetchData();
    }, [id]);

    const fetchData = async () => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [personnelRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/personnel/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/personnel/${id}/statistics`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            if (personnelRes.ok) {
                setPersonnel(await personnelRes.json());
            } else {
                setError("Personel bilgileri yüklenemedi.");
            }

            if (statsRes.ok) {
                setStatistics(await statsRes.json());
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-slate-600">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (error || !personnel) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                        {error || "Personel bulunamadı."}
                    </div>
                    <Link href="/admin/personel" className="inline-block mt-4 text-slate-600 hover:text-slate-900">
                        ← Personel Listesine Dön
                    </Link>
                </div>
            </div>
        );
    }

    const bloodTypeEmoji = personnel.bloodType ? "🩸" : "";
    const licenseEmoji = personnel.hasDriverLicense ? "🚗" : "❌";

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/admin/personel" className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block">
                            ← Geri
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">{personnel.fullName}</h1>
                        <p className="text-slate-600">{personnel.specialization || "Uzmanlık belirtilmemiş"}</p>
                    </div>
                    <Link
                        href={`/admin/personnel/${id}/edit`}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        Düzenle
                    </Link>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Jobs */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm text-slate-600 mb-1">Toplam İş</div>
                        <div className="text-3xl font-bold text-slate-900">{statistics?.totalJobs || 0}</div>
                    </div>

                    {/* Completed Jobs */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm text-slate-600 mb-1">Tamamlanan</div>
                        <div className="text-3xl font-bold text-emerald-600">{statistics?.completedJobs || 0}</div>
                    </div>

                    {/* Overdue Jobs */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm text-slate-600 mb-1">Gecikmiş</div>
                        <div className="text-3xl font-bold text-red-600">{statistics?.overdueJobs || 0}</div>
                    </div>

                    {/* Active Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="text-sm text-slate-600 mb-1">Durum</div>
                        <div className={`text-lg font-semibold ${personnel.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {personnel.isActive ? "✓ Aktif" : "✗ Pasif"}
                        </div>
                    </div>
                </div>

                {/* Personnel Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Kişisel Bilgiler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-slate-600">E-posta:</span>
                            <div className="font-medium text-slate-900">{personnel.email}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Telefon:</span>
                            <div className="font-medium text-slate-900">{personnel.phone}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Adres:</span>
                            <div className="font-medium text-slate-900">{personnel.address || "Belirtilmemiş"}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">TC Kimlik No:</span>
                            <div className="font-medium text-slate-900">{personnel.tc || "Belirtilmemiş"}</div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Kan Grubu:</span>
                            <div className="font-medium text-slate-900">
                                {bloodTypeEmoji} {personnel.bloodType || "Belirtilmemiş"}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Ehliyet:</span>
                            <div className="font-medium text-slate-900">
                                {licenseEmoji} {personnel.hasDriverLicense ? "Var" : "Yok"}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600">Kayıt Tarihi:</span>
                            <div className="font-medium text-slate-900">
                                {new Date(personnel.createdAt).toLocaleDateString("tr-TR")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
