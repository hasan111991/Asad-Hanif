import React, { useState } from 'react';
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
  ChevronDown
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
  const [facilitiesDropdown, setFacilitiesDropdown] = useState(false);

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
    setFacilitiesDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-[#064D2B] text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-medium bg-[#087A43] px-2 py-0.5 rounded text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              PP-203 Chichawatni
            </span>
            <span className="hidden md:inline text-emerald-100">
              {language === 'ur' ? profile.fullNameUrdu : profile.fullName} — {language === 'ur' ? 'عوامی سیکرٹریٹ' : 'Public Secretariat'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings.helplinePhone}`}
              className="flex items-center gap-1.5 text-emerald-100 hover:text-white transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-mono">{settings.helplinePhone}</span>
              <span className="sm:hidden">{t('callHelpline')}</span>
            </a>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-[#087A43] hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded transition font-medium border border-emerald-600/50"
              title="Switch Language / زبان تبدیل کریں"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? 'اردو (Urdu)' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo and Titles */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-[#087A43] p-0.5 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src="/images/chaudhry_asad_hanif_jutt.jpg"
              alt="Chaudhry Asad Hanif Jutt"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/portrait_lead_1794225832643.jpg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded border border-amber-300">
                PP-203
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {language === 'ur' ? 'چیچہ وطنی، ضلع ساہیوال، پنجاب' : 'Chichawatni, District Sahiwal, Punjab'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-700">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'text-[#087A43] bg-emerald-50 font-semibold'
                  : 'hover:text-[#087A43] hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={onOpenTrackingModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition shadow-xs"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>{t('trackComplaint')}</span>
          </button>

          <button
            onClick={() => handleNavClick('complaints')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#087A43] hover:bg-[#064D2B] text-white transition shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>{t('submitGrievanceBtn')}</span>
          </button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenTrackingModal}
            className="p-2 text-slate-600 hover:text-emerald-700"
            title="Track Complaint"
          >
            <FileCheck2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-emerald-700 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg max-h-[85vh] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left rtl:text-right px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-[#087A43] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenTrackingModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>{t('trackComplaint')}</span>
            </button>
            <button
              onClick={() => handleNavClick('complaints')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#087A43] text-white font-semibold text-sm hover:bg-[#064D2B]"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>{t('submitGrievanceBtn')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
