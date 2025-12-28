"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203";

export default function InternetApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            setError("Oturum açmanız gerekiyor.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/internet-applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            } else {
                setError("Başvurular yüklenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error(err);
            setError("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: number) => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/internet-applications/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchApplications();
                if (selectedApp && selectedApp.id === id) {
                    setSelectedApp({ ...selectedApp, status });
                }
            } else {
                alert("Durum güncellenemedi.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/internet-applications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setApplications(applications.filter(app => app.id !== id));
                if (selectedApp && selectedApp.id === id) {
                    setShowDetailModal(false);
                    setSelectedApp(null);
                }
            } else {
                alert("Silme işlemi başarısız.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Yeni</span>;
            case 1: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">İncelendi</span>;
            case 2: return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">Tamamlandı</span>;
            case 3: return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">İptal</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">Bilinmiyor</span>;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">İnternet Başvuruları</h1>
                    <p className="text-slate-500 text-sm">Web sitesinden gelen internet başvurularını yönetin.</p>
                </div>
                <button
                    onClick={fetchApplications}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Yenile
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                    <p className="text-slate-500">Henüz başvuru bulunmamaktadır.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ad Soyad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{app.fullName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{app.phoneNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">
                                            {new Date(app.createdAt).toLocaleDateString("tr-TR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedApp(app);
                                                setShowDetailModal(true);
                                            }}
                                            className="text-emerald-600 hover:text-emerald-900 mr-4"
                                        >
                                            Detay
                                        </button>
                                        <button
                                            onClick={() => handleDelete(app.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Başvuru Detayı</h3>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-1">Ad Soyad</label>
                                <p className="text-slate-800 font-medium">{selectedApp.fullName}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-1">Telefon</label>
                                <p className="text-slate-800 font-medium">{selectedApp.phoneNumber}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-1">Adres</label>
                                <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                    {selectedApp.address}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-1">Başvuru Tarihi</label>
                                <p className="text-slate-800 font-medium">
                                    {new Date(selectedApp.createdAt).toLocaleDateString("tr-TR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-2">Durum Güncelle</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, 0)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${selectedApp.status === 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        Yeni
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, 1)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${selectedApp.status === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        İncelendi
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, 2)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${selectedApp.status === 2 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        Tamamlandı
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, 3)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${selectedApp.status === 3 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
