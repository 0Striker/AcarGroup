"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import JobDetailModal from "@/components/jobs/JobDetailModal";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

enum JobStatus {
    Pending = 0,
    Scheduled = 1,
    InProgress = 2,
    Completed = 3,
    Canceled = 4
}

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
    const [updating, setUpdating] = useState<number | null>(null);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [statusSelections, setStatusSelections] = useState<Record<number, number>>({});

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
                // Initialize status selections with current job statuses
                const selections: Record<number, number> = {};
                data.forEach((job: any) => {
                    selections[job.id] = job.status;
                });
                setStatusSelections(selections);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (jobId: number) => {
        const token = getToken();
        if (!token) return;

        const newStatus = statusSelections[jobId];
        const currentJob = jobs.find(j => j.id === jobId);

        if (currentJob && newStatus === currentJob.status) {
            toast.error("Aynı durumu seçtiniz.");
            return;
        }

        setUpdating(jobId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    newStatus: newStatus,
                    notes: "Personel tarafından güncellendi."
                }),
            });

            if (response.ok) {
                toast.success("Durum güncellendi!");
                await fetchJobs();
            } else {
                toast.error("Güncelleme başarısız.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setUpdating(null);
        }
    };

    const getAvailableStatuses = (currentStatus: number) => {
        // Personnel can update to these statuses
        const options = [];

        switch (currentStatus) {
            case JobStatus.Pending:
                options.push({ value: JobStatus.Pending, label: "Bekliyor" });
                options.push({ value: JobStatus.InProgress, label: "Başla" });
                break;
            case JobStatus.Scheduled:
                options.push({ value: JobStatus.Scheduled, label: "Planlandı" });
                options.push({ value: JobStatus.InProgress, label: "Başla" });
                break;
            case JobStatus.InProgress:
                options.push({ value: JobStatus.InProgress, label: "Devam Ediyor" });
                options.push({ value: JobStatus.Pending, label: "Yarım Kaldı" });
                options.push({ value: JobStatus.Completed, label: "Bitti" });
                break;
            case JobStatus.Completed:
                options.push({ value: JobStatus.Completed, label: "Tamamlandı" });
                options.push({ value: JobStatus.InProgress, label: "Tekrar Aç" });
                break;
            default:
                // Fallback for other statuses
                options.push({ value: currentStatus, label: STATUS_LABELS[currentStatus] || "Bilinmiyor" });
                break;
        }

        return options;
    };

    const handleViewDetail = async (jobId: number) => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const jobDetail = await response.json();
                setSelectedJob(jobDetail);
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
            toast.error("İş detayları yüklenemedi.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-slate-400">Yükleniyor...</div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-slate-400">Size atanmış herhangi bir iş bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <Toaster position="top-right" />
            {jobs.map((job) => (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <JobStatusBadge status={job.status as 0 | 1 | 2 | 3 | 4} />
                                <span className="text-slate-500 text-xs">
                                    #{job.id} • {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                            <p className="text-slate-400 text-sm mb-4">{job.description}</p>

                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>👤 Müşteri: {job.customerName}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <button
                                onClick={() => handleViewDetail(job.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
                            >
                                📋 Detay Görüntüle
                            </button>

                            {/* Status Update Section */}
                            <div className="flex gap-2">
                                <select
                                    value={statusSelections[job.id] || job.status}
                                    onChange={(e) => setStatusSelections({
                                        ...statusSelections,
                                        [job.id]: parseInt(e.target.value)
                                    })}
                                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:border-emerald-500 focus:outline-none"
                                >
                                    {getAvailableStatuses(job.status).map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleStatusChange(job.id)}
                                    disabled={updating === job.id || statusSelections[job.id] === job.status}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Durumu Güncelle"
                                >
                                    {updating === job.id ? "⏳" : "✓"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Job Detail Modal */}
            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onUpdate={fetchJobs}
                />
            )}
        </div>
    );
}
