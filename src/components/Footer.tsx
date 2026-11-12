import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PolicyModalType } from '../types';
import { getAssetUrl, PORTRAIT_IMAGE_PATH } from '../utils/assetUrl';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenPolicy: (type: PolicyModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy }) => {
  const { language, t } = useLanguage();
  const { profile, settings } = useData();

  return (
    <footer className="bg-[#123B28] text-emerald-100/85 text-xs border-t-4 border-[#C9A227] w-full mb-16 sm:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Representative Overview */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-[#C9A227] overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={getAssetUrl(profile.photoUrl || PORTRAIT_IMAGE_PATH)}
                  alt="Chaudhry Asad Hanif Jutt — Profile Photograph"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAssetUrl(PORTRAIT_IMAGE_PATH);
                  }}
                />
              </div>
              <div className="min-w-0">
                <span className="font-editorial font-bold text-white text-sm block truncate">
                  {language === 'ur' ? profile.fullNameUrdu : profile.fullName}
                </span>
                <span className="text-[11px] text-[#C9A227] font-semibold">
                  PP-203 Chichawatni · PML-N
                </span>
              </div>
            </div>

            <p className="text-emerald-100/80 text-xs leading-relaxed">
              {language === 'ur'
                ? 'پاکستان مسلم لیگ (ن) — عوامی خدمت، شفاف ترقی اور حلقہ پی پی 203 چیچہ وطنی کی خوشحالی کا عزم۔'
                : 'Official political representative profile, transparency hub, and constituent public service portal for PP-203 Chichawatni, District Sahiwal.'}
            </p>

            <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('verifiedOfficialPortal')}</span>
            </div>
          </div>

          {/* Public Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-editorial text-white font-bold uppercase tracking-wider text-xs">
              {language === 'ur' ? 'حلقہ و پورٹل' : 'Constituency Directory'}
            </h4>
            <ul className="space-y-1">
              {['about', 'constituency', 'city', 'projects', 'map', 'assembly'].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="min-h-[38px] flex items-center text-emerald-100/80 hover:text-[#C9A227] transition cursor-pointer"
                  >
                    {t(id)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Citizen Services */}
          <div className="space-y-2.5">
            <h4 className="font-editorial text-white font-bold uppercase tracking-wider text-xs">
              {language === 'ur' ? 'عوامی خدمات' : 'Citizen Services'}
            </h4>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onNavigate('complaints')}
                  className="min-h-[38px] flex items-center hover:text-[#C9A227] transition cursor-pointer"
                >
                  {t('complaints')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notices')}
                  className="min-h-[38px] flex items-center hover:text-[#C9A227] transition cursor-pointer"
                >
                  {t('notices')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="min-h-[38px] flex items-center hover:text-[#C9A227] transition cursor-pointer"
                >
                  {t('news')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="min-h-[38px] flex items-center hover:text-[#C9A227] transition cursor-pointer"
                >
                  {t('gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="min-h-[38px] flex items-center hover:text-[#C9A227] transition cursor-pointer"
                >
                  {t('contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Secretariat Info */}
          <div className="space-y-3">
            <h4 className="font-editorial text-white font-bold uppercase tracking-wider text-xs">
              {language === 'ur' ? 'سیکرٹریٹ رابطہ' : 'Secretariat Office'}
            </h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <span>{language === 'ur' ? settings.officeLocationUrdu : settings.officeLocation}</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#C9A227] shrink-0" />
                <a
                  href={`tel:${settings.helplinePhone}`}
                  className="font-mono text-white hover:text-[#C9A227] transition"
                >
                  {settings.helplinePhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C9A227] shrink-0" />
                <a
                  href={`mailto:${profile.officialEmail}`}
                  className="font-mono text-white hover:text-[#C9A227] transition truncate"
                >
                  {profile.officialEmail}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Non-Government Official Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/15 bg-black/20 rounded-xl p-4 text-[11px] text-emerald-50/90 leading-relaxed">
          <strong className="text-[#C9A227] uppercase tracking-wider mr-1.5">
            {language === 'ur' ? 'اہم وضاحت:' : 'Official Notice & Disclaimer:'}
          </strong>
          {t('officialDisclaimerShort')}
        </div>
      </div>

      {/* Bottom Legal Compliance Bar (ZERO Admin Links) */}
      <div className="bg-[#0b271a] py-4 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-center md:text-left">
          <div className="text-emerald-100/75">
            &copy; {new Date().getFullYear()} Chaudhry Asad Hanif Jutt – Official Website (PP-203 Chichawatni).
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-emerald-100/80">
            <button
              onClick={() => onOpenPolicy('privacy')}
              className="min-h-[38px] px-2 hover:text-[#C9A227] transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenPolicy('terms')}
              className="min-h-[38px] px-2 hover:text-[#C9A227] transition cursor-pointer"
            >
              Terms of Public Service
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenPolicy('data_protection')}
              className="min-h-[38px] px-2 hover:text-[#C9A227] transition cursor-pointer"
            >
              Data Protection Notice
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenPolicy('complaint_disclaimer')}
              className="min-h-[38px] px-2 hover:text-[#C9A227] transition cursor-pointer"
            >
              Complaint Submission Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
