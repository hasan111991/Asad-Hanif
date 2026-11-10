import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { CitizenComplaint, ComplaintStatus } from '../types';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  MapPin,
  Calendar,
  X,
  Phone,
  ShieldAlert
} from 'lucide-react';

interface ComplaintTrackingProps {
  initialTrackingId?: string;
  onClose?: () => void;
}

export const ComplaintTracking: React.FC<ComplaintTrackingProps> = ({ initialTrackingId = '', onClose }) => {
  const { language, t } = useLanguage();
  const { getComplaintByTracking, complaints } = useData();

  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState<CitizenComplaint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      // If we find it in current session data, prefill
      const found = complaints.find(c => c.trackingId.toUpperCase() === initialTrackingId.toUpperCase());
      if (found) {
        setPhone(found.phone);
        setComplaint(found);
        setHasSearched(true);
      }
    }
  }, [initialTrackingId, complaints]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setHasSearched(true);

    if (!trackingId.trim()) {
      setErrorMsg(language === 'ur' ? 'براہ کرم شکایت کا حوالہ نمبر درج کریں۔' : 'Please enter your tracking ID.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(language === 'ur' ? 'رازداری کی تصدیق کے لیے رجسٹرڈ موبائل نمبر درج کریں۔' : 'Please enter the registered mobile number for privacy verification.');
      return;
    }

    const result = getComplaintByTracking(trackingId.trim(), phone.trim());
    if (result) {
      setComplaint(result);
    } else {
      setComplaint(null);
      setErrorMsg(
        language === 'ur'
          ? 'کوئی ریکارڈ نہیں ملا۔ براہ کرم تصدیق کریں کہ شکایت نمبر اور فون نمبر درست ہیں۔'
          : 'No complaint found matching this Tracking ID and Phone Number combination. Please verify your credentials.'
      );
    }
  };

  const workflowSteps: { status: ComplaintStatus; labelEn: string; labelUr: string }[] = [
    { status: 'Received', labelEn: 'Received', labelUr: 'موصول شدہ' },
    { status: 'Under Review', labelEn: 'Under Review', labelUr: 'زیر غور' },
    { status: 'Referred to Department', labelEn: 'Referred to Dept', labelUr: 'متعلقہ محکمے کو ارسال' },
    { status: 'In Progress', labelEn: 'In Progress', labelUr: 'کارروائی جاری' },
    { status: 'Resolved', labelEn: 'Resolved', labelUr: 'مسئلہ حل شدہ' }
  ];

  const getStepIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Received': return 0;
      case 'Under Review':
      case 'Verified': return 1;
      case 'Assigned':
      case 'Referred to Department': return 2;
      case 'In Progress': return 3;
      case 'Resolved':
      case 'Closed': return 4;
      default: return 0;
    }
  };

  const currentStep = complaint ? getStepIndex(complaint.status) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-md">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('trackingModalTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ur' ? 'محفوظ ڈیجیٹل ٹریکنگ سسٹم' : 'Secure Verification & Audit Trail'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Verification Search Form */}
      <form onSubmit={handleTrack} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {language === 'ur' ? 'شکایت حوالہ نمبر' : 'Tracking Reference ID'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. PP203-2026-1042"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {language === 'ur' ? 'رجسٹرڈ موبائل نمبر' : 'Registered Mobile Number'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('trackingNotice')}</span>
          </p>

          <button
            type="submit"
            className="bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm transition flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>{t('trackNow')}</span>
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaint Result Card */}
      {complaint && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {language === 'ur' ? 'شکایت نمبر' : 'Tracking Reference'}
              </span>
              <div className="text-base font-mono font-bold text-[#087A43]">
                {complaint.trackingId}
              </div>
            </div>

            <div className="text-right rtl:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {language === 'ur' ? 'موجودہ صورتحال' : 'Current Status'}
              </span>
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : complaint.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {complaint.status}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Workflow */}
          <div className="py-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 -z-0 transition-all duration-500"
                style={{ width: `${(currentStep / (workflowSteps.length - 1)) * 100}%` }}
              />

              {workflowSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isPassed
                          ? 'bg-[#087A43] text-white ring-4 ring-emerald-50'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent ? 'text-emerald-800 font-bold' : 'text-slate-500'
                    }`}>
                      {language === 'ur' ? step.labelUr : step.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grievance Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium">Citizen Name:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{complaint.citizenName}</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Union Council & Locality:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{complaint.unionCouncil} — {complaint.locality}</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Category:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{complaint.category}</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Submission Date:</span>
              <p className="font-semibold text-slate-800 mt-0.5 font-mono">{complaint.createdAt.split('T')[0]}</p>
            </div>

            {complaint.departmentReferred && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Referred Department:</span>
                <p className="font-semibold text-emerald-800 mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{complaint.departmentReferred}</span>
                </p>
              </div>
            )}

            {complaint.assignedOfficer && (
              <div>
                <span className="text-slate-400 font-medium">Assigned Officer:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{complaint.assignedOfficer}</p>
              </div>
            )}

            {complaint.adminRemarks && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Secretariat Action Remarks:</span>
                <p className="text-slate-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 mt-1 leading-relaxed">
                  {complaint.adminRemarks}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
