"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";
const STATUS_OPTIONS = ["", "Pending", "InProgress", "WaitingForCustomer", "Completed", "Canceled"];

type ServiceItem = {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt?: string | null;
    adminNote?: string | null;
    photoPath?: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    history: {
        status: string;
        note?: string | null;
        changedBy: string;
        createdAt: string;
    }[];
};

export default function AdminServiceItemsPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [detail, setDetail] = useState<ServiceItem | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [statusForm, setStatusForm] = useState({ status: "InProgress", note: "" });
    const [noteForm, setNoteForm] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [createForm, setCreateForm] = useState({
        customerId: 0,
        title: "",
        description: ""
    });

    useEffect(() => {
        fetchItems();
    }, [statusFilter, search]);

    const fetchItems = async () => {
        const token = getToken();
        if (!token) {
            setError("Oturum bulunamadı.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append("status", statusFilter);
            if (search) params.append("search", search);

            const response = await fetch(`${API_BASE_URL}/api/admin/service-items?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Servis kayıtları yüklenemedi.");
            }

            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Servis kayıtları alınırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (id: number) => {
        const token = getToken();
        if (!token) return;

        setDetailLoading(true);
        setDetail(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/service-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setDetail(data);
            setStatusForm({ status: data.status, note: "" });
            setNoteForm("");
        } catch {
            setError("Detay yüklenemedi.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!detail) return;
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/service-items/${detail.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: statusForm.status,
                    note: statusForm.note || null,
                }),
            });

            if (!response.ok) {
                throw new Error();
            }

            await fetchDetail(detail.id);
            await fetchItems();
            setStatusForm({ status: statusForm.status, note: "" });
        } catch {
            setError("Durum güncelleme başarısız.");
        }
    };

    const handleAddNote = async () => {
        if (!detail || !noteForm.trim()) return;
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/service-items/${detail.id}/note`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ note: noteForm.trim() }),
            });

            if (!response.ok) throw new Error();

            await fetchDetail(detail.id);
            await fetchItems();
            setNoteForm("");
        } catch {
            setError("Admin notu kaydedilemedi.");
        }
    };

    useEffect(() => {
        const fetchCustomers = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCustomers(Array.isArray(data) ? data : []);
                }
            } catch {
                console.error("Müşteriler yüklenemedi");
            }
        };

        fetchCustomers();
    }, []);

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        if (!createForm.customerId || !createForm.title.trim() || !createForm.description.trim()) {
            setError("Tüm alanlar zorunludur.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/service-items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(createForm)
            });

            if (!response.ok) throw new Error();

            setShowCreateForm(false);
            setCreateForm({ customerId: 0, title: "", description: "" });
            await fetchItems();
        } catch {
            setError("Servis kaydı oluşturulamadı.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Servis Kayıtları</h1>
                    <p className="text-sm text-slate-600">Tüm servis/arıza taleplerini yönetin.</p>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-500 transition"
                    >
                        + Yeni Servis Kaydı
                    </button>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt ? opt : "Tüm Durumlar"}
                            </option>
                        ))}
                    </select>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ara..."
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Başlık</th>
                                <th className="px-4 py-3">Müşteri</th>
                                <th className="px-4 py-3">Durum</th>
                                <th className="px-4 py-3">Oluşturulma</th>
                                <th className="px-4 py-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-900">{item.customerName}</p>
                                        <p className="text-xs text-slate-500">{item.customerEmail}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {new Date(item.createdAt).toLocaleString("tr-TR")}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => fetchDetail(item.id)}
                                            className="text-sm text-emerald-600 hover:text-emerald-500"
                                        >
                                            Detay
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateForm(false)}>
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Yeni Servis Kaydı</h2>
                                <p className="text-sm text-slate-600">Müşteri için servis/arıza kaydı oluşturun</p>
                            </div>
                            <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateService} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri *</label>
                                <select
                                    required
                                    value={createForm.customerId}
                                    onChange={(e) => setCreateForm({ ...createForm, customerId: parseInt(e.target.value) })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value={0}>Müşteri Seçiniz</option>
                                    {customers.map((customer: any) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.fullName} ({customer.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:border-emerald-500 focus:outline-none"
                                    placeholder="Örn: Kamera arızası"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:border-emerald-500 focus:outline-none"
                                    placeholder="Servis/arıza detaylarını açıklayın..."
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition font-semibold"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setDetail(null)}
                >
                    <div
                        className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">{detail.title}</h2>
                                        <p className="text-sm text-slate-400">{detail.customerName} • {detail.customerEmail}</p>
                                    </div>
                                    <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-white">
                                        ✕
                                    </button>
                                </div>

                                <p className="mt-4 text-slate-200">{detail.description}</p>

                                {detail.photoPath && (
                                    <div className="mt-4">
                                        <img
                                            src={`${API_BASE_URL}/${detail.photoPath}`}
                                            alt="Servis fotoğrafı"
                                            className="max-h-72 rounded-xl border border-slate-700 object-cover"
                                        />
                                    </div>
                                )}

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Durum Güncelle</h3>
                                        <div className="space-y-2">
                                            <select
                                                value={statusForm.status}
                                                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                                            >
                                                {STATUS_OPTIONS.filter(Boolean).map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <textarea
                                                rows={2}
                                                value={statusForm.note}
                                                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                                                placeholder="Durum notu (opsiyonel)"
                                            />
                                            <button
                                                onClick={handleStatusUpdate}
                                                className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                                            >
                                                Güncelle
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Admin Notu</h3>
                                        <textarea
                                            rows={4}
                                            value={noteForm}
                                            onChange={(e) => setNoteForm(e.target.value)}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                                            placeholder="Yeni admin notu"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={!noteForm.trim()}
                                            className="mt-2 w-full rounded-lg bg-slate-800 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                                        >
                                            Not Ekle
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Durum Geçmişi</h3>
                                    <div className="space-y-2">
                                        {detail.history.map((record, idx) => (
                                            <div
                                                key={`${record.status}-${idx}`}
                                                className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-white">{record.status}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(record.createdAt).toLocaleString("tr-TR")}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">by {record.changedBy}</p>
                                                {record.note && (
                                                    <p className="mt-1 text-slate-300">{record.note}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
