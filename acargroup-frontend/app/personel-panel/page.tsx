"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPersonnel, clearAuth } from "@/lib/auth";
import DashboardTab from "./components/DashboardTab";
import JobsTab from "./components/JobsTab";
import CalendarTab from "./components/CalendarTab";
import ProfileTab from "./components/ProfileTab";

type TabType = "dashboard" | "jobs" | "calendar" | "profile";

export default function PersonnelPanelPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("dashboard");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const personnel = getPersonnel();
        if (!personnel) {
            router.replace("/personel-giris");
            return;
        }
        setIsLoading(false);
    }, [router]);

    const personnel = getPersonnel();
    const personnelName = personnel?.fullName || "";

    const handleLogout = () => {
        clearAuth();
        router.push("/personel-giris");
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
        { id: "dashboard" as TabType, label: "Özet", icon: "📊" },
        { id: "jobs" as TabType, label: "İşlerim", icon: "🛠️" },
        { id: "calendar" as TabType, label: "Takvim", icon: "📅" },
        { id: "profile" as TabType, label: "Profil", icon: "👤" },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                Personel Paneli
                            </h1>
                            {personnelName && (
                                <p className="text-slate-400 text-sm">
                                    Hoş geldiniz, <span className="text-emerald-400 font-semibold">{personnelName}</span>
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
                    {activeTab === "dashboard" && <DashboardTab />}
                    {activeTab === "jobs" && <JobsTab />}
                    {activeTab === "calendar" && <CalendarTab />}
                    {activeTab === "profile" && <ProfileTab />}
                </div>
            </div>
        </div>
    );
}
