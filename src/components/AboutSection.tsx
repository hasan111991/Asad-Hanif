import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Award,
  BookOpen,
  Building,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';

export const AboutSection: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { profile } = useData();

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 w-full">
      {/* Top Profile Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200 bg-slate-900">
              <img
                src="/images/chaudhry_asad_hanif_jutt.jpg"
                alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                className="w-full aspect-square sm:aspect-[4/5] object-cover object-[center_15%]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-14 pb-3 px-3.5 sm:px-4" />
              <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                <span className="text-[10px] font-mono bg-[#087A43] text-amber-300 font-bold px-2 py-0.5 rounded inline-block shadow-xs">
                  {language === 'ur' ? 'عوامی نمائندہ' : 'PP-203 Leadership'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold mt-1 truncate">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5 truncate">
                  {language === 'ur' ? profile.titleUrdu : profile.title}
                </p>
              </div>
            </div>
          </div>

          {/* Biography & Credentials Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'ur' ? 'قیادت و سیاسی تعارف' : 'Leadership & Mission'}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#087A43]">
                {language === 'ur' ? profile.constituencyUrdu : profile.constituency}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {language === 'ur' ? profile.bioUrdu : profile.bio}
            </p>

            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] sm:text-[11px]">
                {language === 'ur' ? 'سیاسی سفر و عوامی وابستگی' : 'Political Journey & Public Outreach'}
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {language === 'ur' ? profile.politicalJourneyUrdu : profile.politicalJourney}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-700">
                <BookOpen className="w-4 h-4 text-[#087A43] shrink-0" />
                <span><strong>Education:</strong> {language === 'ur' ? profile.educationUrdu : profile.education}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Building className="w-4 h-4 text-[#087A43] shrink-0" />
                <span><strong>Party:</strong> {language === 'ur' ? profile.partyUrdu : profile.party}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-[#087A43] shrink-0" />
                <span><strong>Assembly:</strong> {language === 'ur' ? profile.assemblyTenureUrdu : profile.assemblyTenure}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-[#087A43] shrink-0" />
                <span><strong>Darbar:</strong> Tue & Thu (10am–4pm)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assembly Photo and Initiatives Strip */}
      <div className="bg-gradient-to-r from-emerald-950 to-[#064D2B] rounded-2xl sm:rounded-3xl text-white p-5 sm:p-10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-emerald-900/80 px-2.5 py-1 rounded inline-block">
              PARLIAMENTARY ADVOCACY
            </span>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold leading-snug sm:leading-tight">
              {language === 'ur'
                ? 'پنجاب اسمبلی میں چیچہ وطنی اور دیہی کاشتکاروں کے حقوق کی توانا آواز'
                : 'Championing Agricultural Reforms & Citizen Welfare in the Punjab Assembly'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Active legislative work focusing on canal water tail-end equity on the LBDC network, rural health center staffing, seed and fertilizer subsidies, and rural road infrastructure.
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
              <span className="bg-white/10 text-emerald-100 text-[11px] px-2.5 py-1 rounded-full border border-white/15">
                Canal Water Tail Equity
              </span>
              <span className="bg-white/10 text-emerald-100 text-[11px] px-2.5 py-1 rounded-full border border-white/15">
                Kisan Fertilizer Oversight
              </span>
              <span className="bg-white/10 text-emerald-100 text-[11px] px-2.5 py-1 rounded-full border border-white/15">
                THQ Trauma Upgrades
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md h-48 sm:h-64 bg-slate-900 w-full">
              <img
                src={profile.assemblyImageUrl || '/images/punjab_assembly_1794225863446.jpg'}
                alt="Punjab Assembly Representation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Official Secretariat & Public Darbar Timing */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#087A43] shrink-0" />
          <span>{language === 'ur' ? 'مرکزی عوامی سیکرٹریٹ و رابطہ' : 'Central Secretariat & Public Office'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Secretariat Location</span>
            <p className="font-semibold text-slate-900 leading-relaxed">
              {language === 'ur' ? profile.officeAddressUrdu : profile.officeAddress}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Office & Darbar Hours</span>
            <p className="font-semibold text-slate-900 leading-relaxed">
              {language === 'ur' ? profile.officeHoursUrdu : profile.officeHours}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Contact Helpline</span>
            <p className="font-mono font-bold text-emerald-700 text-sm">
              {profile.officialPhone}
            </p>
            <p className="text-slate-500 font-mono text-[11px] truncate">{profile.officialEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
