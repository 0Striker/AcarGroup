"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

// Admin panel view consuming /api/admin/project-requests endpoints with the unified token helper.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

// Types
type ProjectRequestListDto = {
    id: number;
    projectType: string;
    city: string;
    district: string;
    fullName: string;
    phone: string;
    createdAt: string;
    status: string;
};

type ProjectRequestDetailDto = {
    id: number;
    projectType: string;
    city: string;
    district: string;
    fullName: string;
    phone: string;
    address: string;
    description?: string;
    createdAt: string;
    status: string;
    isArchived: boolean;
};

export default function ProjectRequestsPage() {
    const router = useRouter();

    // State
    const [requests, setRequests] = useState<ProjectRequestListDto[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [includeArchived, setIncludeArchived] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Detail Modal State
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [detail, setDetail] = useState<ProjectRequestDetailDto | null>(null);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);

    // Action States
    const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
    const [archiving, setArchiving] = useState<boolean>(false);
    const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);

    // Initial Load
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchProjectRequests();
    }, [selectedStatus, includeArchived]);

    // Fetch Requests
    const fetchProjectRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                router.push("/admin/login");
                setLoading(false);
                return;
            }
            let url = `${API_BASE_URL}/api/admin/project-requests?includeArchived=${includeArchived}`;
            if (selectedStatus !== "All") {
                url += `&status=${selectedStatus}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            } else {
                setError("Proje talepleri yüklenirken hata oluştu.");
            }
        } catch (err) {
            console.error(err);
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Detail
    const fetchDetail = async (id: number) => {
        setSelectedRequestId(id);
        setDetailLoading(true);
        setDetail(null);
        try {
            const token = getToken();
            if (!token) {
                router.push("/admin/login");
                setDetailLoading(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/admin/project-requests/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setDetail(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    // Update Status
    const updateStatus = async (id: number, newStatus: string) => {
        setStatusUpdating(true);
        try {
            const token = getToken();
            if (!token) {
                router.push("/admin/login");
                setStatusUpdating(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/admin/project-requests/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Update list state
                setRequests((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
                );
                // Update detail state if open
                if (detail && detail.id === id) {
                    setDetail({ ...detail, status: newStatus });
                }
            } else {
                alert("Durum güncellenemedi.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setStatusUpdating(false);
        }
    };

    // Archive Request
    const archiveRequest = async (id: number) => {
        if (!confirm("Bu talebi arşivlemek istediğinize emin misiniz?")) return;

        setArchiving(true);
        try {
            const token = getToken();
            if (!token) {
                router.push("/admin/login");
                setArchiving(false);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/admin/project-requests/${id}/archive`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                if (!includeArchived) {
                    // Remove from list if we are not showing archived
                    setRequests((prev) => prev.filter((r) => r.id !== id));
                } else {
                    // Just refresh list or update UI logic if needed
                    fetchProjectRequests();
                }

                // Close modal if open
                if (selectedRequestId === id) {
                    setSelectedRequestId(null);
                    setDetail(null);
                }
            } else {
                alert("Arşivleme başarısız.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setArchiving(false);
        }
    };

    // Download PDF
    const downloadPdf = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        setDownloadingPdfId(id);
        try {
            const token = getToken();
            if (!token) {
                router.push("/admin/login");
                setDownloadingPdfId(null);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/admin/project-requests/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `proje-talebi-${id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert("PDF indirilemedi.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setDownloadingPdfId(null);
        }
    };

    // Helpers
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "New":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "InReview":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Completed":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            default:
                return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "New": return "Yeni";
            case "InReview": return "İncelemede";
            case "Completed": return "Tamamlandı";
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Proje Talepleri</h1>
                    <p className="text-slate-400">
                        Müşterilerden gelen proje taleplerini görüntüleyin, durumlarını yönetin ve PDF çıktısı alın.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Durum:</span>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
                            >
                                <option value="All">Tümü</option>
                                <option value="New">Yeni</option>
                                <option value="InReview">İncelemede</option>
                                <option value="Completed">Tamamlandı</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="includeArchived"
                            checked={includeArchived}
                            onChange={(e) => setIncludeArchived(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <label htmlFor="includeArchived" className="text-sm text-slate-300 cursor-pointer select-none">
                            Arşivlenenleri Göster
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-400">{error}</div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">Kayıt bulunamadı.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Talep No</th>
                                        <th scope="col" className="px-6 py-4">Tarih</th>
                                        <th scope="col" className="px-6 py-4">Proje Tipi</th>
                                        <th scope="col" className="px-6 py-4">Konum</th>
                                        <th scope="col" className="px-6 py-4">Müşteri</th>
                                        <th scope="col" className="px-6 py-4">Durum</th>
                                        <th scope="col" className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {requests.map((req) => (
                                        <tr
                                            key={req.id}
                                            className="bg-slate-900/40 hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-mono text-slate-400">#{req.id}</td>
                                            <td className="px-6 py-4">
                                                {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">{req.projectType}</td>
                                            <td className="px-6 py-4">{req.city} / {req.district}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{req.fullName}</div>
                                                <div className="text-xs text-slate-500">{req.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(req.status)}`}>
                                                    {getStatusLabel(req.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => fetchDetail(req.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        Detay
                                                    </button>
                                                    <button
                                                        onClick={(e) => downloadPdf(req.id, e)}
                                                        disabled={downloadingPdfId === req.id}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                                                    >
                                                        {downloadingPdfId === req.id ? "..." : "PDF"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequestId && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-end"
                    onClick={() => setSelectedRequestId(null)}
                >
                    <div
                        className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto shadow-2xl animate-slideInRight"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailLoading || !detail ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Modal Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Proje Talebi #{detail.id}</h2>
                                        <p className="text-slate-400 text-sm">
                                            {new Date(detail.createdAt).toLocaleString("tr-TR")}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedRequestId(null)}
                                        className="text-slate-400 hover:text-white p-2"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Status Actions */}
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Durum Yönetimi</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {["New", "InReview", "Completed"].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(detail.id, status)}
                                                disabled={statusUpdating || detail.status === status}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${detail.status === status
                                                        ? getStatusBadge(status) + " ring-2 ring-offset-2 ring-offset-slate-900 ring-emerald-500/50"
                                                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                                                    }`}
                                            >
                                                {getStatusLabel(status)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Proje Türü</h3>
                                        <p className="text-lg text-white font-medium">{detail.projectType}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-1">Ad Soyad</h3>
                                            <p className="text-white">{detail.fullName}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-1">Telefon</h3>
                                            <p className="text-white font-mono">{detail.phone}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-1">Şehir</h3>
                                            <p className="text-white">{detail.city}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-1">İlçe</h3>
                                            <p className="text-white">{detail.district}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Adres</h3>
                                        <p className="text-white bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                            {detail.address}
                                        </p>
                                    </div>

                                    {detail.description && (
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-1">Açıklama</h3>
                                            <p className="text-white bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                                {detail.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-6 border-t border-slate-800 flex gap-3">
                                    <button
                                        onClick={(e) => downloadPdf(detail.id, e)}
                                        disabled={downloadingPdfId === detail.id}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {downloadingPdfId === detail.id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span>📄 PDF İndir</span>
                                        )}
                                    </button>

                                    {!detail.isArchived && (
                                        <button
                                            onClick={() => archiveRequest(detail.id)}
                                            disabled={archiving}
                                            className="px-4 py-3 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-900/50 rounded-xl font-medium transition-all disabled:opacity-50"
                                        >
                                            {archiving ? "..." : "Arşivle"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
