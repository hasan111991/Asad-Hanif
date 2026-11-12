import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useCityData } from '../../context/CityDataContext';
import { useAuth } from '../../context/AuthContext';
import { CITY_FUNDING_SOURCES, MASTER_PLAN_SECTORS } from '../../data/cityManagementData';
import { CityBudgetStage, CityFundingSource } from '../../types';
import { ConfirmDeleteModal, EmptyVerifiedDataNotice, formatPkr } from './CitySharedUI';
import { Wallet, Building2, ShieldCheck, Trash2, AlertTriangle, Plus } from 'lucide-react';

interface CityFinanceDepartmentModuleProps {
  section: 'budget' | 'departments';
}

export const CityFinanceDepartmentModule: React.FC<CityFinanceDepartmentModuleProps> = ({
  section
}) => {
  const { currentUser } = useAuth();
  const {
    cityBudgets,
    cityDepartments,
    cityProjects,
    cityComplaints,
    saveBudgetRecord,
    deleteBudgetRecord,
    saveDepartment,
    deleteDepartment,
    seedStructuralDepartments
  } = useCityData();

  const [deleteInfo, setDeleteInfo] = useState<{ kind: 'budget' | 'dept'; id: string; label: string } | null>(null);

  // Budget form state
  const [bTitle, setBTitle] = useState('');
  const [bYear, setBYear] = useState('2027-28');
  const [bSource, setBSource] = useState<CityFundingSource>('Punjab Government');
  const [bStage, setBStage] = useState<CityBudgetStage>('Proposed');
  const [bAmount, setBAmount] = useState('');
  const [bSector, setBSector] = useState('A. Roads & Transportation');
  const [bRef, setBRef] = useState('');
  const [bNotes, setBNotes] = useState('');

  // Department form state
  const [dName, setDName] = useState('');
  const [dJurisdiction, setDJurisdiction] = useState('');
  const [dFocal, setDFocal] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [dNotes, setDNotes] = useState('');

  const ledgerTotals = useMemo(() => {
    let proposed = 0;
    let requested = 0;
    let approved = 0;
    let released = 0;
    let expended = 0;
    for (const r of cityBudgets) {
      const amt = Number(r.amountPkr) || 0;
      if (r.fundingStage === 'Proposed') proposed += amt;
      else if (r.fundingStage === 'Requested') requested += amt;
      else if (r.fundingStage === 'Approved') approved += amt;
      else if (r.fundingStage === 'Released') released += amt;
      else if (r.fundingStage === 'Expended') expended += amt;
    }
    return { proposed, requested, approved, released, expended };
  }, [cityBudgets]);

  const chartBySource = useMemo(() => {
    return CITY_FUNDING_SOURCES.map((src) => {
      const rows = cityBudgets.filter((b) => b.fundingSource === src);
      return {
        source: src.split(' ').slice(0, 2).join(' '),
        Approved: rows.filter((r) => r.fundingStage === 'Approved').reduce((s, r) => s + r.amountPkr, 0) / 1000000,
        Released: rows.filter((r) => r.fundingStage === 'Released').reduce((s, r) => s + r.amountPkr, 0) / 1000000,
        Expended: rows.filter((r) => r.fundingStage === 'Expended').reduce((s, r) => s + r.amountPkr, 0) / 1000000,
        Proposed: rows.filter((r) => r.fundingStage === 'Proposed' || r.fundingStage === 'Requested').reduce((s, r) => s + r.amountPkr, 0) / 1000000
      };
    }).filter((d) => d.Approved + d.Released + d.Expended + d.Proposed > 0);
  }, [cityBudgets]);

  if (section === 'budget') {
    return (
      <div className="space-y-6">
        {/* Strict Financial Separation Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Strict Financial Separation Policy:</strong> Funds tagged <em>Proposed</em> or <em>Requested</em> are tracked strictly as unapproved estimates and are NEVER added to Officially Approved, Released, or Expended totals. Attach treasury/PC-I reference numbers on every approved entry.
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <span className="text-slate-500">Officially Approved Funds</span>
            <div className="text-xl font-bold text-[#087A43] mt-1">{formatPkr(ledgerTotals.approved)}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <span className="text-slate-500">Verified Funds Released</span>
            <div className="text-xl font-bold text-[#123B28] mt-1">{formatPkr(ledgerTotals.released)}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <span className="text-slate-500">Actual Expenditure</span>
            <div className="text-xl font-bold text-sky-700 mt-1">{formatPkr(ledgerTotals.expended)}</div>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <span className="text-amber-900 font-semibold">Proposed (Unapproved)</span>
            <div className="text-xl font-bold text-amber-900 mt-1">{formatPkr(ledgerTotals.proposed)}</div>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <span className="text-amber-900 font-semibold">Requested (Unapproved)</span>
            <div className="text-xl font-bold text-amber-900 mt-1">{formatPkr(ledgerTotals.requested)}</div>
          </div>
        </div>

        {/* Add Financial Entry */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#087A43]" />
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">Municipal Funding & Financial Ledger (8 Funding Categories)</h2>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveBudgetRecord({
                title: bTitle.trim(),
                fiscalYear: bYear,
                fundingSource: bSource,
                fundingStage: bStage,
                amountPkr: Number(bAmount) || 0,
                sector: bSector,
                evidenceRef: bRef.trim(),
                notes: bNotes.trim(),
                updatedBy: currentUser?.email || 'finance@pp203.pk'
              });
              setBTitle('');
              setBAmount('');
              setBRef('');
              setBNotes('');
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200"
          >
            <input type="text" required value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder="Grant / Scheme / Allocation Title" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" required value={bYear} onChange={(e) => setBYear(e.target.value)} placeholder="Fiscal Year (e.g. 2027-28)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={bSource} onChange={(e) => setBSource(e.target.value as CityFundingSource)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              {CITY_FUNDING_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={bStage} onChange={(e) => setBStage(e.target.value as CityBudgetStage)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Proposed">Stage: Proposed (Unapproved)</option>
              <option value="Requested">Stage: Requested (Unapproved)</option>
              <option value="Approved">Stage: Officially Approved</option>
              <option value="Released">Stage: Funds Released</option>
              <option value="Expended">Stage: Verified Expenditure</option>
            </select>
            <input type="number" required min={0} value={bAmount} onChange={(e) => setBAmount(e.target.value)} placeholder="Amount in PKR" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={bSector} onChange={(e) => setBSector(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              {MASTER_PLAN_SECTORS.map((s) => (
                <option key={s.code} value={`${s.code}. ${s.name}`}>{s.code}. {s.name}</option>
              ))}
            </select>
            <input type="text" value={bRef} onChange={(e) => setBRef(e.target.value)} placeholder="Notification / Voucher / PC-I Ref" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={bNotes} onChange={(e) => setBNotes(e.target.value)} placeholder="Supporting notes" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <button type="submit" className="sm:col-span-2 lg:col-span-4 min-h-[40px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
              Record Financial Entry (Logged to Audit Trail)
            </button>
          </form>

          {/* Chart */}
          {chartBySource.length > 0 && (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartBySource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'PKR Millions', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Approved" fill="#087A43" />
                  <Bar dataKey="Released" fill="#123B28" />
                  <Bar dataKey="Expended" fill="#0284C7" />
                  <Bar dataKey="Proposed" fill="#C9A227" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {cityBudgets.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Verified Financial Entries Yet" description="Add real municipal budget allocations, grants, or proposed cost estimates above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F7] border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Title & Sector</th>
                    <th className="p-3 font-bold">Source & FY</th>
                    <th className="p-3 font-bold">Stage</th>
                    <th className="p-3 font-bold">Amount (PKR)</th>
                    <th className="p-3 font-bold">Evidence Ref</th>
                    <th className="p-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cityBudgets.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3">
                        <div className="font-bold text-[#123B28]">{b.title}</div>
                        <div className="text-[11px] text-slate-500">{b.sector}</div>
                      </td>
                      <td className="p-3">{b.fundingSource} · {b.fiscalYear}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                          b.fundingStage === 'Proposed' || b.fundingStage === 'Requested'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-emerald-50 text-[#087A43] border-emerald-200'
                        }`}>
                          {b.fundingStage}
                        </span>
                      </td>
                      <td className="p-3 font-bold tabular-nums">{formatPkr(b.amountPkr)}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{b.evidenceRef || '—'}</td>
                      <td className="p-3 text-right">
                        <button type="button" onClick={() => setDeleteInfo({ kind: 'budget', id: b.id, label: b.title })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ConfirmDeleteModal
          open={!!deleteInfo}
          title="Delete Financial Entry?"
          message={`Delete "${deleteInfo?.label}" from municipal finance records?`}
          onCancel={() => setDeleteInfo(null)}
          onConfirm={async () => {
            if (deleteInfo) {
              await deleteBudgetRecord(deleteInfo.id);
              setDeleteInfo(null);
            }
          }}
        />
      </div>
    );
  }

  // Departments
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-[#123B28] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
        <div>
          <strong>Institutional Role & Coordination Notice:</strong> The office of MPA PP-203 Chichawatni serves a representative coordination, oversight, and public facilitation role. It does <strong>not</strong> exercise direct administrative control over municipal staff appointments, internal postings, or government procurement tenders, which remain under respective provincial/municipal departments.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#087A43]" />
            <div>
              <h2 className="font-editorial text-lg font-bold text-[#123B28]">Department Coordination Directory ({cityDepartments.length})</h2>
              <p className="text-xs text-slate-500">Manage 13 Chichawatni municipal/provincial agencies, focal persons, and live assigned tasks.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await seedStructuralDepartments();
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#123B28] hover:bg-[#087A43] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>Initialize 13 Coordination Departments</span>
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await saveDepartment({
              name: dName.trim(),
              jurisdiction: dJurisdiction.trim(),
              focalPerson: dFocal.trim(),
              contactPhone: dPhone.trim(),
              officeAddress: dAddress.trim(),
              correspondenceNotes: dNotes.trim(),
              isIndependentControlDisclaimer: true
            });
            setDName('');
            setDJurisdiction('');
            setDFocal('');
            setDPhone('');
            setDAddress('');
            setDNotes('');
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200"
        >
          <input type="text" required value={dName} onChange={(e) => setDName(e.target.value)} placeholder="Department Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" required value={dJurisdiction} onChange={(e) => setDJurisdiction(e.target.value)} placeholder="Jurisdiction & Civic Mandate" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={dFocal} onChange={(e) => setDFocal(e.target.value)} placeholder="Verified Focal Officer" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={dPhone} onChange={(e) => setDPhone(e.target.value)} placeholder="Verified Office Phone" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={dAddress} onChange={(e) => setDAddress(e.target.value)} placeholder="Office Location" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={dNotes} onChange={(e) => setDNotes(e.target.value)} placeholder="Official Correspondence / Letter Ref Notes" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <button type="submit" className="sm:col-span-3 min-h-[40px] bg-[#087A43] text-white font-bold rounded-xl cursor-pointer">
            Save Coordination Department
          </button>
        </form>

        {cityDepartments.length === 0 ? (
          <EmptyVerifiedDataNotice title="No Departments Initialized Yet" description="Click 'Initialize 13 Coordination Departments' above or add individual departments manually." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {cityDepartments.map((d) => {
              const linkedProjects = cityProjects.filter(
                (p) => !p.isSampleTemplate && p.department.toLowerCase().includes(d.name.slice(0, 8).toLowerCase())
              ).length;
              const linkedComplaints = cityComplaints.filter(
                (c) => c.department && c.department.toLowerCase().includes(d.name.slice(0, 8).toLowerCase())
              ).length;
              return (
                <div key={d.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#123B28]">{d.name}</div>
                      <div className="text-[11px] text-slate-600">{d.jurisdiction}</div>
                    </div>
                    <button type="button" onClick={() => setDeleteInfo({ kind: 'dept', id: d.id, label: d.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Focal Officer: <strong>{d.focalPerson || 'Pending Verification'}</strong> · Phone: <strong>{d.contactPhone || 'Pending Verification'}</strong>
                  </div>
                  <div className="text-[11px] font-semibold text-[#087A43]">
                    Live DB Workload: {linkedProjects} Projects · {linkedComplaints} Complaints
                  </div>
                  {d.correspondenceNotes && <div className="text-[11px] text-slate-500">Notes: {d.correspondenceNotes}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteInfo}
        title="Delete Department?"
        message={`Delete "${deleteInfo?.label}" from coordination directory?`}
        onCancel={() => setDeleteInfo(null)}
        onConfirm={async () => {
          if (deleteInfo) {
            await deleteDepartment(deleteInfo.id);
            setDeleteInfo(null);
          }
        }}
      />
    </div>
  );
};
