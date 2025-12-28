"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

type Product = {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
    categoryId: number;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

type Category = {
    id: number;
    name: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Brand = {
    id: number;
    name: string;
    logoUrl?: string | null;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandsLoading, setBrandsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedBrandId, setSelectedBrandId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [onlyActive, setOnlyActive] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch products
                const productsRes = await fetch(`${API_BASE_URL}/api/products`, {
                    cache: "no-store",
                });
                if (!productsRes.ok) {
                    setError("Ürünler yüklenirken bir hata oluştu.");
                    setProducts([]);
                } else {
                    const productsData: Product[] = await productsRes.json();
                    setProducts(productsData);
                }

                // Fetch categories
                const categoriesRes = await fetch(`${API_BASE_URL}/api/categories`, {
                    cache: "no-store",
                });
                if (categoriesRes.ok) {
                    const categoriesData: Category[] = await categoriesRes.json();
                    setCategories(categoriesData);
                } else {
                    console.error(
                        "Kategori listesi yüklenirken hata:",
                        await categoriesRes.text()
                    );
                }


                // Fetch brands
                setBrandsLoading(true);
                const brandsRes = await fetch(`${API_BASE_URL}/api/brands`, {
                    cache: "no-store",
                });
                if (brandsRes.ok) {
                    const brandsData: Brand[] = await brandsRes.json();
                    setBrands(brandsData);
                }
                setBrandsLoading(false);
            } catch (err) {
                console.error("Ürün/kategori fetch hatası:", err);
                setError("Ürünler yüklenirken bir hata oluştu.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Active status filter
            if (onlyActive && !product.isActive) {
                return false;
            }

            // Category filter
            if (
                selectedCategoryId &&
                product.categoryId !== Number(selectedCategoryId)
            ) {
                return false;
            }

            // TODO: Brand filter - needs backend support to add brandId to Product entity
            // if (selectedBrandId && product.brandId !== Number(selectedBrandId)) {
            //     return false;
            // }

            // Search filter
            if (searchTerm.trim().length > 0) {
                const term = searchTerm.toLowerCase();
                const nameMatch = product.name.toLowerCase().includes(term);
                const descMatch = (product.description ?? "").toLowerCase().includes(term);
                if (!nameMatch && !descMatch) {
                    return false;
                }
            }

            return true;
        });
    }, [products, onlyActive, selectedCategoryId, selectedBrandId, searchTerm]);

    const categoryMap = useMemo(
        () => new Map(categories.map((c) => [c.id, c.name])),
        [categories]
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950">
                <div className="max-w-6xl mx-auto py-10 px-4">
                    <h1 className="text-2xl font-semibold mb-4 text-slate-100">Ürünler</h1>
                    <p className="text-slate-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
                    {/* Sol Panel: Başlık + Filtre */}
                    <aside className="mb-8 lg:mb-0 lg:sticky lg:top-4 lg:self-start">
                        <h1 className="text-2xl font-semibold mb-2 text-slate-100">Ürünler</h1>
                        <p className="text-sm text-slate-400">
                            Kamera ve altyapı ürünlerimizi kategoriye göre filtreleyebilir, arama
                            yapabilirsiniz.
                        </p>

                        {/* Filtre Paneli */}
                        <div className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-md p-4 space-y-4">
                            {/* Kategori Filtresi */}
                            <div>
                                <label className="block text-xs text-slate-700 mb-2 font-medium">
                                    Kategori
                                </label>
                                <select
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                                >
                                    <option value="">Tümü</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Marka Filtresi */}
                            <div>
                                <label className="block text-xs text-slate-700 mb-2 font-medium">
                                    Marka
                                </label>
                                <select
                                    value={selectedBrandId}
                                    onChange={(e) => setSelectedBrandId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                                >
                                    <option value="">Tümü</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Arama Filtresi */}
                            <div>
                                <label className="block text-xs text-slate-700 mb-2 font-medium">
                                    Ara
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ürün adı veya açıklama..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white placeholder:text-slate-400"
                                />
                            </div>

                            {/* Aktif Filtresi */}
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    id="onlyActive"
                                    type="checkbox"
                                    checked={onlyActive}
                                    onChange={(e) => setOnlyActive(e.target.checked)}
                                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                                />
                                <label
                                    htmlFor="onlyActive"
                                    className="text-xs text-slate-700 font-medium cursor-pointer select-none"
                                >
                                    Sadece aktif ürünler
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Sağ Panel: Markalar + Ürünler */}
                    <div>
                        {/* Marka Şeridi */}
                        <section className="mb-6">
                            <h2 className="text-sm font-medium text-slate-700 mb-3">
                                Çalıştığımız Markalar
                            </h2>

                            <div className="flex items-center overflow-hidden py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 relative">
                                {brandsLoading ? (
                                    <div className="text-xs text-slate-500 w-full text-center">Markalar yükleniyor...</div>
                                ) : brands.length === 0 ? (
                                    <div className="text-xs text-slate-500 w-full text-center">Marka bulunamadı.</div>
                                ) : (
                                    <motion.div
                                        className="flex items-center gap-8 min-w-max"
                                        animate={{ x: ["0%", "-50%"] }}
                                        transition={{
                                            duration: 20,
                                            ease: "linear",
                                            repeat: Infinity,
                                        }}
                                    >
                                        {[...brands, ...brands].map((brand, index) => (
                                            <Link
                                                key={`${brand.id}-${index}`}
                                                href={`/markalar/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="flex-shrink-0 h-10 w-24 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-2 hover:bg-slate-100 transition-colors group cursor-pointer"
                                                title={brand.name}
                                            >
                                                {brand.logoUrl ? (
                                                    <img
                                                        src={brand.logoUrl}
                                                        alt={brand.name}
                                                        className="max-h-full max-w-full object-contain transition-all"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-600 font-medium group-hover:text-slate-900 transition-colors truncate max-w-full px-1">
                                                        {brand.name}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </section>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Ürün Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
                                <p className="text-slate-600 text-sm">
                                    Filtrelere uygun ürün bulunamadı.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredProducts.map((product) => {
                                    const categoryName =
                                        categoryMap.get(product.categoryId) ?? "Genel Çözüm";

                                    return (
                                        <div
                                            key={product.id}
                                            className="rounded-2xl bg-white border border-slate-200 shadow-md p-5 hover:shadow-lg transition h-full flex flex-col group"
                                        >
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="block flex-1"
                                            >
                                                {/* Görsel Alanı */}
                                                <div className="h-32 mb-4 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                                            <span className="text-slate-600 text-xs font-semibold">
                                                                {product.name.substring(0, 3).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Kategori + Durum */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                                                        {categoryName}
                                                    </span>
                                                    {product.isActive && (
                                                        <span className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Ürün Bilgileri */}
                                                <h3 className="text-slate-900 font-semibold mb-1 group-hover:text-emerald-600 transition-colors">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            <p className="text-slate-600 text-sm line-clamp-3 mb-4 mt-1">
                                                {product.description ||
                                                    "Bu ürün için henüz açıklama eklenmemiştir."}
                                            </p>

                                            {/* WhatsApp Button */}
                                            <div className="mt-auto pt-4 border-t border-slate-800">
                                                <a
                                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905555555555"}?text=${encodeURIComponent(
                                                        `${product.name} ürünü için teklif alabilir miyim?`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 text-slate-900 text-xs font-medium hover:bg-emerald-400 transition w-full justify-center group/btn"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                    </svg>
                                                    WhatsApp ile Teklif Al
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
