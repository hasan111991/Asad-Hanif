import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const { complaints, projects, unionCouncils } = useData();

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Referred to Department').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Public Transparency & Audit</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {language === 'ur' ? 'ماہانہ کارکردگی و عوامی رپورٹس' : 'Monthly Performance & Public Service Metrics'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {language === 'ur'
              ? 'پی پی 203 کے تمام یونین کونسلوں کی شکایات کا ازالہ، منصوبوں پر کام کی رفتار اور سرکاری فنڈز کے شفاف کوائف۔'
              : 'Verifiable accountability metrics on citizen grievances, departmental referrals, and development progress across Chichawatni.'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="min-h-[44px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs shrink-0 active:scale-98"
        >
          <Printer className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* KPI Cards (1-col on 320px, 2-col on 375px–767px, 4-col on desktop) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Total Grievances Logged</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalComplaints}</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">100% Digitally Tracked</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Resolved by Secretariat</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#087A43] mt-1">{resolvedComplaints}</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">Verified with Citizen</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Active Referrals</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{inProgressComplaints}</div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">Under Direct Follow-up</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Resolution Rate</span>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{resolutionRate}%</div>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 inline-block">Secretariat Benchmark</span>
        </div>
      </div>

      {/* Union Council Grievance Breakdown: Mobile Cards + Desktop Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            {language === 'ur' ? 'یونین کونسل وار شکایات و ترقیاتی جائزہ' : 'Union Council Performance Breakdown'}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Current Quarter</span>
        </div>

        {/* Mobile View (< sm): Responsive Cards */}
        <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
          {unionCouncils.map((uc) => {
            const ucComplaints = complaints.filter(c => c.unionCouncil === uc.code);
            return (
              <div key={uc.id} className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {uc.code} — {language === 'ur' ? uc.nameUrdu : uc.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    uc.type === 'Urban' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {uc.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div><strong>Est. Pop:</strong> {uc.estimatedPopulation.toLocaleString()}</div>
                  <div><strong>Grievances:</strong> <span className="text-[#087A43] font-bold">{ucComplaints.length} Logged</span></div>
                </div>

                <div className="text-[11px] text-slate-500">
                  <strong>Focus Area:</strong> {uc.mainIssues[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View (sm and above): Table with Controlled Container */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Union Council</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Est. Population</th>
                <th className="px-5 py-3.5">Active Grievances</th>
                <th className="px-5 py-3.5">Key Focus Area</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {unionCouncils.map((uc) => {
                const ucComplaints = complaints.filter(c => c.unionCouncil === uc.code);
                return (
                  <tr key={uc.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {uc.code} — {language === 'ur' ? uc.nameUrdu : uc.name}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        uc.type === 'Urban' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {uc.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono">{uc.estimatedPopulation.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-[#087A43]">{ucComplaints.length} Logged</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-xs">{uc.mainIssues[0]}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Monitored
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
