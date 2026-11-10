import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const { complaints, projects, unionCouncils, education, healthcare } = useData();

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Referred to Department').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Public Transparency & Audit</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'ur' ? 'ماہانہ کارکردگی و عوامی رپورٹس' : 'Monthly Performance & Public Service Metrics'}
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            {language === 'ur'
              ? 'پی پی 203 کے تمام یونین کونسلوں کی شکایات کا ازالہ، منصوبوں پر کام کی رفتار اور سرکاری فنڈز کے شفاف کوائف۔'
              : 'Verifiable accountability metrics on citizen grievances, departmental referrals, and development progress across Chichawatni.'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-xs shrink-0"
        >
          <Printer className="w-4 h-4 text-emerald-700" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Total Grievances Logged</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalComplaints}</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">100% Digitally Tracked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Resolved by Secretariat</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#087A43] mt-1">{resolvedComplaints}</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">Verified with Citizen</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Active Departmental Referrals</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{inProgressComplaints}</div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">Under Direct Follow-up</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Overall Resolution Rate</span>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{resolutionRate}%</div>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 inline-block">Secretariat Benchmark</span>
        </div>
      </div>

      {/* Union Council Grievance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {language === 'ur' ? 'یونین کونسل وار شکایات و ترقیاتی جائزہ' : 'Union Council Performance Breakdown'}
          </h3>
          <span className="text-xs text-slate-400">Current Quarter Record</span>
        </div>

        <div className="overflow-x-auto">
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
