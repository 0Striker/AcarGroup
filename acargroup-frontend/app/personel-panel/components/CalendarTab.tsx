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

export default function CalendarTab() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/calendar`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                // Sort by start date
                const sorted = data.sort((a: CalendarEvent, b: CalendarEvent) =>
                    new Date(a.start).getTime() - new Date(b.start).getTime()
                );
                setEvents(sorted);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: number) => {
        const token = getToken();
        if (!token) return;

        if (!confirm("Bu randevuyu onaylamak istediğinize emin misiniz?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/calendar/schedule/${id}/confirm`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchEvents();
            } else {
                alert("Onaylanamadı.");
            }
        } catch (error) {
            console.error("Error confirming event:", error);
        }
    };

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

    if (events.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-slate-400">Planlanmış randevunuz bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Yaklaşan Randevular</h2>
            <div className="grid gap-4">
                {events.map((event) => (
                    <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-emerald-400 font-medium">
                                    {new Date(event.start).toLocaleDateString("tr-TR")}
                                </span>
                                <span className="text-slate-500 text-sm">
                                    {new Date(event.start).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })} -
                                    {new Date(event.end).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <h3 className="text-white font-medium">{event.title}</h3>
                            {event.isConfirmed ? (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs rounded border border-emerald-500/20">
                                    Onaylandı
                                </span>
                            ) : (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20">
                                    Onay Bekliyor
                                </span>
                            )}
                        </div>

                        {!event.isConfirmed && (
                            <button
                                onClick={() => handleConfirm(event.id)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition"
                            >
                                Onayla
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
