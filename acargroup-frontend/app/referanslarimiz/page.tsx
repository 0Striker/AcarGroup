import { getReferenceLogo } from "@/lib/images";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type ReferenceDto = {
    id: number;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string | null;
    displayOrder: number;
};

async function getReferences(): Promise<ReferenceDto[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/references`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch references:", error);
        return [];
    }
}

export default async function ReferencesPage() {
    const references = await getReferences();

    return (
        <div className="min-h-screen bg-slate-950 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Referanslarımız
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Güven ve kalite odaklı hizmet anlayışımızla çalıştığımız değerli iş ortaklarımız ve müşterilerimiz.
                    </p>
                </div>

                {/* References Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {references.map((ref) => (
                        <div
                            key={ref.id}
                            className="group rounded-2xl bg-slate-900/50 border border-slate-800 p-6 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300"
                        >
                            <div className="w-full aspect-video relative flex items-center justify-center bg-white rounded-xl p-4 overflow-hidden">
                                <img
                                    src={getReferenceLogo(ref.logoUrl, ref.name)}
                                    alt={ref.name}
                                    className="max-w-full max-h-full object-contain transition-all duration-300"
                                />
                            </div>

                            <div className="text-center">
                                <h3 className="text-white font-medium mb-1 group-hover:text-emerald-400 transition-colors">
                                    {ref.name}
                                </h3>
                                {ref.websiteUrl && (
                                    <a
                                        href={ref.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-slate-500 hover:text-emerald-500 transition-colors inline-flex items-center gap-1"
                                    >
                                        Web Sitesini Ziyaret Et
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {references.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <p className="text-slate-400">Henüz referans eklenmemiş.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
