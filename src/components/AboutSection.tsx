import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { getAssetUrl, PORTRAIT_IMAGE_PATH, ASSEMBLY_IMAGE_PATH } from '../utils/assetUrl';
import {
  BookOpen,
  Building,
  Clock,
  ShieldCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';

export const AboutSection: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { profile } = useData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 w-full">
      {/* Top Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden shadow-xl border-2 border-[#C9A227] bg-[#123B28]">
              <img
                src={getAssetUrl(profile.photoUrl || PORTRAIT_IMAGE_PATH)}
                alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                className="w-full aspect-[4/5] object-cover object-top"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl(PORTRAIT_IMAGE_PATH);
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123B28] via-[#123B28]/70 to-transparent pt-16 pb-4 px-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227] block">
                  {language === 'ur' ? 'عوامی نمائندہ · پی پی 203' : 'PML-N · PP-203 Leadership'}
                </span>
                <h3 className="font-editorial text-lg sm:text-xl font-bold mt-0.5 truncate">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5 truncate">
                  {language === 'ur' ? profile.titleUrdu : profile.title}
                </p>
              </div>
            </div>
          </div>

          {/* Biography & Credentials Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>{language === 'ur' ? 'قیادت و سیاسی تعارف' : 'Official Representative Profile'}</span>
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] leading-tight">
                {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#087A43]">
                {language === 'ur' ? profile.constituencyUrdu : profile.constituency}
              </p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {language === 'ur' ? profile.bioUrdu : profile.bio}
            </p>

            <div className="bg-[#F7F9F7] p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-[#123B28] uppercase tracking-wider text-[11px]">
                {language === 'ur' ? 'سیاسی سفر و عوامی وابستگی' : 'Political Background & Public Service Journey'}
              </h4>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                {language === 'ur' ? profile.politicalJourneyUrdu : profile.politicalJourney}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-start gap-2.5 text-slate-700">
                <BookOpen className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ur' ? 'تعلیمی پس منظر' : 'Education'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {language === 'ur' ? profile.educationUrdu : profile.education}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-700">
                <Building className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ur' ? 'سیاسی جماعت' : 'Political Party'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {language === 'ur' ? profile.partyUrdu : profile.party}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ur' ? 'اسمبلی نمائندگی' : 'Provincial Assembly'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {language === 'ur' ? profile.assemblyTenureUrdu : profile.assemblyTenure}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-700">
                <Clock className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ur' ? 'عوامی کھلی کچہری' : 'Public Darbar'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {language === 'ur' ? profile.officeHoursUrdu : profile.officeHours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assembly Advocacy Strip */}
      <div className="bg-[#123B28] rounded-2xl text-white p-6 sm:p-10 shadow-lg border border-[#C9A227]/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227]">
              {language === 'ur' ? 'پارلیمانی و قانون سازی کردار' : 'Provincial Assembly Profile'}
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold leading-snug">
              {language === 'ur'
                ? 'پنجاب اسمبلی میں چیچہ وطنی اور دیہی کاشتکاروں کے حقوق کی نمائندگی'
                : 'Championing Agricultural Equity, Rural Healthcare & Infrastructure in the Punjab Assembly'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {language === 'ur'
                ? 'لوئر باری دوآب کینال کی ٹیلوں تک پانی کی منصفانہ فراہمی، تحصیل ہیڈ کوارٹر ہسپتال چیچہ وطنی کی اپ گریڈیشن، اور دیہی رابطہ سڑکوں کی تعمیر کے لیے مسلسل قانون سازی و بجٹ سفارشات۔'
                : 'Legislative priorities include equitable LBDC canal irrigation distribution for tail-end farmers, THQ Hospital trauma expansion, solarized RO drinking water plants, and farm-to-market rural roads across PP-203.'}
            </p>
            <div className="pt-1 flex flex-wrap gap-3">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('assembly')}
                  className="min-h-[44px] bg-[#C9A227] hover:bg-[#b5901d] text-[#123B28] font-bold px-5 py-2.5 rounded-xl text-xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {language === 'ur' ? 'پنجاب اسمبلی کی سرگرمیاں دیکھیں' : 'View Assembly Activities'}
                  </span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              )}
              {onNavigate && (
                <button
                  onClick={() => onNavigate('complaints')}
                  className="min-h-[44px] bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl border border-white/20 text-xs transition cursor-pointer"
                >
                  {language === 'ur' ? 'عوامی خدمت پورٹل' : 'Open Public Service Portal'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-[#C9A227]/40 shadow-md h-52 sm:h-64 bg-slate-900 w-full">
              <img
                src={getAssetUrl(profile.assemblyImageUrl || ASSEMBLY_IMAGE_PATH)}
                alt="Provincial Assembly of the Punjab"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl(ASSEMBLY_IMAGE_PATH);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Secretariat Contact Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-editorial text-lg font-bold text-[#123B28] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#087A43] shrink-0" />
            <span>{language === 'ur' ? 'مرکزی عوامی سیکرٹریٹ و رابطہ' : 'Constituency Secretariat Info'}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {language === 'ur' ? 'تحصیل چیچہ وطنی، ضلع ساہیوال' : 'Chichawatni, District Sahiwal'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
              {language === 'ur' ? 'پتہ سیکرٹریٹ' : 'Secretariat Address'}
            </span>
            <p className="font-semibold text-slate-900 leading-relaxed">
              {language === 'ur' ? profile.officeAddressUrdu : profile.officeAddress}
            </p>
          </div>

          <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
              {language === 'ur' ? 'اوقاتِ کار و کھلی کچہری' : 'Visiting & Darbar Hours'}
            </span>
            <p className="font-semibold text-slate-900 leading-relaxed">
              {language === 'ur' ? profile.officeHoursUrdu : profile.officeHours}
            </p>
          </div>

          <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
              {language === 'ur' ? 'سرکاری ہیلپ لائن' : 'Helpline & Official Email'}
            </span>
            <a
              href={`tel:${profile.officialPhone}`}
              className="font-mono font-bold text-[#087A43] text-sm block hover:underline"
            >
              {profile.officialPhone}
            </a>
            <a
              href={`mailto:${profile.officialEmail}`}
              className="text-slate-600 font-mono text-[11px] truncate block hover:underline"
            >
              {profile.officialEmail}
            </a>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
          {language === 'ur' ? profile.verifiedNoticeUrdu : profile.verifiedNotice}
        </p>
      </div>
    </div>
  );
};
