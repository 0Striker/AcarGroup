"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface Personnel {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    tc?: string;
    specialization: string;
    bloodType?: string;
    hasDriverLicense: boolean;
    isActive: boolean;
}

export default function AdminPersonnelPage() {
    const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        tc: "",
        password: "",
        specialization: "",
        bloodType: "",
        hasDriverLicense: false,
    });

    useEffect(() => {
        fetchPersonnel();
    }, []);

    const fetchPersonnel = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/personnel/active`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setPersonnelList(data);
            }
        } catch (error) {
            console.error("Error fetching personnel:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/personnel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    address: "",
                    tc: "",
                    password: "",
                    specialization: "",
                    bloodType: "",
                    hasDriverLicense: false
                });
                fetchPersonnel();
            } else {
                alert("Personel eklenemedi.");
            }
        } catch (error) {
            console.error("Error creating personnel:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/personnel/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchPersonnel();
            } else {
                alert("Silinemedi.");
            }
        } catch (error) {
            console.error("Error deleting personnel:", error);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Personel Yönetimi</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                >
                    {showForm ? "İptal" : "Yeni Personel Ekle"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6 border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4">Yeni Personel</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                            <input
                                type="email"
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                            <textarea
                                rows={2}
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Adres bilgisi (opsiyonel)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TC Kimlik No</label>
                            <input
                                type="text"
                                maxLength={11}
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.tc}
                                onChange={(e) => setFormData({ ...formData, tc: e.target.value })}
                                placeholder="11 haneli TC numarası (opsiyonel)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                            <input
                                type="password"
                                required
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Uzmanlık</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kan Grubu</label>
                            <select
                                className="w-full border rounded px-3 py-2 text-slate-900 bg-white"
                                value={formData.bloodType}
                                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                            >
                                <option value="">Seçiniz (opsiyonel)</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-600 border-slate-300 rounded"
                                    checked={formData.hasDriverLicense}
                                    onChange={(e) => setFormData({ ...formData, hasDriverLicense: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-slate-700">Ehliyeti var</span>
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                            >
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Ad Soyad</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">İletişim</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Uzmanlık</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Kan/Ehliyet</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Durum</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {personnelList.map((person) => (
                            <tr key={person.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    <Link
                                        href={`/admin/personnel/${person.id}`}
                                        className="hover:text-emerald-600 hover:underline cursor-pointer"
                                    >
                                        {person.fullName}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="text-sm">{person.email}</div>
                                    <div className="text-xs text-slate-500">{person.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{person.specialization}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span title="Kan Grubu">🩸 {person.bloodType || "-"}</span>
                                        <span title="Ehliyet">{person.hasDriverLicense ? "🚗" : "❌"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${person.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {person.isActive ? "Aktif" : "Pasif"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/personnel/${person.id}`}
                                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                        >
                                            Detay
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(person.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
