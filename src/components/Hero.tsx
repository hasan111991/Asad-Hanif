import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { getAssetUrl, PORTRAIT_IMAGE_PATH } from '../utils/assetUrl';
import {
  ShieldCheck,
  Building2,
  Landmark,
  HardHat,
  UserCheck,
  PhoneCall,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface HeroProps {
  onNavigate: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { profile, unionCouncils, projects, assemblyActivities, complaints } = useData();

  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const resolutionRate =
    complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 85;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#123B28] via-[#0e4d31] to-[#087A43] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20 w-full">
      {/* Subtle architectural accent rules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Editorial Identity Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left rtl:lg:text-right">
            <div className="inline-flex items-center gap-2 text-[#C9A227] text-xs font-bold tracking-widest uppercase border-b border-[#C9A227]/40 pb-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {language === 'ur'
                  ? 'پاکستان مسلم لیگ (ن) · حلقہ پی پی 203 چیچہ وطنی'
                  : 'Pakistan Muslim League (N) · Constituency PP-203 Chichawatni'}
              </span>
            </div>

            <h1 className="font-editorial text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-snug text-white">
              {language === 'ur' ? (
                <span className="font-urdu-title block leading-loose">
                  {profile.fullNameUrdu} — عوامی خدمت، شفاف ترقی اور دیہی خوشحالی
                </span>
              ) : (
                <>
                  {profile.fullName}{' '}
                  <span className="block text-[#C9A227] mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold">
                    Accountable Public Service for PP-203 Chichawatni
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-emerald-50/90 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {language === 'ur'
                ? 'ممبر صوبائی اسمبلی پنجاب (ایم پی اے — حتمی سرکاری تصدیق سے مشروط)، تحصیل چیچہ وطنی، ضلع ساہیوال۔ ترقیاتی منصوبوں کی نگرانی، پنجاب اسمبلی کی کارروائی، اور براہِ راست عوامی شکایات کا پورٹل۔'
                : 'Member of Provincial Assembly, Punjab (MPA — subject to final official verification), representing Chichawatni, District Sahiwal. Explore verified development schemes, Punjab Assembly interventions, and our transparent citizen service portal.'}
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => onNavigate('about')}
                className="min-h-[48px] bg-[#C9A227] hover:bg-[#b5901d] text-[#123B28] font-bold px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>{t('aboutMeBtn')}</span>
              </button>

              <button
                onClick={() => onNavigate('complaints')}
                className="min-h-[48px] bg-white text-[#123B28] hover:bg-[#F7F9F7] font-bold px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#087A43] shrink-0" />
                <span>{t('publicServiceBtn')}</span>
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="min-h-[48px] bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/25 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>{t('contactOfficeBtn')}</span>
              </button>
            </div>
          </div>

          {/* Right Gold-and-Green Editorial Portrait Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C9A227]">
              <div className="relative w-full aspect-[4/5] max-h-[420px] overflow-hidden bg-[#123B28]">
                <img
                  src={getAssetUrl(profile.leadPortraitUrl || PORTRAIT_IMAGE_PATH)}
                  alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAssetUrl(PORTRAIT_IMAGE_PATH);
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123B28] via-[#123B28]/70 to-transparent pt-20 pb-4 px-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227] block">
                    {language === 'ur' ? 'پاکستان مسلم لیگ (ن)' : 'PML-N · PP-203 Chichawatni'}
                  </span>
                  <h2 className="font-editorial text-lg sm:text-xl font-bold text-white mt-0.5 truncate">
                    {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                  </h2>
                  <p className="text-xs text-emerald-100 truncate">
                    {language === 'ur' ? 'ممبر صوبائی اسمبلی پنجاب (ایم پی اے)' : 'Member of Provincial Assembly, Punjab'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#F7F9F7] text-[#1B241E] space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">
                    {language === 'ur' ? 'حلقہ انتخاب:' : 'Constituency:'}
                  </span>
                  <span className="font-bold text-[#123B28]">PP-203 Chichawatni</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">
                    {language === 'ur' ? 'ضلع:' : 'District:'}
                  </span>
                  <span className="font-semibold text-slate-800">Sahiwal, Punjab</span>
                </div>
                <button
                  onClick={() => onNavigate('about')}
                  className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-[#087A43] hover:text-[#123B28] pt-1 cursor-pointer"
                >
                  <span>{language === 'ur' ? 'مکمل پروفائل و تعارف دیکھیں' : 'View Representative Biography'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Counters Row */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-100 mb-1.5">
              <span className="text-xs font-medium">{t('statUCs')}</span>
              <Building2 className="w-4 h-4 text-[#C9A227] shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {unionCouncils.length}
            </div>
            <div className="text-[11px] text-emerald-100/80 mt-0.5">
              {language === 'ur' ? '3 شہری · 8 دیہی کونسلیں' : '3 Urban · 8 Rural Councils'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-100 mb-1.5">
              <span className="text-xs font-medium">{t('statProjects')}</span>
              <HardHat className="w-4 h-4 text-[#C9A227] shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {projects.length}
            </div>
            <div className="text-[11px] text-emerald-100/80 mt-0.5">
              {language === 'ur' ? '7 شعبہ جات میں ترقیاتی منصوبے' : 'Across 7 Core Sectors'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-100 mb-1.5">
              <span className="text-xs font-medium">{t('statAssembly')}</span>
              <Landmark className="w-4 h-4 text-[#C9A227] shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {assemblyActivities.length}
            </div>
            <div className="text-[11px] text-emerald-100/80 mt-0.5">
              {language === 'ur' ? 'سوالات، قراردادیں اور کمیٹی اجلاس' : 'Questions, Resolutions & Committees'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between text-emerald-100 mb-1.5">
              <span className="text-xs font-medium">{t('statResolutionRate')}</span>
              <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {resolutionRate}%
            </div>
            <div className="text-[11px] text-emerald-100/80 mt-0.5">
              {language === 'ur' ? 'عوامی شکایات ٹریکنگ سسٹم' : 'Citizen Grievance Portal'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
