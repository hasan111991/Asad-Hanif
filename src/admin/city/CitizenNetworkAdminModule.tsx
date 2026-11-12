import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useCitizenNetwork } from '../../context/CitizenNetworkContext';
import { useAuth } from '../../context/AuthContext';
import {
  CITIZEN_CONSENT_OPTIONS,
  CITIZEN_CONTACT_METHODS,
  CITIZEN_INTEREST_TOPICS,
  COMMUNICATION_TEMPLATES
} from '../../data/citizenNetworkData';
import {
  CitizenConsentCategory,
  CitizenContactMethod,
  CitizenGroup,
  CitizenInterestTopic,
  CitizenSurveyQuestion
} from '../../types';
import {
  Users,
  ShieldCheck,
  Search,
  Download,
  Send,
  Building2,
  ClipboardList,
  MessageSquare,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react';

type AdminCitizenTab =
  | 'overview'
  | 'directory'
  | 'groups'
  | 'communications'
  | 'participation'
  | 'organizations';

export const CitizenNetworkAdminModule: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    adminProfiles,
    adminConsents,
    adminInterests,
    adminCommPrefs,
    adminGroups,
    adminGroupMembers,
    adminSuggestions,
    adminSurveys,
    adminVolunteers,
    adminOrganizations,
    adminCommLogs,
    adminUpdateCitizenStatus,
    adminDeleteCitizenProfile,
    adminSaveGroup,
    adminDeleteGroup,
    adminSeedVoluntaryGroupTemplates,
    adminAssignMembersToGroup,
    adminUpdateSuggestion,
    adminSaveSurvey,
    adminUpdateVolunteerStatus,
    adminVerifyOrganization,
    adminSendConsentCommunication,
    logAdminCitizenExport
  } = useCitizenNetwork();

  const [tab, setTab] = useState<AdminCitizenTab>('overview');
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Search & Filter state for Citizen Directory
  const [qSearch, setQSearch] = useState('');
  const [fLocality, setFLocality] = useState('all');
  const [fProfession, setFProfession] = useState('all');
  const [fInterest, setFInterest] = useState<string>('all');
  const [fVerified, setFVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [fStatus, setFStatus] = useState<'all' | 'Active' | 'Inactive' | 'Deletion Requested'>('all');
  const [fDateFrom, setFDateFrom] = useState('');
  const [confirmPurgeUid, setConfirmPurgeUid] = useState<string | null>(null);

  // Community Groups form state
  const [grpName, setGrpName] = useState('');
  const [grpInterest, setGrpInterest] = useState<CitizenInterestTopic | 'Multi-Sector Civic'>('Cleanliness and Sanitation');
  const [grpLocality, setGrpLocality] = useState('');
  const [grpDesc, setGrpDesc] = useState('');

  // Consent Communication Dispatch state
  const [commChannel, setCommChannel] = useState<CitizenContactMethod>('In-App');
  const [commCategory, setCommCategory] = useState<CitizenConsentCategory>('cityServiceAnnouncements');
  const [commTemplate, setCommTemplate] = useState('Custom Update');
  const [commSubject, setCommSubject] = useState('');
  const [commBody, setCommBody] = useState('');
  const [commLocalityFilter, setCommLocalityFilter] = useState('all');
  const [commInterestFilter, setCommInterestFilter] = useState('all');
  const [sendingComm, setSendingComm] = useState(false);

  // Survey creation state
  const [srvTitle, setSrvTitle] = useState('');
  const [srvTopic, setSrvTopic] = useState('Neighborhood Priorities');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvQPrompt, setSrvQPrompt] = useState('');
  const [srvQOptions, setSrvQOptions] = useState('Roads & Drainage, Clean Drinking Water, Streetlights, Waste Collection');

  // Computed strictly from real database records (zero fake numbers)
  const stats = useMemo(() => {
    const total = adminProfiles.length;
    const verified = adminProfiles.filter((p) => p.phoneVerified).length;
    const unverified = total - verified;
    const active = adminProfiles.filter((p) => p.accountStatus === 'Active').length;
    const inactive = adminProfiles.filter((p) => p.accountStatus !== 'Active').length;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newRecent = adminProfiles.filter(
      (p) => Date.parse(p.createdAt || '') >= sevenDaysAgo
    ).length;

    const byLocality: Record<string, number> = {};
    const byProfession: Record<string, number> = {};
    adminProfiles.forEach((p) => {
      const loc = p.cityLocality || 'Unspecified';
      byLocality[loc] = (byLocality[loc] || 0) + 1;
      if (p.profession?.trim()) {
        byProfession[p.profession.trim()] = (byProfession[p.profession.trim()] || 0) + 1;
      }
    });

    const byInterest: Record<string, number> = {};
    adminInterests.forEach((rec) => {
      rec.interests.forEach((t) => {
        byInterest[t] = (byInterest[t] || 0) + 1;
      });
    });

    const consentCounts: Record<CitizenConsentCategory, number> = {
      publicDevelopmentUpdates: 0,
      cityServiceAnnouncements: 0,
      communityEventNotifications: 0,
      surveyInvitations: 0,
      emergencyPublicAlerts: 0
    };
    adminConsents.forEach((c) => {
      if (c.unsubscribedAll) return;
      (Object.keys(consentCounts) as CitizenConsentCategory[]).forEach((k) => {
        if (c[k]) consentCounts[k]++;
      });
    });

    const localityChart = Object.entries(byLocality)
      .map(([locality, count]) => ({ locality, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    const interestChart = Object.entries(byInterest)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      verified,
      unverified,
      active,
      inactive,
      newRecent,
      localities: Object.keys(byLocality).sort(),
      professions: Object.entries(byProfession).sort((a, b) => b[1] - a[1]),
      consentCounts,
      localityChart,
      interestChart
    };
  }, [adminProfiles, adminInterests, adminConsents]);

  const filteredCitizens = useMemo(() => {
    const q = qSearch.trim().toLowerCase();
    return adminProfiles.filter((p) => {
      if (q && !p.fullName.toLowerCase().includes(q) && !p.phoneE164.toLowerCase().includes(q)) {
        return false;
      }
      if (fLocality !== 'all' && p.cityLocality !== fLocality) return false;
      if (fProfession !== 'all' && (p.profession || '') !== fProfession) return false;
      if (fVerified === 'verified' && !p.phoneVerified) return false;
      if (fVerified === 'unverified' && p.phoneVerified) return false;
      if (fStatus !== 'all' && p.accountStatus !== fStatus) return false;
      if (fDateFrom && p.createdAt.slice(0, 10) < fDateFrom) return false;
      if (fInterest !== 'all') {
        const rec = adminInterests.find((i) => i.uid === p.uid);
        if (!rec || !rec.interests.includes(fInterest as CitizenInterestTopic)) return false;
      }
      return true;
    });
  }, [adminProfiles, adminInterests, qSearch, fLocality, fProfession, fInterest, fVerified, fStatus, fDateFrom]);

  const communicationAudience = useMemo(() => {
    const candidates = adminProfiles.filter((p) => {
      if (p.accountStatus !== 'Active') return false;
      if (commLocalityFilter !== 'all' && p.cityLocality !== commLocalityFilter) return false;
      if (commInterestFilter !== 'all') {
        const rec = adminInterests.find((i) => i.uid === p.uid);
        if (!rec?.interests.includes(commInterestFilter as CitizenInterestTopic)) return false;
      }
      return true;
    });

    const eligible: string[] = [];
    let excludedCount = 0;

    candidates.forEach((p) => {
      const c = adminConsents.find((x) => x.uid === p.uid);
      const pref = adminCommPrefs.find((x) => x.uid === p.uid);
      const hasCatConsent = Boolean(c && c[commCategory] && !c.unsubscribedAll);
      const hasChannelOptIn =
        commChannel === 'WhatsApp'
          ? Boolean(pref?.whatsappOptIn ?? p.preferredContactMethod === 'WhatsApp')
          : commChannel === 'SMS'
            ? Boolean(pref?.smsOptIn ?? p.preferredContactMethod === 'SMS')
            : commChannel === 'Email'
              ? Boolean(pref?.emailOptIn && p.email)
              : Boolean(pref?.inAppOptIn ?? true);

      if (hasCatConsent && hasChannelOptIn && !pref?.unsubscribedAll) {
        eligible.push(p.uid);
      } else {
        excludedCount++;
      }
    });

    return { totalCandidates: candidates.length, eligible, excludedCount };
  }, [adminProfiles, adminInterests, adminConsents, adminCommPrefs, commLocalityFilter, commInterestFilter, commCategory, commChannel]);

  const handleExportCSV = async () => {
    const headers = ['UID', 'Full Name', 'Mobile E164', 'Verified', 'Locality', 'Profession', 'Status', 'Registered At'];
    const rows = filteredCitizens.map((p) => [
      p.uid,
      `"${p.fullName.replace(/"/g, '""')}"`,
      p.phoneE164,
      p.phoneVerified ? 'Verified' : 'Unverified',
      `"${p.cityLocality.replace(/"/g, '""')}"`,
      `"${(p.profession || '').replace(/"/g, '""')}"`,
      p.accountStatus,
      p.createdAt.slice(0, 10)
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chichawatni-Citizens-Export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    await logAdminCitizenExport(`Exported ${filteredCitizens.length} citizen records to CSV`);
    setBanner({ type: 'ok', text: `Exported ${filteredCitizens.length} filtered records (logged in Audit Trail).` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#087A43]">
            Authorized Civic Privacy & Engagement Console
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28]">
            Citizen Network Management
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Strict role-based PII isolation · Opt-in consent verified prior to communications · Zero political profiling
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['overview', 'Overview & Stats'],
              ['directory', `Citizens (${stats.total})`],
              ['groups', `Groups (${adminGroups.length})`],
              ['communications', 'Communications'],
              ['participation', 'Suggestions & Surveys'],
              ['organizations', `Organizations (${adminOrganizations.length})`]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                tab === id
                  ? 'bg-[#123B28] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            banner.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{banner.text}</span>
        </div>
      )}

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Citizens', value: stats.total },
              { label: 'Verified Mobile', value: stats.verified },
              { label: 'Unverified', value: stats.unverified },
              { label: 'Active Accounts', value: stats.active },
              { label: 'Inactive / Del Req', value: stats.inactive },
              { label: 'New (Last 7 Days)', value: stats.newRecent }
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500">{kpi.label}</div>
                <div className="font-mono text-2xl font-bold text-[#123B28] tabular-nums">{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-sm text-[#123B28]">Locality-Wise Verified & Registered Citizens</h3>
              {stats.localityChart.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No voluntary citizen registrations recorded yet.</p>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.localityChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="locality" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Citizens" fill="#087A43" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-sm text-[#123B28]">Interest-Wise & Consent Opt-In Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-700">Top Civic Interests</div>
                  {stats.interestChart.length === 0 ? (
                    <p className="text-slate-500">No interest records yet.</p>
                  ) : (
                    stats.interestChart.map((item) => (
                      <div key={item.interest} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="truncate pr-2">{item.interest}</span>
                        <span className="font-mono font-bold tabular-nums">{item.count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-700">Active Consent Opt-Ins</div>
                  {CITIZEN_CONSENT_OPTIONS.map((c) => (
                    <div key={c.key} className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="truncate pr-2">{c.en}</span>
                      <span className="font-mono font-bold text-[#087A43] tabular-nums">
                        {stats.consentCounts[c.key]}
                      </span>
                    </div>
                  ))}
                  {stats.professions.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="font-semibold text-slate-700">Top Professions</div>
                      {stats.professions.slice(0, 6).map(([prof, count]) => (
                        <div key={prof} className="flex items-center justify-between text-[11px]">
                          <span>{prof}</span>
                          <span className="font-mono font-bold tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN DIRECTORY & FILTERS */}
      {tab === 'directory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  placeholder="Search name or verified phone..."
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  className="min-h-[38px] pl-8 pr-3 border border-slate-300 rounded-xl w-56"
                />
              </div>
              <select
                value={fLocality}
                onChange={(e) => setFLocality(e.target.value)}
                className="min-h-[38px] px-2.5 border border-slate-300 rounded-xl"
              >
                <option value="all">All Localities</option>
                {stats.localities.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                value={fProfession}
                onChange={(e) => setFProfession(e.target.value)}
                className="min-h-[38px] px-2.5 border border-slate-300 rounded-xl"
              >
                <option value="all">All Professions</option>
                {stats.professions.map(([p]) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={fInterest}
                onChange={(e) => setFInterest(e.target.value)}
                className="min-h-[38px] px-2.5 border border-slate-300 rounded-xl"
              >
                <option value="all">All Interests</option>
                {CITIZEN_INTEREST_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.en}
                  </option>
                ))}
              </select>
              <select
                value={fVerified}
                onChange={(e) => setFVerified(e.target.value as any)}
                className="min-h-[38px] px-2.5 border border-slate-300 rounded-xl"
              >
                <option value="all">Verification: All</option>
                <option value="verified">Verified Mobile Only</option>
                <option value="unverified">Unverified</option>
              </select>
              <select
                value={fStatus}
                onChange={(e) => setFStatus(e.target.value as any)}
                className="min-h-[38px] px-2.5 border border-slate-300 rounded-xl"
              >
                <option value="all">Status: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deletion Requested">Deletion Requested</option>
              </select>
              <input
                type="date"
                value={fDateFrom}
                onChange={(e) => setFDateFrom(e.target.value)}
                title="Registered after date"
                className="min-h-[38px] px-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-[#123B28] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredCitizens.length})</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-2">Citizen Name</th>
                  <th className="py-2.5 px-2">Verified Mobile</th>
                  <th className="py-2.5 px-2">Locality / UC</th>
                  <th className="py-2.5 px-2">Profession</th>
                  <th className="py-2.5 px-2">Consent Opt-Ins</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCitizens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No matching citizen records found.
                    </td>
                  </tr>
                ) : (
                  filteredCitizens.map((p) => {
                    const consent = adminConsents.find((c) => c.uid === p.uid);
                    const optCount = consent && !consent.unsubscribedAll
                      ? CITIZEN_CONSENT_OPTIONS.filter((o) => consent[o.key]).length
                      : 0;
                    return (
                      <tr key={p.uid} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-semibold text-[#123B28]">
                          <div>{p.fullName}</div>
                          <div className="text-[11px] font-normal text-slate-500 font-mono">
                            {p.createdAt.slice(0, 10)}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono">
                          <div>{p.phoneE164}</div>
                          <div className={`text-[10px] font-sans ${p.phoneVerified ? 'text-[#087A43]' : 'text-amber-700'}`}>
                            {p.phoneVerified ? 'Verified OTP' : 'Unverified'}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <div>{p.cityLocality}</div>
                          {p.ucWard && <div className="text-[11px] text-slate-500">{p.ucWard}</div>}
                        </td>
                        <td className="py-2.5 px-2">{p.profession || '—'}</td>
                        <td className="py-2.5 px-2 font-mono tabular-nums">
                          {consent?.unsubscribedAll ? 'Unsubscribed' : `${optCount}/5 opted · ${p.preferredContactMethod}`}
                        </td>
                        <td className="py-2.5 px-2">
                          <select
                            value={p.accountStatus}
                            onChange={(e) =>
                              adminUpdateCitizenStatus(p.uid, {
                                accountStatus: e.target.value as any
                              })
                            }
                            className="px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Deletion Requested">Deletion Requested</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' ? (
                            confirmPurgeUid === p.uid ? (
                              <div className="inline-flex gap-1">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await adminDeleteCitizenProfile(p.uid);
                                    setConfirmPurgeUid(null);
                                  }}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Purge
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmPurgeUid(null)}
                                  className="px-2 py-1 text-[11px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmPurgeUid(p.uid)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Delete Citizen Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VOLUNTARY COMMUNITY GROUPS */}
      {tab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await adminSaveGroup({
                name: grpName,
                interestCategory: grpInterest,
                localityFilter: grpLocality,
                description: grpDesc,
                isNonPoliticalConfirmed: true,
                isActive: true
              });
              setGrpName('');
              setGrpDesc('');
              setBanner({ type: 'ok', text: 'Voluntary non-political civic group created.' });
            }}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs h-fit"
          >
            <h3 className="font-bold text-sm text-[#123B28]">Create Voluntary Service Group</h3>
            <p className="text-[11px] text-slate-500">
              All groups are non-political & service-oriented. Member phone numbers remain hidden between members.
            </p>
            <input
              required
              placeholder="Group Name (e.g. Clean Chichawatni Community)"
              value={grpName}
              onChange={(e) => setGrpName(e.target.value)}
              className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
            />
            <select
              value={grpInterest}
              onChange={(e) => setGrpInterest(e.target.value as any)}
              className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
            >
              {CITIZEN_INTEREST_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.en}
                </option>
              ))}
              <option value="Multi-Sector Civic">Multi-Sector Civic</option>
            </select>
            <input
              placeholder="Locality focus (optional)"
              value={grpLocality}
              onChange={(e) => setGrpLocality(e.target.value)}
              className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
            />
            <textarea
              required
              rows={3}
              placeholder="Service focus & volunteer scope..."
              value={grpDesc}
              onChange={(e) => setGrpDesc(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              className="w-full min-h-[42px] bg-[#087A43] text-white font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Civic Group</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await adminSeedVoluntaryGroupTemplates();
                setBanner({ type: 'ok', text: '6 official non-political civic group frameworks created.' });
              }}
              className="w-full min-h-[38px] border border-slate-300 text-[#123B28] font-semibold rounded-xl cursor-pointer hover:bg-slate-50"
            >
              Initialize 6 Civic Group Frameworks
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {adminGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No voluntary community groups created yet. Use the form or Initialize 6 Civic Group Frameworks.
              </div>
            ) : (
              adminGroups.map((grp: CitizenGroup) => {
                const count = adminGroupMembers.filter((m) => m.groupId === grp.id && m.status === 'Active').length;
                const matchingInterested = adminProfiles.filter((p) => {
                  if (!p.phoneVerified || p.accountStatus !== 'Active') return false;
                  const rec = adminInterests.find((i) => i.uid === p.uid);
                  return (
                    grp.interestCategory === 'Multi-Sector Civic' ||
                    rec?.interests.includes(grp.interestCategory)
                  );
                });

                return (
                  <div key={grp.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-sm text-[#123B28]">{grp.name}</strong>
                        <div className="text-[11px] text-slate-500">
                          {grp.interestCategory} · {grp.localityFilter || 'All City Wards'} · {count} active members
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const added = await adminAssignMembersToGroup(grp, matchingInterested);
                            setBanner({
                              type: 'ok',
                              text: `Added ${added} matching opted-in members to "${grp.name}".`
                            });
                          }}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#123B28] text-white font-semibold cursor-pointer"
                        >
                          Sync Matching Interested ({matchingInterested.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => adminDeleteGroup(grp.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-600">{grp.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONSENT-VERIFIED COMMUNICATION SYSTEM */}
      {tab === 'communications' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (communicationAudience.eligible.length === 0) {
                setBanner({
                  type: 'err',
                  text: '0 opted-in citizens match your selected consent category and channel. Dispatch blocked.'
                });
                return;
              }
              setSendingComm(true);
              const res = await adminSendConsentCommunication({
                channel: commChannel,
                consentCategory: commCategory,
                templateName: commTemplate,
                subject: commSubject,
                messageBody: commBody,
                targetUids: communicationAudience.eligible
              });
              setSendingComm(false);
              setBanner({
                type: 'ok',
                text: `Communication processed: ${res.sent} sent/delivered, ${res.simulated} queued/gateway-pending, ${res.failed} failed, ${res.skippedNoConsent} skipped (no consent).`
              });
            }}
            className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
              <span>
                <strong>Strict Consent Enforcement:</strong> Unauthorized bulk messaging is disabled. Both client and server verify explicit opt-in consent, active channel preference, and non-unsubscribed status before delivery.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Gateway Channel</span>
                <select
                  value={commChannel}
                  onChange={(e) => setCommChannel(e.target.value as CitizenContactMethod)}
                  className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                >
                  <option value="In-App">In-App Citizen Notification</option>
                  <option value="WhatsApp">WhatsApp Business API</option>
                  <option value="SMS">SMS Gateway</option>
                  <option value="Email">Email Notification</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Required Consent Category</span>
                <select
                  value={commCategory}
                  onChange={(e) => setCommCategory(e.target.value as CitizenConsentCategory)}
                  className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                >
                  {CITIZEN_CONSENT_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.en}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Filter by Locality</span>
                <select
                  value={commLocalityFilter}
                  onChange={(e) => setCommLocalityFilter(e.target.value)}
                  className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                >
                  <option value="all">All Localities</option>
                  {stats.localities.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Filter by Interest</span>
                <select
                  value={commInterestFilter}
                  onChange={(e) => setCommInterestFilter(e.target.value)}
                  className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                >
                  <option value="all">All Interests</option>
                  {CITIZEN_INTEREST_TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.en}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-700">Load Approved Message Template</span>
              <select
                value={commTemplate}
                onChange={(e) => {
                  const name = e.target.value;
                  setCommTemplate(name);
                  const found = COMMUNICATION_TEMPLATES.find((t) => t.name === name);
                  if (found) {
                    setCommCategory(found.consentCategory);
                    setCommSubject(found.subject);
                    setCommBody(found.body);
                  }
                }}
                className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
              >
                <option value="Custom Update">Custom Service Update</option>
                {COMMUNICATION_TEMPLATES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              required
              placeholder="Message Subject *"
              value={commSubject}
              onChange={(e) => setCommSubject(e.target.value)}
              className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
            />
            <textarea
              required
              rows={4}
              placeholder="Public service update message body (non-political)..."
              value={commBody}
              onChange={(e) => setCommBody(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl"
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#123B28]">
                  Eligible Opted-In Recipients: <span className="font-mono">{communicationAudience.eligible.length}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Excluded (missing category consent, channel opt-in, or unsubscribed): {communicationAudience.excludedCount}
                </div>
              </div>
              <button
                type="submit"
                disabled={sendingComm || communicationAudience.eligible.length === 0}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingComm ? 'Dispatching...' : 'Send Opt-In Update'}</span>
              </button>
            </div>
          </form>

          {/* Delivery Logs */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-[#123B28]">Delivery & Consent Audit History</h3>
            {adminCommLogs.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">No communication dispatches logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto">
                {adminCommLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[#123B28] truncate">{log.subject}</strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.deliveryStatus === 'Sent' || log.deliveryStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800'
                            : log.deliveryStatus === 'Failed'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {log.deliveryStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {log.channel} · {log.recipientName} ({log.recipientMaskedContact})
                    </div>
                    {log.failedReason && (
                      <div className="text-[11px] text-red-700">{log.failedReason}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SUGGESTIONS, SURVEYS & VOLUNTEERS */}
      {tab === 'participation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Citizen Suggestions Moderation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#087A43]" />
                <span>Citizen Improvement Suggestions ({adminSuggestions.length})</span>
              </h3>
              {adminSuggestions.length === 0 ? (
                <p className="text-slate-500">No citizen improvement suggestions submitted yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {adminSuggestions.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[#123B28]">{s.title}</strong>
                        <select
                          value={s.status}
                          onChange={(e) => adminUpdateSuggestion(s.id, { status: e.target.value as any })}
                          className="px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Community Review">Under Community Review</option>
                          <option value="Forwarded for Technical Feasibility">Forwarded for Technical Feasibility</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                      <p className="text-slate-600">{s.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{s.citizenDisplayName} · {s.locality}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#087A43]">
                          <input
                            type="checkbox"
                            checked={s.isPublishedSummary}
                            onChange={(e) =>
                              adminUpdateSuggestion(s.id, { isPublishedSummary: e.target.checked })
                            }
                          />
                          <span>Publish Anonymous Summary</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Survey Builder & Volunteers */}
            <div className="space-y-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const q: CitizenSurveyQuestion = {
                    id: 'q1',
                    prompt: srvQPrompt.trim(),
                    options: srvQOptions
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean)
                  };
                  await adminSaveSurvey({
                    title: srvTitle,
                    topic: srvTopic,
                    description: srvDesc,
                    questions: [q],
                    status: 'Active'
                  });
                  setSrvTitle('');
                  setSrvDesc('');
                  setSrvQPrompt('');
                  setBanner({ type: 'ok', text: 'Voluntary civic survey published for community feedback.' });
                }}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs"
              >
                <h3 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#087A43]" />
                  <span>Launch Voluntary Public Survey ({adminSurveys.length})</span>
                </h3>
                <input
                  required
                  placeholder="Survey Title *"
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  className="w-full min-h-[38px] px-3 border border-slate-300 rounded-xl"
                />
                <input
                  required
                  placeholder="Question Prompt *"
                  value={srvQPrompt}
                  onChange={(e) => setSrvQPrompt(e.target.value)}
                  className="w-full min-h-[38px] px-3 border border-slate-300 rounded-xl"
                />
                <input
                  required
                  placeholder="Comma-separated answer options"
                  value={srvQOptions}
                  onChange={(e) => setSrvQOptions(e.target.value)}
                  className="w-full min-h-[38px] px-3 border border-slate-300 rounded-xl"
                />
                <textarea
                  rows={2}
                  placeholder="Survey description..."
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
                <button
                  type="submit"
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-[#123B28] text-white font-bold cursor-pointer"
                >
                  Publish Active Survey
                </button>
              </form>

              {/* Volunteers */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#087A43]" />
                  <span>Community Volunteers ({adminVolunteers.length})</span>
                </h3>
                {adminVolunteers.length === 0 ? (
                  <p className="text-slate-500">No volunteer applications yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {adminVolunteers.map((v) => (
                      <div key={v.id} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                        <div>
                          <strong className="text-[#123B28]">{v.volunteerName}</strong> · {v.initiativeTitle}
                          <div className="text-[11px] text-slate-500">
                            {v.locality} · {v.availability}
                          </div>
                        </div>
                        <select
                          value={v.status}
                          onChange={(e) => adminUpdateVolunteerStatus(v.id, e.target.value as any)}
                          className="px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                        >
                          <option value="Registered">Registered</option>
                          <option value="Approved">Approved</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ORGANIZATION & BUSINESS VERIFICATION DESK */}
      {tab === 'organizations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#087A43]" />
                <span>Organizations, Businesses, NGOs & Institutions Verification</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verify credentials before toggling Public Publication so unverified listings never appear publicly.
              </p>
            </div>
          </div>

          {adminOrganizations.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">No organization submissions waiting for verification.</p>
          ) : (
            <div className="space-y-3">
              {adminOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#087A43]">
                      {org.orgCategory} · {org.locality}
                    </div>
                    <strong className="text-sm text-[#123B28]">{org.orgName}</strong>
                    <p className="text-slate-600">{org.description}</p>
                    <div className="text-[11px] text-slate-500">
                      Focal: {org.focalPersonName}
                      {org.registrationNumber ? ` · Reg: ${org.registrationNumber}` : ''}
                      {org.publicContactPhone ? ` · Phone: ${org.publicContactPhone}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => adminVerifyOrganization(org.id, 'Verified', true)}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#087A43] text-white font-bold cursor-pointer"
                    >
                      Verify & Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => adminVerifyOrganization(org.id, 'Rejected', false)}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-semibold cursor-pointer"
                    >
                      Reject / Unpublish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privacy Retention Footer */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Data Protection Policy: Personal mobile numbers in Citizen Network Management are restricted exclusively to authorized administrators and must never be exported for political campaigning or unauthorized third-party distribution.
        </span>
      </div>
    </div>
  );
};
