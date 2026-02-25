"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { Plus, FileText, Trash2, Edit, Search } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Offer = {
    id: number;
    offerNumber: string;
    customerName: string;
    offerDate: string;
    grandTotal: number;
    currency: string;
    status: string;
};

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/offers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOffers(data);
            } else {
                toast.error("Teklifler yüklenemedi.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success("Teklif silindi.");
                setOffers(offers.filter((o) => o.id !== id));
            } else {
                toast.error("Silme işlemi başarısız.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Bir hata oluştu.");
        }
    };

    const filteredOffers = offers.filter(
        (o) =>
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.offerNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Teklifler</h1>
                    <p className="text-slate-600">
                        Müşterileriniz için hazırladığınız teklifleri buradan yönetebilirsiniz.
                    </p>
                </div>
                <Link
                    href="/admin/offers/create"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                    <Plus size={20} />
                    Yeni Teklif Oluştur
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Teklif No veya Müşteri Adı ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Teklif No</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Müşteri</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Tarih</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Tutar</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Durum</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredOffers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Henüz teklif bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                filteredOffers.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {offer.offerNumber}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {offer.customerName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(offer.offerDate).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {offer.grandTotal.toLocaleString("tr-TR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })} {offer.currency}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                offer.status === "Draft" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                                offer.status === "Sent" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                offer.status === "Accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                "bg-red-50 text-red-600 border-red-200"
                                            }`}>
                                                {offer.status === "Draft" ? "Taslak" :
                                                 offer.status === "Sent" ? "Gönderildi" :
                                                 offer.status === "Accepted" ? "Onaylandı" : "Reddedildi"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/offers/create?id=${offer.id}`} // Re-use create page for editing for simplicity
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Düzenle / Görüntüle"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(offer.id)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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
