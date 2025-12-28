"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import CloudinaryImageUpload from "@/components/admin/CloudinaryImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type CompanyInfoDto = {
    id: number;
    title: string;
    subtitle: string;
    content: string;
    heroImageUrl: string | null;
    sliderImageUrl1: string | null;
    sliderImageUrl2: string | null;
    sliderImageUrl3: string | null;
    address: string | null;
    phoneNumber: string | null;
    phoneNumber2: string | null;
    email: string | null;
    email2: string | null;
    whatsappNumber: string | null;
    mapUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
};

type CompanyInfoCreateUpdateDto = {
    title: string;
    subtitle: string;
    content: string;
    heroImageUrl?: string;
    sliderImageUrl1?: string;
    sliderImageUrl2?: string;
    sliderImageUrl3?: string;
    address?: string;
    phoneNumber?: string;
    phoneNumber2?: string; // Added
    email?: string;
    email2?: string; // Added
    whatsappNumber?: string;
    mapUrl?: string;
};

export default function AdminCompanyInfoPage() {
    const router = useRouter();
    const [info, setInfo] = useState<CompanyInfoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CompanyInfoCreateUpdateDto>({
        title: "",
        subtitle: "",
        content: "",
        heroImageUrl: "",
        sliderImageUrl1: "",
        sliderImageUrl2: "",
        sliderImageUrl3: "",
        address: "",
        phoneNumber: "",
        phoneNumber2: "", // Added
        email: "",
        email2: "", // Added
        whatsappNumber: "",
        mapUrl: "",
    });

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/companyinfo`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data: CompanyInfoDto = await res.json();
                setInfo(data);
                setFormData({
                    title: data.title,
                    subtitle: data.subtitle,
                    content: data.content,
                    heroImageUrl: data.heroImageUrl || "",
                    sliderImageUrl1: data.sliderImageUrl1 || "",
                    sliderImageUrl2: data.sliderImageUrl2 || "",
                    sliderImageUrl3: data.sliderImageUrl3 || "",
                    address: data.address || "",
                    phoneNumber: data.phoneNumber || "",
                    phoneNumber2: data.phoneNumber2 || "", // Added
                    email: data.email || "",
                    email2: data.email2 || "", // Added
                    whatsappNumber: data.whatsappNumber || "",
                    mapUrl: data.mapUrl || "",
                });
            } else if (res.status === 404) {
                // No content yet, that's okay
                setInfo(null);
            } else {
                setError("Veri yüklenirken hata oluştu.");
            }
        } catch (err) {
            console.error(err);
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/companyinfo`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Başarıyla kaydedildi!");
                fetchCompanyInfo();
            } else {
                const msg = await res.text();
                alert(`Kaydetme başarısız: ${msg}`);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 md:p-8">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Biz Kimiz Yönetimi</h1>
                    <p className="text-slate-400">
                        &quot;Biz Kimiz&quot; sayfasının içeriğini buradan düzenleyebilirsiniz.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Başlık</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Örn: Biz Kimiz?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Alt Başlık</label>
                        <input
                            type="text"
                            required
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Kısa tanıtım metni"
                        />
                    </div>

                    <div className="space-y-2">
                        <RichTextEditor
                            label="İçerik"
                            value={formData.content}
                            onChange={(val) => setFormData({ ...formData, content: val })}
                            placeholder="İçeriğinizi buraya girin..."
                        />
                    </div>

                    <div className="space-y-2">
                        <CloudinaryImageUpload
                            label="Hero Görsel (Opsiyonel)"
                            currentImageUrl={formData.heroImageUrl}
                            onUploadSuccess={(url) => setFormData({ ...formData, heroImageUrl: url })}
                            endpoint="/api/upload/image"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-400 block">Galeri Görselleri (Opsiyonel)</label>

                        <div className="space-y-2">
                            <CloudinaryImageUpload
                                label="Görsel 1"
                                currentImageUrl={formData.sliderImageUrl1}
                                onUploadSuccess={(url) => setFormData({ ...formData, sliderImageUrl1: url })}
                                endpoint="/api/upload/image"
                            />
                        </div>

                        <div className="space-y-2">
                            <CloudinaryImageUpload
                                label="Görsel 2"
                                currentImageUrl={formData.sliderImageUrl2}
                                onUploadSuccess={(url) => setFormData({ ...formData, sliderImageUrl2: url })}
                                endpoint="/api/upload/image"
                            />
                        </div>

                        <div className="space-y-2">
                            <CloudinaryImageUpload
                                label="Görsel 3"
                                currentImageUrl={formData.sliderImageUrl3}
                                onUploadSuccess={(url) => setFormData({ ...formData, sliderImageUrl3: url })}
                                endpoint="/api/upload/image"
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-medium text-white">İletişim Bilgileri</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Telefon Numarası
                                </label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="+90 555 555 55 55"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Telefon Numarası 2
                                </label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber2 || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber2: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="+90 555 555 55 55"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    E-posta Adresi
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="info@acargroup.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    E-posta Adresi 2
                                </label>
                                <input
                                    type="email"
                                    value={formData.email2 || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email2: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="destek@acargroup.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    WhatsApp Numarası
                                </label>
                                <input
                                    type="text"
                                    value={formData.whatsappNumber || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, whatsappNumber: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="905555555555 (Boşluksuz)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Adres
                                </label>
                                <textarea
                                    value={formData.address || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                                    placeholder="Açık adres..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Google Maps Embed URL
                                </label>
                                <textarea
                                    value={formData.mapUrl || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, mapUrl: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                                    placeholder="https://www.google.com/maps/embed?..."
                                />
                                <p className="text-xs text-slate-500 mt-1">Google Maps'ten 'Paylaş' &gt; 'Harita yerleştirme' seçeneği ile aldığınız iframe src linki.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                        >
                            {saving ? "Kaydediliyor..." : info ? "Güncelle" : "Oluştur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
