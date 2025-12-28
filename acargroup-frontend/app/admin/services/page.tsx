"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

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

    // Edit Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        detailedDescription: "",
        icon: "",
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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        const token = getToken();
        if (!token) return;

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
                alert("Hizmet başarıyla güncellendi!");
            } else {
                alert("Güncelleme başarısız oldu.");
            }
        } catch (error) {
            console.error("Error updating service:", error);
            alert("Bir hata oluştu.");
        }
    };

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Hizmet Yönetimi (Ana Sayfa)</h1>
            <p className="text-slate-600 mb-6">Ana sayfada "Hizmetlerimiz" bölümünde görünen kartların içeriğini buradan düzenleyebilirsiniz.</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">İkon</th>
                            <th className="px-6 py-4">Başlık</th>
                            <th className="px-6 py-4">Kısa Açıklama</th>
                            <th className="px-6 py-4 w-40">İşlemler</th>
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
                                    <button
                                        onClick={() => handleEditClick(service)}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                    >
                                        Düzenle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

                            {/* Optional: Icon Editing */}
                            <div className="hidden">
                                <label className="block text-sm font-medium text-slate-900 mb-2">İkon (Emoji)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
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
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
