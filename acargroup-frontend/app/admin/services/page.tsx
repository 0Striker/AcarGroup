"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

// 30 service-related emojis
const SERVICE_EMOJIS = [
    "📹", "🔒", "🌐", "💻", "📡", "🔥", "⚡", "🛡️",
    "📱", "🖥️", "⚙️", "🔧", "🛠️", "📊", "📈", "💼",
    "🏢", "🏗️", "🚀", "💡", "🔌", "📞", "✉️", "🌟",
    "⚠️", "🎯", "🔑", "📦", "🗄️", "☁️"
];

interface HomepageServiceItem {
    id: number;
    title: string;
    description: string;
    detailedDescription: string;
    icon: string;
    displayOrder: number;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<HomepageServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<HomepageServiceItem | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        detailedDescription: "",
        icon: SERVICE_EMOJIS[0],
        displayOrder: 0
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/homepageservices`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            detailedDescription: "",
            icon: SERVICE_EMOJIS[0],
            displayOrder: services.length > 0 ? Math.max(...services.map(s => s.displayOrder)) + 1 : 1
        });
    };

    const handleCreateClick = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleEditClick = (service: HomepageServiceItem) => {
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description,
            detailedDescription: service.detailedDescription,
            icon: service.icon,
            displayOrder: service.displayOrder
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            toast.error("Lütfen giriş yapın");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/homepageservices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newService = await res.json();
                setServices([...services, newService]);
                setIsCreateModalOpen(false);
                toast.success("Hizmet başarıyla eklendi!");
                resetForm();
            } else {
                toast.error("Ekleme başarısız oldu.");
            }
        } catch (error) {
            console.error("Error creating service:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        const token = getToken();
        if (!token) {
            toast.error("Lütfen giriş yapın");
            return;
        }

        try {
            const payload = { ...editingService, ...formData };
            const res = await fetch(`${API_BASE_URL}/api/homepageservices/${editingService.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setServices(services.map(s => s.id === editingService.id ? payload : s));
                setEditingService(null);
                toast.success("Hizmet başarıyla güncellendi!");
            } else {
                toast.error("Güncelleme başarısız oldu.");
            }
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    const handleDelete = async (service: HomepageServiceItem) => {
        if (!confirm(`"${service.title}" hizmetini silmek istediğinizden emin misiniz?`)) return;

        const token = getToken();
        if (!token) {
            toast.error("Lütfen giriş yapın");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/homepageservices/${service.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setServices(services.filter(s => s.id !== service.id));
                toast.success("Hizmet başarıyla silindi!");
            } else {
                toast.error("Silme başarısız oldu.");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Hizmet Yönetimi (Ana Sayfa)</h1>
                    <p className="text-slate-600 mt-1">Ana sayfada "Hizmetlerimiz" bölümünde görünen kartların içeriğini buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Hizmet Ekle
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">İkon</th>
                            <th className="px-6 py-4">Başlık</th>
                            <th className="px-6 py-4">Kısa Açıklama</th>
                            <th className="px-6 py-4 w-48">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 text-2xl">{service.icon}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{service.title}</td>
                                <td className="px-6 py-4 text-slate-500 truncate max-w-xs" title={service.description}>
                                    {service.description}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(service)}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service)}
                                            className="text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">Yeni Hizmet Ekle</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Hizmet Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Kısa Açıklama (Kart Üzerinde)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Detaylı Açıklama (Tıklayınca Açılan)</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.detailedDescription}
                                    onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Bu alan, kullanıcı karttaki ok işaretine bastığında açılan detay kısmıdır.</p>
                            </div>

                            {/* Emoji Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-3">İkon Seçin</label>
                                <div className="grid grid-cols-10 gap-2">
                                    {SERVICE_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: emoji })}
                                            className={`aspect-square text-2xl rounded-lg border-2 transition hover:scale-110 ${formData.icon === emoji
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-slate-200 hover:border-emerald-300"
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Görüntüleme Sırası</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Küçük değerler daha önce görünür</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition"
                                >
                                    Hizmeti Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">Hizmeti Düzenle</h2>
                            <button
                                onClick={() => setEditingService(null)}
                                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Hizmet Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Kısa Açıklama (Kart Üzerinde)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Detaylı Açıklama (Tıklayınca Açılan)</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.detailedDescription}
                                    onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Bu alan, kullanıcı karttaki ok işaretine bastığında açılan detay kısmıdır.</p>
                            </div>

                            {/* Emoji Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-3">İkon Seçin</label>
                                <div className="grid grid-cols-10 gap-2">
                                    {SERVICE_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: emoji })}
                                            className={`aspect-square text-2xl rounded-lg border-2 transition hover:scale-110 ${formData.icon === emoji
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-slate-200 hover:border-emerald-300"
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Görüntüleme Sırası</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Küçük değerler daha önce görünür</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingService(null)}
                                    className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
