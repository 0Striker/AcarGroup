"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

// Manages /api/customer/support-tickets (list/detail/create) including uploads and address validation.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type SupportTicket = {
    id: number;
    customerAddressId?: number;
    addressLabel?: string;
    title: string;
    status: string;
    createdAt: string;
    productName?: string;
    serialNumber?: string;
};

type TicketDetail = {
    id: number;
    customerAddressId?: number;
    addressLabel?: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    productName?: string;
    serialNumber?: string;
    imageUrl?: string;
};

type CustomerAddress = {
    id: number;
    label: string;
    fullAddress: string;
};

export default function TicketsTab() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOnlyOpen, setShowOnlyOpen] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        productName: "",
        serialNumber: "",
        preferredDateStart: "",
        preferredDateEnd: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchTickets();
    }, [showOnlyOpen]);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchTickets = async () => {
        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        setIsLoading(true);
        try {
            const url = showOnlyOpen
                ? `${API_BASE_URL}/api/customer/support-tickets?status=Open`
                : `${API_BASE_URL}/api/customer/support-tickets`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(Array.isArray(data) ? data : []);
            } else {
                setErrorMessage("Arıza kayıtları yüklenirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAddresses = async () => {
        setAddressesLoading(true);
        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/addresses`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: CustomerAddress[] = await response.json();
                setAddresses(data);
                if (data.length > 0) {
                    setSelectedAddressId(data[0].id);
                }
            } else {
                setErrorMessage("Adresler yüklenirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            setErrorMessage("Adresler alınırken bağlantı hatası oluştu.");
        } finally {
            setAddressesLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            setErrorMessage("Başlık ve açıklama alanları zorunludur.");
            return;
        }

        if (!selectedAddressId) {
            setErrorMessage("Lütfen bir adres seçin.");
            return;
        }

        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const formDataObj = new FormData();
            formDataObj.append("Title", formData.title);
            formDataObj.append("Description", formData.description);
            if (formData.productName) formDataObj.append("ProductName", formData.productName);
            if (formData.serialNumber) formDataObj.append("SerialNumber", formData.serialNumber);
            if (formData.preferredDateStart) formDataObj.append("PreferredDateStart", formData.preferredDateStart);
            if (formData.preferredDateEnd) formDataObj.append("PreferredDateEnd", formData.preferredDateEnd);
            if (selectedFile) formDataObj.append("Image", selectedFile);
            formDataObj.append("CustomerAddressId", String(selectedAddressId));

            const response = await fetch(`${API_BASE_URL}/api/customer/support-tickets`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataObj,
            });

            if (response.ok) {
                setSuccessMessage("Arıza kaydınız başarıyla oluşturuldu!");
                setFormData({ title: "", description: "", productName: "", serialNumber: "", preferredDateStart: "", preferredDateEnd: "" });
                setSelectedFile(null);
                await fetchTickets();

                setTimeout(() => setSuccessMessage(""), 5000);
            } else {
                const errorData = await response.text();
                setErrorMessage(errorData || "Arıza kaydı oluşturulurken hata oluştu.");
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchTicketDetail = async (id: number) => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/support-tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedTicket(data);
            }
        } catch (error) {
            console.error("Error fetching ticket detail:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Open: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            InProgress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            Closed: "bg-green-500/10 text-green-400 border-green-500/20",
        };
        return styles[status as keyof typeof styles] || styles.Open;
    };

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                    {errorMessage}
                </div>
            )}

            {/* New Ticket Form */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Yeni Arıza Kaydı Oluştur</h2>
                {addressesLoading ? (
                    <p className="text-sm text-slate-400">Adresler yükleniyor...</p>
                ) : addresses.length === 0 ? (
                    <p className="text-sm text-slate-400 mb-4">
                        Arıza kaydı açmadan önce en az bir adres eklemelisiniz. &quot;Adresler&quot; sekmesinden adres ekleyebilirsiniz.
                    </p>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Adres <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={selectedAddressId ?? ""}
                            onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={addresses.length === 0 || addressesLoading || isSubmitting}
                            required
                        >
                            {addresses.map((address) => (
                                <option key={address.id} value={address.id}>
                                    {address.label} - {address.fullAddress}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Başlık <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Arıza başlığı"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Ürün Adı
                            </label>
                            <input
                                type="text"
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Ürün adı (opsiyonel)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Seri Numarası
                            </label>
                            <input
                                type="text"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Seri numarası (opsiyonel)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Fotoğraf
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tercih Edilen Başlangıç Tarihi
                            </label>
                            <input
                                type="date"
                                value={formData.preferredDateStart}
                                onChange={(e) => setFormData({ ...formData, preferredDateStart: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tercih Edilen Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                value={formData.preferredDateEnd}
                                onChange={(e) => setFormData({ ...formData, preferredDateEnd: e.target.value })}
                                min={formData.preferredDateStart || undefined}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Açıklama <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Arıza detaylarını açıklayın..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || addresses.length === 0}
                        className="w-full md:w-auto px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Gönderiliyor..." : "Arıza Kaydı Oluştur"}
                    </button>
                </form>
            </div>

            {/* Tickets List */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Arıza Kayıtlarım</h2>
                    <button
                        onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/40 transition-all"
                    >
                        {showOnlyOpen ? "Tümünü Göster" : "Sadece Açık Kayıtlar"}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p>Henüz arıza kaydı bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold mb-2">{ticket.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                            <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span>{new Date(ticket.createdAt).toLocaleDateString("tr-TR")}</span>
                                            {ticket.productName && <span>🔧 {ticket.productName}</span>}
                                            {ticket.serialNumber && <span>SN: {ticket.serialNumber}</span>}
                                            {ticket.addressLabel && <span>📍 {ticket.addressLabel}</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fetchTicketDetail(ticket.id)}
                                        className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 transition-all"
                                    >
                                        Detay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </span>
                            </div>
                            {selectedTicket.addressLabel && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Adres</h3>
                                    <p className="text-white">{selectedTicket.addressLabel}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 mb-1">Açıklama</h3>
                                <p className="text-white">{selectedTicket.description}</p>
                            </div>

                            {selectedTicket.productName && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Ürün</h3>
                                    <p className="text-white">{selectedTicket.productName}</p>
                                </div>
                            )}

                            {selectedTicket.serialNumber && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Seri Numarası</h3>
                                    <p className="text-white">{selectedTicket.serialNumber}</p>
                                </div>
                            )}

                            {selectedTicket.imageUrl && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Fotoğraf</h3>
                                    <img
                                        src={`${API_BASE_URL}/${selectedTicket.imageUrl}`}
                                        alt="Arıza görseli"
                                        className="rounded-lg border border-slate-700 max-w-full"
                                    />
                                </div>
                            )}

                            <div className="text-sm text-slate-400">
                                Oluşturulma: {new Date(selectedTicket.createdAt).toLocaleString("tr-TR")}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
