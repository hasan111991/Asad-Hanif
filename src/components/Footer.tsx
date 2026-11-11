import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ShieldCheck, PhoneCall, Mail, MapPin, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'disclaimer') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy, onOpenAdmin }) => {
  const { language, isRTL, t } = useLanguage();
  const { profile, settings } = useData();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 w-full mb-16 sm:mb-0">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Leader Overview */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden bg-slate-900 shrink-0">
                <img
                  src="/images/chaudhry_asad_hanif_jutt.jpg"
                  alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white text-sm block truncate">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </span>
                <span className="text-[11px] text-amber-400 font-mono">PP-203 Chichawatni</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {language === 'ur'
                ? 'تحصیل چیچہ وطنی، ضلع ساہیوال کی عوامی فلاح، دیہی خوشحالی اور شفاف طرزِ حکمرانی کے لیے ڈیجیٹل کانسٹی ٹیونسی مینجمنٹ پلیٹ فارم۔'
                : 'Digital governance and transparent constituent outreach platform for PP-203 Chichawatni, District Sahiwal, Punjab.'}
            </p>

            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('verifiedOfficialPortal')}</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Constituency Directory</h4>
            <ul className="space-y-1">
              {['constituency', 'map', 'projects', 'notices', 'reports'].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="min-h-[44px] flex items-center text-slate-400 hover:text-white transition active:text-emerald-400 py-1"
                  >
                    {t(id)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Public Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Citizen Services</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => onNavigate('complaints')} className="min-h-[44px] flex items-center hover:text-white transition py-1">
                  {t('submitGrievanceBtn')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('news')} className="min-h-[44px] flex items-center hover:text-white transition py-1">
                  {t('news')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="min-h-[44px] flex items-center hover:text-white transition py-1">
                  {t('gallery')}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('disclaimer')} className="min-h-[44px] flex items-center hover:text-white transition text-left rtl:text-right py-1">
                  Official Data Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="min-h-[44px] flex items-center hover:text-white transition text-left rtl:text-right py-1">
                  Privacy Policy & Protection
                </button>
              </li>
            </ul>
          </div>

          {/* Secretariat Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Secretariat Info</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Bypass Road / GT Road, Chichawatni</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href={`tel:${settings.helplinePhone}`} className="min-h-[44px] flex items-center font-mono text-slate-300 hover:text-white">
                  {settings.helplinePhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-slate-300 truncate">secretariat@chasadhanif.pk</span>
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed">
          <p>{t('disclaimerText')}</p>
        </div>
      </div>

      {/* Bottom Bar with Discreet Admin Access */}
      <div className="bg-black/90 py-4 px-4 sm:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-center sm:text-left rtl:sm:text-right">
          <div>
            &copy; {new Date().getFullYear()} PP-203 Smart Constituency Management Portal.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-slate-500">
            <button onClick={() => onOpenPolicy('terms')} className="min-h-[44px] px-2 flex items-center hover:text-slate-300">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => onOpenPolicy('privacy')} className="min-h-[44px] px-2 flex items-center hover:text-slate-300">
              Privacy
            </button>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="min-h-[44px] px-2 hover:text-emerald-400 flex items-center gap-1 opacity-70 hover:opacity-100 transition"
              title="Authorized Personnel Access"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
