"use client";

import "./globals.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Instagram, Youtube, Linkedin } from "lucide-react";

const BRANDING_VARIANTS = [
  {
    name: "Primary Logo",
    url: "/logo.png",
  },
  {
    name: "Secondary Logo",
    url: "/logo.png",
  },
  {
    name: "Dark Logo",
    url: "/logo.png",
  },
  {
    name: "Icon Logo",
    url: "/logo.png",
  },
  {
    name: "Badge Logo",
    url: "/logo.png",
  },
];



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [eurRate, setEurRate] = useState<number | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{
    phoneNumber?: string;
    phoneNumber2?: string;
    email?: string;
    email2?: string;
    address?: string;
    isInternetApplicationButtonActive?: boolean;

    logoUrl?: string;
    logoTitle?: string;
    logoText?: string;
    tickerText?: string;
    showCurrencyRates?: boolean;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch currency rates and company info
  useEffect(() => {
    const fetchData = async () => {
      // Currency
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        setUsdRate(data.rates.TRY);

        const eurRes = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const eurData = await eurRes.json();
        setEurRate(eurData.rates.TRY);
      } catch (error) {
        console.error('Currency fetch error:', error);
      }

      // Company Info
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203"}/api/companyinfo`);
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);
        }
      } catch (error) {
        console.error('Company info fetch error:', error);
      }
    };
    fetchData();

    // Listen for company info updates from admin panel
    const handleCompanyInfoUpdate = () => {
      // Refetch company info when admin panel triggers update
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203"}/api/companyinfo`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCompanyInfo(data);
        })
        .catch(err => console.error('Company info refresh error:', err));
    };

    window.addEventListener('companyInfoUpdated', handleCompanyInfoUpdate);

    return () => {
      window.removeEventListener('companyInfoUpdated', handleCompanyInfoUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">
        {/* Top Info Bar */}
        <div className="bg-slate-900 text-white py-2 text-xs border-b border-slate-800">
          <div className="w-full px-4 flex items-center justify-between gap-4">
            {/* Contact Info */}
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <a href={`tel:${companyInfo?.phoneNumber?.replace(/\s/g, "") ?? "+905555555555"}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="hidden sm:inline">{companyInfo?.phoneNumber ?? "+90 555 555 5555"}</span>
                </a>
                {companyInfo?.phoneNumber2 && (
                  <a href={`tel:${companyInfo?.phoneNumber2?.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors hidden lg:flex">
                    <span className="text-slate-600">|</span>
                    <span className="hidden sm:inline">{companyInfo?.phoneNumber2}</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a href={`mailto:${companyInfo?.email ?? "info@acargroup.com"}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden md:inline">{companyInfo?.email ?? "info@acargroup.com"}</span>
                </a>
                {companyInfo?.email2 && (
                  <a href={`mailto:${companyInfo?.email2}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors hidden xl:flex">
                    <span className="text-slate-600">|</span>
                    <span className="hidden md:inline">{companyInfo?.email2}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Scrolling Company Name - Center */}
            <div className="flex-1 overflow-hidden relative">
              {companyInfo?.tickerText && (
                <>
                  <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10" />
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10" />
                  <div className="animate-marquee whitespace-nowrap inline-flex">
                    {[...Array(6)].map((_, i) => (
                      <span key={i} className="inline-block px-8 text-slate-300 font-medium tracking-wide">
                        {companyInfo?.tickerText}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Currency Rates - Vertical */}
            {(companyInfo?.showCurrencyRates ?? true) && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex flex-col items-end text-[10px] leading-tight">
                  <div className="text-slate-400">
                    USD: <span className="text-white font-semibold">{usdRate ? `₺${usdRate.toFixed(2)}` : '...'}</span>
                  </div>
                  <div className="text-slate-400">
                    EUR: <span className="text-white font-semibold">{eurRate ? `₺${eurRate.toFixed(2)}` : '...'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 shadow-md">
                  <img
                    src={companyInfo?.logoUrl || BRANDING_VARIANTS[0].url}
                    alt="AcarGroup Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2.5 flex flex-col justify-center">
                  <p className="text-lg font-bold text-slate-800 leading-none tracking-tight">
                    {companyInfo?.logoTitle || "AcarGroup"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    {companyInfo?.logoText || "Teknoloji & Güvenlik"}
                  </p>
                </div>
              </Link>

              {/* Desktop Mega Menu Navigation */}
              <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
                {/* Ana Sayfa */}
                <Link
                  href="/"
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  Ana Sayfa
                </Link>

                {/* Hizmetler */}
                <Link
                  href="/#hizmetler"
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  Hizmetler
                </Link>

                {/* Projeler - Mega Menu */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('projeler')}
                    onClick={() => setActiveDropdown(activeDropdown === 'projeler' ? null : 'projeler')}
                    className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1"
                  >
                    Projeler
                    <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'projeler' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'projeler' && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
                    >
                      <Link href="/projelerimiz?status=Active" className="block px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100">
                        <div className="font-semibold">Aktif Projeler</div>
                        <div className="text-xs text-slate-500">Devam eden projelerimiz</div>
                      </Link>
                      <Link href="/projelerimiz?status=Completed" className="block px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <div className="font-semibold">Tamamlanan Projeler</div>
                        <div className="text-xs text-slate-500">Başarıyla tamamladıklarımız</div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Ürünler */}
                <Link
                  href="/products"
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  Ürünler
                </Link>

                {/* Kurumsal - Mega Menu */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('kurumsal')}
                    onClick={() => setActiveDropdown(activeDropdown === 'kurumsal' ? null : 'kurumsal')}
                    className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1"
                  >
                    Kurumsal
                    <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'kurumsal' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'kurumsal' && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 divide-x divide-slate-100">
                        {/* Sol Kolon */}
                        <div>
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase">Hakkımızda</div>
                          </div>
                          <Link href="/biz-kimiz" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                            <div className="font-semibold">Biz Kimiz</div>
                          </Link>
                          <Link href="/tarihcemiz" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                            <div className="font-semibold">Tarihçemiz</div>
                          </Link>
                          <Link href="/referanslarimiz" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                            <div className="font-semibold">Referanslar</div>
                          </Link>
                        </div>

                        {/* Sağ Kolon */}
                        <div>
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase">İletişim</div>
                          </div>
                          <Link href="/proje-talebi" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                            <div className="font-semibold">Teklif Al</div>
                          </Link>
                          <div className="px-4 py-2.5 text-sm text-slate-700">
                            <a href={`tel:${companyInfo?.phoneNumber?.replace(/\s/g, "") ?? "+905555555555"}`} className="block hover:bg-emerald-50 hover:text-emerald-600 transition-colors -mx-4 px-4 py-1">
                              <div className="font-semibold">Telefon</div>
                              <div className="text-xs text-slate-500">{companyInfo?.phoneNumber ?? "+90 555 555 5555"}</div>
                            </a>
                            {companyInfo?.phoneNumber2 && (
                              <a href={`tel:${companyInfo?.phoneNumber2?.replace(/\s/g, "")}`} className="block hover:bg-emerald-50 hover:text-emerald-600 transition-colors -mx-4 px-4 py-1 mt-1">
                                <div className="text-xs text-slate-500">{companyInfo?.phoneNumber2}</div>
                              </a>
                            )}
                          </div>
                          <div className="px-4 py-2.5 text-sm text-slate-700">
                            <a href={`mailto:${companyInfo?.email ?? "info@acargroup.com"}`} className="block hover:bg-emerald-50 hover:text-emerald-600 transition-colors -mx-4 px-4 py-1">
                              <div className="font-semibold">E-posta</div>
                              <div className="text-xs text-slate-500">{companyInfo?.email ?? "info@acargroup.com"}</div>
                            </a>
                            {companyInfo?.email2 && (
                              <a href={`mailto:${companyInfo?.email2}`} className="block hover:bg-emerald-50 hover:text-emerald-600 transition-colors -mx-4 px-4 py-1 mt-1">
                                <div className="text-xs text-slate-500">{companyInfo?.email2}</div>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center gap-2 ml-2">
                  {(companyInfo?.isInternetApplicationButtonActive ?? true) && (
                    <Link
                      href="/internet-basvurusu"
                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      İnternet Başvurusu
                    </Link>
                  )}
                  <Link
                    href="/proje-talebi"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                  >
                    Teklif Al
                  </Link>
                  <Link
                    href="/uye-giris"
                    className="px-5 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Üye Girişi
                  </Link>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg z-50 relative"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>


        </motion.nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-white z-50 lg:hidden overflow-y-auto transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          style={{ top: '0px' }}
        >
          <div className="flex flex-col pt-24 pb-12 px-6 gap-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-0 p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Mobile Navigation Links */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors border-b border-slate-100 pb-4"
            >
              Ana Sayfa
            </Link>

            <Link
              href="/#hizmetler"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors border-b border-slate-100 pb-4"
            >
              Hizmetler
            </Link>

            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
              <div className="text-xl font-bold text-slate-800">Projeler</div>
              <Link
                href="/projelerimiz?status=Active"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pl-4 text-slate-600 hover:text-emerald-600"
              >
                • Aktif Projeler
              </Link>
              <Link
                href="/projelerimiz?status=Completed"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pl-4 text-slate-600 hover:text-emerald-600"
              >
                • Tamamlanan Projeler
              </Link>
            </div>

            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors border-b border-slate-100 pb-4"
            >
              Ürünler
            </Link>

            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
              <div className="text-xl font-bold text-slate-800">Kurumsal</div>
              <Link
                href="/biz-kimiz"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pl-4 text-slate-600 hover:text-emerald-600"
              >
                • Biz Kimiz
              </Link>
              <Link
                href="/tarihcemiz"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pl-4 text-slate-600 hover:text-emerald-600"
              >
                • Tarihçemiz
              </Link>
              <Link
                href="/referanslarimiz"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pl-4 text-slate-600 hover:text-emerald-600"
              >
                • Referanslar
              </Link>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {(companyInfo?.isInternetApplicationButtonActive ?? true) && (
                <Link
                  href="/internet-basvurusu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-blue-600 text-white text-center font-bold rounded-xl shadow-md"
                >
                  İnternet Başvurusu
                </Link>
              )}
              <Link
                href="/proje-talebi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 bg-emerald-600 text-white text-center font-bold rounded-xl shadow-md"
              >
                Teklif Al
              </Link>
              <Link
                href="/uye-giris"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 bg-slate-800 text-white text-center font-bold rounded-xl shadow-md"
              >
                Üye Girişi
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 md:py-16 border-t-4 border-emerald-500">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={companyInfo?.logoUrl || BRANDING_VARIANTS[1].url}
                      alt="AcarGroup Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{companyInfo?.logoTitle || "AcarGroup"}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{companyInfo?.logoText || "Teknoloji & Güvenlik"}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Güvenlik ve teknoloji çözümlerinde 15 yıllık tecrübe ile yanınızdayız.
                </p>
                <div>
                  <p className="text-xs uppercase text-slate-500 tracking-wide mb-2">Marka Varyasyonları</p>
                  <div className="grid grid-cols-3 gap-2">
                    {BRANDING_VARIANTS.slice(2).map((logo) => (
                      <div key={logo.name} className="h-10 rounded-md overflow-hidden border border-slate-700/60">
                        <img src={logo.url} alt={logo.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-bold mb-4 text-emerald-400">Hızlı Linkler</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      Ürünler
                    </Link>
                  </li>
                  <li>
                    <Link href="/biz-kimiz" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      Biz Kimiz
                    </Link>
                  </li>
                  <li>
                    <Link href="/tarihcemiz" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      Tarihçemiz
                    </Link>
                  </li>
                  <li>
                    <Link href="/#hizmetler" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      Hizmetler
                    </Link>
                  </li>
                  <li>
                    <Link href="/referanslarimiz" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      Referanslarımız
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-bold mb-4 text-emerald-400">İletişim</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex flex-col">
                      <a href={`tel:${companyInfo?.phoneNumber?.replace(/\s/g, "") ?? "+905555555555"}`} className="text-slate-400 hover:text-emerald-400 transition-colors">
                        {companyInfo?.phoneNumber ?? "+90 555 555 5555"}
                      </a>
                      {companyInfo?.phoneNumber2 && (
                        <a href={`tel:${companyInfo?.phoneNumber2?.replace(/\s/g, "")}`} className="text-slate-500 hover:text-emerald-400 transition-colors text-xs mt-1">
                          {companyInfo?.phoneNumber2}
                        </a>
                      )}
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex flex-col">
                      <a href={`mailto:${companyInfo?.email ?? "info@acargroup.com"}`} className="text-slate-400 hover:text-emerald-400 transition-colors">
                        {companyInfo?.email ?? "info@acargroup.com"}
                      </a>
                      {companyInfo?.email2 && (
                        <a href={`mailto:${companyInfo?.email2}`} className="text-slate-500 hover:text-emerald-400 transition-colors text-xs mt-1">
                          {companyInfo?.email2}
                        </a>
                      )}
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-slate-400">{companyInfo?.address ?? "İstanbul, Türkiye"}</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <p className="text-xs uppercase text-slate-500 tracking-wide mb-2">Sosyal Medya</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4">
                      <a
                        href="#"
                        className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a
                        href="#"
                        className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all"
                        aria-label="YouTube"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                      <a
                        href="#"
                        className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-12 pt-8 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-500">
                © {currentYear} AcarGroup. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
