"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import {
    Package,
    Layers,
    FileText,
    Users,
    Briefcase,
    Award,
    Image as ImageIcon,
    ArrowRight
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

// Reads /api/admin/summary with the shared acargroup_* token to populate dashboard cards.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type SummaryData = {
    totalProducts: number;
    totalCategories: number;
    totalProjectRequests: number;
    totalCustomers: number;
    totalReferences: number;
    totalBrands: number;
    totalProjects: number;
};

export default function AdminDashboard() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [companyInfo, setCompanyInfo] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = getToken();
                const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

                const [summaryRes, companyInfoRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/admin/summary`, { headers }),
                    fetch(`${API_BASE_URL}/api/companyinfo`, { headers })
                ]);

                if (!summaryRes.ok) throw new Error("Summary fetch failed");
                setSummary(await summaryRes.json());

                if (companyInfoRes.ok) {
                    setCompanyInfo(await companyInfoRes.json());
                }

            } catch (err) {
                setError("Veriler alınırken bir hata oluştu.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const [localSettings, setLocalSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local settings when companyInfo loads
    useEffect(() => {
        if (companyInfo) {
            setLocalSettings(companyInfo);
        }
    }, [companyInfo]);

    const handleSettingChange = (key: string, value: boolean | string) => {
        setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveSettings = async () => {
        if (!hasChanges) return;

        try {
            setIsSaving(true);
            const token = getToken();

            const res = await fetch(`${API_BASE_URL}/api/companyinfo`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(localSettings)
            });

            if (!res.ok) {
                throw new Error("Update failed");
            }

            setCompanyInfo(localSettings);
            setHasChanges(false);
            alert("Ayarlar başarıyla kaydedildi!");
        } catch (error) {
            console.error(error);
            alert("Ayarlar güncellenemedi.");
        } finally {
            setIsSaving(false);
        }
    };

    const stats = [
        {
            label: "Toplam Ürün",
            value: summary?.totalProducts ?? 0,
            desc: "Sistemdeki tüm ürünler",
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Toplam Kategori",
            value: summary?.totalCategories ?? 0,
            desc: "Aktif kategori sayısı",
            icon: Layers,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            label: "Proje Talepleri",
            value: summary?.totalProjectRequests ?? 0,
            desc: "Gelen tüm proje talepleri",
            icon: FileText,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            label: "Tamamlanan Projeler",
            value: summary?.totalProjects ?? 0,
            desc: "Referans projelerimiz",
            icon: Briefcase,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            label: "Referanslar",
            value: summary?.totalReferences ?? 0,
            desc: "Müşteri referansları",
            icon: Award,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            label: "Markalar",
            value: summary?.totalBrands ?? 0,
            desc: "Çalışılan markalar",
            icon: ImageIcon,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20"
        }
    ];

    const quickActions = [
        {
            title: "Ürünleri Yönet",
            desc: "Ürün ekle, düzenle, sil",
            href: "/admin/products",
            icon: Package
        },
        {
            title: "Kategorileri Yönet",
            desc: "Kategori ekle, düzenle, sil",
            href: "/admin/categories",
            icon: Layers
        },
        {
            title: "Projeleri Yönet",
            desc: "Projeleri listele ve düzenle",
            href: "/admin/projects",
            icon: Briefcase
        },
        {
            title: "Referansları Yönet",
            desc: "Referans ekle ve düzenle",
            href: "/admin/references",
            icon: Award
        },
        {
            title: "Markaları Yönet",
            desc: "Marka logolarını düzenle",
            href: "/admin/brands",
            icon: ImageIcon
        },
        {
            title: "Müşterileri Yönet",
            desc: "Müşteri kayıtlarını görüntüle",
            href: "/admin/customers",
            icon: Users
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Yönetim Paneli
                </h1>
                <p className="text-slate-600">
                    AcarGroup altyapısının genel özetini buradan takip edebilirsiniz.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <span className="font-bold">Hata:</span> {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${stat.border}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-3xl font-bold text-slate-900">
                                {loading ? "-" : stat.value}
                            </span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-700">
                                {stat.label}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                                {stat.desc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button -Fixed at bottom of settings */}
            {hasChanges && (
                <div className="bg-white rounded-3xl border border-emerald-200 p-6 mb-8 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <div>
                                <div className="text-sm font-semibold text-slate-900">Kaydedilmemiş Değişiklikler</div>
                                <div className="text-xs text-slate-500">Değişikliklerinizi kaydetmeyi unutmayın</div>
                            </div>
                        </div>
                        <button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* General Settings Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Genel Ayarlar
                    </h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <ImageUpload
                            label="Site Logosu"
                            endpoint="/api/upload/local"
                            currentImageUrl={companyInfo?.logoUrl}
                            onUploadSuccess={(url) => handleSettingChange("logoUrl", url)}
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Yüklenen logo Navbar'da görünecektir. (Önerilen: PNG veya SVG)
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Settings */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900">
                        İçerik Ayarları
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Logo Yanı Başlık (Marka)
                        </label>
                        <input
                            type="text"
                            value={companyInfo?.logoTitle || ""}
                            onChange={(e) => handleSettingChange("logoTitle", e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                            placeholder="Örn: AcarGroup"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Navbar'da logo olarak görünen ana başlık.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Logo Yanı Alt Yazı
                        </label>
                        <input
                            type="text"
                            value={companyInfo?.logoText || ""}
                            onChange={(e) => handleSettingChange("logoText", e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                            placeholder="Örn: Teknoloji & Güvenlik"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Navbar'da logo yanında görünen alt başlık.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Kayar Yazı (Boş bırakılabilir)
                        </label>
                        <input
                            type="text"
                            value={companyInfo?.tickerText || ""}
                            onChange={(e) => handleSettingChange("tickerText", e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900"
                            placeholder="Örn: Acar Group Bilişim..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            En üstteki siyah barda kayan yazı.
                        </p>
                    </div>

                    <SettingsToggle
                        label="Döviz Kuru Göster"
                        desc="En üst barda döviz kurlarını göster/gizle"
                        initialValue={companyInfo?.showCurrencyRates ?? true}
                        onToggle={(val) => handleSettingChange("showCurrencyRates", val)}
                    />
                </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Hızlı Ayarlar
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SettingsToggle
                        label="WhatsApp İletişim Butonu"
                        desc="Ana sayfadaki yüzen WhatsApp butonunu göster/gizle"
                        initialValue={companyInfo?.isWhatsappButtonActive ?? true}
                        onToggle={(val) => handleSettingChange("isWhatsappButtonActive", val)}
                    />
                    <SettingsToggle
                        label="İnternet Başvuru Butonu"
                        desc="Menüdeki İnternet Başvurusu butonunu göster/gizle"
                        initialValue={companyInfo?.isInternetApplicationButtonActive ?? true}
                        onToggle={(val) => handleSettingChange("isInternetApplicationButtonActive", val)}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Hızlı İşlemler
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
                        >
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-emerald-50 rounded-xl flex items-center justify-center transition-colors border border-slate-100 group-hover:border-emerald-100">
                                <action.icon className="w-6 h-6 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                    {action.title}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    {action.desc}
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SettingsToggle({ label, desc, initialValue, onToggle }: { label: string, desc: string, initialValue: boolean, onToggle: (val: boolean) => void }) {
    const [enabled, setEnabled] = useState(initialValue);

    // Sync local state with prop if it changes (optional but good for initial load)
    useEffect(() => {
        setEnabled(initialValue);
    }, [initialValue]);

    const handleToggle = () => {
        const newValue = !enabled;
        setEnabled(newValue);
        onToggle(newValue);
    };

    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
                <div className="font-semibold text-slate-800">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
    );
}
