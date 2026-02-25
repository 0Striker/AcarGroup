"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type Brand = {
    id: number;
    name: string;
    logoUrl?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function BrandTicker() {
    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/brands`);
                if (res.ok) {
                    const data = await res.json();
                    setBrands(data);
                }
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        fetchBrands();
    }, []);

    if (brands.length === 0) return null;

    // Duplicate brands to create seamless loop
    // Ensure we have enough items for smooth scrolling
    const displayBrands = [...brands, ...brands, ...brands, ...brands];

    // Helper function to convert brand name to slug
    const getSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 py-2 overflow-hidden">
            <div className="flex">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex gap-12 px-6 min-w-max"
                >
                    {displayBrands.map((brand, index) => (
                        <Link
                            key={`${brand.name}-${index}`}
                            href={`/markalar/${getSlug(brand.name)}`}
                            className="relative h-8 w-24 opacity-90 hover:opacity-100 flex items-center justify-center group cursor-pointer transition-opacity duration-300"
                        >
                            {brand.logoUrl ? (
                                <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-white font-bold text-lg">{brand.name}</span>
                            )}

                            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors rounded-lg" />
                            <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center text-white bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                                {brand.name}
                            </span>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
