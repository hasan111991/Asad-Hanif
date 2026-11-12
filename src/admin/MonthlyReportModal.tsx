import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ProjectStatus } from '../types';
import { X, Printer, BarChart3 } from 'lucide-react';

interface MonthlyReportModalProps {
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ onClose }) => {
  const {
    profile,
    projects,
    complaints,
    assemblyActivities,
    contactMessages,
    notices
  } = useData();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [includeAllDates, setIncludeAllDates] = useState<boolean>(true);

  const monthComplaints = includeAllDates
    ? complaints
    : complaints.filter((c) => c.createdAt.startsWith(selectedMonth));

  const resolvedCount = monthComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const referredCount = monthComplaints.filter(
    (c) => c.status === 'Referred to Department' || c.status === 'Under Review'
  ).length;
  const receivedCount = monthComplaints.filter((c) => c.status === 'Received').length;
  const resolutionRate =
    monthComplaints.length > 0 ? Math.round((resolvedCount / monthComplaints.length) * 100) : 0;

  const projectStatusList: ProjectStatus[] = ['Proposed', 'Approved', 'In Progress', 'Completed'];

  const monthContacts = includeAllDates
    ? contactMessages
    : contactMessages.filter((m) => m.createdAt.startsWith(selectedMonth));

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 shadow-2xl space-y-6 relative my-auto">
        <button
          onClick={onClose}
          className="no-print absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          aria-label="Close report modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Controls Bar */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold text-[#123B28] uppercase tracking-wider">
              Scope:
            </label>
            <button
              type="button"
              onClick={() => setIncludeAllDates(true)}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                includeAllDates
                  ? 'bg-[#123B28] text-white'
                  : 'bg-[#F7F9F7] border border-slate-200 text-slate-700'
              }`}
            >
              Cumulative Record
            </button>
            <button
              type="button"
              onClick={() => setIncludeAllDates(false)}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                !includeAllDates
                  ? 'bg-[#123B28] text-white'
                  : 'bg-[#F7F9F7] border border-slate-200 text-slate-700'
              }`}
            >
              Monthly Filter
            </button>
            {!includeAllDates && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[42px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#C9A227]" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* Report Header */}
        <div className="border-b-2 border-[#123B28] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#C9A227]" />
              <span>Secretariat Public Service Summary</span>
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28] mt-0.5">
              {profile.fullName} — PP-203 Chichawatni Report
            </h3>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums text-left sm:text-right">
            <div>Period: {includeAllDates ? 'Cumulative Live Data' : selectedMonth}</div>
            <div>Generated: {new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 block">Grievances Logged</span>
            <strong className="text-xl sm:text-2xl font-bold text-[#123B28] tabular-nums">
              {monthComplaints.length}
            </strong>
          </div>
          <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 block">Resolution Rate</span>
            <strong className="text-xl sm:text-2xl font-bold text-[#087A43] tabular-nums">
              {resolutionRate}%
            </strong>
          </div>
          <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 block">Development Schemes</span>
            <strong className="text-xl sm:text-2xl font-bold text-[#123B28] tabular-nums">
              {projects.length}
            </strong>
          </div>
          <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 block">Assembly Interventions</span>
            <strong className="text-xl sm:text-2xl font-bold text-[#123B28] tabular-nums">
              {assemblyActivities.length}
            </strong>
          </div>
        </div>

        {/* Two-Column Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-[#123B28] uppercase tracking-wider border-b border-slate-100 pb-2">
              Projects by Status
            </h4>
            {projectStatusList.map((st) => {
              const count = projects.filter((p) => p.status === st).length;
              return (
                <div key={st} className="flex items-center justify-between tabular-nums">
                  <span className="text-slate-600">{st}</span>
                  <strong className="text-[#123B28]">{count}</strong>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-[#123B28] uppercase tracking-wider border-b border-slate-100 pb-2">
              Grievance & Secretariat Breakdown
            </h4>
            <div className="flex items-center justify-between tabular-nums">
              <span className="text-slate-600">Resolved / Closed</span>
              <strong className="text-[#087A43]">{resolvedCount}</strong>
            </div>
            <div className="flex items-center justify-between tabular-nums">
              <span className="text-slate-600">Under Review / Referred</span>
              <strong className="text-amber-700">{referredCount}</strong>
            </div>
            <div className="flex items-center justify-between tabular-nums">
              <span className="text-slate-600">New Received</span>
              <strong className="text-slate-800">{receivedCount}</strong>
            </div>
            <div className="flex items-center justify-between tabular-nums">
              <span className="text-slate-600">Published Notices</span>
              <strong className="text-slate-800">{notices.filter((n) => n.isPublished).length}</strong>
            </div>
            <div className="flex items-center justify-between tabular-nums">
              <span className="text-slate-600">Appointments & Inquiries</span>
              <strong className="text-slate-800">{monthContacts.length}</strong>
            </div>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-600 leading-relaxed">
          <strong className="text-[#123B28]">Official Secretariat Notice:</strong> This summary reflects constituent records managed by the Political Secretariat of Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni, subject to final official verification) and is not a provincial government ministry publication.
        </div>
      </div>
    </div>
  );
};
