import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { getAssetUrl } from '../utils/assetUrl';
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
  ChevronDown,
  ShieldCheck,
  Building2,
  FileText,
  Home,
  User,
  Compass,
  Map,
  HardHat,
  Bell,
  Newspaper,
  BarChart3,
  Mail
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
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Primary navigation items (always visible on desktop)
  const primaryNavItems = [
    { id: 'home', labelEn: 'Home', labelUr: 'صفحہ اول' },
    { id: 'about', labelEn: 'About', labelUr: 'قیادت' },
    { id: 'constituency', labelEn: 'PP-203', labelUr: 'حلقہ' },
    { id: 'map', labelEn: 'GIS Map', labelUr: 'نقشہ' },
    { id: 'projects', labelEn: 'Projects', labelUr: 'منصوبے' },
    { id: 'complaints', labelEn: 'Grievances', labelUr: 'شکایات' }
  ];

  // Secondary items in the "More" dropdown
  const secondaryNavItems = [
    { id: 'notices', labelEn: 'Public Notices', labelUr: 'سرکاری اعلانات', icon: Bell },
    { id: 'news', labelEn: 'News & Media', labelUr: 'خبریں و پریس', icon: Newspaper },
    { id: 'reports', labelEn: 'Reports & Data', labelUr: 'رپورٹس و ڈیٹا', icon: BarChart3 },
    { id: 'contact', labelEn: 'Contact Office', labelUr: 'رابطہ و سیکرٹریٹ', icon: Mail }
  ];

  // All navigation items for mobile drawer
  const allNavItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'about', label: t('about'), icon: User },
    { id: 'constituency', label: t('constituency'), icon: Compass },
    { id: 'map', label: t('map'), icon: Map },
    { id: 'projects', label: t('projects'), icon: HardHat },
    { id: 'complaints', label: t('complaints'), icon: MessageSquare },
    { id: 'notices', label: t('notices'), icon: Bell },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'contact', label: t('contact'), icon: Mail }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreItemActive = secondaryNavItems.some(item => item.id === activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-emerald-950/10 shadow-xs w-full max-w-full">
        {/* Top Utility Bar (Optimized for 320px–1920px) */}
        <div className="bg-[#064D2B] text-white text-xs py-1.5 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Left / Start: Official PP-203 Badge & Title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 font-bold bg-[#087A43] text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] shrink-0 border border-emerald-500/40 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                PP-203
              </span>
              <span className="hidden sm:inline text-emerald-100 truncate text-[11px] md:text-xs font-medium">
                {language === 'ur' ? profile.fullNameUrdu : profile.fullName} — {language === 'ur' ? 'عوامی سیکرٹریٹ و کانسٹی ٹیونسی پورٹل' : 'Official Constituency Portal'}
              </span>
            </div>

            {/* Right / End: Helpline & Language Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a
                href={`tel:${settings.helplinePhone}`}
                className="min-h-[44px] flex items-center gap-1.5 text-emerald-100 hover:text-white transition py-1 text-[11px] sm:text-xs px-2.5 rounded-lg hover:bg-emerald-800/40"
                title="Call Secretariat Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline font-mono font-semibold tracking-wide">{settings.helplinePhone}</span>
                <span className="md:hidden font-semibold">{language === 'ur' ? 'ہیلپ لائن' : 'Call'}</span>
              </a>

              {/* Language Switcher (Min 44px touch target) */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-[#087A43] hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition font-medium border border-emerald-500/40 text-[11px] sm:text-xs min-h-[44px] shadow-xs active:scale-95 cursor-pointer"
                title="Switch Language / زبان تبدیل کریں"
                aria-label="Toggle language between English and Urdu"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-semibold">{language === 'en' ? 'اردو' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Logo & Leadership Brand (Responsive, never overflows) */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-1 lg:flex-initial"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 border-2 border-[#087A43] p-0.5 flex items-center justify-center overflow-hidden shadow-xs shrink-0 ring-2 ring-emerald-600/20">
              <img
                src={getAssetUrl('images/chaudhry_asad_hanif_jutt.jpg')}
                alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                className="w-full h-full object-cover rounded-full"
                loading="eager"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition truncate leading-snug">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300 shrink-0 hidden xs:inline-block">
                  PP-203
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate leading-tight">
                {language === 'ur' ? 'چیچہ وطنی، ضلع ساہیوال، پنجاب' : 'Chichawatni, District Sahiwal, Punjab'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Compact & Streamlined) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-medium text-slate-700 shrink-0">
            {primaryNavItems.map((item) => {
              const label = language === 'ur' ? item.labelUr : item.labelEn;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs xl:text-sm cursor-pointer ${
                    isActive
                      ? 'text-[#087A43] bg-emerald-50 font-bold shadow-2xs'
                      : 'hover:text-[#087A43] hover:bg-slate-50 font-medium'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {/* "More / مزید" Dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs xl:text-sm flex items-center gap-1 cursor-pointer ${
                  isMoreItemActive || moreDropdownOpen
                    ? 'text-[#087A43] bg-emerald-50 font-bold'
                    : 'hover:text-[#087A43] hover:bg-slate-50 font-medium'
                }`}
                aria-expanded={moreDropdownOpen}
              >
                <span>{language === 'ur' ? 'مزید' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  {secondaryNavItems.map((item) => {
                    const IconComponent = item.icon;
                    const label = language === 'ur' ? item.labelUr : item.labelEn;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full text-left rtl:text-right px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-[#087A43]'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="flex-1">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Action Buttons (Protected width, never clips) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenTrackingModal}
              className="min-h-[44px] flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition shadow-xs whitespace-nowrap active:scale-95 cursor-pointer"
              title="Track submitted grievance status"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('trackComplaint')}</span>
            </button>

            <button
              onClick={() => handleNavClick('complaints')}
              className="min-h-[44px] flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#087A43] hover:bg-[#064D2B] text-white transition shadow-sm whitespace-nowrap active:scale-95 cursor-pointer"
              title="Submit a public grievance"
            >
              <MessageSquare className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t('submitGrievanceBtn')}</span>
            </button>
          </div>

          {/* Mobile & Tablet Right Controls (Aligned and guaranteed safe from viewport edge) */}
          <div className="flex items-center gap-1 lg:hidden shrink-0">
            <button
              onClick={onOpenTrackingModal}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
              title="Track Grievance"
              aria-label="Track complaint status"
            >
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-800 hover:text-emerald-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white w-full max-w-full">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-600 overflow-hidden shrink-0">
                <img
                  src={getAssetUrl('images/chaudhry_asad_hanif_jutt.jpg')}
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
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
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
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-xs active:scale-98 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t('trackComplaint')}</span>
            </button>

            <button
              onClick={() => handleNavClick('complaints')}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#087A43] text-white font-bold text-xs shadow-xs active:scale-98 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t('submitGrievanceBtn')}</span>
            </button>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {allNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-100 text-[#087A43] font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#087A43]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 rtl:rotate-180" />
                </button>
              );
            })}
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
              className="w-full min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
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
