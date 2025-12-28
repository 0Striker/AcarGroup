"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import JobStatusBadge from "./JobStatusBadge";
import JobPriorityBadge from "./JobPriorityBadge";
import { getToken, getPersonnel } from "@/lib/auth";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface JobDetailModalProps {
    job: any;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function JobDetailModal({ job, onClose, onUpdate }: JobDetailModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "timeline" | "photos" | "materials" | "notes">("general");
    const [uploading, setUploading] = useState(false);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesText, setNotesText] = useState(job.notes || "");
    const [newMaterial, setNewMaterial] = useState("");
    const [addingMaterial, setAddingMaterial] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const personnelData = getPersonnel();
    const isPersonnel = !!personnelData;
    const isAssignedPersonnel = isPersonnel && job.assignedPersonnelId === personnelData?.id;
    const canEdit = isAssignedPersonnel;

    const tabs = [
        { id: "general", label: "Genel Bilgiler", icon: "📋" },
        { id: "timeline", label: "Durum Geçmişi", icon: "📜" },
        { id: "photos", label: "Fotoğraflar", icon: "📷" },
        { id: "materials", label: "Malzemeler", icon: "🔧" },
        { id: "notes", label: "Notlar", icon: "📝" },
    ] as const;

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        return format(new Date(date), "dd MMMM yyyy, HH:mm", { locale: tr });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("photo", file);

        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/photos`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                toast.success("Fotoğraf yüklendi!");
                onUpdate?.();
                onClose();
            } else {
                toast.error("Fotoğraf yüklenemedi.");
            }
        } catch (error) {
            console.error("Photo upload error:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveNotes = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/notes`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notes: notesText }),
            });

            if (response.ok) {
                toast.success("Notlar kaydedildi!");
                setEditingNotes(false);
                onUpdate?.();
            } else {
                toast.error("Notlar kaydedilemedi.");
            }
        } catch (error) {
            console.error("Save notes error:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    const handleAddMaterial = async () => {
        if (!newMaterial.trim()) return;

        setAddingMaterial(true);
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/materials`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ materialName: newMaterial }),
            });

            if (response.ok) {
                toast.success("Malzeme eklendi!");
                setNewMaterial("");
                onUpdate?.();
                onClose();
            } else {
                toast.error("Malzeme eklenemedi.");
            }
        } catch (error) {
            console.error("Add material error:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setAddingMaterial(false);
        }
    };

    const handleRemoveMaterial = async (index: number) => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/materials/${index}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                toast.success("Malzeme çıkarıldı!");
                onUpdate?.();
                onClose();
            } else {
                toast.error("Malzeme çıkarılamadı.");
            }
        } catch (error) {
            console.error("Remove material error:", error);
            toast.error("Bir hata oluştu.");
        }
    };

    const handleSubmitPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error("Geçerli bir tutar giriniz.");
            return;
        }

        setSubmittingPayment(true);
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: parseFloat(paymentAmount) }),
            });

            if (response.ok) {
                toast.success("Ödeme kaydedildi!");
                setShowPaymentModal(false);
                setPaymentAmount("");
                onUpdate?.();
                onClose();
            } else {
                const errorText = await response.text();
                toast.error(errorText || "Ödeme kaydedilemedi.");
            }
        } catch (error) {
            console.error("Payment submission error:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setSubmittingPayment(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
                            <JobStatusBadge status={job.status} />
                            <JobPriorityBadge priority={job.priority} />
                        </div>
                        <p className="text-sm text-slate-600">
                            #{job.id} • Oluşturuldu: {formatDate(job.createdAt)}
                        </p>
                        {
                            canEdit && (
                                <p className="text-xs text-emerald-600 mt-1">✏️ Düzenleme modunda</p>
                            )
                        }
                    </div >
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div >

                {/* Tabs */}
                < div className="border-b border-slate-200 px-6" >
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-3 text-sm font-medium transition border-b-2 ${activeTab === tab.id
                                    ? "border-emerald-600 text-emerald-600"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div >

                {/* Content */}
                < div className="flex-1 overflow-y-auto p-6" >
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoField label="Müşteri" value={job.customerName} icon="👤" />
                                <InfoField label="Personel" value={job.assignedPersonnelName || "Atanmamış"} icon="👨‍🔧" />
                                {!isPersonnel && (
                                    <>
                                        <InfoField label="Tahmini Maliyet" value={`₺${job.estimatedCost?.toLocaleString("tr-TR")}`} icon="💰" />
                                        <InfoField label="Gerçek Maliyet" value={job.actualCost ? `₺${job.actualCost?.toLocaleString("tr-TR")}` : "-"} icon="💵" />
                                    </>
                                )}
                                {isPersonnel && job.paymentReceived != null && (
                                    <InfoField label="Alınan Ödeme" value={`₺${job.paymentReceived?.toLocaleString("tr-TR")}`} icon="💵" />
                                )}
                                <InfoField label="Tahmini Süre" value={job.estimatedHours ? `${job.estimatedHours} saat` : "-"} icon="⏱️" />
                                <InfoField label="Planlanan Tarih" value={formatDate(job.scheduledDate)} icon="📅" />
                            </div>

                            {job.address && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <span>📍</span> Adres Bilgileri
                                    </h3>
                                    <p className="text-sm text-slate-600">{job.address}</p>
                                    {job.contactPerson && (
                                        <p className="text-sm text-slate-600 mt-2">
                                            İrtibat: {job.contactPerson} {job.contactPhone && `• ${job.contactPhone}`}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Açıklama</h3>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>
                    )
                    }

                    {
                        activeTab === "timeline" && (
                            <div className="space-y-4">
                                {job.jobHistories && job.jobHistories.length > 0 ? (
                                    <div className="relative pl-8 space-y-6">
                                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200" />
                                        {job.jobHistories.map((history: any) => (
                                            <div key={history.id} className="relative">
                                                <div className="absolute left-[-2rem] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white ring-2 ring-emerald-100" />
                                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <JobStatusBadge status={history.newStatus} showIcon={false} />
                                                        <span className="text-xs text-slate-500">{formatDate(history.createdAt)}</span>
                                                    </div>
                                                    {history.notes && <p className="text-sm text-slate-600 mt-2">{history.notes}</p>}
                                                    <p className="text-xs text-slate-500 mt-2">Değiştiren: {history.changedBy}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">Henüz geçmiş kaydı bulunmuyor</p>
                                )}
                            </div>
                        )
                    }

                    {
                        activeTab === "photos" && (
                            <div>
                                {canEdit && (
                                    <div className="mb-4">
                                        <label className="block">
                                            <span className="sr-only">Fotoğraf yükle</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                disabled={uploading}
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
                                            />
                                        </label>
                                        {uploading && <p className="text-sm text-slate-600 mt-2">Yükleniyor...</p>}
                                    </div>
                                )}
                                {job.photoUrls && job.photoUrls.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {job.photoUrls.map((url: string, idx: number) => (
                                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                                                <img src={url} alt={`İş fotoğrafı ${idx + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">Henüz fotoğraf eklenmemiş</p>
                                )}
                            </div>
                        )
                    }

                    {
                        activeTab === "materials" && (
                            <div>
                                {canEdit && (
                                    <div className="mb-4 flex gap-2">
                                        <input
                                            type="text"
                                            value={newMaterial}
                                            onChange={(e) => setNewMaterial(e.target.value)}
                                            placeholder="Malzeme adı..."
                                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                            onKeyPress={(e) => e.key === "Enter" && handleAddMaterial()}
                                        />
                                        <button
                                            onClick={handleAddMaterial}
                                            disabled={addingMaterial || !newMaterial.trim()}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            {addingMaterial ? "..." : "Ekle"}
                                        </button>
                                    </div>
                                )}
                                {job.requiredMaterials && job.requiredMaterials.length > 0 ? (
                                    <ul className="space-y-2">
                                        {job.requiredMaterials.map((material: string, idx: number) => (
                                            <li key={idx} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-emerald-600">✓</span>
                                                    <span className="text-sm text-slate-700">{material}</span>
                                                </div>
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleRemoveMaterial(idx)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Çıkar
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">Malzeme listesi eklenmemiş</p>
                                )}
                            </div>
                        )
                    }

                    {
                        activeTab === "notes" && (
                            <div className="space-y-4">
                                {canEdit && !editingNotes && (
                                    <button
                                        onClick={() => setEditingNotes(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                    >
                                        Notları Düzenle
                                    </button>
                                )}
                                {editingNotes ? (
                                    <div>
                                        <textarea
                                            value={notesText}
                                            onChange={(e) => setNotesText(e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[200px]"
                                            placeholder="İşle ilgili notlarınızı buraya yazabilirsiniz..."
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={handleSaveNotes}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                                            >
                                                Kaydet
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingNotes(false);
                                                    setNotesText(job.notes || "");
                                                }}
                                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{job.notes || "Not eklenmemiş"}</p>
                                    </div>
                                )}
                            </div>
                        )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between gap-2">
                    <div>
                        {canEdit && job.status === 3 && job.paymentReceived == null && (
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                            >
                                💰 Ödeme Al
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
                    >
                        Kapat
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Ödeme Al</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Müşteri: <strong>{job.customerName}</strong><br />
                            İş: <strong>{job.title}</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Alınan Tutar (TRY)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmitPayment}
                                disabled={submittingPayment}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {submittingPayment ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPaymentAmount("");
                                }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoField({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <span>{icon}</span>
                {label}
            </p>
            <p className="text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}
