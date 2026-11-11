import React from 'react';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'disclaimer' | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-4 sm:p-8 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'disclaimer' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Official Data & Legal Disclaimer</h3>
            </div>
            <p>
              The <strong>PP-203 Smart Constituency Management & Development Portal</strong> is operated to facilitate constituent communication, public grievances, and transparent development tracking for the residents of PP-203 Chichawatni (District Sahiwal, Punjab) under the auspices of <strong>Chaudhry Asad Hanif Jutt</strong>.
            </p>
            <p>
              This portal does not replace the official gazette of the Government of the Punjab or formal notifications issued by statutory administrative departments (C&W, PHED, Irrigation, Health, Education, Revenue). All budgets, progress percentages, and status indicators reflect verified project monitoring reports recorded by our constituency secretariat.
            </p>
            <p>
              No political achievements or official credentials have been fabricated. Information published regarding parliamentary activities is subject to the official records and hansards of the Provincial Assembly of the Punjab.
            </p>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <Lock className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Citizen Privacy & Grievance Protection</h3>
            </div>
            <p>
              Your personal privacy is of paramount importance. When submitting a public grievance or inquiry, your phone number and full name are stored strictly in protected databases and used only to verify your identity and communicate status updates regarding your complaint.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Citizen mobile numbers and personal identity records are never published publicly.</li>
              <li>Complaint tracking requires two-factor validation (Reference Number matching the Registered Mobile Phone).</li>
              <li>Under no circumstances is citizen grievance data shared with third-party advertisers or commercial entities.</li>
            </ul>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Terms & Conditions of Service</h3>
            </div>
            <p>
              By accessing this digital portal, constituents and visitors agree to the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Users must submit accurate and authentic civic grievances. Misuse of the portal to lodge frivolous or defamatory claims is prohibited.</li>
              <li>All GIS map information, Union Council boundaries, and facility pins are provided for civil engagement and baseline community assistance.</li>
              <li>Any unauthorized attempt to breach administrative access controls or tamper with database records is strictly forbidden.</li>
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] bg-[#087A43] text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-[#064D2B] transition active:scale-95 flex items-center justify-center"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
