import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Building2,
  GraduationCap,
  Hospital,
  Tractor,
  HardHat,
  Search,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const ConstituencySection: React.FC<{ onOpenMap?: () => void }> = ({ onOpenMap }) => {
  const { language, t } = useLanguage();
  const { unionCouncils, villages, education, healthcare, infrastructure } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'ucs' | 'education' | 'healthcare' | 'agriculture'>('profile');
  const [searchTerm, setSearchTerm] = useState('');

  const subTabs = [
    { id: 'profile', labelEn: 'Profile & Geography', labelUr: 'حلقہ کا تعارف و جغرافیہ' },
    { id: 'ucs', labelEn: 'Union Councils & Chaks', labelUr: 'یونین کونسلیں و دیہات' },
    { id: 'education', labelEn: 'Education Facilities', labelUr: 'تعلیمی ادارے و کالجز' },
    { id: 'healthcare', labelEn: 'Healthcare & Hospitals', labelUr: 'ہسپتال و مراکزِ صحت' },
    { id: 'agriculture', labelEn: 'Agriculture & Economy', labelUr: 'زراعت، نہریں و معیشت' }
  ];

  const filteredUCs = unionCouncils.filter(uc =>
    uc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uc.keyVillages.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="text-xs font-bold text-[#087A43] bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Constituency Directory
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {language === 'ur' ? 'حلقہ پی پی 203 چیچہ وطنی — جامع پروفائل' : 'PP-203 Chichawatni Constituency Profile & Data'}
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          {language === 'ur'
            ? 'ضلع ساہیوال کی زرخیز تحصیل چیچہ وطنی، اس کے 11 یونین کونسلوں، 80+ دیہی چکوں اور عوامی سہولیات کے مستند اعداد و شمار۔'
            : 'Comprehensive baseline data covering municipal wards, rural union councils, schools, hospitals, and agro-economic infrastructure.'}
        </p>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 border-b border-slate-200 pb-4">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeSubTab === tab.id
                ? 'bg-[#087A43] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {language === 'ur' ? tab.labelUr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Geography */}
      {activeSubTab === 'profile' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                PROVINCIAL CONSTITUENCY PP-203
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {language === 'ur'
                  ? 'چیچہ وطنی: پنجاب کا زرعی و تاریخی قلب'
                  : 'Chichawatni: The Agricultural & Civic Heart of Sahiwal'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'ur'
                  ? 'حلقہ پی پی 203 تحصیل چیچہ وطنی، ضلع ساہیوال میں واقع ہے۔ یہ علاقہ قومی شاہراہ (جی ٹی روڈ)، مین ریلوے لائن اور لوئر باری دوآب کینال کے سنگم پر واقع ہے۔ یہ پنجاب کی سب سے بڑی اناج اور کپاس کی منڈیوں میں شمار ہوتا ہے۔ اس حلقے میں چیچہ وطنی کا شہری علاقہ، اوکانوالہ بنگلہ، غازی آباد، اقبال نگر اور درجنوں دیہی چک شامل ہیں۔'
                  : 'PP-203 is situated in Chichawatni Tehsil of Sahiwal District, Punjab. Located strategically along the historic Grand Trunk (GT) Road (N-5) and the main Karachi-Peshawar railway artery, Chichawatni represents a premier agro-commercial hub renowned for grain storage, cotton ginning, and citrus cultivation irrigated by the Lower Bari Doab Canal (LBDC).'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Headquarters:</span>
                  <strong className="text-slate-800">Chichawatni City</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">District:</span>
                  <strong className="text-slate-800">Sahiwal Division</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Total Registered UCs:</span>
                  <strong className="text-slate-800">11 Union Councils</strong>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative h-72">
                <img
                  src="/images/chichawatni_scene_1794225848060.jpg"
                  alt="Chichawatni Landscape"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-semibold">Chichawatni Bypass & Civic Corridor</p>
                  <p className="text-[11px] text-white/80">Connecting rural chaks to central markets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Union Councils & Chaks */}
      {activeSubTab === 'ucs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ur' ? 'کونسل یا چک تلاش کریں...' : 'Search UC or village...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 shadow-xs"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredUCs.length} of {unionCouncils.length} Union Councils
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUCs.map((uc) => (
              <div key={uc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold bg-[#087A43] text-white px-2 py-0.5 rounded">
                      {uc.code}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      uc.type === 'Urban' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {uc.type} Council
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">
                    {language === 'ur' ? uc.nameUrdu : uc.name}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    <strong>HQ:</strong> {language === 'ur' ? uc.headquartersUrdu : uc.headquarters}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <div><strong>Est. Population:</strong> {uc.estimatedPopulation.toLocaleString()}</div>
                    <div><strong>Key Localities / Chaks:</strong></div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(language === 'ur' ? uc.keyVillagesUrdu : uc.keyVillages).map((v, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-amber-700 font-medium block">
                    Priority Issue: {uc.mainIssues[0] || 'Infrastructure rehabilitation'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Education */}
      {activeSubTab === 'education' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Colleges & Higher Sec:</span>
              <p className="text-xl font-bold text-slate-800 mt-1">6 Institutions</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Total Enrollment:</span>
              <p className="text-xl font-bold text-[#087A43] mt-1">11,200+ Students</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Teaching Faculty:</span>
              <p className="text-xl font-bold text-slate-800 mt-1">280+ Educators</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Technical Training:</span>
              <p className="text-xl font-bold text-blue-700 mt-1">TEVTA & VTI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {education.map((edu) => (
              <div key={edu.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {edu.level} • {edu.gender}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{edu.unionCouncil}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">
                  {language === 'ur' ? edu.nameUrdu : edu.name}
                </h4>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Enrollment:</span>
                    <strong className="text-slate-800">{edu.enrollment.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Teachers:</span>
                    <strong className="text-slate-800">{edu.teachersCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rooms:</span>
                    <strong className="text-slate-800">{edu.classroomsCount}</strong>
                  </div>
                </div>

                {edu.missingFacilities.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-amber-700">Identified Gaps: </span>
                    <span>{edu.missingFacilities.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Healthcare */}
      {activeSubTab === 'healthcare' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthcare.map((fac) => (
              <div key={fac.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5" />
                    {fac.type}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{fac.unionCouncil}</span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-lg">
                    {language === 'ur' ? fac.nameUrdu : fac.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Condition: <strong className={fac.condition === 'Functional' ? 'text-emerald-700' : 'text-amber-700'}>{fac.condition}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Bed Capacity:</span>
                    <strong className="text-slate-800 text-sm">{fac.beds} Beds</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Doctors On Duty:</span>
                    <strong className="text-slate-800 text-sm">{fac.doctorsAvailable} Doctors</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">24/7 Emergency:</span>
                    <strong className={`text-sm ${fac.emergency24h ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {fac.emergency24h ? 'Active' : 'No'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">Available Medical Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.services.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Agriculture & Economy */}
      {activeSubTab === 'agriculture' && (
        <div className="space-y-6 animate-fade-in bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Agrarian Pillar
            </span>
            <h3 className="text-2xl font-bold text-slate-900">
              {language === 'ur' ? 'چیچہ وطنی کا زرعی و معاشی پس منظر' : 'Chichawatni Agricultural Powerhouse & Markets'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              PP-203 is blessed with highly fertile canal-irrigated flatlands fed by the Lower Bari Doab Canal (LBDC). The tehsil is nationally celebrated for high-yield cotton, basmati rice, wheat, and fine kinnow/citrus orchards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Tractor className="w-4 h-4 text-emerald-700" />
                <span>Major Agricultural Crops</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Wheat (Rabi season, 180,000+ metric tons), Cotton (Silver Fiber of Sahiwal), Sugarcane, Maize, and world-class Citrus (Kinnow) orchards.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Grain Market (Ghalla Mandi)</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Central Grain Silos and regulated wholesale commodities market handling tens of thousands of bags daily with electronic weighbridges.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-700" />
                <span>Canal & Irrigation Network</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lower Bari Doab Canal (LBDC) distributaries: 9-L, 11-L, 12-L, and 14-L feeding village watercourses and tube-well networks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
