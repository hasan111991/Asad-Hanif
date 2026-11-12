import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData, PublicComplaintTrackingView } from '../context/DataContext';
import { ComplaintStatus } from '../types';
import {
  FileCheck2,
  Search,
  AlertCircle,
  Building,
  X,
  ShieldCheck
} from 'lucide-react';

interface ComplaintTrackingProps {
  initialTrackingId?: string;
  onClose?: () => void;
}

export const ComplaintTracking: React.FC<ComplaintTrackingProps> = ({
  initialTrackingId = '',
  onClose
}) => {
  const { language, t } = useLanguage();
  const { lookupComplaintByTracking } = useData();

  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [result, setResult] = useState<PublicComplaintTrackingView | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const performLookup = useCallback(
    async (idToSearch: string) => {
      const clean = idToSearch.trim().toUpperCase();
      if (!clean) {
        setErrorMsg(
          language === 'ur' ? 'براہ کرم ٹریکنگ نمبر درج کریں۔' : 'Please enter a valid Tracking ID.'
        );
        return;
      }

      setErrorMsg('');
      setIsSearching(true);
      try {
        const found = await lookupComplaintByTracking(clean);
        if (found) {
          setResult(found);
        } else {
          setResult(null);
          setErrorMsg(
            language === 'ur'
              ? 'اس ٹریکنگ نمبر پر کوئی شکایت نہیں ملی۔ براہ کرم درست نمبر درج کریں (مثلاً CMP-2026-1042)۔'
              : 'No complaint record found for this Tracking ID (e.g. CMP-2026-1042).'
          );
        }
      } catch (err) {
        console.error('Lookup failed:', err);
        setResult(null);
        setErrorMsg(
          language === 'ur'
            ? 'ٹریکنگ سروس عارضی طور پر دستیاب نہیں۔'
            : 'Unable to verify Tracking ID right now. Please try again.'
        );
      } finally {
        setIsSearching(false);
      }
    },
    [lookupComplaintByTracking, language]
  );

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      performLookup(initialTrackingId);
    }
  }, [initialTrackingId, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(trackingId);
  };

  const workflowSteps: { status: ComplaintStatus; labelEn: string; labelUr: string }[] = [
    { status: 'Received', labelEn: 'Received', labelUr: 'موصول شدہ' },
    { status: 'Under Review', labelEn: 'Under Review', labelUr: 'زیر غور' },
    { status: 'Referred to Department', labelEn: 'Referred', labelUr: 'محکمے کو ارسال' },
    { status: 'Resolved', labelEn: 'Resolved', labelUr: 'حل شدہ' },
    { status: 'Closed', labelEn: 'Closed', labelUr: 'بند شدہ' }
  ];

  const getStepIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Received':
        return 0;
      case 'Under Review':
        return 1;
      case 'Referred to Department':
        return 2;
      case 'Resolved':
        return 3;
      case 'Closed':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = result ? getStepIndex(result.status) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 max-w-3xl mx-auto shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#087A43] border border-emerald-200 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#123B28] truncate">
              {t('trackingModalTitle')}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {language === 'ur'
                ? 'ٹریکنگ آئی ڈی کے ذریعے محفوظ اسٹیٹس چیک'
                : 'Privacy-preserving single-ticket lookup · Example: CMP-2026-1042'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('enterTrackingId')}
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm font-mono uppercase bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[46px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="min-h-[46px] bg-[#087A43] hover:bg-[#123B28] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#C9A227]" />
            <span>{isSearching ? 'Searching...' : t('trackNow')}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#087A43] shrink-0" />
          <span>
            {language === 'ur'
              ? 'شہری رازداری کے تحت ذاتی معلومات اور دیگر شکایات کی فہرست ظاہر نہیں کی جاتی۔'
              : 'Citizen names and full contact numbers are masked to protect constituent privacy.'}
          </span>
        </p>
      </form>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && (
        <div className="bg-[#F7F9F7] rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Tracking Reference
              </span>
              <div className="text-base font-mono font-bold text-[#087A43] tabular-nums">
                {result.trackingId}
              </div>
            </div>

            <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#123B28] text-[#C9A227]">
              {result.status}
            </span>
          </div>

          {/* 5-Stage Progress Stepper */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="hidden sm:flex items-center justify-between relative py-2">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200" />
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#087A43] transition-all duration-500"
                style={{ width: `${(currentStep / (workflowSteps.length - 1)) * 90}%` }}
              />
              {workflowSteps.map((step, idx) => {
                const passed = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        passed
                          ? 'bg-[#087A43] text-white ring-4 ring-emerald-50'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}
                    >
                      {passed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 whitespace-nowrap ${
                        active ? 'text-[#123B28] font-bold' : 'text-slate-500'
                      }`}
                    >
                      {language === 'ur' ? step.labelUr : step.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="sm:hidden space-y-1.5">
              {workflowSteps.map((step, idx) => {
                const passed = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div
                    key={step.status}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs ${
                      active
                        ? 'bg-emerald-50 text-[#123B28] font-bold border border-emerald-200'
                        : passed
                        ? 'text-[#087A43]'
                        : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        passed ? 'bg-[#087A43] text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {passed ? '✓' : idx + 1}
                    </span>
                    <span>{language === 'ur' ? step.labelUr : step.labelEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block">Category</span>
              <strong className="text-slate-800">{result.category}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Registered Contact</span>
              <strong className="font-mono text-slate-800">{result.maskedPhone}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Constituency Area</span>
              <strong className="text-slate-800">
                {result.unionCouncil} — {result.locality}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Last Updated</span>
              <strong className="font-mono text-slate-800 tabular-nums">
                {result.updatedAt.split('T')[0]}
              </strong>
            </div>

            {result.departmentReferred && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 block">Referred Department</span>
                <p className="font-bold text-[#087A43] mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span>{result.departmentReferred}</span>
                </p>
              </div>
            )}

            {result.adminRemarks && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 block">Secretariat Remarks</span>
                <p className="text-slate-700 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60 mt-1 leading-relaxed">
                  {result.adminRemarks}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
