import React, { useMemo, useState } from 'react';
import { useCityData } from '../../context/CityDataContext';
import { CITY_REPORT_TYPES, OFFICIAL_APPROVED_PROJECT_STATUSES } from '../../data/cityManagementData';
import { CityReport, CityReportType } from '../../types';
import { ConfirmDeleteModal, EmptyVerifiedDataNotice, formatPkr } from './CitySharedUI';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Globe,
  Sparkles,
  Send,
  Trash2,
  Megaphone,
  ShieldAlert
} from 'lucide-react';

interface CityReportsAndAIModuleProps {
  section: 'reports' | 'ai';
}

export const CityReportsAndAIModule: React.FC<CityReportsAndAIModuleProps> = ({ section }) => {
  const {
    cityAreas,
    cityRoads,
    cityWaterFacilities,
    citySewerageAssets,
    cityWasteRoutes,
    cityAssets,
    cityProjects,
    cityBudgets,
    cityComplaints,
    cityReports,
    cityNotices,
    saveCityReport,
    deleteCityReport,
    saveCityNotice,
    deleteCityNotice
  } = useCityData();

  // Reports State
  const [repType, setRepType] = useState<CityReportType>('Monthly Department Performance Report');
  const [repPeriod, setRepPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [repSource, setRepSource] = useState('Chichawatni Live Firestore Registry');
  const [repDept, setRepDept] = useState('Municipal Coordination Desk');
  const [repVerStatus, setRepVerStatus] = useState<CityReport['verificationStatus']>('Provisional');
  const [repPublish, setRepPublish] = useState(false);

  // City Notice quick state
  const [nTitle, setNTitle] = useState('');
  const [nDesc, setNDesc] = useState('');
  const [nCat, setNCat] = useState('Municipal Advisory');

  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'report' | 'notice'; id: string; label: string } | null>(null);

  // AI Assistant State
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; mode?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Chichawatni City Master Plan Assistant ready. Ask about 2027–2030 sector priorities, critical road/drainage backlogs, verified vs proposed funding separation, or open citizen complaints. All answers cite exact database record IDs and never invent unverified data.'
    }
  ]);

  const computeLiveReportSummary = (type: CityReportType) => {
    const realProj = cityProjects.filter((p) => !p.isSampleTemplate);
    const approvedProj = realProj.filter((p) => OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status));
    const critRoads = cityRoads.filter((r) => r.condition === 'Poor' || r.condition === 'Critical');
    const resolvedComp = cityComplaints.filter((c) => c.status === 'Resolved');
    const approvedFunds = cityBudgets.filter((b) => b.fundingStage === 'Approved').reduce((s, b) => s + b.amountPkr, 0);
    const releasedFunds = cityBudgets.filter((b) => b.fundingStage === 'Released').reduce((s, b) => s + b.amountPkr, 0);
    const proposedFunds = cityBudgets.filter((b) => b.fundingStage === 'Proposed' || b.fundingStage === 'Requested').reduce((s, b) => s + b.amountPkr, 0);

    return `${type} (${repPeriod}) — Areas Mapped: ${cityAreas.length}; Roads Assessed: ${cityRoads.length} (${critRoads.length} Poor/Critical); Water Facilities: ${cityWaterFacilities.length}; Sewerage Assets: ${citySewerageAssets.length}; Sanitation Routes: ${cityWasteRoutes.length}; City Projects (Real/Approved/Templates): ${realProj.length}/${approvedProj.length}/${cityProjects.length - realProj.length}; Citizen Complaints: ${cityComplaints.length} (${resolvedComp.length} Resolved); Approved Budget: ${formatPkr(approvedFunds)} | Released: ${formatPkr(releasedFunds)} | Proposed Unapproved: ${formatPkr(proposedFunds)}.`;
  };

  const exportReportFile = (r: CityReport, format: 'csv' | 'xls') => {
    const rows = [
      ['Field', 'Value'],
      ['Title', r.title],
      ['Report Type', r.reportType],
      ['Reporting Period', r.period],
      ['Data Source', r.dataSource],
      ['Department', r.department],
      ['Verification Status', r.verificationStatus],
      ['Published Publicly', r.isPublished ? 'Yes' : 'No (Internal Only)'],
      ['Last Updated', r.lastUpdated],
      ['Summary', r.summary]
    ];
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const content = rows.map((row) => row.map(esc).join(format === 'csv' ? ',' : '\t')).join('\n');
    const blob = new Blob([content], {
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.reportType.replace(/\s+/g, '-')}-${r.period}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReportPdf = (r: CityReport) => {
    const html = `
      <!doctype html>
      <html>
      <head><title>${r.title}</title></head>
      <body style="font-family: sans-serif; padding: 36px; color: #123B28;">
        <h2 style="margin-bottom:4px;">Chichawatni City Management — Performance Report</h2>
        <div style="font-size:13px; color:#087A43; font-weight:bold;">${r.reportType}</div>
        <hr style="margin:16px 0; border:1px solid #C9A227;" />
        <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:16px;">
          <tr><td><strong>Period:</strong> ${r.period}</td><td><strong>Department:</strong> ${r.department}</td></tr>
          <tr><td><strong>Data Source:</strong> ${r.dataSource}</td><td><strong>Verification:</strong> ${r.verificationStatus}</td></tr>
          <tr><td><strong>Last Updated:</strong> ${r.lastUpdated}</td><td><strong>Visibility:</strong> ${r.isPublished ? 'Public' : 'Internal'}</td></tr>
        </table>
        <div style="padding:16px; background:#F7F9F7; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; line-height:1.6;">
          ${r.summary}
        </div>
        <p style="font-size:11px; color:#64748b; margin-top:24px;">Note: Official representative profile & portal of Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni) — not a government department portal.</p>
        <script>window.print();</script>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const buildDatabaseContextSnapshot = useMemo(() => {
    const realProjects = cityProjects.filter((p) => !p.isSampleTemplate);
    return {
      generatedAt: new Date().toISOString(),
      counts: {
        areas: cityAreas.length,
        roads: cityRoads.length,
        roadsPoorOrCritical: cityRoads.filter((r) => r.condition === 'Poor' || r.condition === 'Critical').length,
        waterFacilities: cityWaterFacilities.length,
        sewerageAssets: citySewerageAssets.length,
        blockedDrainsOrFloodHotspots: citySewerageAssets.filter((s) => s.condition === 'Blocked').length,
        wasteRoutes: cityWasteRoutes.length,
        parksHealthEduMarkets: cityAssets.length,
        realCityProjects: realProjects.length,
        sampleTemplates: cityProjects.length - realProjects.length,
        complaintsTotal: cityComplaints.length,
        complaintsPending: cityComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected').length
      },
      areas: cityAreas.slice(0, 20).map((a) => ({ id: a.id, wardCode: a.wardCode, name: a.name, pop: a.populationVerified })),
      criticalRoads: cityRoads
        .filter((r) => r.condition === 'Poor' || r.condition === 'Critical')
        .slice(0, 25)
        .map((r) => ({ id: r.id, name: r.name, locality: r.locality, condition: r.condition, priority: r.maintenancePriority })),
      projects: realProjects.slice(0, 40).map((p) => ({
        id: p.id,
        code: p.projectCode,
        name: p.name,
        sector: p.sector,
        status: p.status,
        priority: p.priority,
        year: p.targetYear,
        estPkr: p.estimatedCostPkr,
        apprPkr: p.approvedCostPkr,
        prog: p.physicalProgressPercent
      })),
      budgets: cityBudgets.slice(0, 30).map((b) => ({
        id: b.id,
        title: b.title,
        stage: b.fundingStage,
        source: b.fundingSource,
        amountPkr: b.amountPkr
      })),
      recentComplaints: cityComplaints.slice(0, 30).map((c) => ({
        trackingId: c.trackingId,
        category: c.category,
        locality: c.locality,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt.slice(0, 10)
      }))
    };
  }, [cityAreas, cityRoads, cityWaterFacilities, citySewerageAssets, cityWasteRoutes, cityAssets, cityProjects, cityBudgets, cityComplaints]);

  const buildLocalDeterministicAnswer = (userQ: string): string => {
    const c = buildDatabaseContextSnapshot.counts;
    const criticalList = buildDatabaseContextSnapshot.criticalRoads
      .slice(0, 5)
      .map((r) => `${r.name} [${r.id}] (${r.condition})`)
      .join(', ');
    const openComplaintsList = buildDatabaseContextSnapshot.recentComplaints
      .filter((x) => x.status !== 'Resolved')
      .slice(0, 5)
      .map((x) => `${x.trackingId} (${x.category} - ${x.locality}, ${x.status})`)
      .join('; ');
    return [
      `[Deterministic Firestore Query Summary — Static/Offline Fallback Mode]`,
      `Query: "${userQ}"`,
      `1. Verified Database Totals (${buildDatabaseContextSnapshot.generatedAt.slice(0, 10)}):`,
      `   - Mapped Areas: ${c.areas} | Roads: ${c.roads} (${c.roadsPoorOrCritical} Poor/Critical) | Water Units: ${c.waterFacilities} | Sewerage Assets: ${c.sewerageAssets} (${c.blockedDrainsOrFloodHotspots} Blocked)`,
      `   - Real City Projects: ${c.realCityProjects} (plus ${c.sampleTemplates} sample planning templates) | Open Complaints: ${c.complaintsPending}/${c.complaintsTotal}`,
      `2. Highlighted Records: ${criticalList || 'No Poor/Critical roads currently flagged in DB.'}`,
      `3. Pending Complaints: ${openComplaintsList || 'No open municipal complaints currently in DB.'}`,
      `4. Missing Data Notice: AI Gemini live reasoning requires the Express server route (/api/city-assistant) with GEMINI_API_KEY configured. On pure static hosts (such as GitHub Pages), only verified live Firestore record summaries are returned — zero estimates or budgets are fabricated.`
    ].join('\n');
  };

  const sendAiPrompt = async (textToSend?: string) => {
    const q = (textToSend ?? prompt).trim();
    if (!q || aiLoading) return;
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAiLoading(true);

    const isStaticHost = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
    if (isStaticHost) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: buildLocalDeterministicAnswer(q), mode: 'Offline DB Summary' }
      ]);
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch('./api/city-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: buildDatabaseContextSnapshot })
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: buildLocalDeterministicAnswer(q), mode: 'Offline DB Summary' }
        ]);
      } else {
        const data = (await res.json()) as { answer?: string; error?: string };
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.answer || data.error || buildLocalDeterministicAnswer(q),
            mode: 'Gemini Grounded Analysis'
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: buildLocalDeterministicAnswer(q), mode: 'Offline DB Summary' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (section === 'reports') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#087A43]" />
            <div>
              <h2 className="font-editorial text-lg font-bold text-[#123B28]">City Performance Reports & Exports (10 Report Types)</h2>
              <p className="text-xs text-slate-500">Every generated report embeds period, data source, department, last updated, and verification status. Export to CSV, Excel, or PDF.</p>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveCityReport({
                reportType: repType,
                title: `${repType} — ${repPeriod}`,
                period: repPeriod,
                dataSource: repSource.trim(),
                department: repDept.trim(),
                verificationStatus: repVerStatus,
                isPublished: repPublish,
                summary: computeLiveReportSummary(repType)
              });
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200"
          >
            <select value={repType} onChange={(e) => setRepType(e.target.value as CityReportType)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              {CITY_REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" required value={repPeriod} onChange={(e) => setRepPeriod(e.target.value)} placeholder="Period (e.g. 2026-11 / Q1 2027)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" required value={repDept} onChange={(e) => setRepDept(e.target.value)} placeholder="Lead Department" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" required value={repSource} onChange={(e) => setRepSource(e.target.value)} placeholder="Verified Data Source" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={repVerStatus} onChange={(e) => setRepVerStatus(e.target.value as CityReport['verificationStatus'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Draft">Verification: Draft</option>
              <option value="Provisional">Verification: Provisional</option>
              <option value="Verified">Verification: Verified</option>
            </select>
            <label className="inline-flex items-center gap-2 font-semibold text-[#123B28] px-2 cursor-pointer">
              <input type="checkbox" checked={repPublish} onChange={(e) => setRepPublish(e.target.checked)} className="accent-[#087A43]" />
              <span>Publish to Public City Portal</span>
            </label>
            <button type="submit" className="sm:col-span-2 lg:col-span-3 min-h-[40px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
              Generate Snapshot Report from Live Database
            </button>
          </form>

          {cityReports.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Reports Generated Yet" description="Select any of the 10 municipal report templates above to compile verified statistics from Firestore." />
          ) : (
            <div className="space-y-3 text-xs">
              {cityReports.map((r) => (
                <div key={r.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#123B28]">{r.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Period: {r.period} · Source: {r.dataSource} · Dept: {r.department} · Verification: <strong>{r.verificationStatus}</strong> ·{' '}
                        <span className={r.isPublished ? 'text-[#087A43] font-bold' : 'text-amber-700 font-bold'}>
                          {r.isPublished ? 'Published Publicly' : 'Internal Only'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => exportReportFile(r, 'csv')} className="px-2.5 py-1.5 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold inline-flex items-center gap-1 cursor-pointer"><Download className="w-3.5 h-3.5" /> CSV</button>
                      <button type="button" onClick={() => exportReportFile(r, 'xls')} className="px-2.5 py-1.5 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold inline-flex items-center gap-1 cursor-pointer"><Download className="w-3.5 h-3.5" /> Excel</button>
                      <button type="button" onClick={() => printReportPdf(r)} className="px-2.5 py-1.5 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold inline-flex items-center gap-1 cursor-pointer"><Printer className="w-3.5 h-3.5" /> PDF</button>
                      <button
                        type="button"
                        onClick={() => saveCityReport({ ...r, isPublished: !r.isPublished }, r.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#123B28] text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>{r.isPublished ? 'Unpublish' : 'Publish'}</span>
                      </button>
                      <button type="button" onClick={() => setDeleteTarget({ kind: 'report', id: r.id, label: r.title })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-slate-600 bg-[#F7F9F7] p-3 rounded-xl">{r.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City Public Notices Manager */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#C9A227]" />
            <h3 className="font-bold text-base text-[#123B28]">City Public Notices & Service Advisories ({cityNotices.length})</h3>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveCityNotice({
                title: nTitle.trim(),
                category: nCat,
                publishDate: new Date().toISOString().slice(0, 10),
                description: nDesc.trim(),
                isPublished: true
              });
              setNTitle('');
              setNDesc('');
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200"
          >
            <input type="text" required value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="City Advisory Title" className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={nCat} onChange={(e) => setNCat(e.target.value)} placeholder="Category" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <button type="submit" className="min-h-[38px] bg-[#087A43] text-white font-bold rounded-xl cursor-pointer">Publish City Notice</button>
            <input type="text" required value={nDesc} onChange={(e) => setNDesc(e.target.value)} placeholder="Advisory description for citizens..." className="sm:col-span-4 px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          </form>
          <div className="divide-y divide-slate-100 text-xs">
            {cityNotices.map((n) => (
              <div key={n.id} className="py-2.5 flex justify-between items-center gap-2">
                <div>
                  <strong className="text-[#123B28]">{n.title}</strong> <span className="text-slate-400">({n.publishDate})</span>
                  <div className="text-slate-600">{n.description}</div>
                </div>
                <button type="button" onClick={() => setDeleteTarget({ kind: 'notice', id: n.id, label: n.title })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        <ConfirmDeleteModal
          open={!!deleteTarget}
          title="Confirm Deletion"
          message={`Remove "${deleteTarget?.label}"?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            if (deleteTarget.kind === 'report') await deleteCityReport(deleteTarget.id);
            else await deleteCityNotice(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      </div>
    );
  }

  // AI City Planning Assistant
  const quickPrompts = [
    'Summarize current verified vs unapproved project status in Chichawatni.',
    'Which municipal roads and sewerage hotspots are marked Critical/Blocked?',
    'Review budget allocations and separate Proposed vs Approved funds.',
    'Identify data gaps we need Field Officers to survey before 2027 budgeting.'
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Grounded Read-Only Advisory Assistant:</strong> Queries live Firestore snapshots strictly via server route <span className="font-mono">/api/city-assistant</span>. Never fabricates costs, approvals, or statistics, and never auto-modifies database records.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C9A227]" />
          <h2 className="font-editorial text-lg font-bold text-[#123B28]">AI City Planning & Master Development Assistant</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendAiPrompt(qp)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-[#F7F9F7] border border-slate-200 hover:border-[#087A43] text-[#123B28] font-semibold cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        <div className="bg-[#F7F9F7] border border-slate-200 rounded-2xl p-4 h-[380px] overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#123B28] text-white'
                    : 'bg-white border border-slate-200 text-[#1B241E]'
                }`}
              >
                {m.mode && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#087A43] block mb-1">
                    {m.mode}
                  </span>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {aiLoading && <div className="text-slate-500 italic">Analyzing live Chichawatni Firestore records...</div>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendAiPrompt();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about Master Plan priorities, road backlogs, budgets, or missing field surveys..."
            className="flex-1 px-4 py-3 text-xs bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[44px]"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="min-h-[44px] px-5 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#C9A227]" />
            <span>Analyze</span>
          </button>
        </form>
      </div>
    </div>
  );
};
