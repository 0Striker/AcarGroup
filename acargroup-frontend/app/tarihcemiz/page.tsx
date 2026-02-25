"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
    HiOutlineOfficeBuilding,
    HiOutlineUsers,
    HiOutlineTrendingUp,
    HiOutlineGlobe,
    HiOutlineAcademicCap,
    HiOutlineLightBulb,
    HiOutlineShieldCheck,
    HiOutlineStar
} from "react-icons/hi";
import * as Icons from "react-icons/hi";

import { IconType } from "react-icons";

// Timeline veri tipi
// Timeline veri tipi
type TimelineItem = {
    years: string;
    title: string;
    description: string;
    icon: string; // Icon name as string
};

// Helper to map icon name to component
const getIconComponent = (iconName: string): IconType => {
    // @ts-ignore
    const Icon = Icons[iconName];
    return Icon || HiOutlineStar;
};

// Tek Timeline Elemanı Bileşeni
function TimelineCard({
    item,
    index,
    isActive
}: {
    item: TimelineItem;
    index: number;
    isActive: boolean;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const isLeft = index % 2 === 0;
    const Icon = getIconComponent(item.icon);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`relative flex items-center gap-8 mb-12 md:mb-16 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
        >
            {/* Kart - Sol veya Sağ */}
            <div className={`flex-1 ${isLeft ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}>
                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer group"
                >
                    {/* Yıl Badge */}
                    <div className={`inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${isLeft ? "md:float-right md:ml-4" : "md:float-left md:mr-4"
                        }`}>
                        <span>{item.years}</span>
                    </div>

                    {/* Başlık ve İkon */}
                    <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:flex-row-reverse md:justify-start" : "md:flex-row"
                        }`}>
                        <Icon className="text-emerald-600 text-2xl flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                            {item.title}
                        </h3>
                    </div>

                    {/* Açıklama */}
                    <p className="text-slate-600 leading-relaxed">
                        {item.description}
                    </p>
                </motion.div>
            </div>

            {/* Merkez Nokta */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10 hidden md:flex flex-col items-center">
                <motion.div
                    animate={{
                        scale: isActive ? 1.3 : 1,
                        backgroundColor: isActive ? "#059669" : "#ef4444"
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 rounded-full border-4 border-white shadow-lg"
                />
            </div>

            {/* Boş Alan - Karşı Taraf */}
            <div className="flex-1 hidden md:block" />
        </motion.div>
    );
}

// Ana Timeline Bileşeni
export default function CompanyTimelinePage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203"}/api/history`);
                if (res.ok) {
                    const data = await res.json();
                    setTimelineItems(data);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Scroll pozisyonuna göre aktif öğeyi belirle
    useEffect(() => {
        const handleScroll = () => {
            if (!timelineRef.current) return;

            const cards = timelineRef.current.querySelectorAll("[data-timeline-card]");
            const scrollY = window.scrollY + window.innerHeight / 2;

            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const cardTop = rect.top + window.scrollY;
                const cardBottom = cardTop + rect.height;

                if (scrollY >= cardTop && scrollY <= cardBottom) {
                    setActiveIndex(index);
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        setTimeout(handleScroll, 500); // Initial check with delay for dynamic content
        return () => window.removeEventListener("scroll", handleScroll);
    }, [timelineItems]); // Re-run when items change

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]" />
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Tarihçemiz
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
                            2008&apos;den bugüne güvenlik ve teknoloji alanında 15 yıllık yolculuğumuz
                        </p>
                    </motion.div>
                </div>

                {/* Decorative bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(248 250 252)" />
                    </svg>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 md:py-24 relative">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <div ref={timelineRef} className="relative">
                        {/* Merkez Çizgi - Desktop */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-red-400 to-red-500 transform -translate-x-1/2 hidden md:block" />

                        {/* Timeline Kartları */}
                        <div className="relative">
                            {timelineItems.map((item, index) => (
                                <div key={index} data-timeline-card>
                                    <TimelineCard
                                        item={item}
                                        index={index}
                                        isActive={activeIndex === index}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 md:py-20 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Tecrübemizin Bir Parçası Olun
                        </h2>
                        <p className="text-xl text-slate-300 mb-8">
                            15 yıllık tecrübemizle güvenlik ve teknoloji ihtiyaçlarınız için yanınızdayız.
                        </p>
                        <a
                            href="/#iletisim"
                            className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
                        >
                            İletişime Geçin
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
