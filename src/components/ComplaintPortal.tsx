import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ComplaintCategory } from '../types';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Search,
  Send,
  Phone,
  User,
  MapPin,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ComplaintPortalProps {
  onOpenTracking: (prefilledId?: string) => void;
}

export const ComplaintPortal: React.FC<ComplaintPortalProps> = ({ onOpenTracking }) => {
  const { language, isRTL, t } = useLanguage();
  const { unionCouncils, submitComplaint } = useData();

  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [unionCouncil, setUnionCouncil] = useState('');
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads & Infrastructure');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);

  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const categories: { id: ComplaintCategory; labelEn: string; labelUr: string }[] = [
    { id: 'Roads & Infrastructure', labelEn: 'Roads & Link Infrastructure', labelUr: 'سڑکیں اور انفراسٹرکچر' },
    { id: 'Water Supply', labelEn: 'Clean Drinking Water & RO Plants', labelUr: 'صاف پانی اور فلٹریشن پلانٹس' },
    { id: 'Sanitation & Sewerage', labelEn: 'Sanitation, Drainage & Sewerage', labelUr: 'سیوریج، نالیاں اور صفائی' },
    { id: 'Electricity', labelEn: 'Electricity & Low Voltage Transformers', labelUr: 'بجلی، ٹرانسفارمر اور اسٹریٹ لائٹس' },
    { id: 'Healthcare Facilities', labelEn: 'Healthcare & Hospital Medicine', labelUr: 'ہسپتال، ادویات اور بی ایچ یو' },
    { id: 'Education Concerns', labelEn: 'Schools, Classrooms & Teachers', labelUr: 'اسکول، اساتذہ اور تعلیمی مسائل' },
    { id: 'Agriculture & Irrigation', labelEn: 'Canal Water & Fertilizer Supply', labelUr: 'نہری پانی، کھاد و زرعی مسائل' },
    { id: 'Other Public Service', labelEn: 'Other Public Services', labelUr: 'دیگر عوامی و بلدیاتی مسائل' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!citizenName.trim()) {
      setErrorMsg(language === 'ur' ? 'براہ کرم اپنا نام درج کریں۔' : 'Please provide your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg(language === 'ur' ? 'براہ کرم درست 11 ہندسوں کا موبائل نمبر درج کریں۔' : 'Please provide a valid 11-digit mobile number.');
      return;
    }
    if (!unionCouncil) {
      setErrorMsg(language === 'ur' ? 'براہ کرم متعلقہ یونین کونسل منتخب کریں۔' : 'Please select your Union Council.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMsg(language === 'ur' ? 'براہ کرم مسئلے کی کم از کم 15 حروف پر مشتمل وضاحت لکھیں۔' : 'Please provide a detailed description (at least 15 characters).');
      return;
    }
    if (!consent) {
      setErrorMsg(language === 'ur' ? 'براہ کرم تصدیقی باکس پر کلک کریں۔' : 'Please check the consent box.');
      return;
    }

    const newComp = submitComplaint({
      citizenName: citizenName.trim(),
      phone: phone.trim(),
      unionCouncil,
      locality: locality.trim() || 'PP-203 Chichawatni',
      category,
      description: description.trim(),
      priority: 'Normal'
    });

    setSubmittedComplaintId(newComp.trackingId);
  };

  const handleCopy = () => {
    if (submittedComplaintId) {
      navigator.clipboard.writeText(submittedComplaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>{language === 'ur' ? 'شکایات کا فوری ازالہ' : 'Public Grievance Redressal'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {language === 'ur' ? 'عوامی شکایت پورٹل — حلقہ پی پی 203' : 'Citizen Grievance & Public Service Portal'}
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
          {language === 'ur'
            ? 'سیکرٹریٹ چوہدری اسد حنیف جٹ آپ کے مسائل کے فوری حل کے لیے متحرک ہے۔ تمام شکایات کی براہ راست نگرانی کی جاتی ہے۔'
            : 'Directly file civic, healthcare, road, and water issues. Every submission receives an official tracking ID with verified resolution workflow.'}
        </p>
      </div>

      {/* Success Modal / Banner */}
      {submittedComplaintId ? (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-lg animate-fade-in">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-emerald-950">
            {language === 'ur' ? 'آپ کی شکایت کامیابی کے ساتھ درج کر لی گئی ہے!' : 'Grievance Successfully Registered!'}
          </h3>

          <p className="text-sm text-emerald-800 max-w-lg mx-auto">
            {language === 'ur'
              ? 'شکایت سیکرٹریٹ عملے کو ارسال کر دی گئی ہے۔ آپ کے رجسٹرڈ فون نمبر پر اس شکایت کا اسٹیٹس دیکھا جا سکتا ہے۔'
              : 'Your complaint has been assigned to the relevant department officer. Please save your tracking number for status inquiries.'}
          </p>

          <div className="bg-white border border-emerald-300 rounded-xl p-4 max-w-md mx-auto flex items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                {language === 'ur' ? 'شکایت کا حوالہ نمبر' : 'Complaint Tracking ID'}
              </span>
              <div className="text-xl font-mono font-extrabold text-[#087A43]">
                {submittedComplaintId}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? (language === 'ur' ? 'کاپی ہو گیا' : 'Copied!') : (language === 'ur' ? 'کاپی کریں' : 'Copy ID')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onOpenTracking(submittedComplaintId)}
              className="bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>{t('trackComplaint')}</span>
            </button>
            <button
              onClick={() => {
                setSubmittedComplaintId(null);
                setCitizenName('');
                setPhone('');
                setDescription('');
                setLocality('');
                setConsent(false);
              }}
              className="bg-white border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              {language === 'ur' ? 'نئی شکایت درج کریں' : 'Submit Another Complaint'}
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Citizen Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('citizenName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={language === 'ur' ? 'مثال: محمد احمد' : 'e.g. Muhammad Ahmad'}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('mobileNumber')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Union Council Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('selectUC')} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={unionCouncil}
                onChange={(e) => setUnionCouncil(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition text-slate-800"
              >
                <option value="">{language === 'ur' ? '-- یونین کونسل منتخب کریں --' : '-- Select Union Council --'}</option>
                {unionCouncils.map((uc) => (
                  <option key={uc.code} value={uc.code}>
                    {uc.code} — {language === 'ur' ? uc.nameUrdu : uc.name} ({uc.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Village / Chak / Locality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {language === 'ur' ? 'گاؤں / چک / محلہ' : 'Village / Chak / Locality'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={language === 'ur' ? 'مثلاً: چک 168/9-ایل یا ریلوے بازار' : 'e.g. Chak 168/9-L or Railway Bazaar'}
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('category')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 text-xs rounded-xl border text-left rtl:text-right transition ${
                    category === cat.id
                      ? 'border-[#087A43] bg-emerald-50 text-[#087A43] font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {language === 'ur' ? cat.labelUr : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('issueDescription')} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder={language === 'ur'
                ? 'اپنے مسئلے یا شکایت کی واضح تفصیل تحریر کریں تاکہ متعلقہ محکمہ بروقت کارروائی کر سکے۔'
                : 'Describe the civic problem, exact street/location, how long the issue has persisted, and affected residents.'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition leading-relaxed"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="consent-check"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="consent-check" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              {t('consentCheck')}
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Standard response time: 24–48 hours</span>
            </div>

            <button
              type="submit"
              className="bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-7 py-3 rounded-xl transition shadow-md flex items-center gap-2 text-sm"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{t('submitComplaint')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
