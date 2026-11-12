import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { MediaPreviewBlock } from './MediaPreviewBlock';
import {
  Building2,
  Tractor,
  HardHat,
  Search,
  Hospital,
  ArrowRight
} from 'lucide-react';

export const ConstituencySection: React.FC<{
  onOpenMap?: () => void;
  onNavigate?: (tab: string) => void;
}> = ({ onOpenMap, onNavigate }) => {
  const { language } = useLanguage();
  const { profile, unionCouncils, education, healthcare } = useData();

  const [activeSubTab, setActiveSubTab] = useState<
    'profile' | 'ucs' | 'education' | 'healthcare' | 'agriculture'
  >('profile');
  const [searchTerm, setSearchTerm] = useState('');

  const subTabs = [
    { id: 'profile', labelEn: 'Profile & Geography', labelUr: 'حلقہ کا تعارف و جغرافیہ' },
    { id: 'ucs', labelEn: 'Union Councils & Chaks', labelUr: 'یونین کونسلیں و دیہات' },
    { id: 'education', labelEn: 'Education Facilities', labelUr: 'تعلیمی ادارے' },
    { id: 'healthcare', labelEn: 'Healthcare Facilities', labelUr: 'ہسپتال و مراکزِ صحت' },
    { id: 'agriculture', labelEn: 'Agro-Civic Economy', labelUr: 'زراعت و معیشت' }
  ];

  const filteredUCs = unionCouncils.filter(
    (uc) =>
      uc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.nameUrdu.includes(searchTerm) ||
      uc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.keyVillages.some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="text-xs font-bold text-[#087A43] uppercase tracking-widest block">
            {language === 'ur' ? 'حلقہ انتخاب پی پی 203' : 'Constituency Overview · District Sahiwal'}
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
            {language === 'ur'
              ? 'حلقہ پی پی 203 چیچہ وطنی — جامع تعارف'
              : 'PP-203 Chichawatni Constituency Profile'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            {language === 'ur'
              ? 'ضلع ساہیوال کی زرخیز تحصیل چیچہ وطنی، اس کی یونین کونسلوں، دیہی چکوں، تعلیمی و طبی مراکز اور ترقیاتی منصوبوں کی تفصیلات۔'
              : 'Chichawatni & District Sahiwal civic profile covering municipal wards, rural union councils and chaks, schools, hospitals, and ongoing public works.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate('projects')}
              className="min-h-[44px] bg-[#087A43] hover:bg-[#123B28] text-white font-semibold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'ur' ? 'ترقیاتی منصوبے دیکھیں' : 'View All Projects'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          )}
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="min-h-[44px] bg-white hover:bg-[#F7F9F7] border border-slate-200 text-[#123B28] font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              {language === 'ur' ? 'جی آئی ایس نقشہ' : 'Open GIS Map'}
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-3 mb-6 border-b border-slate-200 scrollbar-none">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#123B28] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-[#F7F9F7] border border-slate-200'
            }`}
          >
            {language === 'ur' ? tab.labelUr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Geography */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227]">
              PP-203 · Tehsil Chichawatni · District Sahiwal
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28] leading-snug">
              {language === 'ur'
                ? 'چیچہ وطنی: پنجاب کا زرخیز زرعی و عوامی مرکز'
                : 'Chichawatni: Agro-Commercial & Civic Corridor of Sahiwal'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'ur'
                ? 'حلقہ پی پی 203 تحصیل چیچہ وطنی، ضلع ساہیوال میں واقع ہے۔ قومی شاہراہ (جی ٹی روڈ N-5)، مین ریلوے لائن اور لوئر باری دوآب کینال کے سنگم پر واقع یہ علاقہ گندم، کپاس، مکئی اور ترشاوہ باغات کے حوالے سے نمایاں مقام رکھتا ہے۔ اس میں شہری وارڈز سمیت اوکانوالہ بنگلہ، غازی آباد، اقبال نگر اور تمام ملحقہ چک شامل ہیں۔'
                : 'PP-203 spans Tehsil Chichawatni in District Sahiwal, Punjab. Situated along the Grand Trunk Road (N-5) and main railway line and irrigated by the Lower Bari Doab Canal (LBDC), the constituency encompasses urban commercial wards alongside thriving rural union councils and chaks including Okanwala Bangla, Ghaziabad, and Iqbal Nagar.'}
            </p>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">
                  {language === 'ur' ? 'صدر مقام' : 'Tehsil HQ'}
                </span>
                <strong className="text-[#123B28]">Chichawatni City</strong>
              </div>
              <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">
                  {language === 'ur' ? 'ضلع / ڈویژن' : 'District'}
                </span>
                <strong className="text-[#123B28]">Sahiwal, Punjab</strong>
              </div>
              <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">
                  {language === 'ur' ? 'شامل علاقے' : 'Coverage'}
                </span>
                <strong className="text-[#123B28] tabular-nums">11 UCs · 80+ Chaks</strong>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2">
            <MediaPreviewBlock
              imageUrl={profile.chichawatniSceneUrl || CHICHAWATNI_SCENE_PATH}
              videoUrl={profile.constituencyVideoUrl}
              title="Chichawatni Civic & Rural Belt"
              fallbackImage={CHICHAWATNI_SCENE_PATH}
              heightClass="h-56 sm:h-72"
            />
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[#123B28]">Chichawatni Civic & Rural Belt</span>
              <span className="text-[11px] text-slate-500">District Sahiwal, Punjab</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Union Councils */}
      {activeSubTab === 'ucs' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ur' ? 'کونسل یا چک تلاش کریں...' : 'Search UC, chak, or town...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] min-h-[44px]"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium tabular-nums">
              {filteredUCs.length} / {unionCouncils.length}{' '}
              {language === 'ur' ? 'یونین کونسلیں' : 'Union Councils'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredUCs.map((uc) => (
              <div
                key={uc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-[#087A43]">{uc.code}</span>
                    <span className="text-slate-500 font-medium">{uc.type} Council</span>
                  </div>

                  <h4 className="font-bold text-[#123B28] text-sm sm:text-base leading-snug">
                    {language === 'ur' ? uc.nameUrdu : uc.name}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'ur' ? uc.headquartersUrdu : uc.headquarters}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div className="tabular-nums">
                      <strong>{language === 'ur' ? 'تخمینہ آبادی:' : 'Est. Population:'}</strong>{' '}
                      {uc.estimatedPopulation.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {(language === 'ur' ? uc.keyVillagesUrdu : uc.keyVillages).join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <strong className="text-[#123B28]">
                    {language === 'ur' ? 'ترجیحی ضرورت:' : 'Key Focus:'}
                  </strong>{' '}
                  {uc.mainIssues[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Education */}
      {activeSubTab === 'education' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#087A43]">
                  {edu.level} · {edu.gender}
                </span>
                <span className="font-mono text-slate-500">{edu.unionCouncil}</span>
              </div>
              <h4 className="font-bold text-[#123B28] text-sm sm:text-base leading-snug">
                {language === 'ur' ? edu.nameUrdu : edu.name}
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs bg-[#F7F9F7] p-3 rounded-xl border border-slate-100 text-center tabular-nums">
                <div>
                  <span className="text-slate-400 block text-[10px]">Enrollment</span>
                  <strong className="text-slate-800">{edu.enrollment.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Faculty</span>
                  <strong className="text-slate-800">{edu.teachersCount}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Classrooms</span>
                  <strong className="text-slate-800">{edu.classroomsCount}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Healthcare */}
      {activeSubTab === 'healthcare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {healthcare.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#087A43] inline-flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 shrink-0" />
                  <span>{fac.type}</span>
                </span>
                <span className="font-mono text-slate-500">{fac.unionCouncil}</span>
              </div>
              <h4 className="font-bold text-[#123B28] text-base leading-snug">
                {language === 'ur' ? fac.nameUrdu : fac.name}
              </h4>
              <div className="grid grid-cols-3 gap-2 bg-[#F7F9F7] p-3 rounded-xl border border-slate-100 text-xs text-center tabular-nums">
                <div>
                  <span className="text-slate-400 block text-[10px]">Beds</span>
                  <strong className="text-slate-800">{fac.beds}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Doctors</span>
                  <strong className="text-slate-800">{fac.doctorsAvailable}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">24/7 Emergency</span>
                  <strong className={fac.emergency24h ? 'text-[#087A43]' : 'text-slate-500'}>
                    {fac.emergency24h ? 'Active' : 'Day OPD'}
                  </strong>
                </div>
              </div>
              <p className="text-xs text-slate-600">{fac.services.join(' · ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Agro-Civic Economy */}
      {activeSubTab === 'agriculture' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#087A43]">
              Chichawatni Agrarian Belt
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28] mt-1">
              {language === 'ur'
                ? 'چیچہ وطنی کا زرعی و معاشی نظام'
                : 'Agricultural & Grain Market Backbone'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-[#123B28] text-sm flex items-center gap-2">
                <Tractor className="w-4 h-4 text-[#087A43] shrink-0" />
                <span>Major Crops</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Wheat, Cotton, Sugarcane, Maize, and Citrus orchards sustaining rural households across Chichawatni Tehsil.
              </p>
            </div>
            <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-[#123B28] text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#087A43] shrink-0" />
                <span>Ghalla Mandi Hub</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regional grain storage silos and regulated agricultural produce wholesale market serving Sahiwal Division.
              </p>
            </div>
            <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-[#123B28] text-sm flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#087A43] shrink-0" />
                <span>LBDC Irrigation</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lower Bari Doab Canal distributaries (9-L, 11-L, 12-L, 14-L) feeding rural chaks and farming watercourses.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
