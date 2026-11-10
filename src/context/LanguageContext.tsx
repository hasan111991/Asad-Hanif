import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; ur: string }> = {
  // Navigation
  home: { en: 'Home', ur: 'صفحہ اول' },
  about: { en: 'About Leader', ur: 'تعارف و قیادت' },
  constituency: { en: 'Constituency Profile', ur: 'حلقہ کا تعارف' },
  map: { en: 'GIS Map', ur: 'حلقہ کا نقشہ' },
  unionCouncils: { en: 'Union Councils', ur: 'یونین کونسلیں' },
  villages: { en: 'Villages & Chaks', ur: 'دیہات و چک' },
  education: { en: 'Education', ur: 'تعلیمی ادارے' },
  healthcare: { en: 'Healthcare', ur: 'صحت کی سہولیات' },
  infrastructure: { en: 'Infrastructure', ur: 'انفراسٹرکچر' },
  agriculture: { en: 'Agro-Economy', ur: 'زراعت و معیشت' },
  projects: { en: 'Development Projects', ur: 'ترقیاتی منصوبے' },
  complaints: { en: 'Public Complaints', ur: 'عوامی شکایات پورٹل' },
  trackComplaint: { en: 'Track Complaint', ur: 'شکایت ٹریک کریں' },
  notices: { en: 'Public Notices', ur: 'سرکاری اعلانات' },
  news: { en: 'News & Media', ur: 'خبریں و اپ ڈیٹس' },
  gallery: { en: 'Media Gallery', ur: 'تصویری گیلری' },
  reports: { en: 'Monthly Reports', ur: 'ماہانہ رپورٹس' },
  contact: { en: 'Contact & Secretariat', ur: 'رابطہ و سیکرٹریٹ' },
  adminLogin: { en: 'Staff Portal', ur: 'اسٹاف پورٹل' },

  // General & Badges
  portalTitle: { en: 'PP-203 Smart Constituency Management & Development Portal', ur: 'پی پی 203 اسمارٹ کانسٹی ٹیونسی مینجمنٹ و ڈویلپمنٹ پورٹل' },
  portalSubtitle: { en: 'Chichawatni, District Sahiwal, Punjab, Pakistan', ur: 'تحصیل چیچہ وطنی، ضلع ساہیوال، پنجاب، پاکستان' },
  verifiedOfficialPortal: { en: 'Verified Public Service Portal', ur: 'تصدیق شدہ عوامی خدمت پورٹل' },
  callHelpline: { en: 'Helpline: +92 300 6902203', ur: 'ہیلپ لائن: 03006902203' },
  whatappChat: { en: 'WhatsApp Helpdesk', ur: 'واٹس ایپ رابطہ' },
  quickKhuliKachehri: { en: 'Public Darbar Every Tue & Thu', ur: 'ہر منگل و جمعرات کھلی کچہری' },

  // Hero Section
  heroBadge: { en: 'Dedicated to PP-203 Chichawatni Development', ur: 'حلقہ پی پی 203 چیچہ وطنی کی فلاح و ترقی کے لیے وقف' },
  heroTitle: { en: 'Empowering Chichawatni Through Transparent Governance', ur: 'شفاف حکمرانی، عوامی خدمت اور دیہی ترقی کا سفر' },
  heroSubtitle: { en: 'Real-time tracking of development projects, citizen grievances, GIS constituency mapping, and transparent public infrastructure monitoring under the leadership of Chaudhry Asad Hanif Jutt.', ur: 'چوہدری اسد حنیف جٹ کی قیادت میں ترقیاتی منصوبوں کی نگرانی، عوامی شکایات کے فوری حل، جی آئی ایس نقشہ جات اور دیہی خوشحالی کا جدید ڈیجیٹل نظام۔' },
  submitGrievanceBtn: { en: 'Submit a Complaint', ur: 'شکایت درج کروائیں' },
  trackGrievanceBtn: { en: 'Track Grievance Status', ur: 'شکایت کا اسٹیٹس دیکھیں' },
  exploreGisMap: { en: 'Explore Interactive GIS Map', ur: 'حلقے کا نقشہ دیکھیں' },

  // Stats Counters
  statUCs: { en: 'Union Councils', ur: 'یونین کونسلیں' },
  statVillages: { en: 'Verified Villages & Chaks', ur: 'تصدیق شدہ دیہات و چک' },
  statPopulation: { en: 'Estimated Constituents', ur: 'تخمینہ آبادی' },
  statProjects: { en: 'Active & Completed Projects', ur: 'ترقیاتی منصوبے' },
  statSchools: { en: 'Registered Schools & Colleges', ur: 'تعلیمی ادارے' },
  statHealth: { en: 'Hospitals & Health Units', ur: 'ہسپتال و بی ایچ یو' },
  statResolutionRate: { en: 'Grievance Resolution Rate', ur: 'شکایات کے حل کی شرح' },

  // Complaints
  complaintFormTitle: { en: 'Public Grievance Redressal Form', ur: 'عوامی شکایت کے اندراج کا فارم' },
  citizenName: { en: 'Citizen Full Name', ur: 'شہری کا مکمل نام' },
  mobileNumber: { en: 'Mobile Number (for SMS & Tracking)', ur: 'موبائل نمبر (اطلاع و ٹریکنگ کے لیے)' },
  selectUC: { en: 'Select Union Council', ur: 'یونین کونسل منتخب کریں' },
  localityPlaceholder: { en: 'Specific village, chak or street address', ur: 'مخصوص گاؤں، چک یا محلہ کا نام' },
  category: { en: 'Category', ur: 'شکایت کا شعبہ' },
  issueDescription: { en: 'Detailed Description of the Issue', ur: 'مسئلے کی مکمل تفصیل' },
  consentCheck: { en: 'I confirm that this grievance is genuine and authorize the Secretariat to contact me for verification.', ur: 'میں تصدیق کرتا ہوں کہ یہ شکایت درست ہے اور سیکرٹریٹ کو رابطے کی اجازت دیتا ہوں۔' },
  submitComplaint: { en: 'Submit Grievance to Secretariat', ur: 'شکایت سیکرٹریٹ میں جمع کروائیں' },
  trackingModalTitle: { en: 'Track Citizen Complaint Status', ur: 'شہری شکایت کا اسٹیٹس ٹریک کریں' },
  enterTrackingId: { en: 'Enter Tracking ID (e.g., PP203-2026-1042)', ur: 'شکایت نمبر درج کریں (مثلاً PP203-2026-1042)' },
  enterMobileVerify: { en: 'Enter Registered Mobile Number', ur: 'رجسٹرڈ موبائل نمبر درج کریں' },
  trackNow: { en: 'Verify & Track', ur: 'تصدیق اور ٹریک کریں' },
  trackingNotice: { en: 'For privacy, complaint details are accessible only with the matching registered phone number.', ur: 'رازداری کے تحفظ کے لیے کوائف صرف درست موبائل نمبر کی تصدیق پر دکھائے جاتے ہیں۔' },

  // Projects
  allCategories: { en: 'All Categories', ur: 'تمام شعبہ جات' },
  allStatuses: { en: 'All Statuses', ur: 'تمام صورتحال' },
  budget: { en: 'Budget', ur: 'بجٹ' },
  department: { en: 'Department', ur: 'متعلقہ محکمہ' },
  progress: { en: 'Progress', ur: 'پیش رفت' },
  viewDetails: { en: 'View Project Details', ur: 'تفصیلات دیکھیں' },

  // Disclaimer
  disclaimerText: { en: 'Official Data Disclaimer: This portal operates for public constituent outreach, grievance facilitation, and civic information under Chaudhry Asad Hanif Jutt. It is not a substitutive state gazette. All metrics reflect currently verified database records.', ur: 'سرکاری ڈس کلیمر: یہ پورٹل چوہدری اسد حنیف جٹ کے عوامی رابطہ و شکایات کے ازالے کے لیے ہے۔ تمام معلومات تصدیق شدہ ڈیٹا کی بنیاد پر ہیں۔' }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  isRTL: false,
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pp203_lang') as Language) || 'en';
  });

  const isRTL = language === 'ur';

  useEffect(() => {
    localStorage.setItem('pp203_lang', language);
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
