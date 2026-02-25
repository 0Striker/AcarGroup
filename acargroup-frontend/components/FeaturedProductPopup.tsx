"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

type Product = {
    id: number;
    name: string;
    imageUrl: string | null;
    isFeatured: boolean;
    description?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function FeaturedProductPopup() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/products`);
                if (res.ok) {
                    const data: Product[] = await res.json();
                    const featured = data.filter((p) => p.isFeatured);
                    setFeaturedProducts(featured);

                    // Show popup after a short delay if there are featured products
                    if (featured.length > 0) {
                        setTimeout(() => setIsVisible(true), 2000);
                    }
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (featuredProducts.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
        }, 8000); // Change product every 8 seconds

        return () => clearInterval(interval);
    }, [featuredProducts]);

    if (isClosed || featuredProducts.length === 0 || !isVisible) return null;

    const product = featuredProducts[currentIndex];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={product.id}
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="fixed bottom-6 left-6 z-[70] w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsClosed(true)}
                    className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                >
                    <X size={14} />
                </button>

                <div className="flex h-28">
                    {/* Image */}
                    <div className="w-1/3 relative bg-slate-100">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <span className="text-[10px]">Görsel Yok</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="w-2/3 p-3 flex flex-col justify-center">
                        <div className="mb-1">
                            <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider rounded-full mb-1">
                                Sizin İçin Özel Teklif
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                                {product.name}
                            </h3>
                        </div>

                        <Link
                            href={`/products/${product.id}`}
                            className="mt-1 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Ürünü İncele →
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
