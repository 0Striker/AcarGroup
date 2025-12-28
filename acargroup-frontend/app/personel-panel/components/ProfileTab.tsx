"use client";

import { useEffect, useState } from "react";
import { getToken, getPersonnel } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function ProfileTab() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = getToken();
        const personnel = getPersonnel();
        if (!token || !personnel) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/personnel/${personnel.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

    if (!profile) return <div className="text-red-400">Profil bilgileri alınamadı.</div>;

    return (
        <div className="max-w-2xl">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <span className="text-3xl">👤</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                        <p className="text-emerald-400">{profile.specialization || "Personel"}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">E-posta</label>
                        <p className="text-slate-200 font-medium">{profile.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">Telefon</label>
                        <p className="text-slate-200 font-medium">{profile.phone || "-"}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">Durum</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${profile.isActive
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}>
                            {profile.isActive ? "Aktif" : "Pasif"}
                        </span>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">Kayıt Tarihi</label>
                        <p className="text-slate-200 font-medium">
                            {new Date(profile.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
