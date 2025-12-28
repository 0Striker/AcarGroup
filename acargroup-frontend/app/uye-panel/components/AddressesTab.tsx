"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

// CRUD UI for /api/customer/addresses endpoints, sharing the unified token helper.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Address = {
    id: number;
    label: string;
    city: string;
    district: string;
    fullAddress: string;
    postalCode?: string;
    isDefault: boolean;
};

export default function AddressesTab() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        label: "",
        city: "",
        district: "",
        fullAddress: "",
        postalCode: "",
        isDefault: false,
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
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
                const data = await response.json();
                setAddresses(Array.isArray(data) ? data : []);
            } else {
                setErrorMessage("Adresler yüklenirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            label: "",
            city: "",
            district: "",
            fullAddress: "",
            postalCode: "",
            isDefault: false,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (address: Address) => {
        setFormData({
            label: address.label,
            city: address.city,
            district: address.district,
            fullAddress: address.fullAddress,
            postalCode: address.postalCode || "",
            isDefault: address.isDefault,
        });
        setEditingId(address.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.label || !formData.city || !formData.district || !formData.fullAddress) {
            setErrorMessage("Etiket, şehir, ilçe ve adres alanları zorunludur.");
            return;
        }

        const token = getToken();
        if (!token) {
            router.replace("/uye-giris");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const url = editingId
                ? `${API_BASE_URL}/api/customer/addresses/${editingId}`
                : `${API_BASE_URL}/api/customer/addresses`;

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccessMessage(editingId ? "Adres güncellendi!" : "Adres eklendi!");
                resetForm();
                fetchAddresses();
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setErrorMessage("Adres kaydedilirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error saving address:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setSuccessMessage("Adres silindi!");
                fetchAddresses();
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setErrorMessage("Adres silinirken hata oluştu.");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            setErrorMessage("Bağlantı hatası oluştu.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Kayıtlı Adresler</h2>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                    >
                        + Yeni Adres
                    </button>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                        {errorMessage}
                    </div>
                )}

                {addresses.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                        <p>Henüz kayıtlı adres bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`bg-slate-900/80 border rounded-2xl p-4 hover:border-slate-700 transition-all ${address.isDefault ? "border-emerald-500/40" : "border-slate-800"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-white font-semibold">{address.label}</h3>
                                            {address.isDefault && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                                    Varsayılan
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm">
                                            {address.city} / {address.district}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 border border-slate-700 transition-all"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/40 transition-all"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm">{address.fullAddress}</p>
                                {address.postalCode && (
                                    <p className="text-slate-500 text-xs mt-1">Posta Kodu: {address.postalCode}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">
                            {editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Etiket <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Ev, İş, vb."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Şehir <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="İstanbul"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    İlçe <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Kadıköy"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Adres <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.fullAddress}
                                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Sokak, cadde, bina no, daire no..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Posta Kodu
                            </label>
                            <input
                                type="text"
                                value={formData.postalCode}
                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="34000"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                            />
                            <label htmlFor="isDefault" className="text-sm text-slate-300">
                                Varsayılan adres olarak ayarla
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            >
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
