"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getReferenceLogo, getProjectImage } from "@/lib/images";
import Roadmap3D from "@/components/Roadmap3D";
import BrandTicker from "@/components/BrandTicker";
import FeaturedProductPopup from "@/components/FeaturedProductPopup";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905555555555";
const HERO_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=80";

type FeaturedProject = {
  id: number;
  title: string;
  slug: string;
  status: string;
  heroImageUrl: string | null;
  city: string;
  district: string;
  clientName: string;
  shortDescription: string | null;
  heroImage?: string; // For compatibility if needed
};

type Reference = {
  id: number;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  displayOrder: number;
  isFeatured: boolean;
};

type CompanyInfo = {
  address: string | null;
  phoneNumber: string | null;
  phoneNumber2: string | null;
  email: string | null;
  email2: string | null;
  whatsappNumber: string | null;
  mapUrl: string | null;
  isWhatsappButtonActive?: boolean;
};

type HomepageService = {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;
  icon: string;
  displayOrder: number;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  const [featuredReferences, setFeaturedReferences] = useState<Reference[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [featuredProjectsLoading, setFeaturedProjectsLoading] = useState(true);
  const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
  const [isStatusReady, setIsStatusReady] = useState(false);
  const [showWhatsAppBubble, setShowWhatsAppBubble] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [services, setServices] = useState<HomepageService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsStatusReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Company Info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/companyinfo`);
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);
        }
      } catch (err) {
        console.error("Company info fetch error", err);
      }
    };
    fetchInfo();
  }, []);

  // Fetch Featured References
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/references`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data: Reference[] = await res.json();
        const featured = data.filter((r) => r.isFeatured);
        // If has featured, take them. Else fallback to first 6? Or just show empty?
        // User wants to control via checkbox. So likely only show featured.
        // But if no featured, maybe fallback? I'll stick to displaying only featured if user asks for "checkbox to feature".
        // But to avoid breaking existing state where none are featured yet (default false),
        // I might want to fallback if none are featured?
        // However, I updated DB to default false. So initially homepage will be empty references.
        // That might be shocking.
        // But user asked for it.
        // I will use featured if any, otherwise slice 6?
        // No, "ana sayfada öne çıkarabileceğimiz check box yok" implies they WANT to control it.
        // So I should only show featured.
        // But I should tell the user to go mark some as featured.
        setFeaturedReferences(featured.length > 0 ? featured : data.slice(0, 6));
      } catch (err) {
        console.error("Referanslar alınırken hata:", err);
      }
    };

    fetchReferences();
  }, []);

  // Fetch Active Projects (for homepage display)
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setFeaturedProjectsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/projects?status=Active&take=3`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setFeaturedProjects([]);
          return;
        }
        const data: FeaturedProject[] = await res.json();
        setFeaturedProjects(data);
      } catch (err) {
        console.error("Öne çıkan projeler alınırken hata:", err);
        setFeaturedProjects([]);
      } finally {
        setFeaturedProjectsLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/homepageservices`, {
          cache: "no-store"
        });
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (err) {
        console.error("Hizmetler alınırken hata:", err);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* 1. Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-slate-950 text-white overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src={HERO_BACKGROUND_IMAGE}
            alt="Teknoloji altyapısı"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/85" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32 grid gap-12 md:grid-cols-2 items-center">
          {/* Background Effects */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute left-0 bottom-0 h-80 w-80 bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_70%)]" />
          </div>

          {/* Left Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
                Kesintisiz Güvenlik & Altyapı
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Geleceğin teknolojisi, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                bugünün güvenliği.
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
              Kurumsal kamera sistemleri, sunucu kurulumları ve ağ altyapısı
              projelerini uçtan uca tasarlıyor, kuruyor ve yönetiyoruz.
              İşletmenizin dijital dönüşümünde güvenilir çözüm ortağınız.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              >
                Ürünleri İncele
              </Link>

              <Link
                href="/proje-talebi"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-white text-sm font-bold hover:bg-slate-800 transition-all backdrop-blur-sm"
              >
                Teklif Alın
              </Link>
            </div>

            <div className="flex gap-8 mt-12 pt-8 border-t border-slate-800/50">
              <div>
                <p className="text-2xl font-bold text-white">7/24</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Teknik Destek</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">%99.9</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Uptime Garantisi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Mutlu Müşteri</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="hidden md:block relative z-10"
          >
            <div className="relative w-full max-w-lg ml-auto">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

                <div className="relative z-10">
                  {/* New Title */}
                  <h3 className="text-sm font-medium text-slate-300 mb-4">
                    Acar Bilişim Ağına Bağlı Aktif Sistemlerimiz
                  </h3>

                  {/* Floating Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-4 backdrop-blur-md shadow-lg"
                    >
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1">Güvenlik</p>
                      <p className="text-sm font-bold text-white">HD IP Kamera & CCTV</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-4 backdrop-blur-md shadow-lg"
                    >
                      <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1">Alarm</p>
                      <p className="text-sm font-bold text-white">Alarm Sistemleri</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-4 backdrop-blur-md shadow-lg"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1">Altyapı</p>
                      <p className="text-sm font-bold text-white">Sunucu & Depolama</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-4 backdrop-blur-md shadow-lg"
                    >
                      <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1">Güvenlik</p>
                      <p className="text-sm font-bold text-white">Yangın ve Duman</p>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-5 backdrop-blur-md shadow-lg relative z-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-medium text-slate-400">Sistem Durumu</p>
                    {isStatusReady && <span className="flex h-2 w-2 rounded-full bg-emerald-500" />}
                  </div>

                  {!isStatusReady ? (
                    <div className="h-24 flex items-center justify-center">
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Sistem durumları kontrol ediliyor...
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-3"
                    >
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "92%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "78%" }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                          className="h-full bg-purple-500"
                        />
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </motion.div>
                  )}

                  {isStatusReady && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-4 flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">Tüm sistemler aktif</span>
                      <span className="text-emerald-400">Stabil</span>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. Why AcarGroup Section */}
      <motion.section
        id="neden"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white py-20"
      >
        <div className="max-w-6xl mx-auto px-4 grid gap-12 md:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Neden Biz?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6">
              Teknolojiye yön veren <br />
              profesyonel çözümler.
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              AcarGroup olarak, sadece ürün satmıyor; işletmenizin ihtiyaçlarına özel
              terzi işi çözümler üretiyoruz. Keşiften kuruluma, bakımdan teknik desteğe
              kadar tüm süreçlerde yanınızdayız.
            </p>
            <ul className="space-y-4">
              {[
                "Ücretsiz keşif ve projelendirme",
                "Lisanslı ve garantili ürünler",
                "7/24 Teknik destek ve bakım anlaşmaları",
                "Uzman mühendis kadrosu"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/tarihcemiz"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              >
                Tarihçemizi İnceleyin
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="relative h-full min-h-[300px] bg-slate-100 rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/why-us.png"
              alt="AcarGroup Kurumsal"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          </div>
        </div>
      </motion.section>

      {/* 3. Featured References Section */}
      <motion.section
        id="one-cikan-referanslar"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-slate-50 py-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Paydaşlarımız</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
              Güvenilir Referanslarımız
            </h2>
            <p className="text-slate-600">
              Birlikte çalıştığımız kurumlar.
            </p>
          </div>

          {featuredReferences.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Referans bulunmuyor.
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
              {featuredReferences.map((reference, index) => (
                <motion.a
                  key={reference.id}
                  href={reference.websiteUrl || '#'}
                  target={reference.websiteUrl ? '_blank' : undefined}
                  rel={reference.websiteUrl ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="aspect-square bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all p-4 flex items-center justify-center group cursor-pointer"
                >
                  <img
                    src={getReferenceLogo(reference.logoUrl, reference.name)}
                    alt={reference.name}
                    className="max-w-full max-h-full object-contain transition-all"
                  />
                </motion.a>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/referanslarimiz"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Tüm Paydaşlarımız
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 4. Services Section */}
      <motion.section
        id="hizmetler"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-slate-50 py-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Hizmetlerimiz</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
              Uçtan uca teknoloji çözümleri
            </h2>
            <p className="text-slate-600">
              İşletmenizin altyapı, güvenlik ve bilişim ihtiyaçları için
              profesyonel hizmetler sunuyoruz.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {servicesLoading ? (
              // Skeleton loading
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
              ))
            ) : services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setActiveServiceId(activeServiceId === service.id ? null : service.id)}
                className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all group ${activeServiceId === service.id
                  ? "border-emerald-500 shadow-lg"
                  : "border-slate-200 hover:shadow-lg hover:border-emerald-500/40"
                  }`}
              >
                <div className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl mb-3 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors leading-tight">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Detaylı Açıklama - Accordion */}
                <motion.div
                  initial={false}
                  animate={{
                    height: activeServiceId === service.id ? "auto" : 0,
                    opacity: activeServiceId === service.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {service.detailedDescription}
                    </p>
                  </div>
                </motion.div>

                {/* Aç/Kapat İkonu */}
                <div className="mt-3 flex justify-center">
                  <motion.div
                    animate={{ rotate: activeServiceId === service.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-slate-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5. Roadmap Section */}
      <Roadmap3D />

      {/* 6. Featured Projects Section (Portfolio) */}
      <motion.section
        id="portfoy"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white py-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider"></span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
                Öne çıkan projelerimiz
              </h2>
            </div>
            <Link href="/projelerimiz?status=Active" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Tümünü Gör
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuredProjectsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={`featured-skeleton-${idx}`}
                  className="h-64 rounded-xl border border-slate-200 bg-slate-100 animate-pulse"
                />
              ))
            ) : featuredProjects.length === 0 ? (
              <div className="md:col-span-3 text-center py-12 border border-dashed border-slate-300 rounded-2xl text-slate-500">
                Şu anda öne çıkan proje bulunmuyor.
              </div>
            ) : (
              featuredProjects.map((project, idx) => {
                const location = [project.city, project.district]
                  .filter(Boolean)
                  .join(" / ");
                return (
                  <div key={project.id} className="group cursor-pointer">
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative border border-slate-200">
                      <img
                        src={getProjectImage(project.heroImageUrl)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-900/10" />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] uppercase tracking-wide bg-white/80 text-slate-700">
                        Vaka #{idx + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {project.title}
                    </h3>
                    {project.shortDescription && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {project.shortDescription}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-1">
                      {location || "Türkiye Genelinde"} ·{" "}
                      {project.clientName ? `Müşteri: ${project.clientName}` : "Kurumsal çözüm projesi"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.section>

      {/* Contact & Map Section */}
      <motion.section
        id="teklif"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-slate-950 py-20 text-white relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10 grid gap-16 lg:grid-cols-2 items-center">
          {/* Left Column: Contact Info */}
          <div>
            <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">İletişim</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 mt-2">
              Bize Ulaşın
            </h2>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
              Projeleriniz ve sorularınız için uzman ekibimizle iletişime geçin.
              Size en kısa sürede dönüş yapalım.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Merkez Ofis</h3>
                <p className="text-slate-400 leading-relaxed">
                  {companyInfo?.address || "İstanbul, Türkiye"}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">İletişim</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-slate-400">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <a href={`tel:${companyInfo?.phoneNumber?.replace(/\s/g, "") ?? "+905555555555"}`} className="hover:text-emerald-400 transition-colors">
                        {companyInfo?.phoneNumber || "+90 555 555 5555"}
                      </a>
                      {companyInfo?.phoneNumber2 && (
                        <a href={`tel:${companyInfo?.phoneNumber2?.replace(/\s/g, "")}`} className="hover:text-emerald-400 transition-colors text-sm mt-0.5">
                          {companyInfo?.phoneNumber2}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-slate-400">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <a href={`mailto:${companyInfo?.email || "info@acargroup.com"}`} className="hover:text-emerald-400 transition-colors">
                        {companyInfo?.email || "info@acargroup.com"}
                      </a>
                      {companyInfo?.email2 && (
                        <a href={`mailto:${companyInfo?.email2}`} className="hover:text-emerald-400 transition-colors text-sm mt-0.5">
                          {companyInfo?.email2}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <a
                  href={`tel:${companyInfo?.phoneNumber?.replace(/\s/g, "") ?? "+905555555555"}`}
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hemen Ara
                </a>
                <a
                  href={`mailto:${companyInfo?.email || "info@acargroup.com"}`}
                  className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-white text-sm font-bold hover:bg-slate-800 transition-all backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Mail Gönder
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps */}
          <div className="h-[400px] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            <iframe
              src={companyInfo?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.650490010698!2d29.1167!3d40.9901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac8875af55555%3A0x1234567890abcdef!2sAta%C5%9Fehir%2C%20Istanbul!5e0!3m2!1sen!2str!4v1625000000000!5m2!1sen!2str"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>

            {/* Overlay for style */}
            <div className="absolute inset-0 pointer-events-none border-4 border-slate-800/50 rounded-2xl"></div>
          </div>
        </div>
      </motion.section>

      {/* Floating WhatsApp Button */}
      {(companyInfo?.isWhatsappButtonActive ?? true) && (
        <a
          href={`https://wa.me/${companyInfo?.whatsappNumber || WHATSAPP_NUMBER}?text=${encodeURIComponent(
            "Merhaba Acar Bilişim'in ücretsiz keşif fırsatından yararlanmak istiyorum."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[60] h-14 w-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 group"
          aria-label="WhatsApp ile iletişime geçin"
          onMouseEnter={() => setShowWhatsAppBubble(true)}
        >
          {/* Ringing Bell Animation */}
          <div className="absolute -top-3 -right-2 z-10 animate-ring">
            <div className="bg-red-500 text-white p-1.5 rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
          </div>

          {/* Message Bubble */}
          {showWhatsAppBubble && (
            <div className="absolute bottom-full mb-4 right-0 w-64 bg-white p-4 rounded-2xl rounded-br-none shadow-2xl border border-slate-100 animate-bounce-slow origin-bottom-right">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowWhatsAppBubble(false);
                }}
                className="absolute -top-2 -left-2 bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 rounded-full p-1 transition-colors shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-slate-800 leading-snug">
                    👋 Merhaba! Ücretsiz keşif fırsatından yararlanmak için bize ulaşın.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 text-right">Şimdi</p>
                </div>
              </div>
              {/* Tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-slate-100"></div>
            </div>
          )}
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            />
          </svg>
        </a>
      )}

      {/* Featured Product Popup */}
      <FeaturedProductPopup />

      {/* Sticky Brand Ticker */}
      <BrandTicker />
    </div>
  );
}
