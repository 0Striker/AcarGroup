"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
    src?: string | null;
    alt: string;
}

export default function ProductImage({ src, alt }: ProductImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className="w-full aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                <ImageOff size={48} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Görsel Yok</span>
            </div>
        );
    }

    return (
        <div className="w-full aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden relative">
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain p-4"
                onError={() => setError(true)}
            />
        </div>
    );
}
