import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, AdminModuleId } from './context/AuthContext';
import { CityDataProvider } from './context/CityDataContext';
import { PolicyModalType } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ConstituencySection } from './components/ConstituencySection';
import { ProjectsSection } from './components/ProjectsSection';
import { ConstituencyMap } from './components/ConstituencyMap';
import { AssemblySection } from './components/AssemblySection';
import { ComplaintPortal } from './components/ComplaintPortal';
import { PublicNotices } from './components/PublicNotices';
import { NewsSection } from './components/NewsSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { CityPublicPortal } from './components/CityPublicPortal';
import { Footer } from './components/Footer';
import { PolicyModals } from './components/PolicyModals';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { AdminPortal } from './admin/AdminPortal';
import {
  FileText,
  Search,
  MapPin,
  Home,
  MessageSquare,
  HardHat,
  Phone,
  ArrowRight
} from 'lucide-react';

const VALID_ADMIN_ROUTES: AdminModuleId[] = [
  'dashboard',
  'projects',
  'complaints',
  'notices',
  'appointments',
  'news',
  'gallery',
  'analytics',
  'settings',
  'staff',
  'audit',
  'city-overview',
  'city-master-plan',
  'city-gis',
  'city-areas',
  'city-roads',
  'city-water-sewerage',
  'city-sanitation',
  'city-traffic',
  'city-parks',
  'city-health-edu',
  'city-markets',
  'city-streetlights',
  'city-town-planning',
  'city-projects',
  'city-budget',
  'city-complaints',
  'city-departments',
  'city-surveys',
  'city-reports',
  'city-ai'
];

const PUBLIC_TABS = [
  'home',
  'about',
  'constituency',
  'city',
  'projects',
  'map',
  'assembly',
  'complaints',
  'notices',
  'news',
  'gallery',
  'contact'
];

function parseRouteState(): {
  isAdmin: boolean;
  adminSubRoute: AdminModuleId;
  publicTab: string;
} {
  const path = window.location.pathname;
  const hash = window.location.hash.replace(/^#\/?/, '');

  const checkAdminTarget = (segmentSource: string): AdminModuleId | null => {
    const match = segmentSource.match(/\/admin(?:\/([a-z-]+))?/i);
    if (!match) return null;
    const sub = (match[1] || 'dashboard').toLowerCase();
    if (sub === 'login') return 'dashboard';
    if (VALID_ADMIN_ROUTES.includes(sub as AdminModuleId)) {
      return sub as AdminModuleId;
    }
    return 'dashboard';
  };

  const fromPath = checkAdminTarget(path);
  if (fromPath) {
    return { isAdmin: true, adminSubRoute: fromPath, publicTab: 'home' };
  }

  if (hash === 'admin' || hash.startsWith('admin/')) {
    const sub = hash.split('/')[1] || 'dashboard';
    const validSub =
      sub !== 'login' && VALID_ADMIN_ROUTES.includes(sub as AdminModuleId)
        ? (sub as AdminModuleId)
        : 'dashboard';
    return { isAdmin: true, adminSubRoute: validSub, publicTab: 'home' };
  }

  const publicTab = PUBLIC_TABS.includes(hash) ? hash : 'home';
  return { isAdmin: false, adminSubRoute: 'dashboard', publicTab };
}

function getRepoBasePrefix(): string {
  const path = window.location.pathname.replace(/\/index\.html$/i, '');
  const adminIndex = path.indexOf('/admin');
  if (adminIndex !== -1) {
    const stripped = path.slice(0, adminIndex);
    return stripped ? (stripped.endsWith('/') ? stripped : `${stripped}/`) : '/';
  }
  if (!path || path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function MainAppContent() {
  const { language, t } = useLanguage();
  const { settings } = useData();

  const initialRoute = parseRouteState();
  const [isAdminView, setIsAdminView] = useState<boolean>(initialRoute.isAdmin);
  const [adminSubRoute, setAdminSubRoute] = useState<AdminModuleId>(initialRoute.adminSubRoute);
  const [activeTab, setActiveTab] = useState<string>(initialRoute.publicTab);
  const [complaintInitialMode, setComplaintInitialMode] = useState<'submit' | 'track'>('submit');
  const [policyModalType, setPolicyModalType] = useState<PolicyModalType | null>(null);

  // Sync browser back/forward navigation cleanly
  useEffect(() => {
    const handlePopOrHash = () => {
      const next = parseRouteState();
      setIsAdminView(next.isAdmin);
      setAdminSubRoute(next.adminSubRoute);
      if (!next.isAdmin) {
        setActiveTab(next.publicTab);
      }
    };
    window.addEventListener('popstate', handlePopOrHash);
    window.addEventListener('hashchange', handlePopOrHash);
    return () => {
      window.removeEventListener('popstate', handlePopOrHash);
      window.removeEventListener('hashchange', handlePopOrHash);
    };
  }, []);

  // Privacy-preserving Google Analytics 4 injection when configured cleanly
  useEffect(() => {
    const gaId = settings.ga4MeasurementId?.trim();
    if (!gaId || !/^G-[A-Z0-9]+$/i.test(gaId)) return;

    const existing = document.getElementById('ga4-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.id = 'ga4-config';
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`;
    document.head.appendChild(inline);
  }, [settings.ga4MeasurementId]);

  // Normalize any /admin pathname visits into safe hash routing so GitHub Pages assets stay anchored
  useEffect(() => {
    if (window.location.pathname.includes('/admin')) {
      const base = getRepoBasePrefix();
      window.history.replaceState(null, '', `${base}#/admin/${initialRoute.adminSubRoute}`);
    }
  }, [initialRoute.adminSubRoute]);

  const navigatePublic = useCallback((tab: string, mode: 'submit' | 'track' = 'submit') => {
    setComplaintInitialMode(mode);
    setActiveTab(tab);
    setIsAdminView(false);
    const targetHash = tab === 'home' ? '' : `#${tab}`;
    const base = getRepoBasePrefix();
    window.history.pushState({}, '', `${base}${targetHash}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateAdminRoute = useCallback((route: AdminModuleId) => {
    setIsAdminView(true);
    setAdminSubRoute(route);
    const base = getRepoBasePrefix();
    window.history.pushState({}, '', `${base}#/admin/${route}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const exitAdminToPublic = useCallback(() => {
    navigatePublic('home');
  }, [navigatePublic]);

  if (isAdminView) {
    return (
      <AdminPortal
        activeSubRoute={adminSubRoute}
        onNavigateRoute={navigateAdminRoute}
        onExitToPublic={exitAdminToPublic}
      />
    );
  }

  const mobileBottomNav = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'map', label: t('map'), icon: MapPin },
    { id: 'complaints', label: t('complaints'), icon: MessageSquare },
    { id: 'projects', label: t('projects'), icon: HardHat },
    { id: 'contact', label: t('contact'), icon: Phone }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7] text-[#1B241E] w-full max-w-full overflow-x-hidden">
      {/* Public Header Navbar (ZERO Admin Links) */}
      <Navbar activeTab={activeTab} setActiveTab={(tab) => navigatePublic(tab)} />

      {/* Main Content Canvas */}
      <main className="flex-1 pb-16 sm:pb-0 w-full">
        {activeTab === 'home' && (
          <div className="space-y-8 sm:space-y-12">
            {/* 1. Hero Section */}
            <Hero onNavigate={(tab) => navigatePublic(tab)} />

            {/* 2. Quick Citizen Service Strip */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-[#123B28] to-[#087A43] rounded-2xl p-5 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1 text-center md:text-left rtl:md:text-right">
                  <span className="text-xs font-bold text-[#C9A227] uppercase tracking-widest">
                    {language === 'ur' ? 'عوامی کھلی کچہری' : 'Citizen Public Service Portal'}
                  </span>
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold leading-snug">
                    {language === 'ur'
                      ? 'کیا آپ کے علاقے میں سڑک، نالی، صاف پانی یا بجلی کا مسئلہ ہے؟'
                      : 'Submit & Track Constituency Service Requests Online'}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
                    {language === 'ur'
                      ? 'براہِ راست عوامی پورٹل پر اندراج کروائیں اور ٹریکنگ نمبر کے ذریعے پیش رفت دیکھیں۔'
                      : 'Register municipal, road, water, electricity, or school/healthcare concerns with instant Tracking ID updates.'}
                  </p>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2.5 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => navigatePublic('complaints', 'submit')}
                    className="min-h-[48px] bg-[#C9A227] hover:bg-[#b5901d] text-[#123B28] font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>{t('submitGrievanceBtn')}</span>
                  </button>
                  <button
                    onClick={() => navigatePublic('complaints', 'track')}
                    className="min-h-[48px] bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl border border-white/25 text-xs sm:text-sm transition inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span>{t('trackGrievanceBtn')}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Interactive GIS Constituency Map */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#087A43] uppercase tracking-widest block">
                    GIS Spatial Map
                  </span>
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28]">
                    {language === 'ur'
                      ? 'حلقہ پی پی 203 کا لائیو جی آئی ایس نقشہ'
                      : 'Interactive PP-203 Constituency Map'}
                  </h2>
                </div>
                <button
                  onClick={() => navigatePublic('map')}
                  className="min-h-[44px] px-3 text-xs font-bold text-[#087A43] hover:text-[#123B28] inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>{language === 'ur' ? 'مکمل نقشہ' : 'Full Map'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
              <ConstituencyMap />
            </section>

            {/* 4. Development Projects */}
            <section className="bg-white py-8 sm:py-12 border-y border-slate-200">
              <ProjectsSection />
            </section>

            {/* 5. Constituency Overview */}
            <section>
              <ConstituencySection
                onOpenMap={() => navigatePublic('map')}
                onNavigate={(tab) => navigatePublic(tab)}
              />
            </section>

            {/* 6. Punjab Assembly Activities */}
            <section className="bg-white py-6 sm:py-10 border-y border-slate-200">
              <AssemblySection />
            </section>

            {/* 7. News Highlights */}
            <section>
              <NewsSection />
            </section>
          </div>
        )}

        {activeTab === 'about' && (
          <AboutSection onNavigate={(tab) => navigatePublic(tab)} />
        )}
        {activeTab === 'constituency' && (
          <ConstituencySection
            onOpenMap={() => navigatePublic('map')}
            onNavigate={(tab) => navigatePublic(tab)}
          />
        )}
        {activeTab === 'city' && <CityPublicPortal />}
        {activeTab === 'projects' && <ProjectsSection />}
        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-4">
            <div>
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-widest block">
                GIS Constituency Portal
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
                {language === 'ur'
                  ? 'حلقہ پی پی 203 چیچہ وطنی — جی آئی ایس نقشہ'
                  : 'PP-203 Chichawatni Interactive GIS Map'}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                Explore Chichawatni Union Councils, hospitals, schools, and verified development projects filtered by sector and status.
              </p>
            </div>
            <ConstituencyMap />
          </div>
        )}
        {activeTab === 'assembly' && <AssemblySection />}
        {activeTab === 'complaints' && (
          <ComplaintPortal
            key={complaintInitialMode}
            initialMode={complaintInitialMode}
          />
        )}
        {activeTab === 'notices' && <PublicNotices />}
        {activeTab === 'news' && <NewsSection />}
        {activeTab === 'gallery' && <GallerySection />}
        {activeTab === 'contact' && <ContactSection />}
      </main>

      {/* Public Footer (ZERO Admin Links) */}
      <Footer
        onNavigate={(tab) => navigatePublic(tab)}
        onOpenPolicy={(type) => setPolicyModalType(type)}
      />

      {/* Mobile Fixed Bottom Thumb Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 h-16 pb-safe flex items-center justify-around no-print">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigatePublic(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition cursor-pointer ${
                isActive ? 'text-[#087A43] font-bold' : 'text-slate-500 hover:text-[#123B28]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#087A43]' : 'text-slate-500'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Floating WhatsApp Widget */}
      <WhatsAppWidget />

      {/* Legal & Compliance Modals */}
      <PolicyModals
        type={policyModalType}
        onClose={() => setPolicyModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <CityDataProvider>
            <MainAppContent />
          </CityDataProvider>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
