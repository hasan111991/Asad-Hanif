import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { getAssetUrl, PORTRAIT_IMAGE_PATH } from '../utils/assetUrl';
import {
  Menu,
  X,
  Globe,
  PhoneCall,
  ChevronRight,
  ChevronDown,
  Home,
  User,
  Compass,
  HardHat,
  Map,
  Landmark,
  MessageSquare,
  Bell,
  Newspaper,
  Image as ImageIcon,
  Mail,
  Megaphone
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { language, setLanguage, t } = useLanguage();
  const { profile, settings } = useData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [tickerDismissed, setTickerDismissed] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // All 11 Public Navigation Items required by specification (NO admin links!)
  const primaryNavItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'about', label: t('about'), icon: User },
    { id: 'constituency', label: t('constituency'), icon: Compass },
    { id: 'projects', label: t('projects'), icon: HardHat },
    { id: 'map', label: t('map'), icon: Map },
    { id: 'assembly', label: t('assembly'), icon: Landmark },
    { id: 'complaints', label: t('complaints'), icon: MessageSquare }
  ];

  const secondaryNavItems = [
    { id: 'notices', label: t('notices'), icon: Bell },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'gallery', label: t('gallery'), icon: ImageIcon },
    { id: 'contact', label: t('contact'), icon: Mail }
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreItemActive = secondaryNavItems.some((item) => item.id === activeTab);

  const announcementText =
    language === 'ur' ? settings.announcementUrdu : settings.announcement;

  return (
    <>
      {/* 1. Top Announcement Ticker (Dismissible & Live Marquee) */}
      {settings.announcementActive && !tickerDismissed && announcementText && (
        <div className="bg-[#123B28] text-white border-b border-[#C9A227]/30 w-full">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 shrink-0 text-[#C9A227] font-bold uppercase tracking-wider text-[10px]">
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">
                {language === 'ur' ? 'اہم اعلان' : 'Official Update'}
              </span>
            </div>

            <div className="flex-1 overflow-hidden relative mx-2">
              <div className="animate-ticker text-emerald-50 font-medium text-[11px] sm:text-xs">
                <span className="pr-16">{announcementText}</span>
                <span className="pr-16" aria-hidden="true">
                  {announcementText}
                </span>
              </div>
            </div>

            <button
              onClick={() => setTickerDismissed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
              aria-label="Dismiss announcement"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Sticky Editorial Header */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#123B28]/12 shadow-xs w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-3 w-full">
          {/* Brand Crest & Representative Identity */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left rtl:text-right cursor-pointer group min-w-0 flex-1 xl:flex-initial"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#C9A227] overflow-hidden bg-[#F7F9F7] shadow-xs shrink-0">
              <img
                src={getAssetUrl(profile.photoUrl || PORTRAIT_IMAGE_PATH)}
                alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                className="w-full h-full object-cover object-top"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl(PORTRAIT_IMAGE_PATH);
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xs sm:text-sm md:text-[15px] font-bold text-[#123B28] group-hover:text-[#087A43] transition truncate block">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </span>
                <span className="hidden xs:inline-block text-[10px] font-bold bg-[#123B28] text-[#C9A227] px-1.5 py-0.5 rounded shrink-0">
                  PP-203
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate leading-tight">
                {language === 'ur'
                  ? 'ممبر صوبائی اسمبلی پنجاب · چیچہ وطنی'
                  : 'MPA Punjab · PP-203 Chichawatni · PML-N'}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Bar */}
          <nav
            className="hidden xl:flex items-center gap-0.5 text-xs font-semibold text-slate-700"
            aria-label="Primary Public Navigation"
          >
            {allNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[40px] cursor-pointer ${
                    isActive
                      ? 'text-[#087A43] bg-[#F7F9F7] border-b-2 border-[#C9A227] font-bold'
                      : 'hover:text-[#087A43] hover:bg-[#F7F9F7]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Tablet Condensed Navigation (lg to xl) */}
          <nav
            className="hidden lg:flex xl:hidden items-center gap-1 text-xs font-semibold text-slate-700"
            aria-label="Tablet Navigation"
          >
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[40px] cursor-pointer ${
                    isActive
                      ? 'text-[#087A43] bg-[#F7F9F7] border-b-2 border-[#C9A227] font-bold'
                      : 'hover:text-[#087A43] hover:bg-[#F7F9F7]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[40px] flex items-center gap-1 cursor-pointer ${
                  isMoreItemActive || moreDropdownOpen
                    ? 'text-[#087A43] bg-[#F7F9F7] font-bold'
                    : 'hover:text-[#087A43] hover:bg-[#F7F9F7]'
                }`}
              >
                <span>{language === 'ur' ? 'مزید' : 'More'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    moreDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  {secondaryNavItems.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full text-left rtl:text-right px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-[#087A43]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4 text-[#087A43] shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Controls: Language Switcher & Right-Side Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLanguage}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
              title="Switch Language / زبان تبدیل کریں"
              aria-label="Toggle language between English and Urdu"
            >
              <Globe className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-[#F7F9F7] text-[#123B28] hover:bg-emerald-50 transition cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. Right-Side Mobile Navigation Drawer (Zero Admin Links) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/60 backdrop-blur-xs">
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="w-[86%] max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#123B28] text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full border-2 border-[#C9A227] overflow-hidden shrink-0">
                  <img
                    src={getAssetUrl(profile.photoUrl || PORTRAIT_IMAGE_PATH)}
                    alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-editorial font-bold text-sm block truncate">
                    {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                  </span>
                  <span className="text-[11px] text-[#C9A227] font-medium block truncate">
                    PP-203 Chichawatni · PML-N
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable 11 Public Links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {allNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full min-h-[46px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#087A43] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-[#F7F9F7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#C9A227]' : 'text-[#087A43]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60 rtl:rotate-180 shrink-0" />
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-[#F7F9F7] space-y-3 pb-safe">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">
                  {language === 'ur' ? 'سیکرٹریٹ ہیلپ لائن:' : 'Secretariat Helpline:'}
                </span>
                <a
                  href={`tel:${settings.helplinePhone}`}
                  className="font-mono font-bold text-[#087A43] flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {settings.helplinePhone}
                </a>
              </div>

              <button
                onClick={toggleLanguage}
                className="w-full min-h-[44px] bg-[#123B28] hover:bg-[#087A43] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#C9A227]" />
                <span>{language === 'en' ? 'اردو زبان منتخب کریں' : 'Switch to English'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
