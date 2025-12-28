"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

const STATUS_LABELS: Record<number, string> = {
    0: "Bekliyor",
    1: "Planlandı",
    2: "Devam Ediyor",
    3: "Tamamlandı",
    4: "İptal Edildi"
};

const STATUS_COLORS: Record<number, string> = {
    0: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    1: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    2: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    3: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    4: "bg-red-500/10 text-red-500 border-red-500/20"
};

export default function JobsTab() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-slate-400">Kayıtlı servis işleminiz bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {jobs.map((job) => (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
                                    {STATUS_LABELS[job.status]}
                                </span>
                                <span className="text-slate-500 text-xs">
                                    #{job.id} • {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                            <p className="text-slate-400 text-sm mb-4">{job.description}</p>

                            {job.assignedPersonnelName && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>👨‍🔧 Personel: {job.assignedPersonnelName}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Tahmini Tutar</p>
                            <p className="text-xl font-bold text-white">
                                {job.estimatedCost.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                            </p>
                            {job.actualCost && (
                                <div className="mt-2">
                                    <p className="text-xs text-slate-500">Gerçekleşen</p>
                                    <p className="text-sm font-semibold text-emerald-400">
                                        {job.actualCost.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
