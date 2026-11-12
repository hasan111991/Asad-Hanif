import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCityData } from '../../context/CityDataContext';
import {
  MASTER_PLAN_SECTORS,
  CITY_PROJECT_STATUSES,
  OFFICIAL_APPROVED_PROJECT_STATUSES,
  CITY_FUNDING_SOURCES
} from '../../data/cityManagementData';
import {
  CityFeasibility,
  CityPriority,
  CityProject,
  CityProjectStatus,
  MasterPlanSectorCode
} from '../../types';
import {
  ConfirmDeleteModal,
  EmptyVerifiedDataNotice,
  formatPkr,
  getPriorityBadgeClass,
  getProjectStatusBadgeClass
} from './CitySharedUI';
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  X,
  Table2,
  LayoutGrid,
  Map as MapIcon,
  Calendar,
  FileText,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CityMasterPlanViewProps {
  mode: 'master-plan' | 'projects';
}

const DEFAULT_DRAFT: Omit<CityProject, 'id' | 'updatedAt'> = {
  projectCode: '',
  name: '',
  sectorCode: 'A',
  sector: 'A. Roads & Transportation',
  description: '',
  exactLocation: '',
  locality: '',
  department: 'Municipal Committee Chichawatni (MC)',
  estimatedCostPkr: 0,
  approvedCostPkr: 0,
  fundsReleasedPkr: 0,
  expenditurePkr: 0,
  fundingSource: 'Punjab Government',
  priority: 'Medium',
  feasibility: 'Pending',
  startDate: '2027-01-01',
  expectedCompletionDate: '2027-12-31',
  status: 'Proposed',
  targetYear: 2027,
  physicalProgressPercent: 0,
  financialProgressPercent: 0,
  contractor: '',
  approvalReference: '',
  feasibilityDocUrl: '',
  pciDocUrl: '',
  beforePhotoUrl: '',
  afterPhotoUrl: '',
  latitude: null,
  longitude: null,
  isSampleTemplate: false
};

export const CityMasterPlanView: React.FC<CityMasterPlanViewProps> = ({ mode }) => {
  const {
    cityProjects,
    cityProjectUpdates,
    saveCityProject,
    duplicateCityProject,
    deleteCityProject,
    addCityProjectUpdate,
    importSampleProjectTemplates,
    clearSampleProjectTemplates
  } = useCityData();

  const [viewType, setViewType] = useState<'table' | 'cards' | 'map'>('table');
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [localityFilter, setLocalityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [fundingFilter, setFundingFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hideTemplates, setHideTemplates] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CityProject | null>(null);
  const [draft, setDraft] = useState<Omit<CityProject, 'id' | 'updatedAt'>>(DEFAULT_DRAFT);
  const [milestoneProject, setMilestoneProject] = useState<CityProject | null>(null);
  const [milestoneYear, setMilestoneYear] = useState<2027 | 2028 | 2029 | 2030>(2027);
  const [milestoneNote, setMilestoneNote] = useState('');
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<CityProject | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const notify = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 5000);
  };

  const localities = useMemo(
    () => Array.from(new Set(cityProjects.map((p) => p.locality).filter(Boolean))).sort(),
    [cityProjects]
  );
  const departments = useMemo(
    () => Array.from(new Set(cityProjects.map((p) => p.department).filter(Boolean))).sort(),
    [cityProjects]
  );

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return cityProjects.filter((p) => {
      if (hideTemplates && p.isSampleTemplate) return false;
      if (sectorFilter !== 'all' && p.sectorCode !== sectorFilter) return false;
      if (localityFilter !== 'all' && p.locality !== localityFilter) return false;
      if (departmentFilter !== 'all' && p.department !== departmentFilter) return false;
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
      if (fundingFilter !== 'all' && p.fundingSource !== fundingFilter) return false;
      if (yearFilter !== 'all' && String(p.targetYear) !== yearFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.projectCode.toLowerCase().includes(q) &&
        !p.exactLocation.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [
    cityProjects,
    hideTemplates,
    sectorFilter,
    localityFilter,
    departmentFilter,
    priorityFilter,
    fundingFilter,
    yearFilter,
    statusFilter,
    search
  ]);

  const counts = useMemo(() => {
    const proposed = cityProjects.filter((p) => !OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status)).length;
    const approved = cityProjects.filter((p) => OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status)).length;
    const completed = cityProjects.filter((p) => p.status === 'Completed').length;
    const sampleCount = cityProjects.filter((p) => p.isSampleTemplate).length;
    return { proposed, approved, completed, sampleCount };
  }, [cityProjects]);

  useEffect(() => {
    if (viewType !== 'map' || !mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    const map = L.map(mapContainerRef.current).setView([30.5333, 72.7000], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    filteredProjects
      .filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
      .forEach((p) => {
        L.circleMarker([p.latitude!, p.longitude!], {
          radius: 8,
          fillColor: p.status === 'Completed' ? '#087A43' : p.status === 'Delayed' ? '#DC2626' : '#C9A227',
          color: '#123B28',
          weight: 2,
          fillOpacity: 0.9
        })
          .bindPopup(
            `<strong>${p.projectCode}: ${p.name}</strong><br/>Status: ${p.status}<br/>Sector: ${p.sector}<br/>Progress: ${p.physicalProgressPercent}%`
          )
          .addTo(map);
      });
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewType, filteredProjects]);

  const openNew = () => {
    setEditing(null);
    const nextCode = `CW-2030-${String(cityProjects.length + 1).padStart(3, '0')}`;
    setDraft({ ...DEFAULT_DRAFT, projectCode: nextCode });
    setFormOpen(true);
  };

  const openEdit = (p: CityProject) => {
    setEditing(p);
    const { id: _id, updatedAt: _u, ...rest } = p;
    setDraft(rest);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const secMeta = MASTER_PLAN_SECTORS.find((s) => s.code === draft.sectorCode);
    await saveCityProject(
      {
        ...draft,
        sector: secMeta ? `${secMeta.code}. ${secMeta.name}` : draft.sector,
        isSampleTemplate: false
      },
      editing?.id
    );
    setFormOpen(false);
    setEditing(null);
    notify(editing ? 'Project updated in Firestore.' : 'New project created in Firestore.');
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneProject) return;
    await addCityProjectUpdate({
      projectId: milestoneProject.id,
      year: milestoneYear,
      note: milestoneNote.trim(),
      progressPercent: milestoneProgress,
      updatedBy: 'Secretariat Staff'
    });
    setMilestoneNote('');
    notify(`Logged ${milestoneYear} progress update for ${milestoneProject.projectCode}.`);
  };

  return (
    <div className="space-y-5">
      {/* Header & Template Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#087A43]">
            {mode === 'master-plan' ? 'Strategic Framework 2027–2030' : '100+ Project Portfolio Registry'}
          </span>
          <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#123B28]">
            {mode === 'master-plan'
              ? 'Chichawatni City Master Plan (12 Sectors · 2027–2030)'
              : 'City Development Projects Manager'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-Approval/Proposed: <strong className="text-amber-800">{counts.proposed}</strong> · Officially Approved/Funded:{' '}
            <strong className="text-[#087A43]">{counts.approved}</strong> · Completed:{' '}
            <strong className="text-[#123B28]">{counts.completed}</strong>
            {counts.sampleCount > 0 && ` · Sample Planning Templates: ${counts.sampleCount}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openNew}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>Add Project / Proposal</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              const added = await importSampleProjectTemplates();
              notify(
                added > 0
                  ? `Imported ${added} labeled [Sample Template] planning proposals (status: Proposed, PKR 0).`
                  : 'Sample planning templates are already present.'
              );
            }}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 bg-[#F7F9F7] hover:bg-emerald-50 text-[#123B28] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            title="Optionally load 97 structured Sector A-L planning templates marked Proposed (never approved facts)"
          >
            <Layers className="w-4 h-4 text-[#087A43]" />
            <span>Load Sample 2030 Templates</span>
          </button>

          {counts.sampleCount > 0 && (
            <button
              type="button"
              onClick={async () => {
                const removed = await clearSampleProjectTemplates();
                notify(`Removed ${removed} sample planning templates.`);
              }}
              className="min-h-[42px] px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold cursor-pointer"
            >
              Clear Sample Templates ({counts.sampleCount})
            </button>
          )}
        </div>
      </div>

      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#123B28] rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#087A43] shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      {/* 12 Master Plan Sectors Matrix (shown cleanly in Master Plan mode) */}
      {mode === 'master-plan' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MASTER_PLAN_SECTORS.map((sec) => {
            const list = cityProjects.filter((p) => p.sectorCode === sec.code);
            const approvedCnt = list.filter((p) => OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status)).length;
            const selected = sectorFilter === sec.code;
            return (
              <button
                key={sec.code}
                type="button"
                onClick={() => setSectorFilter(selected ? 'all' : sec.code)}
                className={`text-left rounded-2xl border p-3.5 transition cursor-pointer ${
                  selected
                    ? 'bg-[#123B28] text-white border-[#C9A227]'
                    : 'bg-white text-[#123B28] border-slate-200 hover:border-[#087A43]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A227]">
                    Sector {sec.code}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums opacity-80">
                    {list.length} items ({approvedCnt} official)
                  </span>
                </div>
                <div className="font-bold text-xs mt-1">{sec.name}</div>
                <div className={`text-[11px] mt-1 line-clamp-2 ${selected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {sec.focus}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 7-Filter Toolbar + View Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, project name, or exact location..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer mr-2">
              <input
                type="checkbox"
                checked={hideTemplates}
                onChange={(e) => setHideTemplates(e.target.checked)}
                className="accent-[#087A43]"
              />
              <span>Hide Sample Templates</span>
            </label>

            <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden bg-[#F7F9F7]">
              <button
                type="button"
                onClick={() => setViewType('table')}
                className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                  viewType === 'table' ? 'bg-[#087A43] text-white' : 'text-slate-700'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewType('cards')}
                className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                  viewType === 'cards' ? 'bg-[#087A43] text-white' : 'text-slate-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewType('map')}
                className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                  viewType === 'map' ? 'bg-[#087A43] text-white' : 'text-slate-700'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">All 12 Sectors</option>
            {MASTER_PLAN_SECTORS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}. {s.name}
              </option>
            ))}
          </select>

          <select value={localityFilter} onChange={(e) => setLocalityFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">All Localities</option>
            {localities.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">All Priorities</option>
            {(['Critical', 'High', 'Medium', 'Low'] as CityPriority[]).map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>

          <select value={fundingFilter} onChange={(e) => setFundingFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">All Funding Sources</option>
            {CITY_FUNDING_SOURCES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">Years 2027–2030</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2.5 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
            <option value="all">All 12 Statuses</option>
            {CITY_PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content View */}
      {filteredProjects.length === 0 ? (
        <EmptyVerifiedDataNotice
          title="No City Development Projects Found"
          description="Create verified proposals or approved city schemes, or click 'Load Sample 2030 Templates' to initialize an editable planning pipeline across Sectors A–L."
          actionLabel="Add First City Project"
          onAction={openNew}
        />
      ) : viewType === 'map' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing{' '}
              <strong>
                {filteredProjects.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number').length}
              </strong>{' '}
              projects with verified GPS coordinates (projects without GPS are omitted from pins).
            </span>
          </div>
          <div ref={mapContainerRef} className="w-full h-[460px] rounded-xl border border-slate-200 z-0" />
        </div>
      ) : viewType === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#087A43]">{p.projectCode} · {p.targetYear}</span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getProjectStatusBadgeClass(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#123B28] leading-snug">{p.name}</h3>
                <div className="text-[11px] text-slate-600">{p.sector} · {p.locality}</div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] bg-[#F7F9F7] p-2.5 rounded-xl">
                  <div>Est: <strong>{formatPkr(p.estimatedCostPkr)}</strong></div>
                  <div>Appr: <strong>{formatPkr(p.approvedCostPkr)}</strong></div>
                  <div>Rel: <strong>{formatPkr(p.fundsReleasedPkr)}</strong></div>
                  <div>Exp: <strong>{formatPkr(p.expenditurePkr)}</strong></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span>Physical: {p.physicalProgressPercent}%</span>
                    <span>Financial: {p.financialProgressPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#087A43]" style={{ width: `${p.physicalProgressPercent}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setMilestoneProject(p)} className="px-2.5 py-1.5 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold text-[#123B28] cursor-pointer inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#087A43]" />
                  <span>Milestones</span>
                </button>
                <div className="flex gap-1">
                  <button type="button" onClick={() => duplicateCityProject(p)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer" title="Duplicate">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-emerald-50 text-[#087A43] cursor-pointer" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] border-b border-slate-200 text-[#123B28]">
              <tr>
                <th className="p-3 font-bold">ID / Year</th>
                <th className="p-3 font-bold">Project Name & Sector</th>
                <th className="p-3 font-bold">Locality / Dept</th>
                <th className="p-3 font-bold">Est / Approved</th>
                <th className="p-3 font-bold">Priority & Status</th>
                <th className="p-3 font-bold">Progress</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => {
                const isOfficial = OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-3 whitespace-nowrap font-mono">
                      <div className="font-bold text-[#087A43]">{p.projectCode}</div>
                      <div className="text-[11px] text-slate-500">{p.targetYear}</div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-[#123B28]">{p.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{p.sector}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-700">{p.locality}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{p.department}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap tabular-nums">
                      <div className="text-slate-600">Est: {formatPkr(p.estimatedCostPkr)}</div>
                      <div className={isOfficial ? 'font-bold text-[#087A43]' : 'text-slate-400'}>
                        Appr: {formatPkr(p.approvedCostPkr)}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap space-y-1">
                      <div>
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getProjectStatusBadgeClass(p.status)}`}>
                          {p.status}
                        </span>
                      </div>
                      <div>
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getPriorityBadgeClass(p.priority)}`}>
                          {p.priority} · Feas: {p.feasibility}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap tabular-nums">
                      <div>Phys: <strong>{p.physicalProgressPercent}%</strong></div>
                      <div className="text-slate-500">Fin: {p.financialProgressPercent}%</div>
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => setMilestoneProject(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-[#123B28] cursor-pointer" title="2027-2030 Annual Milestones">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => duplicateCityProject(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer" title="Duplicate">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#087A43] cursor-pointer" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#123B28]">
                {editing ? `Edit Project — ${editing.projectCode}` : 'Create City Development Project / Proposal'}
              </h3>
              <button type="button" onClick={() => setFormOpen(false)} className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!OFFICIAL_APPROVED_PROJECT_STATUSES.includes(draft.status) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[11px] text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Status "{draft.status}" marks this item strictly as pre-approval/proposal (not officially approved or funded).</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Unique Project ID</label>
                <input type="text" required value={draft.projectCode} onChange={(e) => setDraft({ ...draft, projectCode: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Project Name</label>
                <input type="text" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Master Plan Sector (A–L)</label>
                <select value={draft.sectorCode} onChange={(e) => setDraft({ ...draft, sectorCode: e.target.value as MasterPlanSectorCode })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                  {MASTER_PLAN_SECTORS.map((s) => (
                    <option key={s.code} value={s.code}>{s.code}. {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Implementation Status</label>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as CityProjectStatus })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                  {CITY_PROJECT_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Plan Year</label>
                <select value={draft.targetYear} onChange={(e) => setDraft({ ...draft, targetYear: Number(e.target.value) as 2027 | 2028 | 2029 | 2030 })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                  <option value={2029}>2029</option>
                  <option value={2030}>2030</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Locality / Municipal Area</label>
                <input type="text" required value={draft.locality} onChange={(e) => setDraft({ ...draft, locality: e.target.value })} placeholder="e.g. Railway Bazaar / Block A" className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Exact Location</label>
                <input type="text" value={draft.exactLocation} onChange={(e) => setDraft({ ...draft, exactLocation: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Responsible Department</label>
                <input type="text" required value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Priority</label>
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as CityPriority })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Feasibility Rating</label>
                <select value={draft.feasibility} onChange={(e) => setDraft({ ...draft, feasibility: e.target.value as CityFeasibility })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                  <option value="Pending">Pending</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Funding Source</label>
                <select value={draft.fundingSource} onChange={(e) => setDraft({ ...draft, fundingSource: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl">
                  {CITY_FUNDING_SOURCES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Estimated Cost (PKR)</label>
                <input type="number" min={0} value={draft.estimatedCostPkr} onChange={(e) => setDraft({ ...draft, estimatedCostPkr: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Approved Cost (PKR)</label>
                <input type="number" min={0} value={draft.approvedCostPkr} onChange={(e) => setDraft({ ...draft, approvedCostPkr: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Funds Released (PKR)</label>
                <input type="number" min={0} value={draft.fundsReleasedPkr} onChange={(e) => setDraft({ ...draft, fundsReleasedPkr: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expenditure (PKR)</label>
                <input type="number" min={0} value={draft.expenditurePkr} onChange={(e) => setDraft({ ...draft, expenditurePkr: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Progress %</label>
                <input type="number" min={0} max={100} value={draft.physicalProgressPercent} onChange={(e) => setDraft({ ...draft, physicalProgressPercent: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Financial Progress %</label>
                <input type="number" min={0} max={100} value={draft.financialProgressPercent} onChange={(e) => setDraft({ ...draft, financialProgressPercent: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expected Completion Date</label>
                <input type="date" value={draft.expectedCompletionDate} onChange={(e) => setDraft({ ...draft, expectedCompletionDate: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contractor (if appointed)</label>
                <input type="text" value={draft.contractor || ''} onChange={(e) => setDraft({ ...draft, contractor: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GPS Latitude (verified only)</label>
                <input type="number" step="0.0001" value={draft.latitude ?? ''} onChange={(e) => setDraft({ ...draft, latitude: e.target.value === '' ? null : Number(e.target.value) })} placeholder="e.g. 30.5333" className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">GPS Longitude (verified only)</label>
                <input type="number" step="0.0001" value={draft.longitude ?? ''} onChange={(e) => setDraft({ ...draft, longitude: e.target.value === '' ? null : Number(e.target.value) })} placeholder="e.g. 72.7000" className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">PC-I / Approval Ref</label>
                <input type="text" value={draft.approvalReference || ''} onChange={(e) => setDraft({ ...draft, approvalReference: e.target.value })} className="w-full px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={draft.feasibilityDocUrl || ''} onChange={(e) => setDraft({ ...draft, feasibilityDocUrl: e.target.value })} placeholder="Feasibility / PC-I Document URL" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px]" />
              <input type="text" value={draft.beforePhotoUrl || ''} onChange={(e) => setDraft({ ...draft, beforePhotoUrl: e.target.value })} placeholder="Before Photo URL" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px]" />
              <input type="text" value={draft.afterPhotoUrl || ''} onChange={(e) => setDraft({ ...draft, afterPhotoUrl: e.target.value })} placeholder="After Photo URL" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px]" />
              <input type="text" value={draft.pciDocUrl || ''} onChange={(e) => setDraft({ ...draft, pciDocUrl: e.target.value })} placeholder="Official Approval Document URL" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px]" />
            </div>

            <textarea rows={3} required placeholder="Project scope, deliverables, and verified justification..." value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl" />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white font-bold cursor-pointer">
                Save Project Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2027-2030 Annual Tracking Modal */}
      {milestoneProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-bold text-[#087A43]">{milestoneProject.projectCode}</span>
                <h3 className="font-bold text-sm text-[#123B28]">{milestoneProject.name}</h3>
              </div>
              <button type="button" onClick={() => setMilestoneProject(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-3 bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <select value={milestoneYear} onChange={(e) => setMilestoneYear(Number(e.target.value) as 2027 | 2028 | 2029 | 2030)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
                  <option value={2027}>Annual Review: 2027</option>
                  <option value={2028}>Annual Review: 2028</option>
                  <option value={2029}>Annual Review: 2029</option>
                  <option value={2030}>Annual Review: 2030</option>
                </select>
                <input type="number" min={0} max={100} value={milestoneProgress} onChange={(e) => setMilestoneProgress(Number(e.target.value))} placeholder="Progress %" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
              </div>
              <textarea rows={2} required value={milestoneNote} onChange={(e) => setMilestoneNote(e.target.value)} placeholder="Verified milestone note, inspection observation, or tender update..." className="w-full p-2.5 bg-white border border-slate-200 rounded-xl" />
              <button type="submit" className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer">
                Log Annual Progress Entry
              </button>
            </form>

            <div className="space-y-2">
              <h4 className="font-bold text-[#123B28]">Recorded Updates (2027–2030)</h4>
              {cityProjectUpdates.filter((u) => u.projectId === milestoneProject.id).length === 0 ? (
                <p className="text-slate-500">No annual milestone entries logged yet.</p>
              ) : (
                cityProjectUpdates
                  .filter((u) => u.projectId === milestoneProject.id)
                  .map((u) => (
                    <div key={u.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <div className="flex justify-between font-bold text-[#087A43]">
                        <span>Year {u.year} · {u.progressPercent}%</span>
                        <span className="font-mono text-slate-400">{u.createdAt.slice(0, 10)}</span>
                      </div>
                      <p className="text-slate-700">{u.note}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete City Project Record?"
        message={`Confirm permanent removal of "${deleteTarget?.projectCode} — ${deleteTarget?.name}". This action will be recorded in the City Audit Log.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteCityProject(deleteTarget.id);
            setDeleteTarget(null);
            notify('Project deleted and logged.');
          }
        }}
      />
    </div>
  );
};
