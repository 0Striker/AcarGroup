"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

const serviceOptions = [
    "IP & HD Kamera Sistemleri",
    "Alarm Sistemleri",
    "Network & Ağ Altyapısı",
    "Bakım Destek",
    "Network–Server Sistemleri",
    "Güneş Enerjisi Sistemleri (GES)",
    "Araç Takip Sistemleri",
    "Otomasyon & Akıllı Ev Sistemleri",
    "Kayar LED Ekran",
    "Ses Sistemleri",
    "Elektrik–Elektronik Sistemleri",
    "Mühendislik Çözümleri",
];

type FormData = {
    serviceType: string;
    city: string;
    district: string;
    phone: string;
    fullName: string;
    address: string;
};

type FormErrors = Partial<FormData>;

export default function ProjectRequestPage() {
    const [formData, setFormData] = useState<FormData>({
        serviceType: "",
        city: "",
        district: "",
        phone: "",
        fullName: "",
        address: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
        "idle"
    );

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!formData.serviceType) {
            newErrors.serviceType = "Lütfen bir proje türü seçiniz.";
            isValid = false;
        }
        if (!formData.city.trim()) {
            newErrors.city = "İl alanı zorunludur.";
            isValid = false;
        }
        if (!formData.district.trim()) {
            newErrors.district = "İlçe alanı zorunludur.";
            isValid = false;
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Telefon numarası zorunludur.";
            isValid = false;
        } else if (formData.phone.replace(/\D/g, "").length < 10) {
            newErrors.phone = "Lütfen geçerli bir telefon numarası giriniz.";
            isValid = false;
        }
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Ad Soyad zorunludur.";
            isValid = false;
        }
        if (!formData.address.trim()) {
            newErrors.address = "Adres alanı zorunludur.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus("idle");

        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/project-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Submission failed");
            }

            setSubmitStatus("success");
            setFormData({
                serviceType: "",
                city: "",
                district: "",
                phone: "",
                fullName: "",
                address: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Proje Talebi
                    </h1>
                    <p className="text-slate-600 max-w-xl mx-auto">
                        İhtiyaç duyduğunuz güvenlik ve altyapı çözümleri için ön talep formunu
                        doldurun, en kısa sürede sizi arayalım.
                    </p>
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                    <div className="mb-6 p-4 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm font-medium">
                            Talebiniz alındı, en kısa sürede sizinle iletişime geçeceğiz.
                        </p>
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm font-medium">
                            Bir hata oluştu, lütfen daha sonra tekrar deneyin.
                        </p>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Proje Türü */}
                        <div>
                            <label
                                htmlFor="serviceType"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Proje Türü <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="serviceType"
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
                                className={`w-full rounded-xl bg-slate-50 border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.serviceType ? "border-red-300" : "border-slate-300"
                                    }`}
                            >
                                <option value="">Seçiniz...</option>
                                {serviceOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {errors.serviceType && (
                                <p className="mt-1 text-xs text-red-500">{errors.serviceType}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* İl */}
                            <div>
                                <label
                                    htmlFor="city"
                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                >
                                    Proje İli <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Örn: İstanbul"
                                    className={`w-full rounded-xl bg-slate-50 border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.city ? "border-red-300" : "border-slate-300"
                                        }`}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                                )}
                            </div>

                            {/* İlçe */}
                            <div>
                                <label
                                    htmlFor="district"
                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                >
                                    Proje İlçesi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="district"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    placeholder="Örn: Kadıköy"
                                    className={`w-full rounded-xl bg-slate-50 border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.district ? "border-red-300" : "border-slate-300"
                                        }`}
                                />
                                {errors.district && (
                                    <p className="mt-1 text-xs text-red-500">{errors.district}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ad Soyad */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                >
                                    Ad Soyad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Adınız Soyadınız"
                                    className={`w-full rounded-xl bg-slate-50 border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.fullName ? "border-red-300" : "border-slate-300"
                                        }`}
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Telefon */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-slate-700 mb-1.5"
                                >
                                    Telefon Numarası <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0555 555 55 55"
                                    className={`w-full rounded-xl bg-slate-50 border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.phone ? "border-red-300" : "border-slate-300"
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Adres */}
                        <div>
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Adres / Proje Detayı <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                rows={4}
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Proje yapılacak yerin açık adresi veya proje hakkında kısa detay..."
                                className={`w-full rounded-xl bg-slate-50 border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none ${errors.address ? "border-red-300" : "border-slate-300"
                                    }`}
                            />
                            {errors.address && (
                                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Gönderiliyor...
                                    </span>
                                ) : (
                                    "Talebi Gönder"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
