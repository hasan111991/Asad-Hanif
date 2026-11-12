import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { useCityData } from '../../context/CityDataContext';
import { AdminModuleId } from '../../context/AuthContext';
import {
  OFFICIAL_APPROVED_PROJECT_STATUSES,
  MASTER_PLAN_SECTORS
} from '../../data/cityManagementData';
import { formatPkr } from './CitySharedUI';
import {
  MapPin,
  Users,
  Route,
  Droplets,
  Trash2,
  Lightbulb,
  Trees,
  Building2,
  HardHat,
  Wallet,
  MessageSquare,
  AlertTriangle,
  Activity,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CityOverviewDashboardProps {
  onNavigateModule: (mod: AdminModuleId) => void;
}

const CHART_COLORS = ['#087A43', '#C9A227', '#0284C7', '#DC2626', '#7C3AED', '#15803D'];

export const CityOverviewDashboard: React.FC<CityOverviewDashboardProps> = ({
  onNavigateModule
}) => {
  const {
    cityAreas,
    cityLocalities,
    cityRoads,
    cityAssets,
    cityWaterFacilities,
    citySewerageAssets,
    cityWasteRoutes,
    cityProjects,
    cityBudgets,
    cityComplaints,
    cityDepartments,
    cityAuditLogs
  } = useCityData();

  const stats = useMemo(() => {
    const verifiedPop = cityAreas.reduce((sum, a) => sum + (Number(a.populationVerified) || 0), 0);
    const totalStreets =
      cityLocalities.reduce((sum, l) => sum + (Number(l.streetCount) || 0), 0) +
      cityRoads.filter((r) => r.roadType === 'Street').length;
    const criticalRoads = cityRoads.filter(
      (r) => r.condition === 'Poor' || r.condition === 'Critical'
    ).length;

    const streetlightAssets = cityAssets.filter((a) => a.domain === 'Streetlights');
    const functionalLights = streetlightAssets.reduce(
      (sum, a) => sum + (Number(a.functionalCount) || 0),
      0
    );
    const nonFunctionalLights = streetlightAssets.reduce(
      (sum, a) => sum + (Number(a.nonFunctionalCount) || 0),
      0
    );

    const parksCount = cityAssets.filter((a) => a.domain === 'Parks').length;
    const schoolsCount = cityAssets.filter((a) => a.domain === 'Education').length;
    const healthCount = cityAssets.filter((a) => a.domain === 'Health').length;

    const realProjects = cityProjects.filter((p) => !p.isSampleTemplate);
    const activeProjects = realProjects.filter(
      (p) => p.status === 'In Progress' || p.status === 'Tendering'
    ).length;
    const completedProjects = realProjects.filter((p) => p.status === 'Completed').length;
    const pendingProjects = realProjects.filter(
      (p) => !OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status)
    ).length;

    // Strict financial rule: Proposed/Requested funds are NEVER counted as Approved/Released/Expended
    const approvedBudgetFromLedger = cityBudgets
      .filter((b) => b.fundingStage === 'Approved')
      .reduce((s, b) => s + (Number(b.amountPkr) || 0), 0);
    const releasedFromLedger = cityBudgets
      .filter((b) => b.fundingStage === 'Released')
      .reduce((s, b) => s + (Number(b.amountPkr) || 0), 0);
    const expenditureFromLedger = cityBudgets
      .filter((b) => b.fundingStage === 'Expended')
      .reduce((s, b) => s + (Number(b.amountPkr) || 0), 0);

    const approvedProjectsCost = realProjects
      .filter((p) => OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status))
      .reduce((s, p) => s + (Number(p.approvedCostPkr) || 0), 0);

    const totalApprovedBudget = approvedBudgetFromLedger || approvedProjectsCost;
    const totalReleased =
      releasedFromLedger ||
      realProjects.reduce((s, p) => s + (Number(p.fundsReleasedPkr) || 0), 0);
    const totalExpenditure =
      expenditureFromLedger ||
      realProjects.reduce((s, p) => s + (Number(p.expenditurePkr) || 0), 0);

    const resolvedComplaints = cityComplaints.filter((c) => c.status === 'Resolved').length;
    const pendingComplaints = cityComplaints.filter(
      (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
    ).length;

    const garbageCollectionPoints = cityWasteRoutes.reduce(
      (s, r) => s + (Number(r.collectionPointsCount) || 0),
      0
    );

    return {
      verifiedPop,
      totalStreets,
      criticalRoads,
      functionalLights,
      nonFunctionalLights,
      parksCount,
      schoolsCount,
      healthCount,
      realProjectsCount: realProjects.length,
      templateCount: cityProjects.length - realProjects.length,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalApprovedBudget,
      totalReleased,
      totalExpenditure,
      resolvedComplaints,
      pendingComplaints,
      garbageCollectionPoints
    };
  }, [
    cityAreas,
    cityLocalities,
    cityRoads,
    cityAssets,
    cityWasteRoutes,
    cityProjects,
    cityBudgets,
    cityComplaints
  ]);

  // Real database chart datasets
  const sectorProgressData = useMemo(() => {
    return MASTER_PLAN_SECTORS.map((sec) => {
      const items = cityProjects.filter((p) => p.sectorCode === sec.code && !p.isSampleTemplate);
      return {
        sector: `${sec.code}`,
        name: sec.name,
        total: items.length,
        completed: items.filter((p) => p.status === 'Completed').length,
        active: items.filter((p) => p.status === 'In Progress').length
      };
    }).filter((d) => d.total > 0);
  }, [cityProjects]);

  const complaintGeoData = useMemo(() => {
    const map: Record<string, { locality: string; open: number; resolved: number }> = {};
    for (const c of cityComplaints) {
      const key = c.locality || 'Unspecified';
      if (!map[key]) map[key] = { locality: key, open: 0, resolved: 0 };
      if (c.status === 'Resolved') map[key].resolved += 1;
      else map[key].open += 1;
    }
    return Object.values(map).slice(0, 8);
  }, [cityComplaints]);

  const roadConditionPie = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of cityRoads) {
      counts[r.condition] = (counts[r.condition] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [cityRoads]);

  const monthlyTrendData = useMemo(() => {
    const byMonth: Record<string, { month: string; complaints: number; resolved: number }> = {};
    for (const c of cityComplaints) {
      const m = (c.createdAt || '').slice(0, 7) || 'Current';
      if (!byMonth[m]) byMonth[m] = { month: m, complaints: 0, resolved: 0 };
      byMonth[m].complaints += 1;
      if (c.status === 'Resolved') byMonth[m].resolved += 1;
    }
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
  }, [cityComplaints]);

  const departmentWorkload = useMemo(() => {
    return cityDepartments
      .map((dept) => ({
        department: dept.name.split('(')[0].trim().slice(0, 22),
        projects: cityProjects.filter(
          (p) => !p.isSampleTemplate && p.department.toLowerCase().includes(dept.name.slice(0, 10).toLowerCase())
        ).length,
        complaints: cityComplaints.filter(
          (c) => c.department && c.department.toLowerCase().includes(dept.name.slice(0, 10).toLowerCase())
        ).length
      }))
      .slice(0, 8);
  }, [cityDepartments, cityProjects, cityComplaints]);

  const kpiCards = [
    { label: 'Mapped Municipal Areas', value: cityAreas.length, sub: `${cityLocalities.length} localities`, icon: MapPin, route: 'city-areas' as AdminModuleId },
    { label: 'Verified Population', value: stats.verifiedPop > 0 ? stats.verifiedPop.toLocaleString() : 'Unverified (0)', sub: 'From verified census entries', icon: Users, route: 'city-areas' as AdminModuleId },
    { label: 'Roads & Critical Segments', value: cityRoads.length, sub: `${stats.criticalRoads} Poor/Critical`, icon: Route, route: 'city-roads' as AdminModuleId },
    { label: 'Mapped City Streets', value: stats.totalStreets, sub: 'Sum of locality & street logs', icon: Route, route: 'city-roads' as AdminModuleId },
    { label: 'Drainage & Sewerage Assets', value: citySewerageAssets.length, sub: `${citySewerageAssets.filter((s) => s.condition === 'Blocked').length} Blocked hotspots`, icon: Droplets, route: 'city-water-sewerage' as AdminModuleId },
    { label: 'Water Supply Facilities', value: cityWaterFacilities.length, sub: `${cityWaterFacilities.filter((w) => w.status === 'Operational').length} Operational`, icon: Droplets, route: 'city-water-sewerage' as AdminModuleId },
    { label: 'Waste Collection Points', value: stats.garbageCollectionPoints, sub: `${cityWasteRoutes.length} mapped routes`, icon: Trash2, route: 'city-sanitation' as AdminModuleId },
    { label: 'Streetlights (Func / Faulty)', value: `${stats.functionalLights} / ${stats.nonFunctionalLights}`, sub: 'From Streetlight Zone records', icon: Lightbulb, route: 'city-streetlights' as AdminModuleId },
    { label: 'Parks & Public Spaces', value: stats.parksCount, sub: 'Mapped green assets', icon: Trees, route: 'city-parks' as AdminModuleId },
    { label: 'Schools & Health Facilities', value: `${stats.schoolsCount} / ${stats.healthCount}`, sub: 'Education / Health units', icon: Building2, route: 'city-health-edu' as AdminModuleId },
    { label: 'City Projects (Active / Done)', value: `${stats.activeProjects} / ${stats.completedProjects}`, sub: `${stats.pendingProjects} pre-approval · ${stats.templateCount} templates`, icon: HardHat, route: 'city-projects' as AdminModuleId },
    { label: 'Approved Project Budgets', value: formatPkr(stats.totalApprovedBudget), sub: `Released: ${formatPkr(stats.totalReleased)}`, icon: Wallet, route: 'city-budget' as AdminModuleId },
    { label: 'Actual Expenditure', value: formatPkr(stats.totalExpenditure), sub: 'Verified disbursed spend', icon: Wallet, route: 'city-budget' as AdminModuleId },
    { label: 'Citizen Complaints', value: `${stats.pendingComplaints} Pending`, sub: `${stats.resolvedComplaints} Resolved`, icon: MessageSquare, route: 'city-complaints' as AdminModuleId }
  ];

  const criticalAlerts: { label: string; route: AdminModuleId }[] = [];
  if (stats.criticalRoads > 0) criticalAlerts.push({ label: `${stats.criticalRoads} Poor/Critical road segments require priority resurfacing`, route: 'city-roads' });
  if (citySewerageAssets.some((s) => s.condition === 'Blocked')) criticalAlerts.push({ label: `${citySewerageAssets.filter((s) => s.condition === 'Blocked').length} Blocked drainage/flooding hotspots logged`, route: 'city-water-sewerage' });
  if (stats.nonFunctionalLights > 0) criticalAlerts.push({ label: `${stats.nonFunctionalLights} non-functional streetlights reported`, route: 'city-streetlights' });
  if (stats.pendingComplaints > 0) criticalAlerts.push({ label: `${stats.pendingComplaints} municipal citizen complaints awaiting action`, route: 'city-complaints' });

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-[#123B28] to-[#087A43] rounded-2xl p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227] block">
            Chichawatni City Management & Master Development System (2027–2030)
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold">
            Live Municipal Operations & Master Plan Telemetry
          </h2>
          <p className="text-xs text-emerald-100 max-w-2xl">
            Every metric below is calculated live from verified Firestore collections. Proposed budgets are strictly isolated from approved or released figures.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateModule('city-master-plan')}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#b5901d] text-[#123B28] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>2027–2030 Master Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateModule('city-ai')}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>AI Planning Assistant</span>
          </button>
        </div>
      </div>

      {/* Priority Issue Indicators */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Priority Municipal Issue Indicators</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {criticalAlerts.map((a, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigateModule(a.route)}
                className="text-left bg-white border border-red-200 hover:border-red-400 rounded-xl px-3 py-2 text-xs text-red-900 font-semibold flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>{a.label}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 14-Card Verified City KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onNavigateModule(card.route)}
              className="text-left bg-white rounded-2xl border border-slate-200 hover:border-[#087A43] p-4 shadow-xs transition group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500">{card.label}</span>
                <Icon className="w-4 h-4 text-[#087A43] shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#123B28] mt-1 tabular-nums truncate">
                {card.value}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block truncate group-hover:text-[#087A43]">
                {card.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sector Project Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#123B28]">
              Master Plan Sector Breakdown (Verified Projects)
            </h3>
            <span className="text-[11px] text-slate-500">{stats.realProjectsCount} real schemes</span>
          </div>
          {sectorProgressData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500 text-center px-4">
              No non-template development projects saved yet. Add projects in Master Plan or Development Projects to view live sector charts.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Total Schemes" fill="#123B28" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="In Progress" fill="#C9A227" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#087A43" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Complaint Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#123B28]">
              Monthly Municipal Complaint Performance
            </h3>
            <span className="text-[11px] text-slate-500">{cityComplaints.length} records</span>
          </div>
          {monthlyTrendData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500 text-center px-4">
              No municipal complaints logged yet. Monthly trends appear automatically as citizen tickets arrive.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="complaints" name="Submitted" stroke="#123B28" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#087A43" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Road Condition Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-bold text-sm text-[#123B28]">
            Road Infrastructure Condition Share
          </h3>
          {roadConditionPie.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-slate-500">
              No mapped road inspections yet.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roadConditionPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                    {roadConditionPie.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Department & Geographic Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-bold text-sm text-[#123B28]">
            Geographic Issue & Department Distribution
          </h3>
          {complaintGeoData.length === 0 && departmentWorkload.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-slate-500">
              Add departments or municipal complaints to inspect workload by locality.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {complaintGeoData.length > 0 ? (
                  <BarChart data={complaintGeoData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="locality" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="open" name="Pending" fill="#C9A227" />
                    <Bar dataKey="resolved" name="Resolved" fill="#087A43" />
                  </BarChart>
                ) : (
                  <BarChart data={departmentWorkload} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="department" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="projects" name="Projects" fill="#123B28" />
                    <Bar dataKey="complaints" name="Complaints" fill="#087A43" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent City Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#087A43]" />
            <h3 className="font-bold text-sm text-[#123B28]">Recent City Management Activity Timeline</h3>
          </div>
          <span className="text-[11px] text-slate-500">{cityAuditLogs.length} audit events</span>
        </div>
        {cityAuditLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No administrative city events recorded yet. All create/update/delete actions are automatically logged here.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {cityAuditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#123B28] mr-1.5">[{log.module}]</span>
                  <span className="font-semibold text-[#087A43] mr-1.5">{log.action}:</span>
                  <span className="text-slate-700">{log.details}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  {log.actorEmail} · {log.timestamp.replace('T', ' ').slice(0, 16)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
