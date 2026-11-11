import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { getAssetUrl } from '../utils/assetUrl';
import {
  ShieldCheck,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Building2,
  Users
} from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
  onOpenTracking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenTracking }) => {
  const { language, t } = useLanguage();
  const { profile, unionCouncils, projects, complaints, settings } = useData();

  const totalProjectsBudget = 'PKR 481.5M';
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionPercentage = complaints.length > 0
    ? Math.round((resolvedCount / complaints.length) * 100)
    : 85;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-[#064D2B] to-[#087A43] text-white pt-4 sm:pt-6 pb-12 sm:pb-16 lg:pb-24 w-full">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 relative z-10 w-full">
        {/* Urgent Announcement Banner if Active */}
        {settings.announcementActive && (
          <div className="mb-4 sm:mb-6 bg-amber-400/15 border border-amber-300/30 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-amber-200 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="flex h-2 w-2 relative mt-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <div className="min-w-0">
                <span className="font-bold text-white mr-1.5">
                  {language === 'ur' ? 'عوامی اطلاع:' : 'Notice:'}
                </span>
                <span className="text-amber-100 break-words leading-relaxed">
                  {language === 'ur' ? settings.announcementUrdu : settings.announcement}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('notices')}
              className="min-h-[44px] inline-flex items-center gap-1 text-amber-300 hover:text-white font-semibold underline underline-offset-2 shrink-0 text-xs px-2"
            >
              <span>{language === 'ur' ? 'تفصیلات دیکھیں' : 'View Schedule'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" />
            </button>
          </div>
        )}

        {/* Hero Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left rtl:lg:text-right">
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-800/60 border border-emerald-500/40 rounded-full px-3 py-1 text-[11px] sm:text-xs text-emerald-200 max-w-full truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{t('verifiedOfficialPortal')}</span>
              <span className="text-white/40 hidden xs:inline">•</span>
              <span className="text-amber-300 font-mono hidden xs:inline">PP-203 Chichawatni</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-snug sm:leading-tight text-white">
              {language === 'ur' ? (
                <span className="font-urdu-title leading-relaxed block">
                  حلقہ پی پی 203 چیچہ وطنی کی تعمیر و ترقی، عوامی خدمت اور شفاف طرزِ حکمرانی
                </span>
              ) : (
                <>
                  Empowering <span className="text-amber-400">PP-203 Chichawatni</span> Through Accountable Public Service
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-emerald-100 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {language === 'ur' ? (
                <span>
                  چوہدری اسد حنیف جٹ کی سربراہی میں حلقہ پی پی 203 کے تمام دیہی و شہری علاقوں کے مسائل کے ازالے، ترقیاتی کاموں کی نگرانی، جی آئی ایس میپنگ اور فوری شکایت حل کے لیے جدید ڈیجیٹل پورٹل۔
                </span>
              ) : (
                <span>
                  Official digital constituency management platform under <strong>Chaudhry Asad Hanif Jutt</strong>. Track ongoing rural road projects, health upgrades, school facilities, and lodge citizen grievances directly to the Secretariat.
                </span>
              )}
            </p>

            {/* Action CTA Buttons (Stacked on mobile, row on tablet/desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('complaints')}
                className="min-h-[48px] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm active:scale-98"
              >
                <FileText className="w-4 h-4 text-emerald-950 shrink-0" />
                <span>{t('submitGrievanceBtn')}</span>
              </button>

              <button
                onClick={onOpenTracking}
                className="min-h-[48px] bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition backdrop-blur-xs flex items-center justify-center gap-2 text-sm active:scale-98"
              >
                <Search className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{t('trackGrievanceBtn')}</span>
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="min-h-[48px] bg-[#064D2B] hover:bg-emerald-800 active:bg-emerald-900 text-emerald-100 font-semibold px-4 py-3 rounded-xl border border-emerald-600/40 transition flex items-center justify-center gap-2 text-sm active:scale-98"
              >
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{t('exploreGisMap')}</span>
              </button>
            </div>

            {/* Fact Strip */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>11 Union Councils</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>80+ Chaks & Mouzas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Public Khuli Kachehri</span>
              </div>
            </div>
          </div>

          {/* Right Column: Leader Card with Verified Photo */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white/95 ring-1 ring-emerald-500/30">
                {/* Photo Container with Proper Aspect Ratio & No Head Cropping */}
                <div className="relative w-full aspect-square sm:aspect-[4/5] max-h-[380px] sm:max-h-[440px] overflow-hidden bg-slate-900">
                  <img
                    src={getAssetUrl('images/chaudhry_asad_hanif_jutt.jpg')}
                    alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                    className="w-full h-full object-cover object-[center_15%]"
                    loading="eager"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-16 pb-3 px-3.5 sm:px-4" />
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#087A43] px-2.5 py-0.5 rounded text-amber-300 inline-block shadow-xs">
                      {language === 'ur' ? 'عوامی رہنما' : 'Public Representative'}
                    </span>
                    <h3 className="text-base sm:text-xl font-bold mt-1 text-white truncate">
                      {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                    </h3>
                    <p className="text-[11px] text-emerald-200 truncate mt-0.5 font-medium">
                      {language === 'ur' ? 'حلقہ پی پی 203 چیچہ وطنی' : 'PP-203 Chichawatni, District Sahiwal'}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-4 bg-slate-50 text-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'ur' ? 'حلقہ انتخاب:' : 'Constituency:'}
                    </span>
                    <span className="font-bold text-emerald-800">PP-203 Chichawatni</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'ur' ? 'ضلع:' : 'District:'}
                    </span>
                    <span className="font-semibold text-slate-700">Sahiwal, Punjab</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'ur' ? 'سیاسی وابستگی:' : 'Affiliation:'}
                    </span>
                    <span className="font-semibold text-slate-700">PML-N</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('about')}
                      className="min-h-[44px] text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 active:scale-95 transition px-2"
                    >
                      <span>{language === 'ur' ? 'مکمل سیاسی تعارف پڑھیں' : 'View Full Profile & Bio'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active Secretariat" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Counters (1 column on 320px, 2 columns on 375px–767px, 4 columns on desktop) */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-1.5">
              <span className="text-xs font-medium">{t('statUCs')}</span>
              <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {unionCouncils.length}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              Urban: 3 | Rural: 8 Councils
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-1.5">
              <span className="text-xs font-medium">{t('statProjects')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {projects.length}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              {totalProjectsBudget} Allocated
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-1.5">
              <span className="text-xs font-medium">{t('statPopulation')}</span>
              <Users className="w-4 h-4 text-amber-300 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              345,000+
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              Chichawatni Tehsil Belt
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-1.5">
              <span className="text-xs font-medium">{t('statResolutionRate')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {resolutionPercentage}%
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              Secretariat Redressal Index
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
