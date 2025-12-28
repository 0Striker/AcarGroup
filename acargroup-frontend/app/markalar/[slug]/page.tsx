"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Brand {
    id: number;
    name: string;
    logoUrl: string;
    description?: string;
}

export default function BrandDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/brands`);
                if (!response.ok) throw new Error("Failed to fetch brands");

                const brands: Brand[] = await response.json();

                // Find brand by slug (convert name to slug format)
                const foundBrand = brands.find(b =>
                    b.name.toLowerCase().replace(/\s+/g, '-') === slug
                );

                if (foundBrand) {
                    setBrand(foundBrand);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error("Error fetching brand:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBrand();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (notFound || !brand) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Marka Bulunamadı</h1>
                    <p className="text-slate-600 mb-8">Aradığınız marka bulunamadı.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Ana Sayfaya Dön
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="bg-slate-900 text-white py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>

            {/* Brand Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Brand Logo */}
                    <div className="mb-12">
                        <div className="relative w-64 h-64 mx-auto bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center border border-slate-200">
                            {brand.logoUrl ? (
                                <Image
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    fill
                                    className="object-contain p-8"
                                />
                            ) : (
                                <div className="text-6xl font-bold text-slate-300">{brand.name.charAt(0)}</div>
                            )}
                        </div>
                    </div>

                    {/* Brand Name */}
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">
                        {brand.name}
                    </h1>

                    {/* Brand Description */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {brand.description ||
                                `${brand.name}, güvenilir ve yenilikçi teknoloji çözümleri sunan önde gelen markalardan biridir. Güvenlik sistemleri, ağ altyapısı ve akıllı teknoloji ürünleriyle müşterilerimize en iyi hizmeti sunmak için çalışıyoruz.`
                            }
                        </p>
                    </div>

                    {/* Products Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            href={`/products?brand=${brand.id}`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                        >
                            <Package className="w-6 h-6" />
                            Ürünleri İncele
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
