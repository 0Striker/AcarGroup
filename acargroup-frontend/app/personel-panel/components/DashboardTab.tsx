"use client";

import { useEffect, useState } from "react";
import { getToken, getPersonnel } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function DashboardTab() {
    const [stats, setStats] = useState({
        totalJobs: 0,
        pendingJobs: 0,
        completedJobs: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const token = getToken();
        const personnel = getPersonnel();
        if (!token || !personnel) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Client-side calculation since we don't have a stats endpoint yet
                const total = data.length;
                const pending = data.filter((j: any) => j.status !== 2 && j.status !== 3).length; // Assuming 2=Completed, 3=Cancelled
                const completed = data.filter((j: any) => j.status === 2).length;

                setStats({
                    totalJobs: total,
                    pendingJobs: pending,
                    completedJobs: completed,
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-slate-400">Yükleniyor...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Jobs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Aktif İşler</h3>
                    <span className="text-2xl">⚡</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.pendingJobs}</p>
                <p className="text-xs text-slate-500 mt-2">Devam eden veya planlanan</p>
            </div>

            {/* Completed Jobs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Tamamlanan</h3>
                    <span className="text-2xl">✅</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.completedJobs}</p>
                <p className="text-xs text-slate-500 mt-2">Başarıyla bitirilen işler</p>
            </div>

            {/* Total Jobs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Toplam İş</h3>
                    <span className="text-2xl">📋</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
                <p className="text-xs text-slate-500 mt-2">Tüm zamanlar</p>
            </div>
        </div>
    );
}
