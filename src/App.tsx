import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ConstituencyMap } from './components/ConstituencyMap';
import { ConstituencySection } from './components/ConstituencySection';
import { ProjectsSection } from './components/ProjectsSection';
import { ComplaintPortal } from './components/ComplaintPortal';
import { ComplaintTracking } from './components/ComplaintTracking';
import { AboutSection } from './components/AboutSection';
import { PublicNotices } from './components/PublicNotices';
import { NewsSection } from './components/NewsSection';
import { GallerySection } from './components/GallerySection';
import { ReportsSection } from './components/ReportsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PolicyModals } from './components/PolicyModals';
import { AdminPortal } from './admin/AdminPortal';
import {
  FileText,
  Search,
  CheckCircle2,
  MapPin,
  Building,
  HeartHandshake,
  HardHat,
  ArrowRight
} from 'lucide-react';

function MainAppContent() {
  const { language, isRTL, t } = useLanguage();
  const { profile } = useData();

  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin' || window.location.pathname === '/admin' || window.location.pathname === '/admin/login') {
      return 'admin';
    }
    return hash || 'home';
  });

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [prefilledTrackingId, setPrefilledTrackingId] = useState('');
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  // Sync hash with activeTab
  useEffect(() => {
    window.location.hash = activeTab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenTracking = (prefilledId?: string) => {
    if (prefilledId) setPrefilledTrackingId(prefilledId);
    setTrackingModalOpen(true);
  };

  // If in Admin Portal Mode
  if (activeTab === 'admin') {
    return <AdminPortal onExit={() => setActiveTab('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7] text-[#202820]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTrackingModal={() => handleOpenTracking()}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <Hero
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenTracking={() => handleOpenTracking()}
            />

            {/* Quick Action Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="bg-gradient-to-r from-emerald-800 to-[#087A43] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left rtl:md:text-right">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {language === 'ur' ? 'عوامی کھلی کچہری' : 'Citizen Grievance Redressal'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {language === 'ur'
                      ? 'کیا آپ کے علاقے میں سڑک، نالی، صاف پانی یا بجلی کا مسئلہ ہے؟'
                      : 'Facing a Road, Water, or Electricity Issue in Your Village?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                    {language === 'ur'
                      ? 'براہِ راست عوامی پورٹل پر اندراج کروائیں یا سیکرٹریٹ ہیلپ لائن پر رابطہ کریں۔'
                      : 'Submit directly through our verified digital grievance portal or track your existing case.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition shadow-md flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('submitGrievanceBtn')}</span>
                  </button>
                  <button
                    onClick={() => handleOpenTracking()}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl border border-white/20 text-xs sm:text-sm transition flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>{t('trackGrievanceBtn')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Map Preview on Home */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider">
                    GIS Spatial Map
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {language === 'ur' ? 'حلقہ پی پی 203 کا لائیو نقشہ' : 'Interactive Constituency Map'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>{language === 'ur' ? 'مکمل نقشہ دیکھیں' : 'Full Screen Map'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
              <ConstituencyMap />
            </section>

            {/* Development Projects Preview */}
            <section className="bg-white py-12 border-y border-slate-200">
              <ProjectsSection />
            </section>

            {/* Constituency Profile Summary */}
            <section>
              <ConstituencySection onOpenMap={() => setActiveTab('map')} />
            </section>

            {/* Latest News & Notices */}
            <section className="bg-slate-50 py-12 border-t border-slate-200">
              <NewsSection />
            </section>
          </div>
        )}

        {activeTab === 'about' && <AboutSection onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'constituency' && <ConstituencySection onOpenMap={() => setActiveTab('map')} />}
        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-4">
            <div>
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider">
                GIS Constituency Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {language === 'ur' ? 'حلقہ پی پی 203 چیچہ وطنی — جی آئی ایس نقشہ' : 'PP-203 GIS Constituency Map & Geo-layers'}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Explore verified boundaries, Union Councils, hospitals, schools, and development project locations.
              </p>
            </div>
            <ConstituencyMap />
          </div>
        )}
        {activeTab === 'projects' && <ProjectsSection />}
        {activeTab === 'complaints' && (
          <ComplaintPortal onOpenTracking={(id) => handleOpenTracking(id)} />
        )}
        {activeTab === 'notices' && <PublicNotices />}
        {activeTab === 'news' && <NewsSection />}
        {activeTab === 'gallery' && <GallerySection />}
        {activeTab === 'reports' && <ReportsSection />}
        {activeTab === 'contact' && <ContactSection />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenPolicy={(type) => setPolicyModalType(type)}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      {/* Global Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <ComplaintTracking
              initialTrackingId={prefilledTrackingId}
              onClose={() => setTrackingModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Global Policy Modals */}
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
      <DataProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </DataProvider>
    </LanguageProvider>
  );
}
