"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

// Admin CRUD surface for /api/admin/projects leveraging the shared acargroup_* auth keys.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type ProjectAdminListDto = {
    id: number;
    title: string;
    slug: string;
    status: string;
    city: string;
    clientName: string;
    isFeatured: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
};

type ProjectAdminCreateUpdateDto = {
    title: string;
    slug: string;
    status: string;
    city?: string;
    district?: string;
    clientName?: string;
    startDate?: string;
    endDate?: string;
    shortDescription?: string;
    longDescription?: string;
    heroImageUrl?: string;
    galleryImageUrls?: string[]; // Backend expects List<string>
    displayOrder: number;
    isFeatured: boolean;
    isActive: boolean;
};

const initialFormState: ProjectAdminCreateUpdateDto = {
    title: "",
    slug: "",
    status: "Active",
    city: "",
    district: "",
    clientName: "",
    shortDescription: "",
    longDescription: "",
    heroImageUrl: "",
    galleryImageUrls: [],
    displayOrder: 0,
    isFeatured: false,
    isActive: true,
};

function slugify(text: string): string {
    const trMap: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    return text
        .replace(/[çğıİöşüÇĞIÖŞÜ]/g, (char) => trMap[char] || char)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars except space and hyphen
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Collapse multiple hyphens
        .replace(/^-+|-+$/g, '');     // Trim hyphens from ends
}

export default function AdminProjectsPage() {
    const router = useRouter();

    // State
    const [projects, setProjects] = useState<ProjectAdminListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ProjectAdminCreateUpdateDto>(initialFormState);
    const [galleryInput, setGalleryInput] = useState(""); // For textarea input
    const [saving, setSaving] = useState(false);

    // Initial Load
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            } else {
                setError("Projeler yüklenirken hata oluştu.");
            }
        } catch (err) {
            console.error(err);
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setFormData(initialFormState);
        setGalleryInput("");
        setIsEditing(false);
        setSelectedProjectId(null);
        setIsModalOpen(true);
    };

    const handleEditClick = async (id: number) => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Map detail DTO to form DTO
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    status: data.status,
                    city: data.city || "",
                    district: data.district || "",
                    clientName: data.clientName || "",
                    startDate: data.startDate ? data.startDate.split("T")[0] : "",
                    endDate: data.endDate ? data.endDate.split("T")[0] : "",
                    shortDescription: data.shortDescription || "",
                    longDescription: data.longDescription || "",
                    heroImageUrl: data.heroImageUrl || "",
                    galleryImageUrls: data.galleryImageUrls || [],
                    displayOrder: data.displayOrder || 0, // Assuming detail DTO has displayOrder, if not we might miss it. 
                    // Wait, ProjectDetailDto in prompt didn't have DisplayOrder explicitly listed but usually detail has everything.
                    // Let's assume it might be missing in detail DTO based on prompt, but let's try.
                    // Actually, looking at my previous implementation plan, ProjectDetailDto DOES NOT have DisplayOrder.
                    // This is a gap. I should have added it. 
                    // For now, I will default to 0 if missing, or fetch from list if possible.
                    // Actually, let's check the backend code I wrote.
                    // ProjectDetailDto in step 1820 DOES NOT have DisplayOrder.
                    // ProjectAdminListDto HAS DisplayOrder.
                    // So when editing, I might lose DisplayOrder if I rely only on GetById.
                    // I should probably update GetById to include DisplayOrder or just use 0.
                    // Or I can find the item in 'projects' list and get DisplayOrder from there.
                    isFeatured: data.isFeatured,
                    isActive: true, // Detail DTO doesn't have IsActive usually (public one), but Admin GetById might?
                    // Admin GetById uses ProjectDetailDto which I defined in step 1820.
                    // It has IsFeatured but NOT IsActive.
                    // This is a small issue. I should have used a specific AdminDetailDto.
                    // I will fetch displayOrder and isActive from the list state for now.
                });

                // Fix missing fields from list state
                const listItem = projects.find(p => p.id === id);
                if (listItem) {
                    setFormData(prev => ({
                        ...prev,
                        displayOrder: listItem.displayOrder,
                        isActive: listItem.isActive
                    }));
                }

                setGalleryInput(data.galleryImageUrls ? data.galleryImageUrls.join("\n") : "");
                setIsEditing(true);
                setSelectedProjectId(id);
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error(err);
            alert("Proje detayları yüklenemedi.");
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;

        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== id));
            } else {
                alert("Silme işlemi başarısız.");
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            setSaving(false);
            return;
        }

        // Process gallery input
        const galleryUrls = galleryInput.split("\n").map(s => s.trim()).filter(s => s !== "");
        const payload = { ...formData, galleryImageUrls: galleryUrls };

        try {
            const url = isEditing
                ? `${API_BASE_URL}/api/admin/projects/${selectedProjectId}`
                : `${API_BASE_URL}/api/admin/projects`;

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchProjects(); // Refresh list
            } else {
                const msg = await res.text();
                alert(`Kaydetme başarısız: ${msg}`);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Projeler Yönetimi</h1>
                        <p className="text-slate-400">Web sitesindeki projeleri buradan yönetebilirsiniz.</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Yeni Proje Ekle
                    </button>
                </div>

                {/* Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-400">{error}</div>
                    ) : projects.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">Henüz proje eklenmemiş.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Başlık</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4">Müşteri / Konum</th>
                                        <th className="px-6 py-4 text-center">Öne Çıkan</th>
                                        <th className="px-6 py-4 text-center">Sıra</th>
                                        <th className="px-6 py-4 text-center">Aktif</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {projects.map((project) => (
                                        <tr key={project.id} className="bg-slate-900/40 hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{project.title}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${project.status === "Active"
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    }`}>
                                                    {project.status === "Active" ? "Aktif" : "Tamamlandı"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white">{project.clientName}</div>
                                                <div className="text-xs text-slate-500">{project.city}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {project.isFeatured ? (
                                                    <span className="text-emerald-400">★</span>
                                                ) : (
                                                    <span className="text-slate-600">★</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-slate-400">{project.displayOrder}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`w-2 h-2 rounded-full mx-auto ${project.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(project.id)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(project.id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Proje Başlığı</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => {
                                            const newTitle = e.target.value;
                                            setFormData({
                                                ...formData,
                                                title: newTitle,
                                                slug: slugify(newTitle)
                                            });
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Slug (URL)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Durum</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="Active">Aktif (Devam Ediyor)</option>
                                        <option value="Completed">Tamamlandı</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Müşteri Adı</label>
                                    <input
                                        type="text"
                                        value={formData.clientName}
                                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Şehir</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">İlçe</label>
                                    <input
                                        type="text"
                                        value={formData.district}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.startDate || ""}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.endDate || ""}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Kısa Açıklama</label>
                                <textarea
                                    rows={2}
                                    value={formData.shortDescription}
                                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <RichTextEditor
                                    label="Detaylı Açıklama"
                                    value={formData.longDescription || ""}
                                    onChange={(val) => setFormData({ ...formData, longDescription: val })}
                                    placeholder="Proje detaylarını buraya girin..."
                                />
                            </div>

                            <div className="space-y-2">
                                <ImageUpload
                                    label="Ana Görsel"
                                    currentImageUrl={formData.heroImageUrl}
                                    onUploadSuccess={(url) => setFormData({ ...formData, heroImageUrl: url })}
                                    endpoint="/api/upload/image"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Galeri Görselleri</label>
                                <div className="mb-2">
                                    <ImageUpload
                                        label="Galeriye Görsel Ekle"
                                        onUploadSuccess={(url) => setGalleryInput(prev => prev + (prev ? "\n" : "") + url)}
                                        endpoint="/api/upload/image"
                                    />
                                </div>
                                <textarea
                                    rows={3}
                                    value={galleryInput}
                                    onChange={e => setGalleryInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-xs"
                                    placeholder="Her satıra bir URL gelecek şekilde..."
                                />
                                <p className="text-xs text-slate-500">Yukarıdan görsel yükleyebilir veya manuel URL girebilirsiniz.</p>
                            </div>

                            <div className="flex gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm text-slate-300 cursor-pointer">Öne Çıkanlarda Göster</label>
                                </div>

                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-slate-300 cursor-pointer">Aktif</label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                                >
                                    {saving ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
