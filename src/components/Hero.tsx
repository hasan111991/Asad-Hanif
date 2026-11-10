import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  ShieldCheck,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Search,
  Building2,
  Users
} from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
  onOpenTracking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenTracking }) => {
  const { language, isRTL, t } = useLanguage();
  const { profile, unionCouncils, projects, complaints, settings } = useData();

  const totalProjectsBudget = 'PKR 481.5M';
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionPercentage = complaints.length > 0
    ? Math.round((resolvedCount / complaints.length) * 100)
    : 85;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-[#064D2B] to-[#087A43] text-white pt-6 pb-16 lg:pb-24">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Urgent Announcement Banner if Active */}
        {settings.announcementActive && (
          <div className="mb-6 bg-amber-400/15 border border-amber-300/30 backdrop-blur-md rounded-xl p-3 flex items-center justify-between gap-3 text-amber-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="font-semibold text-white">
                {language === 'ur' ? 'عوامی اطلاع:' : 'Notice:'}
              </span>
              <span>{language === 'ur' ? settings.announcementUrdu : settings.announcement}</span>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="hidden sm:inline-flex items-center gap-1 text-amber-300 hover:text-white font-semibold underline underline-offset-2 shrink-0"
            >
              {language === 'ur' ? 'مزید پڑھیں' : 'View Schedule'}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
            {/* Badges */}
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-500/40 rounded-full px-3.5 py-1 text-xs text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{t('verifiedOfficialPortal')}</span>
              <span className="text-white/40">•</span>
              <span className="text-amber-300 font-mono">PP-203 Chichawatni</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {language === 'ur' ? (
                <span className="font-urdu-title leading-relaxed">
                  حلقہ پی پی 203 چیچہ وطنی کی تعمیر و ترقی، عوامی خدمت اور شفاف طرزِ حکمرانی
                </span>
              ) : (
                <>
                  Empowering <span className="text-amber-400">PP-203 Chichawatni</span> Through Accountable Public Service
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
              {language === 'ur' ? (
                <span>
                  چوہدری اسد حنیف جٹ کی سربراہی میں حلقہ پی پی 203 کے تمام دیہی و شہری علاقوں کے مسائل کے ازالے، ترقیاتی منصوبوں کی شفاف نگرانی، جی آئی ایس میپنگ اور فوری شکایت حل کے لیے جدید ڈیجیٹل پورٹل۔
                </span>
              ) : (
                <span>
                  Official digital management platform under <strong>Chaudhry Asad Hanif Jutt</strong>. Track ongoing rural road projects, health upgrades, school facilities, and lodge citizen grievances directly to the Secretariat.
                </span>
              )}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('complaints')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-black/20 flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4 text-emerald-950" />
                <span>{t('submitGrievanceBtn')}</span>
              </button>

              <button
                onClick={onOpenTracking}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition backdrop-blur-xs flex items-center gap-2 text-sm"
              >
                <Search className="w-4 h-4 text-amber-300" />
                <span>{t('trackGrievanceBtn')}</span>
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="bg-[#064D2B] hover:bg-emerald-800 text-emerald-100 font-semibold px-4 py-3 rounded-xl border border-emerald-600/40 transition flex items-center gap-2 text-sm"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{t('exploreGisMap')}</span>
              </button>
            </div>

            {/* Constituency Fact Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>11 Union Councils (Urban & Rural)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>80+ Chaks & Mouzas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Bi-Weekly Khuli Kachehri</span>
              </div>
            </div>
          </div>

          {/* Right Column: Leader Card with Verified Photo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-3xl blur-md opacity-40 group-hover:opacity-100 transition duration-1000" />

              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-white/90">
                {/* Photo Container */}
                <div className="h-80 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={profile.leadPortraitUrl || '/images/portrait_lead_1794225832643.jpg'}
                    alt={profile.fullName}
                    className="w-full h-full object-cover object-top hover:scale-102 transition duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/chaudhry_asad_hanif_jutt.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#087A43] px-2 py-0.5 rounded text-amber-300">
                      {language === 'ur' ? 'عوامی رہنما' : 'Public Representative'}
                    </span>
                    <h3 className="text-xl font-bold mt-1 text-white">
                      {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 bg-slate-50 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'ur' ? 'حلقہ انتخاب:' : 'Constituency:'}
                    </span>
                    <span className="font-bold text-emerald-800">PP-203 Chichawatni</span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'ur' ? 'ضلع:' : 'District:'}
                    </span>
                    <span className="font-semibold text-slate-700">Sahiwal, Punjab</span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'ur' ? 'سیاسی وابستگی:' : 'Affiliation:'}
                    </span>
                    <span className="font-semibold text-slate-700">PML-N</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('about')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>{language === 'ur' ? 'مکمل سیاسی تعارف پڑھیں' : 'View Full Profile & Biography'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Active Secretariat" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Counters */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-2">
              <span className="text-xs font-medium">{t('statUCs')}</span>
              <Building2 className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {unionCouncils.length}
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              Urban: 3 | Rural: 8 Councils
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-2">
              <span className="text-xs font-medium">{t('statProjects')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {projects.length}
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              {totalProjectsBudget} Allocated
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-2">
              <span className="text-xs font-medium">{t('statPopulation')}</span>
              <Users className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              345,000+
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              Chichawatni Tehsil Belt
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-200 mb-2">
              <span className="text-xs font-medium">{t('statResolutionRate')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {resolutionPercentage}%
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              Secretariat Redressal Index
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
