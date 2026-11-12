import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; ur: string }> = {
  // Primary 11 Navigation Items
  home: { en: 'Home', ur: 'صفحہ اول' },
  about: { en: 'About', ur: 'تعارف' },
  constituency: { en: 'PP-203', ur: 'پی پی 203' },
  projects: { en: 'Projects', ur: 'منصوبے' },
  map: { en: 'GIS Map', ur: 'جی آئی ایس نقشہ' },
  assembly: { en: 'Assembly', ur: 'اسمبلی' },
  complaints: { en: 'Public Portal', ur: 'عوامی پورٹل' },
  notices: { en: 'Notices', ur: 'اعلانات' },
  news: { en: 'News', ur: 'خبریں' },
  gallery: { en: 'Gallery', ur: 'گیلری' },
  contact: { en: 'Contact', ur: 'رابطہ' },

  // General & Identity
  portalTitle: {
    en: 'Chaudhry Asad Hanif Jutt – Official Website',
    ur: 'چوہدری اسد حنیف جٹ – سرکاری ویب سائٹ'
  },
  portalSubtitle: {
    en: 'PP-203, Chichawatni, District Sahiwal, Punjab, Pakistan',
    ur: 'حلقہ پی پی 203، چیچہ وطنی، ضلع ساہیوال، پنجاب، پاکستان'
  },
  verifiedOfficialPortal: {
    en: 'Official Representative & Constituent Portal',
    ur: 'سرکاری عوامی نمائندہ و خدمت پورٹل'
  },
  partyName: {
    en: 'Pakistan Muslim League (N) – PML-N',
    ur: 'پاکستان مسلم لیگ (ن)'
  },
  officialDisclaimerShort: {
    en: 'Official Notice: This is the official political representative profile and constituent public service portal of Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni), and is not a government department or ministry portal.',
    ur: 'اہم اطلاع: یہ چوہدری اسد حنیف جٹ (ایم پی اے حلقہ پی پی 203 چیچہ وطنی) کی سرکاری سیاسی پروفائل اور عوامی خدمت کا پورٹل ہے، اور یہ کوئی سرکاری محکمہ یا وزارت کا پورٹل نہیں ہے۔'
  },

  // Hero & CTAs
  aboutMeBtn: { en: 'About Me', ur: 'میرا تعارف' },
  publicServiceBtn: { en: 'Public Service', ur: 'عوامی خدمت' },
  contactOfficeBtn: { en: 'Contact Office', ur: 'رابطہ آفس' },
  submitGrievanceBtn: { en: 'Submit Complaint', ur: 'شکایت درج کروائیں' },
  trackGrievanceBtn: { en: 'Track Complaint', ur: 'شکایت ٹریک کریں' },
  exploreGisMap: { en: 'Constituency GIS Map', ur: 'حلقہ کا جی آئی ایس نقشہ' },

  // Stats
  statUCs: { en: 'Union Councils Covered', ur: 'یونین کونسلیں' },
  statProjects: { en: 'Development Initiatives', ur: 'ترقیاتی منصوبے' },
  statAssembly: { en: 'Assembly Interventions', ur: 'اسمبلی سرگرمیاں' },
  statResolutionRate: { en: 'Grievance Redressal Rate', ur: 'شکایات کے حل کی شرح' },

  // Complaints
  complaintFormTitle: { en: 'Submit a Citizen Grievance', ur: 'شہری شکایت درج کروائیں' },
  citizenName: { en: 'Citizen Full Name', ur: 'شہری کا مکمل نام' },
  mobileNumber: { en: 'Mobile Number', ur: 'موبائل نمبر' },
  districtTehsil: { en: 'District / Tehsil', ur: 'ضلع / تحصیل' },
  selectUC: { en: 'Area / Union Council', ur: 'علاقہ / یونین کونسل' },
  localityPlaceholder: { en: 'Village, Chak, or Mohallah', ur: 'گاؤں، چک یا محلہ' },
  category: { en: 'Complaint Category', ur: 'شکایت کا شعبہ' },
  issueDescription: { en: 'Description of Issue', ur: 'مسئلے کی تفصیل' },
  consentCheck: {
    en: 'I confirm this information is accurate and authorize the Secretariat of Chaudhry Asad Hanif Jutt to coordinate with relevant departments for resolution.',
    ur: 'میں تصدیق کرتا ہوں کہ یہ معلومات درست ہیں اور چوہدری اسد حنیف جٹ کے سیکرٹریٹ کو متعلقہ محکموں سے رابطے کی اجازت دیتا ہوں۔'
  },
  submitComplaint: { en: 'Submit Complaint', ur: 'شکایت جمع کروائیں' },
  trackingModalTitle: { en: 'Track Complaint Status', ur: 'شکایت کا اسٹیٹس ٹریک کریں' },
  enterTrackingId: { en: 'Tracking ID (e.g. CMP-2026-1042)', ur: 'ٹریکنگ آئی ڈی درج کریں (مثلاً CMP-2026-1042)' },
  trackNow: { en: 'Track Status', ur: 'اسٹیٹس دیکھیں' },

  // Projects & Actions
  budget: { en: 'Allocated Budget', ur: 'مختص بجٹ' },
  department: { en: 'Executing Department', ur: 'متعلقہ محکمہ' },
  progress: { en: 'Completion Progress', ur: 'کام کی پیش رفت' },
  viewDetails: { en: 'View Details', ur: 'تفصیلات دیکھیں' },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  isRTL: false,
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('pp203_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const isRTL = language === 'ur';

  useEffect(() => {
    try {
      localStorage.setItem('pp203_lang', language);
    } catch {
      // ignore storage quota
    }
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
