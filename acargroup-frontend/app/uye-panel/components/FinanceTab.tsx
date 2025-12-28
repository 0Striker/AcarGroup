"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function FinanceTab() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const [txRes, balRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/finance/my-transactions`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/finance/my-balance`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (txRes.ok) setTransactions(await txRes.json());
            if (balRes.ok) setBalance(await balRes.json());
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            {balance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <p className="text-slate-400 text-sm mb-1">Toplam Borç</p>
                        <p className="text-2xl font-bold text-white">
                            {balance.totalDebt.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <p className="text-slate-400 text-sm mb-1">Toplam Ödenen</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            {balance.totalPaid.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <p className="text-slate-400 text-sm mb-1">Güncel Bakiye</p>
                        <p className={`text-2xl font-bold ${balance.currentBalance > 0 ? "text-red-400" : "text-white"}`}>
                            {balance.currentBalance.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {balance.currentBalance > 0 ? "(Ödenmesi gereken)" : "(Borcunuz yok)"}
                        </p>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">Hesap Hareketleri</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-400">Tarih</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-400">Açıklama</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-400">Tür</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-400 text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Henüz bir işlem kaydı bulunmamaktadır.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 text-slate-300">
                                            {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${tx.type === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                }`}>
                                                {tx.type === 0 ? "Ödeme" : "Borç"}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-medium text-right ${tx.type === 0 ? "text-emerald-400" : "text-red-400"
                                            }`}>
                                            {tx.type === 0 ? "+" : "-"}{tx.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
