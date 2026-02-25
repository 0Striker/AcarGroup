import { notFound } from "next/navigation";

type Product = {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
    imageUrl?: string | null;
    categoryId: number;
    createdAt: string;
    updatedAt?: string | null;
};

type Category = {
    id: number;
    name: string;
};

type PageProps = {
    params: Promise<{ id: string }>;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

import ProductImage from "@/components/ProductImage";

// ... (imports remain the same)

export default async function ProductDetailPage({ params }: PageProps) {
    const { id: idParam } = await params;
    const id = Number(idParam);

    // ... (fetching logic remains the same)

    if (Number.isNaN(id)) {
        notFound();
    }

    // Fetch product
    const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        cache: "no-store",
    });

    if (!productRes.ok) {
        notFound();
    }

    const product: Product = await productRes.json();

    // Fetch category name
    let categoryName = "-";
    try {
        const categoryRes = await fetch(`${API_BASE_URL}/api/categories`, {
            cache: "no-store",
        });
        if (categoryRes.ok) {
            const categories: Category[] = await categoryRes.json();
            categoryName =
                categories.find((c) => c.id === product.categoryId)?.name ?? "-";
        }
    } catch (err) {
        console.error("Kategori fetch hatası:", err);
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-6">
                <p className="text-sm text-slate-500 mb-1">
                    Ürünler /{" "}
                    {categoryName !== "-" ? (
                        <span className="font-medium text-slate-700">{categoryName} / </span>
                    ) : (
                        ""
                    )}
                    #{product.id}
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {product.name}
                </h1>
                <p className="text-sm text-slate-600">
                    {product.isActive ? (
                        <span className="text-green-600 font-medium">Aktif ürün</span>
                    ) : (
                        <span className="text-gray-500">Pasif ürün</span>
                    )}
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                {/* Left side: Image */}
                <div className="h-fit sticky top-6">
                    <ProductImage src={product.imageUrl} alt={product.name} />
                </div>

                {/* Right side: Description & Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-3 text-slate-900">
                            Ürün Açıklaması
                        </h2>
                        <div
                            className="text-slate-700 whitespace-pre-line leading-relaxed prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description || "Bu ürün için henüz detaylı açıklama eklenmemiştir." }}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        {categoryName !== "-" && (
                            <div className="border-b border-slate-100 pb-3 mb-3">
                                <p className="text-sm text-slate-500 mb-1">Kategori</p>
                                <p className="text-slate-800 font-medium">{categoryName}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <a
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905555555555"}?text=${encodeURIComponent(
                                    `Merhaba, web sitenizdeki "${product.name}" ürünü hakkında bilgi almak istiyorum.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3.5 rounded-lg hover:bg-[#20bd5a] transition-colors font-bold shadow-sm group"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp ile Bilgi Al
                            </a>
                            <p className="text-xs text-slate-400 text-center mt-2">
                                Ürün hakkında detaylı bilgi ve fiyat teklifi için bize ulaşın.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
