import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ComplaintCategory } from '../types';
import { ComplaintTracking } from './ComplaintTracking';
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
  Clock
} from 'lucide-react';

interface ComplaintPortalProps {
  initialMode?: 'submit' | 'track';
  initialTrackingId?: string;
}

export const ComplaintPortal: React.FC<ComplaintPortalProps> = ({
  initialMode = 'submit',
  initialTrackingId = ''
}) => {
  const { language, t } = useLanguage();
  const { unionCouncils, submitComplaint } = useData();

  const [mode, setMode] = useState<'submit' | 'track'>(initialMode);
  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtTehsil, setDistrictTehsil] = useState('Chichawatni, District Sahiwal');
  const [unionCouncil, setUnionCouncil] = useState('');
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads & Infrastructure');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitHashRef = useRef<string>('');
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<string>(initialTrackingId);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const categories: { id: ComplaintCategory; labelEn: string; labelUr: string }[] = [
    { id: 'Roads & Infrastructure', labelEn: 'Roads & Infrastructure', labelUr: 'سڑکیں اور انفراسٹرکچر' },
    { id: 'Water Supply', labelEn: 'Clean Water & RO Plants', labelUr: 'صاف پانی اور فلٹریشن' },
    { id: 'Sanitation & Sewerage', labelEn: 'Sanitation & Sewerage', labelUr: 'سیوریج و نکاسی آب' },
    { id: 'Electricity', labelEn: 'Electricity & Transformers', labelUr: 'بجلی و ٹرانسفارمر' },
    { id: 'Healthcare Facilities', labelEn: 'Healthcare Facilities', labelUr: 'ہسپتال و مراکزِ صحت' },
    { id: 'Education Concerns', labelEn: 'Education Concerns', labelUr: 'اسکول و تعلیمی مسائل' },
    { id: 'Agriculture & Irrigation', labelEn: 'Agriculture & Irrigation', labelUr: 'نہری پانی و زراعت' },
    { id: 'Other Public Service', labelEn: 'Other Public Service', labelUr: 'دیگر عوامی مسائل' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    if (citizenName.trim().length < 2) {
      setErrorMsg(language === 'ur' ? 'براہ کرم اپنا مکمل نام درج کریں۔' : 'Please enter your full name.');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg(
        language === 'ur'
          ? 'براہ کرم درست موبائل نمبر درج کریں۔'
          : 'Please provide a valid mobile number (at least 10 digits).'
      );
      return;
    }
    if (!districtTehsil.trim()) {
      setErrorMsg(language === 'ur' ? 'ضلع و تحصیل درج کریں۔' : 'Please provide District / Tehsil.');
      return;
    }
    if (!unionCouncil.trim()) {
      setErrorMsg(language === 'ur' ? 'علاقہ یا یونین کونسل منتخب کریں۔' : 'Please select Area / Union Council.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMsg(
        language === 'ur'
          ? 'براہ کرم مسئلے کی کم از کم 10 حروف پر مشتمل وضاحت درج کریں۔'
          : 'Please provide a clear description (at least 10 characters).'
      );
      return;
    }
    if (!consent) {
      setErrorMsg(
        language === 'ur' ? 'براہ کرم تصدیقی باکس منتخب کریں۔' : 'Please confirm accuracy using the checkbox below.'
      );
      return;
    }

    const submitSignature = `${phone.trim()}|${category}|${description.trim().slice(0, 60)}`;
    if (lastSubmitHashRef.current === submitSignature) {
      setErrorMsg(
        language === 'ur'
          ? 'یہ شکایت ابھی درج کی جا چکی ہے۔ براہ کرم ٹریکنگ آئی ڈی محفوظ رکھیں۔'
          : 'This complaint was already submitted in this session.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitComplaint({
        citizenName: citizenName.trim(),
        phone: phone.trim(),
        districtTehsil: districtTehsil.trim(),
        unionCouncil: unionCouncil.trim(),
        locality: locality.trim() || unionCouncil.trim(),
        category,
        description: description.trim(),
        priority: 'Normal'
      });
      lastSubmitHashRef.current = submitSignature;
      setSubmittedComplaintId(created.trackingId);
    } catch (err) {
      console.error('Complaint submission error:', err);
      setErrorMsg(
        language === 'ur'
          ? 'شکایت محفوظ کرنے میں عارضی مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Could not submit your complaint at this moment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (submittedComplaintId) {
      navigator.clipboard.writeText(submittedComplaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#C9A227] shrink-0" />
          <span>{language === 'ur' ? 'عوامی شکایات پورٹل' : 'Citizen Public Service Portal'}</span>
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
          {language === 'ur'
            ? 'شکایت کا اندراج اور آن لائن ٹریکنگ'
            : 'Citizen Grievance Redressal & Tracking'}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto mt-1.5 leading-relaxed">
          {language === 'ur'
            ? 'حلقہ پی پی 203 چیچہ وطنی کے شہری اپنی شکایات درج کروائیں اور ٹریکنگ نمبر کے ذریعے فوری پیش رفت دیکھیں۔'
            : 'Submit constituent issues directly to the Secretariat of Chaudhry Asad Hanif Jutt and track real-time department referral status.'}
        </p>

        {/* Submit / Track Mode Switch */}
        <div className="inline-flex bg-white border border-slate-200 p-1 rounded-xl mt-5 shadow-xs">
          <button
            type="button"
            onClick={() => setMode('submit')}
            className={`min-h-[44px] px-5 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              mode === 'submit'
                ? 'bg-[#123B28] text-white'
                : 'text-slate-600 hover:text-[#123B28]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#C9A227]" />
            <span>{t('submitGrievanceBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('track')}
            className={`min-h-[44px] px-5 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              mode === 'track'
                ? 'bg-[#123B28] text-white'
                : 'text-slate-600 hover:text-[#123B28]'
            }`}
          >
            <Search className="w-4 h-4 text-[#C9A227]" />
            <span>{t('trackGrievanceBtn')}</span>
          </button>
        </div>
      </div>

      {mode === 'track' ? (
        <ComplaintTracking initialTrackingId={activeTrackId} />
      ) : submittedComplaintId ? (
        <div className="bg-white border-2 border-[#087A43] rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-md">
          <div className="w-14 h-14 bg-[#087A43] text-white rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28]">
            {language === 'ur'
              ? 'آپ کی شکایت کامیابی سے درج کر لی گئی ہے'
              : 'Complaint Successfully Registered'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {language === 'ur'
              ? 'اپنا ٹریکنگ نمبر محفوظ کر لیں تاکہ آپ کسی بھی وقت آن لائن اسٹیٹس معلوم کر سکیں۔'
              : 'Save your unique Tracking ID below to monitor review and department referral status online.'}
          </p>

          <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-4 max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="text-left rtl:text-right min-w-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                {language === 'ur' ? 'ٹریکنگ آئی ڈی' : 'Official Tracking ID'}
              </span>
              <div className="text-lg sm:text-xl font-mono font-extrabold text-[#087A43] truncate tabular-nums">
                {submittedComplaintId}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#123B28] hover:bg-[#087A43] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTrackId(submittedComplaintId);
                setMode('track');
              }}
              className="min-h-[46px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#C9A227]" />
              <span>{t('trackNow')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmittedComplaintId(null);
                setCitizenName('');
                setPhone('');
                setDescription('');
                setLocality('');
                setConsent(false);
              }}
              className="min-h-[46px] bg-white border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
            >
              {language === 'ur' ? 'نئی شکایت درج کریں' : 'Submit Another Complaint'}
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-5"
        >
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm font-mono bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                {t('districtTehsil')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={districtTehsil}
                onChange={(e) => setDistrictTehsil(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                {t('selectUC')} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={unionCouncil}
                onChange={(e) => setUnionCouncil(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-slate-800 min-h-[44px]"
              >
                <option value="">
                  {language === 'ur' ? '-- یونین کونسل منتخب کریں --' : '-- Select Union Council --'}
                </option>
                {unionCouncils.map((uc) => (
                  <option key={uc.code} value={uc.code}>
                    {uc.code} — {language === 'ur' ? uc.nameUrdu : uc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
              {t('localityPlaceholder')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ur' ? 'چک 168/9-ایل یا مین بازار' : 'e.g. Chak 168/9-L or Purana Bazaar'}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-2">
              {t('category')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`min-h-[44px] px-3 py-2 text-xs rounded-xl border text-left rtl:text-right transition cursor-pointer ${
                    category === cat.id
                      ? 'border-[#087A43] bg-emerald-50 text-[#123B28] font-bold'
                      : 'border-slate-200 bg-[#F7F9F7] hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {language === 'ur' ? cat.labelUr : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
              {t('issueDescription')} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder={
                language === 'ur'
                  ? 'مسئلے اور مقام کی واضح تفصیل تحریر کریں۔'
                  : 'Describe the issue, exact location/street, and impact on constituents.'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white leading-relaxed min-h-[110px]"
            />
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#F7F9F7] rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="consent-check"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-[#087A43] focus:ring-[#087A43] border-slate-300 shrink-0"
            />
            <label htmlFor="consent-check" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
              {t('consentCheck')}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {language === 'ur'
                  ? 'فوری ٹریکنگ نمبر جاری کیا جاتا ہے'
                  : 'Instant Tracking ID generated upon submission'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] bg-[#087A43] hover:bg-[#123B28] disabled:opacity-60 text-white font-bold px-7 py-3 rounded-xl transition shadow-sm inline-flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>
                {isSubmitting
                  ? language === 'ur'
                    ? 'محفوظ کیا جا رہا ہے...'
                    : 'Submitting...'
                  : t('submitComplaint')}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
