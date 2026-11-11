import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Menu,
  X,
  Globe,
  PhoneCall,
  Search,
  MessageSquare,
  FileCheck2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTrackingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenTrackingModal }) => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { profile, settings } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'constituency', label: t('constituency') },
    { id: 'map', label: t('map') },
    { id: 'projects', label: t('projects') },
    { id: 'complaints', label: t('complaints') },
    { id: 'notices', label: t('notices') },
    { id: 'news', label: t('news') },
    { id: 'reports', label: t('reports') },
    { id: 'contact', label: t('contact') }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs w-full max-w-full">
        {/* Top Utility Bar (Optimized for 320px–1920px) */}
        <div className="bg-[#064D2B] text-white text-xs py-1.5 px-3 sm:px-8 w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Left: Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 font-semibold bg-[#087A43] px-2 py-0.5 rounded text-[11px] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                PP-203
              </span>
              <span className="hidden sm:inline text-emerald-100 truncate text-[11px] md:text-xs">
                {language === 'ur' ? profile.fullNameUrdu : profile.fullName} — {language === 'ur' ? 'عوامی سیکرٹریٹ' : 'Public Secretariat'}
              </span>
            </div>

            {/* Right: Helpline & Language Switcher */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <a
                href={`tel:${settings.helplinePhone}`}
                className="min-h-[44px] flex items-center gap-1 text-emerald-100 hover:text-white transition py-1 text-[11px] sm:text-xs px-2"
                title="Call Secretariat Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline font-mono">{settings.helplinePhone}</span>
                <span className="md:hidden font-semibold">{language === 'ur' ? 'ہیلپ لائن' : 'Call'}</span>
              </a>

              {/* Language Switcher with minimum touch target (44px) */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-[#087A43] hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition font-medium border border-emerald-600/50 text-[11px] sm:text-xs min-h-[44px] active:scale-95"
                title="Switch Language / زبان تبدیل کریں"
                aria-label="Toggle language between English and Urdu"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{language === 'en' ? 'اردو' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 w-full">
          {/* Logo and Titles */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0 shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 border-2 border-[#087A43] p-0.5 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              <img
                src="/images/chaudhry_asad_hanif_jutt.jpg"
                alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                className="w-full h-full object-cover rounded-full"
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition truncate max-w-[150px] xs:max-w-[210px] sm:max-w-none">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded border border-amber-300 shrink-0 hidden xs:inline-block">
                  PP-203
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
                {language === 'ur' ? 'چیچہ وطنی، ضلع ساہیوال، پنجاب' : 'Chichawatni, District Sahiwal, Punjab'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation (xl and above for full 10-item width stability) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-xs 2xl:text-sm ${
                  activeTab === item.id
                    ? 'text-[#087A43] bg-emerald-50 font-bold'
                    : 'hover:text-[#087A43] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenTrackingModal}
              className="min-h-[44px] flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition shadow-xs whitespace-nowrap active:scale-95"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('trackComplaint')}</span>
            </button>

            <button
              onClick={() => handleNavClick('complaints')}
              className="min-h-[44px] flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#087A43] hover:bg-[#064D2B] text-white transition shadow-sm whitespace-nowrap active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t('submitGrievanceBtn')}</span>
            </button>
          </div>

          {/* Mobile & Tablet Right Controls: Tracking Icon & Hamburger (Min 44x44px touch targets) */}
          <div className="flex items-center gap-1 xl:hidden shrink-0">
            <button
              onClick={onOpenTrackingModal}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100 active:bg-slate-200 transition"
              title="Track Grievance"
              aria-label="Track complaint status"
            >
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-800 hover:text-emerald-700 hover:bg-slate-100 active:bg-slate-200 transition"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col bg-white w-full max-w-full">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-600 overflow-hidden shrink-0">
                <img
                  src="/images/chaudhry_asad_hanif_jutt.jpg"
                  alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">PP-203 Chichawatni</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:scale-95 transition"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Primary Actions in Drawer */}
          <div className="p-4 grid grid-cols-2 gap-2 bg-emerald-50/60 border-b border-emerald-100">
            <button
              onClick={() => {
                onOpenTrackingModal();
                setMobileMenuOpen(false);
              }}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-xs active:scale-98"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t('trackComplaint')}</span>
            </button>

            <button
              onClick={() => handleNavClick('complaints')}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#087A43] text-white font-bold text-xs shadow-xs active:scale-98"
            >
              <MessageSquare className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t('submitGrievanceBtn')}</span>
            </button>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-emerald-100 text-[#087A43] font-bold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-50 rtl:rotate-180" />
              </button>
            ))}
          </nav>

          {/* Drawer Footer with Helpline & Language */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 pb-safe">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Secretariat Helpline:</span>
              <a
                href={`tel:${settings.helplinePhone}`}
                className="font-mono font-bold text-emerald-700 text-sm"
              >
                {settings.helplinePhone}
              </a>
            </div>

            <button
              onClick={() => {
                toggleLanguage();
              }}
              className="w-full min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Switch to {language === 'en' ? 'اردو (Urdu)' : 'English'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
