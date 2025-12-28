"use client";

import { useState, useEffect } from "react";
import { getToken, getCustomer } from "@/lib/auth";

// Aggregates /api/customer/* endpoints to show counts on the summary tab.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type SummaryData = {
    openTicketsCount: number;
    totalTicketsCount: number;
    serviceItemsCount: number;
    addressesCount: number;
};

export default function SummaryTab() {
    const [data, setData] = useState<SummaryData>({
        openTicketsCount: 0,
        totalTicketsCount: 0,
        serviceItemsCount: 0,
        addressesCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [customerName, setCustomerName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchSummaryData();

        const customer = getCustomer();
        if (customer?.fullName) {
            setCustomerName(customer.fullName);
        }
    }, []);

    const fetchSummaryData = async () => {
        const token = getToken();
        if (!token) {
            setErrorMessage("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
            setIsLoading(false);
            return;
        }

        try {
            // Fetch all data in parallel
            const [ticketsRes, addressesRes, serviceItemsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/customer/support-tickets`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/customer/addresses`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/customer/service-items`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const tickets = ticketsRes.ok ? await ticketsRes.json() : [];
            const addresses = addressesRes.ok ? await addressesRes.json() : [];
            const serviceItems = serviceItemsRes.ok ? await serviceItemsRes.json() : [];

            setData({
                openTicketsCount: Array.isArray(tickets) ? tickets.filter((t: { status: string }) => t.status === "Open").length : 0,
                totalTicketsCount: Array.isArray(tickets) ? tickets.length : 0,
                serviceItemsCount: Array.isArray(serviceItems) ? serviceItems.length : 0,
                addressesCount: Array.isArray(addresses) ? addresses.length : 0,
            });
        } catch (error) {
            console.error("Error fetching summary data:", error);
            setErrorMessage("Pano verileri alınamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const cards = [
        {
            title: "Açık Arıza Kayıtları",
            value: data.openTicketsCount,
            icon: "🔧",
            color: "emerald",
        },
        {
            title: "Toplam Arıza Kayıtları",
            value: data.totalTicketsCount,
            icon: "📋",
            color: "blue",
        },
        {
            title: "Servisteki Ürünler",
            value: data.serviceItemsCount,
            icon: "📦",
            color: "purple",
        },
        {
            title: "Kayıtlı Adresler",
            value: data.addressesCount,
            icon: "📍",
            color: "orange",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Message */}
            {customerName && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Hoş geldiniz, {customerName}! 👋
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Üye panelinize hoş geldiniz. Buradan arıza kayıtlarınızı takip edebilir, kişisel bilgilerinizi güncelleyebilir ve adreslerinizi yönetebilirsiniz.
                    </p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:scale-105 cursor-default"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`text-3xl bg-${card.color}-500/10 p-3 rounded-xl border border-${card.color}-500/20`}>
                                {card.icon}
                            </div>
                            <span className={`text-3xl font-bold text-${card.color}-400`}>
                                {card.value}
                            </span>
                        </div>
                        <h3 className="text-slate-300 text-sm font-semibold">{card.title}</h3>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                {errorMessage && (
                    <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                        {errorMessage}
                    </div>
                )}
                <h3 className="text-lg font-bold text-white mb-4">Hızlı Erişim</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/40 transition-all text-sm text-slate-300 hover:text-white">
                        <span className="mr-2">🔧</span> Yeni Arıza Kaydı Oluştur
                    </button>
                    <button className="text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/40 transition-all text-sm text-slate-300 hover:text-white">
                        <span className="mr-2">👤</span> Profil Bilgilerini Güncelle
                    </button>
                    <button className="text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/40 transition-all text-sm text-slate-300 hover:text-white">
                        <span className="mr-2">📍</span> Yeni Adres Ekle
                    </button>
                </div>
            </div>
        </div>
    );
}
