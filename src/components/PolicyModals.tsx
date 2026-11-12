import React from 'react';
import { PolicyModalType } from '../types';
import { X, ShieldAlert, FileText, Lock, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  type: PolicyModalType | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-8 space-y-4 shadow-2xl relative border-t-4 border-[#C9A227]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#123B28]">
              <Lock className="w-6 h-6 text-[#087A43] shrink-0" />
              <h3 className="font-editorial text-lg font-bold">Privacy Policy</h3>
            </div>
            <p>
              The Office of <strong>Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni)</strong> respects the privacy of every constituent using this portal. Personal information submitted through citizen grievance forms or secretariat contact forms is used exclusively to verify and resolve constituent service requests.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Citizen names, phone numbers, and contact emails are never sold, rented, or publicly listed.</li>
              <li>Aggregate analytics (if enabled) are strictly anonymous and contain zero personally identifiable information (PII).</li>
              <li>Public Tracking ID lookups display only sanitized status, category, and department remarks.</li>
            </ul>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#123B28]">
              <FileText className="w-6 h-6 text-[#087A43] shrink-0" />
              <h3 className="font-editorial text-lg font-bold">Terms of Public Service</h3>
            </div>
            <p>
              This portal serves as the official political representative profile and constituent service hub for <strong>PP-203 Chichawatni, District Sahiwal</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Users must submit truthful civic grievances and respectful constituent inquiries.</li>
              <li>This website is operated by the office of an elected representative and is <strong>not</strong> a government ministry, statutory department, or official provincial gazette.</li>
              <li>Unauthorized attempts to tamper with portal forms or administrative routes are prohibited.</li>
            </ul>
          </div>
        )}

        {type === 'data_protection' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#123B28]">
              <ShieldCheck className="w-6 h-6 text-[#087A43] shrink-0" />
              <h3 className="font-editorial text-lg font-bold">Data Protection Notice</h3>
            </div>
            <p>
              Citizen grievance tickets and appointment inquiries are stored in access-controlled Firebase Cloud Firestore databases protected by strict role-based security rules.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Only authorized Secretariat personnel authenticated via verified accounts can triage and update constituent cases.</li>
              <li>All administrative edits and status transitions are recorded in an immutable audit log.</li>
              <li>Citizens may request corrections or removal of closed inquiry records by contacting the Central Secretariat.</li>
            </ul>
          </div>
        )}

        {type === 'complaint_disclaimer' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#123B28]">
              <ShieldAlert className="w-6 h-6 text-[#C9A227] shrink-0" />
              <h3 className="font-editorial text-lg font-bold">Complaint Submission Disclaimer</h3>
            </div>
            <p>
              Submitting a grievance on this portal creates a constituent service ticket with the Secretariat of <strong>Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni)</strong> to facilitate follow-up and referral with relevant municipal or provincial departments.
            </p>
            <p>
              For life-threatening emergencies, active criminal incidents, or urgent medical trauma, please dial official emergency services (<strong>15 Police</strong> / <strong>1122 Rescue</strong>) immediately rather than waiting for online grievance triage.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] bg-[#123B28] text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-[#087A43] transition cursor-pointer"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
