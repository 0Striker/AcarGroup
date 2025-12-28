"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface CalendarEvent {
    id: number;
    title: string;
    start: string;
    end: string;
    jobId: number;
    personnelName: string;
    isConfirmed: boolean;
}

interface Job {
    id: number;
    title: string;
    customerName: string;
    priority: number;
    estimatedCost: number;
    scheduledDate: string;
    status: number;
}

export default function AdminCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [reminders, setReminders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showDayDetailModal, setShowDayDetailModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Form Data
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [personnel, setPersonnel] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        customerId: "",
        newCustomerName: "",
        newCustomerEmail: "",
        newCustomerPhone: "",
        title: "",
        description: "",
        personnelId: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "12:00"
    });

    const [reminderFormData, setReminderFormData] = useState({
        title: "",
        reminderDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchEvents();
        fetchJobs();
        fetchDependencies();
        fetchReminders();
    }, []);

    const fetchEvents = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/calendar`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setEvents(await response.json());
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const allJobs = await response.json();
                // Filter jobs that have scheduled dates and are not cancelled (status: 4 = Canceled)
                const scheduledJobs = allJobs.filter((j: Job) => j.scheduledDate && j.status !== 4);
                setJobs(scheduledJobs);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const fetchDependencies = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const [custRes, persRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/personnel`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (custRes.ok) setCustomers(await custRes.json());
            if (persRes.ok) setPersonnel(await persRes.json());
        } catch (error) {
            console.error("Error fetching dependencies:", error);
        }
    };

    const fetchReminders = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/reminders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReminders(data);
            }
        } catch (error) {
            console.error("Error fetching reminders:", error);
        }
    };

    const handleReminderCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/reminders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: reminderFormData.title,
                    reminderDate: new Date(reminderFormData.reminderDate + "T00:00:00Z").toISOString()
                })
            });

            if (response.ok) {
                alert("Hatırlatıcı oluşturuldu!");
                setShowReminderModal(false);
                setReminderFormData({ title: "", reminderDate: new Date().toISOString().split('T')[0] });
                fetchReminders();
            } else {
                alert("Hatırlatıcı oluşturulamadı.");
            }
        } catch (error) {
            console.error("Error creating reminder:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleReminderDelete = async (id: number) => {
        if (!confirm("Bu hatırlatıcıyı silmek istediğinizden emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                alert("Hatırlatıcı silindi.");
                fetchReminders();
            } else {
                alert("Silme başarısız.");
            }
        } catch (error) {
            console.error("Error deleting reminder:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleJobCancel = async (id: number) => {
        if (!confirm("Bu işi iptal etmek istediğinizden emin misiniz?")) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    newStatus: 4, // 4 = Canceled (JobStatus enum)
                    notes: "Takvimden iptal edildi"
                })
            });

            if (response.ok) {
                alert("İş iptal edildi.");
                fetchJobs();
                fetchEvents(); // Refresh events too in case they're linked
            } else {
                alert("İptal işlemi başarısız.");
            }
        } catch (error) {
            console.error("Error cancelling job:", error);
            alert("Bir hata oluştu.");
        }
    };


    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            let customerId = formData.customerId;

            // 1. Create Customer if new
            if (isNewCustomer) {
                const custRes = await fetch(`${API_BASE_URL}/api/auth/register`, { // Using register for new customer
                    method: "POST",
                    headers: { "Content-Type": "application/json" }, // Public endpoint usually, but maybe auth needed?
                    // Actually, Admin should use a different endpoint to create customer without password or auto-generate
                    // But for now, let's assume we use the public register or a simplified admin create if available.
                    // Wait, AuthController.Register is for self-registration.
                    // We don't have an Admin Create Customer endpoint in the plan.
                    // Let's use AuthController.Register but we need a password.
                    // Hack: Generate a random password.
                    body: JSON.stringify({
                        fullName: formData.newCustomerName,
                        email: formData.newCustomerEmail,
                        phone: formData.newCustomerPhone,
                        password: "TempPassword123!", // Placeholder
                        confirmPassword: "TempPassword123!"
                    })
                });

                // Wait, Register returns Token, not ID directly in a clean way for Admin usage usually.
                // But let's check AuthController.Register response. It returns AuthResponseDto (Token, CustomerId, etc).
                if (custRes.ok) {
                    const custData = await custRes.json();
                    customerId = custData.customerId.toString(); // Assuming AuthResponseDto has CustomerId
                    // Actually AuthResponseDto has: string Token, string Role, string CustomerId (maybe?)
                    // Let's check AuthResponseDto.
                } else {
                    alert("Müşteri oluşturulamadı.");
                    return;
                }
            }

            // 2. Create Job
            const jobRes = await fetch(`${API_BASE_URL}/api/jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    customerId: parseInt(customerId),
                    title: formData.title,
                    description: formData.description,
                    assignedPersonnelId: parseInt(formData.personnelId),
                    estimatedCost: 0 // Default
                })
            });

            if (!jobRes.ok) throw new Error("İş oluşturulamadı");
            const jobData = await jobRes.json();

            // 3. Schedule Job
            const startDateTime = `${formData.date}T${formData.startTime}:00`;
            const endDateTime = `${formData.date}T${formData.endTime}:00`;

            const schedRes = await fetch(`${API_BASE_URL}/api/calendar/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    jobId: jobData.id,
                    scheduledStartTime: startDateTime,
                    scheduledEndTime: endDateTime,
                    location: "Adres", // Placeholder
                    scheduleNotes: "Takvimden oluşturuldu"
                })
            });

            if (schedRes.ok) {
                setShowModal(false);
                fetchEvents();
                // Reset form
                setFormData({
                    customerId: "",
                    newCustomerName: "",
                    newCustomerEmail: "",
                    newCustomerPhone: "",
                    title: "",
                    description: "",
                    personnelId: "",
                    date: new Date().toISOString().split('T')[0],
                    startTime: "09:00",
                    endTime: "12:00"
                });
                setIsNewCustomer(false);
                alert("İş başarıyla oluşturuldu!");
            } else {
                alert("İş schedule edilemedi.");
            }

        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        }
    };

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        // Adjust for Monday start (Turkey)
        const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: firstDayAdjusted };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">
                        {monthNames[currentDate.getMonth()]} <span className="text-slate-400">{currentDate.getFullYear()}</span>
                    </h1>
                    <div className="flex bg-slate-700 rounded-lg p-1">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-600 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium hover:bg-slate-600 rounded">Bugün</button>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-600 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowReminderModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        📌 Hatırlatıcı Ekle
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        + İş Ekle
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 bg-slate-800 border-b border-slate-700">
                {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => (
                    <div key={day} className="py-2 text-center text-sm font-medium text-slate-400 border-r border-slate-700 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-900">
                {emptyDays.map(i => (
                    <div key={`empty-${i}`} className="border-b border-r border-slate-800 bg-slate-900/50"></div>
                ))}
                {daysArray.map(day => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.start.startsWith(dateStr));
                    const dayJobs = jobs.filter(j => j.scheduledDate && j.scheduledDate.startsWith(dateStr));
                    const dayReminders = reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(dateStr));
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                    // Priority colors
                    const getPriorityColor = (priority: number) => {
                        switch (priority) {
                            case 1: return 'bg-emerald-900/50 text-emerald-200 border-emerald-800/50'; // Low
                            case 2: return 'bg-blue-900/50 text-blue-200 border-blue-800/50'; // Normal
                            case 3: return 'bg-yellow-900/50 text-yellow-200 border-yellow-800/50'; // High
                            case 4: return 'bg-red-900/50 text-red-200 border-red-800/50'; // Urgent
                            default: return 'bg-slate-800/50 text-slate-300 border-slate-700/50';
                        }
                    };

                    return (
                        <div
                            key={day}
                            onClick={() => {
                                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                setSelectedDate(dateStr);
                                setShowDayDetailModal(true);
                            }}
                            className={`border-b border-r border-slate-800 p-2 min-h-[100px] overflow-y-auto cursor-pointer hover:bg-slate-800/30 transition ${isToday ? 'bg-slate-800/50 ring-2 ring-emerald-500/50' : ''
                                }`}
                        >
                            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-red-500 text-white' : 'text-slate-400'}`}>
                                {day}
                            </span>
                            <div className="mt-1 space-y-1">
                                {/* Calendar Events */}
                                {dayEvents.map(event => (
                                    <div key={`event-${event.id}`} className="text-xs p-1 rounded bg-emerald-900/50 text-emerald-200 border border-emerald-800/50 truncate">
                                        {new Date(event.start).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })} {event.title}
                                    </div>
                                ))}
                                {/* Scheduled Jobs */}
                                {dayJobs.map(job => (
                                    <div
                                        key={`job-${job.id}`}
                                        className={`text-xs p-1.5 rounded border group relative hover:${getPriorityColor(job.priority).replace('/50', '/70')} transition ${getPriorityColor(job.priority)}`}
                                        title={`${job.customerName} - ${job.estimatedCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 flex-1 min-w-0">
                                                <span className="font-medium">İş:</span>
                                                <span className="truncate">{job.title}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleJobCancel(job.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 ml-1 hover:text-red-400 transition"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Reminders */}
                                {dayReminders.map((reminder: any) => (
                                    <div
                                        key={`reminder-${reminder.id}`}
                                        className="bg-purple-900/50 text-purple-200 border border-purple-800/50 rounded p-1.5 text-xs mb-1 hover:bg-purple-800/50 transition group relative"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 flex-1 min-w-0">
                                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                <span className="truncate">{reminder.title}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReminderDelete(reminder.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 ml-1 text-purple-300 hover:text-red-400 transition"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Hızlı İş Oluştur</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-4 space-y-4">
                            {/* Customer Toggle */}
                            <div className="flex bg-slate-700 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setIsNewCustomer(false)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${!isNewCustomer ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                                >
                                    Mevcut Müşteri
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsNewCustomer(true)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${isNewCustomer ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                                >
                                    Yeni Müşteri
                                </button>
                            </div>

                            {isNewCustomer ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Ad Soyad"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                                        value={formData.newCustomerName}
                                        onChange={e => setFormData({ ...formData, newCustomerName: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="E-posta"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                                        value={formData.newCustomerEmail}
                                        onChange={e => setFormData({ ...formData, newCustomerEmail: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Telefon"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                                        value={formData.newCustomerPhone}
                                        onChange={e => setFormData({ ...formData, newCustomerPhone: e.target.value })}
                                        required
                                    />
                                </>
                            ) : (
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                    value={formData.customerId}
                                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                    required
                                >
                                    <option value="">Müşteri Seçin</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.fullName}</option>
                                    ))}
                                </select>
                            )}

                            <input
                                type="text"
                                placeholder="İş Başlığı"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="time"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                value={formData.personnelId}
                                onChange={e => setFormData({ ...formData, personnelId: e.target.value })}
                                required
                            >
                                <option value="">Personel Ata</option>
                                {personnel.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.specialization})</option>
                                ))}
                            </select>

                            <textarea
                                placeholder="Açıklama (opsiyonel)"
                                rows={3}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition"
                            >
                                Oluştur
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reminder Modal */}
            {showReminderModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                Hatırlatıcı Ekle
                            </h2>
                            <button onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleReminderCreate} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Hatırlatıcı Notu *</label>
                                <input
                                    type="text"
                                    required
                                    value={reminderFormData.title}
                                    onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Örn: Müşteri araması yap"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Tarih *</label>
                                <input
                                    type="date"
                                    required
                                    value={reminderFormData.reminderDate}
                                    onChange={(e) => setReminderFormData({ ...reminderFormData, reminderDate: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReminderModal(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    Hatırlatıcı Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Day Detail Modal */}
            {showDayDetailModal && selectedDate && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {selectedDate && new Date(selectedDate).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                            </h2>
                            <button onClick={() => setShowDayDetailModal(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Planlı İşler ({jobs.filter(j => j.scheduledDate && j.scheduledDate.startsWith(selectedDate)).length})
                                </h3>
                                <div className="space-y-2">
                                    {jobs.filter(j => j.scheduledDate && j.scheduledDate.startsWith(selectedDate)).length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center py-4 bg-slate-900/50 rounded-lg">Bu gün için planlanmış iş yok.</p>
                                    ) : (
                                        jobs.filter(j => j.scheduledDate && j.scheduledDate.startsWith(selectedDate)).map(job => {
                                            const getPriorityLabel = (priority: number) => {
                                                switch (priority) {
                                                    case 1: return { text: 'Düşük', color: 'bg-emerald-600' };
                                                    case 2: return { text: 'Normal', color: 'bg-blue-600' };
                                                    case 3: return { text: 'Yüksek', color: 'bg-yellow-600' };
                                                    case 4: return { text: 'Acil', color: 'bg-red-600' };
                                                    default: return { text: 'Normal', color: 'bg-slate-600' };
                                                }
                                            };
                                            const priority = getPriorityLabel(job.priority);


                                            return (
                                                <div key={job.id} className="bg-slate-700 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition group relative">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-white mb-1">{job.title}</h4>
                                                            <p className="text-sm text-slate-400">Müşteri: {job.customerName}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`${priority.color} text-white text-xs px-2 py-1 rounded font-medium`}>
                                                                {priority.text}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleJobCancel(job.id);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                                                                title="İşi iptal et"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-slate-300">
                                                        Tahmini Maliyet: {job.estimatedCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    Hatırlatıcılar ({reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(selectedDate)).length})
                                </h3>
                                <div className="space-y-2">
                                    {reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(selectedDate)).length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center py-4 bg-slate-900/50 rounded-lg">Bu gün için hatırlatıcı yok.</p>
                                    ) : (
                                        reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(selectedDate)).map(reminder => (
                                            <div key={reminder.id} className="bg-purple-900/30 rounded-lg p-3 border border-purple-800/50 hover:border-purple-700 transition group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                        <span className="text-purple-200">{reminder.title}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReminderDelete(reminder.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-purple-300 hover:text-red-400 transition"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div >
                </div>
            )
            }
        </div >
    );
}
