"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProjectImage } from "@/lib/images";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type ProjectListDto = {
    id: number;
    title: string;
    slug: string;
    status: string;
    city: string;
    district: string;
    clientName: string;
    heroImageUrl: string;
    displayOrder: number;
    isFeatured: boolean;
};

async function fetchProjects(status: string): Promise<ProjectListDto[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/projects?status=${status}`);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return [];
    }
}

function ProjectsContent() {
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status");
    const status = statusParam === "Completed" ? "Completed" : "Active";

    const [projects, setProjects] = useState<ProjectListDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isActive = true;

        fetchProjects(status).then((data) => {
            if (!isActive) return;
            setProjects(data);
            setLoading(false);
        });

        return () => {
            isActive = false;
        };
    }, [status]);

    return (
        <div className="min-h-screen bg-slate-950 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {status === "Active" ? "Aktif Projelerimiz" : "Tamamlanan Projelerimiz"}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                        AcarGroup olarak teknoloji ve güvenlik alanında imza attığımız projeleri inceleyin.
                    </p>

                    <div className="inline-flex bg-slate-900 p-1 rounded-full border border-slate-800">
                        <Link
                            href="/projelerimiz?status=Active"
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${status === "Active"
                                ? "bg-emerald-500 text-slate-900 shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Aktif Projeler
                        </Link>
                        <Link
                            href="/projelerimiz?status=Completed"
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${status === "Completed"
                                ? "bg-emerald-500 text-slate-900 shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Tamamlanan Projeler
                        </Link>
                    </div>
                </div>

                <div className="space-y-12">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Projeler yükleniyor...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                            <p className="text-slate-400">Bu kategoride henüz proje bulunmuyor.</p>
                        </div>
                    ) : (
                        projects.map((project, index) => (
                            <section
                                key={project.id}
                                className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden shadow-2xl hover:border-slate-700 transition-colors group"
                            >
                                <div className="grid md:grid-cols-2">
                                    <div
                                        className={`relative h-64 md:h-auto overflow-hidden ${index % 2 === 1 ? "md:order-2" : ""
                                            }`}
                                    >
                                        <div className="relative w-full h-full">
                                            <img
                                                src={getProjectImage(project.heroImageUrl)}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-slate-950/50" />
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-12 flex flex-col justify-center">
                                        <div className="mb-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${project.status === "Active"
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    }`}
                                            >
                                                {project.status === "Active" ? "Devam Ediyor" : "Tamamlandı"}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                                            {project.title}
                                        </h2>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                                            {project.clientName && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    {project.clientName}
                                                </div>
                                            )}
                                            {(project.city || project.district) && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {[project.city, project.district].filter(Boolean).join(" / ")}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-slate-400 text-sm">
                                            <p>Bu proje hakkında detaylı bilgi için bizimle iletişime geçebilirsiniz.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Yükleniyor...</div>
            </div>
        }>
            <ProjectsContent />
        </Suspense>
    );
}