"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";
import SummaryTab from "./components/SummaryTab";
import JobsTab from "./components/JobsTab";
import FinanceTab from "./components/FinanceTab";
import TicketsTab from "./components/TicketsTab";
import ProfileTab from "./components/ProfileTab";
import AddressesTab from "./components/AddressesTab";
import ServiceItemsTab from "./components/ServiceItemsTab";

type TabType = "summary" | "jobs" | "finance" | "tickets" | "profile" | "addresses" | "serviceItems";

// Protects the member panel by reading the unified acargroup_* auth keys and redirecting when JWT/customer missing.
export default function MemberPanelPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("summary");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { token } = getAuth();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }
        setIsLoading(false);
    }, [router]);

    const { customer } = getAuth();
    const customerName = customer?.fullName || "";
    const isInactive = customer?.isActive === false;

    const handleLogout = () => {
        clearAuth();
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "summary" as TabType, label: "Özet", icon: "📊" },
        { id: "tickets" as TabType, label: "Arıza Kayıtları", icon: "🔧" },
        { id: "profile" as TabType, label: "Kişisel Bilgiler", icon: "👤" },
        { id: "addresses" as TabType, label: "Adresler", icon: "📍" },
        { id: "serviceItems" as TabType, label: "Servisteki Ürünler", icon: "📦" },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                Üye Paneli
                            </h1>
                            {customerName && (
                                <p className="text-slate-400 text-sm">
                                    Hoş geldiniz, <span className="text-emerald-400 font-semibold">{customerName}</span>
                                </p>
                            )}
                            {isInactive && (
                                <p className="text-xs text-red-400 mt-1">
                                    Hesabınız pasif durumda; lütfen destek ekibiyle iletişime geçin.
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-slate-800 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${activeTab === tab.id
                                ? "bg-slate-900 text-emerald-400 border-b-2 border-emerald-500"
                                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">
                    {activeTab === "summary" && <SummaryTab />}
                    {activeTab === "jobs" && <JobsTab />}
                    {activeTab === "finance" && <FinanceTab />}
                    {activeTab === "tickets" && <TicketsTab />}
                    {activeTab === "profile" && <ProfileTab />}
                    {activeTab === "addresses" && <AddressesTab />}
                    {activeTab === "serviceItems" && <ServiceItemsTab />}
                </div>
            </div>
        </div>
    );
}
