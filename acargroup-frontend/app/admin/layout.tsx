import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import LogoutButton from "@/components/admin/LogoutButton";
import {
    LayoutDashboard,
    Briefcase,
    Award,
    Tags,
    Info,
    Package,
    Layers,
    Users,
    FileQuestion,
    Wrench,
    ClipboardList,
    UserCog,
    Calendar,
    DollarSign,
    FileText,
    Calculator,
    Globe,
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="min-h-screen grid grid-cols-[260px_1fr]">
                {/* Sidebar */}
                <aside className="bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="bg-emerald-500 w-2 h-6 rounded-full inline-block" />
                            Admin Panel
                        </h2>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-8">
                        {/* General */}
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Genel
                            </h3>
                            <div className="space-y-1">
                                <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} label="Genel Özet" />
                            </div>
                        </div>

                        {/* Content Management */}
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                İçerik Yönetimi
                            </h3>
                            <div className="space-y-1">
                                <SidebarLink href="/admin/projects" icon={<Briefcase size={18} />} label="Projeler" />
                                <SidebarLink href="/admin/references" icon={<Award size={18} />} label="Referanslar" />
                                <SidebarLink href="/admin/brands" icon={<Tags size={18} />} label="Markalar" />
                                <SidebarLink href="/admin/company-info" icon={<Info size={18} />} label="Biz Kimiz" />
                                <SidebarLink href="/admin/history" icon={<Calendar size={18} />} label="Tarihçe" />
                                <SidebarLink href="/admin/services" icon={<Briefcase size={18} />} label="Hizmetler" />
                            </div>
                        </div>

                        {/* Product Management */}
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Ürün Yönetimi
                            </h3>
                            <div className="space-y-1">
                                <SidebarLink href="/admin/categories" icon={<Layers size={18} />} label="Kategoriler" />
                                <SidebarLink href="/admin/products" icon={<Package size={18} />} label="Ürünler" />
                            </div>
                        </div>

                        {/* CRM */}
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Müşteri & Talepler
                            </h3>
                            <div className="space-y-1">
                                <SidebarLink href="/admin/customers" icon={<Users size={18} />} label="Müşteriler" />
                                <SidebarLink href="/admin/offers" icon={<FileText size={18} />} label="Teklifler" />
                                <SidebarLink href="/admin/project-requests" icon={<FileQuestion size={18} />} label="Proje Talepleri" />
                                <SidebarLink href="/admin/internet-basvurulari" icon={<Globe size={18} />} label="İnternet Başvuruları" />
                                <SidebarLink href="/admin/service-items" icon={<Wrench size={18} />} label="Servis Kayıtları" />
                            </div>
                        </div>

                        {/* Technical Service */}
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Teknik Servis
                            </h3>
                            <div className="space-y-1">
                                <SidebarLink href="/admin/isler" icon={<ClipboardList size={18} />} label="İş Atama/Takip" />
                                <SidebarLink href="/admin/personel" icon={<UserCog size={18} />} label="Personel" />
                                <SidebarLink href="/admin/takvim" icon={<Calendar size={18} />} label="Takvim" />
                                <SidebarLink href="/admin/finans" icon={<DollarSign size={18} />} label="Finans" />
                                <SidebarLink href="/admin/muhasebe" icon={<Calculator size={18} />} label="Muhasebe" />
                            </div>
                        </div>

                        {/* Definitions */}
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Tanımlamalar
                            </h3>
                            <div className="space-y-1">
                                <SidebarLink href="/admin/companies" icon={<Briefcase size={18} />} label="Firma Bilgileri" />
                                <SidebarLink href="/admin/shipping-companies" icon={<Package size={18} />} label="Kargo Bilgileri" />
                            </div>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-slate-800 space-y-1">
                        <SidebarLink href="/admin/profile" icon={<UserCog size={18} />} label="Profil / Ayarlar" />
                        <LogoutButton />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="bg-slate-50 min-h-screen">
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
        >
            <span className="text-slate-400 group-hover:text-white">{icon}</span>
            {label}
        </Link>
    );
}
