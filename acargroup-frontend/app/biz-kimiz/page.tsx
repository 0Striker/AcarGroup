"use client";

import { useState, useEffect } from "react";
import { getHeroImage, getSliderImages } from "@/lib/images";

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
};

export default function BizKimizPage() {
    const [companyInfo, setCompanyInfo] = useState<CompanyInfoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/companyinfo`, {
                cache: "no-store",
            });

            if (res.ok) {
                const data: CompanyInfoDto = await res.json();
                setCompanyInfo(data);
            } else if (res.status === 404) {
                setError("İçerik henüz eklenmemiştir.");
            } else {
                setError("Bilgiler yüklenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Failed to fetch company info:", err);
            setError("Bağlantı hatası oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !companyInfo) {
        return (
            <div className="min-h-screen bg-slate-950 py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12">
                        <h1 className="text-2xl font-bold text-white mb-4">Biz Kimiz?</h1>
                        <p className="text-slate-400">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const heroImage = getHeroImage(companyInfo.heroImageUrl);
    const sliderImages = getSliderImages(
        companyInfo.sliderImageUrl1,
        companyInfo.sliderImageUrl2,
        companyInfo.sliderImageUrl3
    );

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src={heroImage}
                        alt={companyInfo.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {companyInfo.title}
                        </h1>
                        <p className="text-xl text-slate-300">
                            {companyInfo.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12">
                        <div
                            className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: companyInfo.content }}
                        />
                    </div>
                </div>
            </section>

            {/* Slider/Gallery Section */}
            <section className="py-16 md:py-24 bg-slate-900/30">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Görsel Galeri
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {sliderImages.map((imageUrl, index) => (
                            <div
                                key={index}
                                className="aspect-video rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-colors group"
                            >
                                <img
                                    src={imageUrl}
                                    alt={`Galeri ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
