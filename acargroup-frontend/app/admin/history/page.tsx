"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import {
    HiOutlineOfficeBuilding,
    HiOutlineUsers,
    HiOutlineTrendingUp,
    HiOutlineGlobe,
    HiOutlineAcademicCap,
    HiOutlineLightBulb,
    HiOutlineShieldCheck,
    HiOutlineStar,
    HiPlus,
    HiPencil,
    HiTrash
} from "react-icons/hi";
import * as Icons from "react-icons/hi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type HistoryItem = {
    id: number;
    years: string;
    title: string;
    description: string;
    icon: string;
};

const ICON_OPTIONS = [
    { name: "HiOutlineOfficeBuilding", icon: HiOutlineOfficeBuilding, label: "Bina" },
    { name: "HiOutlineUsers", icon: HiOutlineUsers, label: "Kullanıcılar" },
    { name: "HiOutlineTrendingUp", icon: HiOutlineTrendingUp, label: "Yükseliş" },
    { name: "HiOutlineGlobe", icon: HiOutlineGlobe, label: "Dünya" },
    { name: "HiOutlineAcademicCap", icon: HiOutlineAcademicCap, label: "Eğitim" },
    { name: "HiOutlineLightBulb", icon: HiOutlineLightBulb, label: "Fikir/İnovasyon" },
    { name: "HiOutlineShieldCheck", icon: HiOutlineShieldCheck, label: "Güvenlik" },
    { name: "HiOutlineStar", icon: HiOutlineStar, label: "Yıldız/Başarı" },
];

export default function AdminHistoryPage() {
    const router = useRouter();
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);

    const [formData, setFormData] = useState({
        years: "",
        title: "",
        description: "",
        icon: "HiOutlineStar"
    });

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();

        try {
            const url = editingItem
                ? `${API_BASE_URL}/api/history/${editingItem.id}`
                : `${API_BASE_URL}/api/history`;

            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({ years: "", title: "", description: "", icon: "HiOutlineStar" });
                fetchItems();
            } else {
                alert("İşlem başarısız oldu.");
            }
        } catch (error) {
            console.error("Error saving history:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/api/history/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchItems();
            } else {
                alert("Silme işlemi başarısız.");
            }
        } catch (error) {
            console.error("Error deleting history:", error);
        }
    };

    const openEditModal = (item: HistoryItem) => {
        setEditingItem(item);
        setFormData({
            years: item.years,
            title: item.title,
            description: item.description,
            icon: item.icon
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ years: "", title: "", description: "", icon: "HiOutlineStar" });
        setIsModalOpen(true);
    };

    // Helper to render icon dynamically
    const renderIcon = (iconName: string) => {
        // @ts-ignore
        const IconComponent = Icons[iconName] || HiOutlineStar;
        return <IconComponent className="w-6 h-6" />;
    };

    if (loading) return <div className="text-white p-8">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Tarihçe Yönetimi</h1>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <HiPlus /> Yeni Ekle
                </button>
            </div>

            <div className="grid gap-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                {renderIcon(item.icon)}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-semibold">
                                        {item.years}
                                    </span>
                                    <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                                </div>
                                <p className="text-slate-600 max-w-2xl">{item.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openEditModal(item)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                <HiPencil className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
                                <HiTrash className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingItem ? "Kaydı Düzenle" : "Yeni Kayıt Ekle"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Yıllar</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.years}
                                        onChange={e => setFormData({ ...formData, years: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        placeholder="Örn: 2020-2023"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Başlık</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        placeholder="Başlık giriniz"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Açıklama</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none h-32 resize-none"
                                    placeholder="Detaylı açıklama..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 block mb-2">İkon Seçimi</label>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                    {ICON_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: opt.name })}
                                                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${formData.icon === opt.name
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500 ring-offset-2"
                                                        : "border-slate-200 hover:border-emerald-300 text-slate-500 hover:bg-slate-50"
                                                    }`}
                                                title={opt.label}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                >
                                    {editingItem ? "Güncelle" : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
