import React, { useState } from 'react';
import { useCityData } from '../../context/CityDataContext';
import { useAuth } from '../../context/AuthContext';
import { CITY_COMPLAINT_CATEGORIES, CITY_COMPLAINT_STATUSES, MASTER_PLAN_SECTORS } from '../../data/cityManagementData';
import {
  CityComplaint,
  CityComplaintStatus,
  CityInspection,
  CityPriority,
  CityRoadCondition,
  CitySurvey
} from '../../types';
import { ConfirmDeleteModal, EmptyVerifiedDataNotice, getConditionBadgeClass, getPriorityBadgeClass } from './CitySharedUI';
import {
  MessageSquare,
  ClipboardCheck,
  Crosshair,
  CloudOff,
  RefreshCw,
  Trash2,
  Pencil,
  X,
  CheckCircle2
} from 'lucide-react';

interface CityComplaintsSurveysModuleProps {
  section: 'complaints' | 'surveys';
}

export const CityComplaintsSurveysModule: React.FC<CityComplaintsSurveysModuleProps> = ({
  section
}) => {
  const { currentUser } = useAuth();
  const {
    cityComplaints,
    cityDepartments,
    citySurveys,
    offlineSurveys,
    cityInspections,
    updateCityComplaint,
    deleteCityComplaint,
    saveCitySurvey,
    updateCitySurvey,
    deleteCitySurvey,
    syncOfflineSurveys,
    saveCityInspection,
    deleteCityInspection
  } = useCityData();

  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTicket, setEditingTicket] = useState<CityComplaint | null>(null);
  const [tStatus, setTStatus] = useState<CityComplaintStatus>('Under Review');
  const [tPriority, setTPriority] = useState<CityPriority>('Medium');
  const [tDept, setTDept] = useState('');
  const [tOfficer, setTOfficer] = useState('');
  const [tPublicNotes, setTPublicNotes] = useState('');
  const [tInternalNotes, setTInternalNotes] = useState('');
  const [tBeforeUrl, setTBeforeUrl] = useState('');
  const [tAfterUrl, setTAfterUrl] = useState('');
  const [tFeedback, setTFeedback] = useState('');

  // Survey state
  const [sTitle, setSTitle] = useState('');
  const [sSector, setSSector] = useState('A. Roads & Transportation');
  const [sLocality, setSLocality] = useState('');
  const [sCondition, setSCondition] = useState<CityRoadCondition>('Average');
  const [sRec, setSRec] = useState('');
  const [sPhoto, setSPhoto] = useState('');
  const [sLat, setSLat] = useState<string>('');
  const [sLng, setSLng] = useState<string>('');

  // Inspection state
  const [iType, setIType] = useState<CityInspection['targetType']>('Project');
  const [iTargetId, setITargetId] = useState('');
  const [iFindings, setIFindings] = useState('');
  const [iOutcome, setIOutcome] = useState<CityInspection['outcome']>('Passed');

  const [banner, setBanner] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: string; id: string; label: string } | null>(null);

  const notify = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 4500);
  };

  if (section === 'complaints') {
    const filtered = cityComplaints.filter((c) => {
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      return true;
    });

    const openEdit = (c: CityComplaint) => {
      setEditingTicket(c);
      setTStatus(c.status);
      setTPriority(c.priority);
      setTDept(c.department || '');
      setTOfficer(c.assignedOfficer || '');
      setTPublicNotes(c.resolutionNotes || '');
      setTInternalNotes(c.internalNotes || '');
      setTBeforeUrl(c.beforePhotoUrl || '');
      setTAfterUrl(c.afterPhotoUrl || '');
      setTFeedback(c.citizenFeedback || '');
    };

    const handleSaveTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTicket) return;
      await updateCityComplaint(editingTicket.trackingId, {
        status: tStatus,
        priority: tPriority,
        department: tDept,
        assignedOfficer: tOfficer,
        resolutionNotes: tPublicNotes,
        internalNotes: tInternalNotes,
        beforePhotoUrl: tBeforeUrl,
        afterPhotoUrl: tAfterUrl,
        citizenFeedback: tFeedback
      });
      setEditingTicket(null);
      notify(`Updated ${editingTicket.trackingId} to "${tStatus}".`);
    };

    return (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#087A43]" />
              <div>
                <h2 className="font-editorial text-lg font-bold text-[#123B28]">City Citizen Complaints & Municipal Resolution ({filtered.length})</h2>
                <p className="text-xs text-slate-500">Unified across 10 municipal categories and 8 workflow statuses. Internal notes and full PII are isolated from public lookup.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                <option value="all">All 10 Categories</option>
                {CITY_COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                <option value="all">All 8 Statuses</option>
                {CITY_COMPLAINT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {banner && (
            <div className="bg-emerald-50 border border-emerald-200 text-[#123B28] rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#087A43]" />
              <span>{banner}</span>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Municipal Complaints Matching Filter" description="Citizen submissions from the City Information Portal will appear here with Tracking IDs (CITY-YYYY-XXXX)." />
          ) : (
            <div className="space-y-3 text-xs">
              {filtered.map((c) => (
                <div key={c.trackingId} className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#087A43]">{c.trackingId}</span>
                      <span className="font-bold text-[#123B28]">{c.citizenName}</span>
                      <span className="font-mono text-slate-500">({c.phone})</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityBadgeClass(c.priority)}`}>{c.priority}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700">{c.category} · {c.locality} {c.area ? `(${c.area})` : ''}</div>
                    <p className="text-slate-600">{c.description}</p>
                    {c.department && (
                      <div className="text-[11px] text-[#087A43]">Assigned: {c.department} {c.assignedOfficer ? `(${c.assignedOfficer})` : ''}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold text-[#123B28]">{c.status}</span>
                    <button type="button" onClick={() => openEdit(c)} className="px-3 py-2 rounded-xl bg-[#087A43] text-white font-bold inline-flex items-center gap-1 cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Triage</span>
                    </button>
                    <button type="button" onClick={() => setDeleteTarget({ kind: 'complaint', id: c.trackingId, label: c.trackingId })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
            <form onSubmit={handleSaveTicket} className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-base text-[#123B28]">Manage Ticket {editingTicket.trackingId}</h3>
                <button type="button" onClick={() => setEditingTicket(null)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Status</label>
                  <select value={tStatus} onChange={(e) => setTStatus(e.target.value as CityComplaintStatus)} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                    {CITY_COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Priority</label>
                  <select value={tPriority} onChange={(e) => setTPriority(e.target.value as CityPriority)} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Referred Department</label>
                  <input type="text" list="city-dept-list" value={tDept} onChange={(e) => setTDept(e.target.value)} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
                  <datalist id="city-dept-list">
                    {cityDepartments.map((d) => <option key={d.id} value={d.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="font-bold block mb-1">Assigned Officer</label>
                  <input type="text" value={tOfficer} onChange={(e) => setTOfficer(e.target.value)} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
                </div>
              </div>
              <textarea rows={2} value={tPublicNotes} onChange={(e) => setTPublicNotes(e.target.value)} placeholder="Public resolution notes (visible to citizen tracking portal)" className="w-full p-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              <textarea rows={2} value={tInternalNotes} onChange={(e) => setTInternalNotes(e.target.value)} placeholder="Internal Secretariat notes (NEVER shown publicly)" className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={tBeforeUrl} onChange={(e) => setTBeforeUrl(e.target.value)} placeholder="Before Photo URL" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px]" />
                <input type="text" value={tAfterUrl} onChange={(e) => setTAfterUrl(e.target.value)} placeholder="After Resolution Photo URL" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px]" />
              </div>
              <input type="text" value={tFeedback} onChange={(e) => setTFeedback(e.target.value)} placeholder="Citizen verification / satisfaction feedback" className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingTicket(null)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer">Save Ticket Update</button>
              </div>
            </form>
          </div>
        )}

        <ConfirmDeleteModal
          open={!!deleteTarget}
          title="Delete Complaint?"
          message={`Delete complaint ${deleteTarget?.label}?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget) {
              await deleteCityComplaint(deleteTarget.id);
              setDeleteTarget(null);
            }
          }}
        />
      </div>
    );
  }

  // Surveys & Field Inspections
  const captureGps = () => {
    if (!navigator.geolocation) {
      notify('Geolocation is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSLat(pos.coords.latitude.toFixed(6));
        setSLng(pos.coords.longitude.toFixed(6));
        notify('Captured live GPS coordinates from device.');
      },
      () => notify('Unable to access device GPS. Enter coordinates manually if known.')
    );
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#123B28] rounded-xl px-4 py-2 text-xs font-semibold">
          {banner}
        </div>
      )}

      {/* Offline Queue Bar */}
      {offlineSurveys.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <CloudOff className="w-4 h-4 shrink-0" />
            <span>{offlineSurveys.length} field surveys saved in offline device storage awaiting Firestore sync.</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              const count = await syncOfflineSurveys();
              notify(`Synced ${count} offline surveys to cloud database.`);
            }}
            className="min-h-[38px] px-4 py-2 rounded-xl bg-[#087A43] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Offline Queue Now</span>
          </button>
        </div>
      )}

      {/* Mobile Field Survey Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-[#087A43]" />
          <div>
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">Field Surveys & Mobile GPS Data Collection</h2>
            <p className="text-xs text-slate-500">Offline-capable field capture with live GPS, photo attachment, condition grading, and supervisor verification.</p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await saveCitySurvey({
              title: sTitle.trim(),
              sector: sSector,
              locality: sLocality.trim() || 'Chichawatni',
              conditionGrade: sCondition,
              repairRecommendation: sRec.trim(),
              photoUrl: sPhoto.trim() || undefined,
              officerName: currentUser?.displayName || 'Field Officer',
              verificationStatus: 'Pending Verification',
              latitude: sLat ? Number(sLat) : null,
              longitude: sLng ? Number(sLng) : null
            });
            setSTitle('');
            setSLocality('');
            setSRec('');
            setSPhoto('');
            notify(
              res === 'offline'
                ? 'Device offline — survey safely queued in localStorage for later sync.'
                : 'Field survey saved and logged.'
            );
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200"
        >
          <input type="text" required value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="Survey Subject / Asset" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <select value={sSector} onChange={(e) => setSSector(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            {MASTER_PLAN_SECTORS.map((s) => <option key={s.code} value={`${s.code}. ${s.name}`}>{s.code}. {s.name}</option>)}
          </select>
          <input type="text" value={sLocality} onChange={(e) => setSLocality(e.target.value)} placeholder="Locality / Street" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <select value={sCondition} onChange={(e) => setSCondition(e.target.value as CityRoadCondition)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Excellent">Condition: Excellent</option>
            <option value="Good">Condition: Good</option>
            <option value="Average">Condition: Average</option>
            <option value="Poor">Condition: Poor</option>
            <option value="Critical">Condition: Critical</option>
          </select>
          <div className="flex gap-1.5">
            <input type="number" step="0.0001" value={sLat} onChange={(e) => setSLat(e.target.value)} placeholder="GPS Lat" className="w-1/2 px-2 py-2 bg-white border border-slate-200 rounded-xl font-mono" />
            <input type="number" step="0.0001" value={sLng} onChange={(e) => setSLng(e.target.value)} placeholder="GPS Lng" className="w-1/2 px-2 py-2 bg-white border border-slate-200 rounded-xl font-mono" />
          </div>
          <button type="button" onClick={captureGps} className="min-h-[38px] px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-emerald-50 font-bold text-[#123B28] inline-flex items-center justify-center gap-1.5 cursor-pointer">
            <Crosshair className="w-4 h-4 text-[#087A43]" />
            <span>Capture Device GPS</span>
          </button>
          <input type="text" value={sPhoto} onChange={(e) => setSPhoto(e.target.value)} placeholder="Field Photo URL (optional)" className="sm:col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]" />
          <textarea rows={2} required value={sRec} onChange={(e) => setSRec(e.target.value)} placeholder="Recommended repair, engineering intervention, or priority observation..." className="sm:col-span-3 p-2.5 bg-white border border-slate-200 rounded-xl" />
          <button type="submit" className="sm:col-span-3 min-h-[40px] bg-[#087A43] text-white font-bold rounded-xl cursor-pointer">
            Submit Field Survey
          </button>
        </form>

        <div className="space-y-2 text-xs">
          {citySurveys.map((s: CitySurvey) => (
            <div key={s.id} className="p-3.5 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-[#123B28]">{s.title} <span className="font-normal text-slate-500">({s.sector})</span></div>
                <div className="text-[11px] text-slate-600">{s.locality} · Officer: {s.officerName} {s.latitude ? `· GPS: ${s.latitude}, ${s.longitude}` : ''}</div>
                <div className="text-[11px] text-slate-500">{s.repairRecommendation}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getConditionBadgeClass(s.conditionGrade)}`}>{s.conditionGrade}</span>
                <select
                  value={s.verificationStatus}
                  onChange={(e) => updateCitySurvey(s.id, { verificationStatus: e.target.value as CitySurvey['verificationStatus'] })}
                  className="px-2 py-1 bg-[#F7F9F7] border border-slate-200 rounded-lg text-[11px] font-semibold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Verified">Verified</option>
                </select>
                <button type="button" onClick={() => setDeleteTarget({ kind: 'survey', id: s.id, label: s.title })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Site Verification Inspections */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-base text-[#123B28]">Project & Utility Site Inspections ({cityInspections.length})</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await saveCityInspection({
              targetType: iType,
              targetId: iTargetId.trim() || 'GENERAL',
              inspectorName: currentUser?.displayName || 'Inspector',
              findings: iFindings.trim(),
              outcome: iOutcome,
              inspectedAt: new Date().toISOString()
            });
            setITargetId('');
            setIFindings('');
            notify('Site inspection recorded.');
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200"
        >
          <select value={iType} onChange={(e) => setIType(e.target.value as CityInspection['targetType'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Project">Project Site</option>
            <option value="Road">Road Work</option>
            <option value="Water">Water Plant</option>
            <option value="Sewerage">Sewerage / Drain</option>
            <option value="Sanitation">Sanitation Route</option>
            <option value="Facility">Public Facility</option>
          </select>
          <input type="text" required value={iTargetId} onChange={(e) => setITargetId(e.target.value)} placeholder="Project Code / Asset Ref" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <select value={iOutcome} onChange={(e) => setIOutcome(e.target.value as CityInspection['outcome'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Passed">Outcome: Passed</option>
            <option value="Action Required">Outcome: Action Required</option>
            <option value="Failed">Outcome: Failed</option>
          </select>
          <button type="submit" className="min-h-[38px] bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">Log Inspection</button>
          <input type="text" required value={iFindings} onChange={(e) => setIFindings(e.target.value)} placeholder="Detailed inspection findings & contractor quality notes..." className="sm:col-span-4 px-3 py-2 bg-white border border-slate-200 rounded-xl" />
        </form>

        <div className="divide-y divide-slate-100 text-xs">
          {cityInspections.map((ins) => (
            <div key={ins.id} className="py-2.5 flex justify-between items-center gap-2">
              <div>
                <strong className="text-[#123B28]">[{ins.targetType}] {ins.targetId}</strong> — <span className="text-slate-700">{ins.findings}</span>
                <div className="text-[11px] text-slate-500">By {ins.inspectorName} · {ins.inspectedAt.slice(0, 10)} · Outcome: <strong>{ins.outcome}</strong></div>
              </div>
              <button type="button" onClick={() => setDeleteTarget({ kind: 'insp', id: ins.id, label: ins.targetId })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Confirm Removal"
        message={`Delete "${deleteTarget?.label}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === 'survey') await deleteCitySurvey(deleteTarget.id);
          else await deleteCityInspection(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
