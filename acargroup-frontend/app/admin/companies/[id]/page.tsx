"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Company = {
    id: number;
    name: string;
    authorizedPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    sector?: string;
    notes?: string;
    stampNumber?: string;
    loginName?: string;
    loginCode?: string;
    loginPassword?: string;
    shippingCompanyName?: string;
};

export default function CompanyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchCompanyDetails(JSON.stringify(params.id));
        }
    }, [params.id]);

    const fetchCompanyDetails = async (id: string) => {
        setIsLoading(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            const cleanId = id.replace(/"/g, ""); // params.id comes as string?
            const res = await fetch(`${API_BASE_URL}/api/admin/companies/${cleanId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setCompany(data);
            } else {
                console.error("Failed to fetch company details");
                // Handle error, maybe redirect back
            }
        } catch (error) {
            console.error("Error fetching company details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400">Yükleniyor...</div>;
    }

    if (!company) {
        return <div className="p-8 text-center text-red-400">Firma bulunamadı.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/companies"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        ← Geri
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Kolon - Temel Bilgiler */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">
                            Temel Bilgiler
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Firma Adı</label>
                                <div className="text-slate-200 mt-1">{company.name}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Yetkili Kişi</label>
                                <div className="text-slate-200 mt-1">{company.authorizedPerson || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Firma Kaşe No</label>
                                <div className="text-emerald-400 mt-1 font-mono">{company.stampNumber || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">İş Alanı / Sektör</label>
                                <div className="text-slate-200 mt-1">{company.sector || "-"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">
                            İletişim & Konum
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Telefon</label>
                                <div className="text-slate-200 mt-1">{company.phone || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">E-Posta</label>
                                <div className="text-slate-200 mt-1">{company.email || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Adres</label>
                                <div className="text-slate-200 mt-1 whitespace-pre-wrap">{company.address || "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ Kolon - Diğer Bilgiler */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">
                            Lojistik & Notlar
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Anlaşmalı Kargo</label>
                                <div className="text-emerald-400 mt-1">{company.shippingCompanyName || "Belirtilmemiş"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Notlar</label>
                                <div className="text-slate-300 mt-1 whitespace-pre-wrap text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 min-h-[80px]">
                                    {company.notes || "Not yok."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">
                            Sistem Giriş Bilgileri
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Giriş Adı</label>
                                <div className="text-slate-200 mt-1 font-mono">{company.loginName || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Giriş Kodu</label>
                                <div className="text-slate-200 mt-1 font-mono">{company.loginCode || "-"}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase">Giriş Şifresi</label>
                                <div className="text-slate-200 mt-1 font-mono">{company.loginPassword || "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
