"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import ImageUpload from "@/components/admin/ImageUpload";
import VideoUpload from "@/components/admin/VideoUpload";
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
    videoUrl: string | null;
    galleryImageUrls: string | null;
    address: string | null;
    phoneNumber: string | null;
    phoneNumber2: string | null; // Added
    email: string | null;
    email2: string | null; // Added
    whatsappNumber: string | null;
    mapUrl: string | null;
    // Settings are handled separately but might be part of the object
    logoTitle?: string;
    logoText?: string;
    tickerText?: string;
    showCurrencyRates?: boolean;
    isWhatsappButtonActive?: boolean;
    isInternetApplicationButtonActive?: boolean;
    createdAt: string;
    updatedAt: string | null;
    logoUrl?: string; // Added for logo
};

type CompanyInfoCreateUpdateDto = {
    title: string;
    subtitle: string;
    content: string;
    heroImageUrl?: string;
    sliderImageUrl1?: string;
    sliderImageUrl2?: string;
    sliderImageUrl3?: string;
    videoUrl?: string;
    galleryImageUrls?: string;
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
        videoUrl: "",
        galleryImageUrls: "",
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
        if (!token) return;

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
                    videoUrl: data.videoUrl || "",
                    galleryImageUrls: data.galleryImageUrls || "",
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
            setError("Bir hata oluştu.");
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
                // Notify other parts of the app (e.g., footer in layout) about the update
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('companyInfoUpdated'));
                }
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

    if (loading) return <div className="text-white p-8">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Şirket/Biz Kimiz Bilgileri</h1>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-emerald-200"
                >
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                {/* Hero Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">Ana Bölüm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Üst Başlık (Title)</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Alt Başlık (Subtitle)</label>
                            <input
                                type="text"
                                required
                                value={formData.subtitle}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Hakkımızda Yazısı</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                            <RichTextEditor
                                value={formData.content}
                                onChange={(val) => setFormData({ ...formData, content: val })}
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-medium text-white">Görseller & Medya</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <ImageUpload
                                label="Büyük Hero Görseli"
                                currentImageUrl={formData.heroImageUrl}
                                onUploadSuccess={(url) => setFormData({ ...formData, heroImageUrl: url })}
                                endpoint="/api/upload/image"
                            />
                            <p className="text-xs text-slate-500">Ana sayfada 'Biz Kimiz' arka planında kullanılır.</p>
                        </div>
                        <div className="space-y-2">
                            <ImageUpload
                                label="Slider Görseli 1"
                                currentImageUrl={formData.sliderImageUrl1}
                                onUploadSuccess={(url) => setFormData({ ...formData, sliderImageUrl1: url })}
                                endpoint="/api/upload/image"
                            />
                        </div>

                        <div className="space-y-2">
                            <ImageUpload
                                label="Slider Görseli 2"
                                currentImageUrl={formData.sliderImageUrl2}
                                onUploadSuccess={(url) => setFormData({ ...formData, sliderImageUrl2: url })}
                                endpoint="/api/upload/image"
                            />
                        </div>

                        <div className="space-y-2">
                            <ImageUpload
                                label="Slider Görseli 3"
                                currentImageUrl={formData.sliderImageUrl3}
                                onUploadSuccess={(url) => setFormData({ ...formData, sliderImageUrl3: url })}
                                endpoint="/api/upload/image"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <VideoUpload
                                label="Tanıtım Videosu (Opsiyonel)"
                                currentVideoUrl={formData.videoUrl}
                                onUploadSuccess={(url) => setFormData({ ...formData, videoUrl: url })}
                                endpoint="/api/upload/video"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Galeri Görselleri (Opsiyonel)</label>
                        <textarea
                            rows={4}
                            value={formData.galleryImageUrls}
                            onChange={e => setFormData({ ...formData, galleryImageUrls: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-xs"
                            placeholder='["https://...", "https://..."] veya her satıra bir link'
                        />
                        <p className="text-xs text-slate-500">Birden fazla görsel için her satıra bir URL girin veya JSON array formatında</p>
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
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                                onChange={(e) => setFormData({ ...formData, phoneNumber2: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                                onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="muhasebe@acargroup.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                WhatsApp Numarası
                            </label>
                            <input
                                type="text"
                                value={formData.whatsappNumber || ""}
                                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="905555555555 (Boşluksuz)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Google Maps URL
                            </label>
                            <input
                                type="text"
                                value={formData.mapUrl || ""}
                                onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Açık Adres
                        </label>
                        <textarea
                            rows={3}
                            value={formData.address || ""}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="Adres detayları..."
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-700 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-emerald-900/20 text-lg flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Kaydediliyor...
                            </>
                        ) : "Bilgileri Kaydet"}
                    </button>
                </div>
            </form>
        </div>
    );
}
