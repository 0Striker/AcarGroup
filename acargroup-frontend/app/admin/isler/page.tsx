"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import JobDetailModal from "@/components/jobs/JobDetailModal";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import JobPriorityBadge from "@/components/jobs/JobPriorityBadge";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface Job {
    id: number;
    title: string;
    description: string;
    customerName: string;
    assignedPersonnelName: string;
    status: number;
    priority: number;
    estimatedCost: number;
    scheduledDate?: string;
    createdAt: string;
}

interface Customer {
    id: number;
    fullName: string;
}

interface Personnel {
    id: number;
    fullName: string;
}

const STATUS_LABELS: Record<number, string> = {
    0: "Bekliyor",
    1: "Planlandı",
    2: "Devam Ediyor",
    3: "Tamamlandı",
    4: "İptal Edildi"
};

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [assigningJobId, setAssigningJobId] = useState<number | null>(null);
    const [selectedJob, setSelectedJob] = useState<any>(null);

    // Form states
    const [formData, setFormData] = useState({
        customerId: "",
        title: "",
        description: "",
        estimatedCost: "",
        priority: 2,
        scheduledDate: "", // NEW
    });
    const [assignData, setAssignData] = useState({
        personnelId: "",
        notes: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const [jobsRes, customersRes, personnelRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/personnel/active`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (jobsRes.ok) setJobs(await jobsRes.json());
            if (customersRes.ok) setCustomers(await customersRes.json());
            if (personnelRes.ok) setPersonnel(await personnelRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    customerId: parseInt(formData.customerId),
                    title: formData.title,
                    description: formData.description,
                    estimatedCost: parseFloat(formData.estimatedCost),
                    priority: formData.priority,
                    scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
                }),
            });

            if (response.ok) {
                toast.success("İş başarıyla oluşturuldu!");
                setShowForm(false);
                setFormData({ customerId: "", title: "", description: "", estimatedCost: "", priority: 2, scheduledDate: "" });
                fetchData();
            } else {
                toast.error("İş oluşturulamadı.");
            }
        } catch (error) {
            console.error("Error creating job:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assigningJobId) return;
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${assigningJobId}/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    personnelId: parseInt(assignData.personnelId),
                    notes: assignData.notes,
                }),
            });

            if (response.ok) {
                toast.success("Personel başarıyla atandı!");
                setAssigningJobId(null);
                setAssignData({ personnelId: "", notes: "" });
                fetchData();
            } else {
                toast.error("Atama yapılamadı.");
            }
        } catch (error) {
            console.error("Error assigning job:", error);
            toast.error("Bir hata oluştu.");
        }
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
            console.error("Error fetching job detail:", error);
            toast.error("İş detayları yüklenemedi.");
        }
    };

    const handleCancelJob = async (jobId: number) => {
        if (!confirm("Bu işi iptal etmek istediğinizden emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/cancel`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                toast.success("İş iptal edildi.");
                fetchData();
            } else {
                const errorText = await response.text();
                console.error("Cancel job error:", response.status, errorText);
                toast.error(`İş iptal edilemedi: ${response.status}`);
            }
        } catch (error) {
            console.error("Error canceling job:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-slate-600">Yükleniyor...</div></div>;

    const jobCounts = {
        pending: jobs.filter(j => j.status === 0).length,
        scheduled: jobs.filter(j => j.status === 1).length,
        inProgress: jobs.filter(j => j.status === 2).length,
        completed: jobs.filter(j => j.status === 3).length,
        canceled: jobs.filter(j => j.status === 4).length,
    };

    return (
        <div>
            <Toaster position="top-right" />

            {/* Header with Stats */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-slate-800">İş Yönetimi</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
                    >
                        {showForm ? "İptal" : "+ Yeni İş"}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-700">{jobCounts.pending}</div>
                        <div className="text-sm text-yellow-600">Bekliyor</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-700">{jobCounts.scheduled}</div>
                        <div className="text-sm text-blue-600">Planlandı</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-700">{jobCounts.inProgress}</div>
                        <div className="text-sm text-purple-600">Devam Ediyor</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-emerald-700">{jobCounts.completed}</div>
                        <div className="text-sm text-emerald-600">Tamamlandı</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-700">{jobCounts.canceled}</div>
                        <div className="text-sm text-red-600">İptal</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6" style={{ display: 'none' }}>
                <h1 className="text-2xl font-bold text-slate-800">İş Yönetimi</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                    + Yeni İş{showForm ? "İptal" : "Yeni İş Oluştur"}
                </button>
            </div>

            {/* Create Job Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6 border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4">Yeni İş Kaydı</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri</label>
                            <select
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            >
                                <option value="">Seçiniz</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.fullName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                            <textarea
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tahmini Maliyet</label>
                            <input
                                type="number"
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.estimatedCost}
                                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Aciliyet</label>
                            <select
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            >
                                <option value={1}>✓ Düşük (Yeşil)</option>
                                <option value={2}>— Normal (Mavi)</option>
                                <option value={3}>⚠ Yüksek (Sarı)</option>
                                <option value={4}>🔴 Acil (Kırmızı)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Tarih</label>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition">
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Assign Job Modal/Form */}
            {assigningJobId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Personel Ata</h2>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Personel</label>
                                <select
                                    required
                                    className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                    value={assignData.personnelId}
                                    onChange={(e) => setAssignData({ ...assignData, personnelId: e.target.value })}
                                >
                                    <option value="">Seçiniz</option>
                                    {personnel.map((p) => (
                                        <option key={p.id} value={p.id}>{p.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                    rows={3}
                                    value={assignData.notes}
                                    onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAssigningJobId(null)}
                                    className="flex-1 bg-slate-200 text-slate-800 py-2 rounded hover:bg-slate-300"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
                                >
                                    Ata
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Jobs List */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Başlık</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Müşteri</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Personel</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Durum</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Öncelik</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {job.title}
                                    <div className="text-xs text-slate-500 font-normal mt-1 truncate max-w-xs">{job.description}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{job.customerName}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {job.assignedPersonnelName || <span className="text-slate-400 italic">Atanmamış</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <JobStatusBadge status={job.status as 0 | 1 | 2 | 3 | 4} />
                                </td>
                                <td className="px-6 py-4">
                                    <JobPriorityBadge priority={job.priority as 1 | 2 | 3 | 4} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewDetail(job.id)}
                                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                        >
                                            Detay
                                        </button>
                                        {!job.assignedPersonnelName && job.status === 0 && (
                                            <button
                                                onClick={() => setAssigningJobId(job.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Personel Ata
                                            </button>
                                        )}
                                        {/* Cancel button for Pending or Scheduled jobs */}
                                        {(job.status === 0 || job.status === 1) && (
                                            <button
                                                onClick={() => handleCancelJob(job.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                İptal
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Job Detail Modal */}
            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onUpdate={fetchData}
                />
            )}
        </div>
    );
}
