import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useCityData, PublicCityComplaintTrackingView } from '../context/CityDataContext';
import {
  CITY_COMPLAINT_CATEGORIES,
  MASTER_PLAN_SECTORS,
  OFFICIAL_APPROVED_PROJECT_STATUSES
} from '../data/cityManagementData';
import { CityComplaintCategory } from '../types';
import { formatPkr, getProjectStatusBadgeClass } from '../admin/city/CitySharedUI';
import {
  Building2,
  MapPin,
  HardHat,
  FileSpreadsheet,
  PhoneCall,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trees,
  Stethoscope,
  GraduationCap,
  Store
} from 'lucide-react';

type PublicCitySection =
  | 'vision'
  | 'facilities'
  | 'projects'
  | 'map'
  | 'reports'
  | 'contacts'
  | 'complaints';

export const CityPublicPortal: React.FC = () => {
  const { language } = useLanguage();
  const {
    cityAreas,
    cityAssets,
    cityProjects,
    cityReports,
    cityNotices,
    cityDepartments,
    submitCityComplaint,
    lookupCityComplaint
  } = useCityData();

  const [activeSub, setActiveSub] = useState<PublicCitySection>('vision');
  const [facilityFilter, setFacilityFilter] = useState<'all' | 'Parks' | 'Health' | 'Education' | 'Markets'>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'official' | 'proposed'>('all');

  // Municipal Complaint Form State
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cArea, setCArea] = useState('');
  const [cLocality, setCLocality] = useState('');
  const [cCategory, setCCategory] = useState<CityComplaintCategory>('Garbage');
  const [cDesc, setCDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Complaint Lookup State
  const [trackInput, setTrackInput] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackedResult, setTrackedResult] = useState<PublicCityComplaintTrackingView | null>(null);
  const [trackNotFound, setTrackNotFound] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const publicProjects = useMemo(
    () =>
      cityProjects
        .filter((p) => !p.isSampleTemplate)
        .filter((p) => {
          const isOfficial = OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status);
          if (projectStatusFilter === 'official') return isOfficial;
          if (projectStatusFilter === 'proposed') return !isOfficial;
          return true;
        }),
    [cityProjects, projectStatusFilter]
  );

  const publicFacilities = useMemo(
    () =>
      cityAssets
        .filter((a) => ['Parks', 'Health', 'Education', 'Markets'].includes(a.domain))
        .filter((a) => facilityFilter === 'all' || a.domain === facilityFilter),
    [cityAssets, facilityFilter]
  );

  const publishedReports = useMemo(() => cityReports.filter((r) => r.isPublished), [cityReports]);
  const publishedNotices = useMemo(() => cityNotices.filter((n) => n.isPublished), [cityNotices]);

  useEffect(() => {
    if (activeSub !== 'map' || !mapRef.current) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current).setView([30.5333, 72.7000], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    cityAreas
      .filter((a) => typeof a.latitude === 'number' && typeof a.longitude === 'number')
      .forEach((a) => {
        L.circleMarker([a.latitude!, a.longitude!], {
          radius: 7,
          fillColor: '#123B28',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.85
        })
          .bindPopup(`<strong>${a.name}</strong><br/>Ward ${a.wardCode} (${a.zoneType})`)
          .addTo(map);
      });

    publicFacilities
      .filter((f) => typeof f.latitude === 'number' && typeof f.longitude === 'number')
      .forEach((f) => {
        L.circleMarker([f.latitude!, f.longitude!], {
          radius: 7,
          fillColor: '#0284C7',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.85
        })
          .bindPopup(`<strong>${f.name}</strong><br/>${f.domain} · ${f.locality}`)
          .addTo(map);
      });

    publicProjects
      .filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
      .forEach((p) => {
        L.circleMarker([p.latitude!, p.longitude!], {
          radius: 8,
          fillColor: '#087A43',
          color: '#C9A227',
          weight: 2,
          fillOpacity: 0.9
        })
          .bindPopup(`<strong>${p.projectCode}: ${p.name}</strong><br/>${p.status} · ${p.physicalProgressPercent}%`)
          .addTo(map);
      });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [activeSub, cityAreas, publicFacilities, publicProjects]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (cDesc.trim().length < 8) {
      setFormError('Please provide at least 8 characters describing the municipal issue.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await submitCityComplaint({
        citizenName: cName,
        phone: cPhone,
        area: cArea,
        locality: cLocality,
        category: cCategory,
        description: cDesc
      });
      setSubmittedId(created.trackingId);
      setTrackInput(created.trackingId);
      setCName('');
      setCPhone('');
      setCArea('');
      setCLocality('');
      setCDesc('');
    } catch {
      setFormError('Unable to submit complaint right now. Please verify your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackLoading(true);
    setTrackNotFound(false);
    const res = await lookupCityComplaint(trackInput);
    setTrackedResult(res);
    if (!res) setTrackNotFound(true);
    setTrackLoading(false);
  };

  const navTabs: { id: PublicCitySection; labelEn: string; labelUr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'vision', labelEn: 'City Vision 2030', labelUr: 'شہری وژن 2030', icon: Building2 },
    { id: 'facilities', labelEn: 'Public Facilities', labelUr: 'عوامی مراکز', icon: Trees },
    { id: 'projects', labelEn: 'City Projects', labelUr: 'شہری منصوبے', icon: HardHat },
    { id: 'map', labelEn: 'City GIS Map', labelUr: 'شہری نقشہ', icon: MapPin },
    { id: 'reports', labelEn: 'Reports & Notices', labelUr: 'رپورٹس و اعلانات', icon: FileSpreadsheet },
    { id: 'contacts', labelEn: 'Service Contacts', labelUr: 'محکمانہ رابطے', icon: PhoneCall },
    { id: 'complaints', labelEn: 'City Complaints', labelUr: 'شہری شکایات', icon: MessageSquare }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B28] to-[#087A43] rounded-2xl p-6 sm:p-8 text-white shadow-md space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227] block">
          {language === 'ur' ? 'چیچہ وطنی سٹی انفارمیشن و ماسٹر ڈویلپمنٹ پورٹل' : 'Chichawatni City Information & Master Development Portal (2027–2030)'}
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight">
          {language === 'ur' ? 'چیچہ وطنی شہری ترقیاتی وژن 2027–2030' : 'Chichawatni City Management & Public Service Transparency Hub'}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          {language === 'ur'
            ? 'شہری سہولیات کی ڈائریکٹری، ترقیاتی منصوبوں کی پیش رفت، شائع شدہ رپورٹس اور صفائی و بلدیاتی شکایات کے اندراج کا شفاف عوامی پلیٹ فارم۔'
            : 'Explore Chichawatni urban development sectors, public facilities, verified scheme progress, published performance reports, and municipal grievance tracking.'}
        </p>
        <div className="bg-black/25 border border-white/15 rounded-xl px-4 py-2.5 text-[11px] text-emerald-50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
          <span>
            {language === 'ur'
              ? 'نوٹ: یہ چوہدری اسد حنیف جٹ (ایم پی اے پی پی-203) کا عوامی خدمت و رابطہ پورٹل ہے، کوئی سرکاری میونسپل یا حکومتی محکمہ نہیں۔'
              : 'Public Notice: Provided for constituent transparency by the Office of Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni). Not an official municipal or government department website.'}
          </span>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSub === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSub(tab.id)}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
                active
                  ? 'bg-[#087A43] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-[#F7F9F7]'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#C9A227]' : 'text-[#087A43]'}`} />
              <span>{language === 'ur' ? tab.labelUr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ABOUT CHICHAWATNI & VISION 2030 */}
      {activeSub === 'vision' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs text-slate-500">Mapped City Areas</span>
              <div className="text-2xl font-bold text-[#123B28] mt-1">{cityAreas.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs text-slate-500">Public Facilities Listed</span>
              <div className="text-2xl font-bold text-[#087A43] mt-1">{publicFacilities.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs text-slate-500">Approved / Active City Schemes</span>
              <div className="text-2xl font-bold text-[#123B28] mt-1">
                {publicProjects.filter((p) => OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status)).length}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <span className="text-xs text-slate-500">Master Plan Sectors (2027–2030)</span>
              <div className="text-2xl font-bold text-[#087A43] mt-1">12 Sectors</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-editorial text-xl font-bold text-[#123B28]">
              {language === 'ur' ? 'ماسٹر ڈویلپمنٹ پلان 2027–2030 کے 12 شعبے' : 'Chichawatni 12-Sector Development Vision (2027–2030)'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {MASTER_PLAN_SECTORS.map((sec) => (
                <div key={sec.code} className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200 space-y-1">
                  <div className="font-bold text-[#087A43]">Sector {sec.code}</div>
                  <div className="font-bold text-sm text-[#123B28]">
                    {language === 'ur' ? sec.nameUrdu : sec.name}
                  </div>
                  <p className="text-slate-600">{sec.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PUBLIC FACILITIES DIRECTORY */}
      {activeSub === 'facilities' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#123B28]">Public Facilities & Commercial Directory</h2>
              <p className="text-xs text-slate-500">Publicly verified parks, healthcare units, schools, colleges, and bazaar directories (zero private PII exposed).</p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(['all', 'Parks', 'Health', 'Education', 'Markets'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFacilityFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                    facilityFilter === cat
                      ? 'bg-[#087A43] text-white border-[#087A43]'
                      : 'bg-[#F7F9F7] text-slate-700 border-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Facilities' : cat}
                </button>
              ))}
            </div>
          </div>

          {publicFacilities.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Verified public city facilities will appear here once published by the Secretariat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {publicFacilities.map((f) => {
                const Icon =
                  f.domain === 'Health' ? Stethoscope : f.domain === 'Education' ? GraduationCap : f.domain === 'Markets' ? Store : Trees;
                return (
                  <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-[#F7F9F7] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#087A43] font-bold">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{f.domain} · {f.subType}</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#123B28]">{f.name}</h3>
                    <div className="text-slate-600">{f.locality} · Status: <strong>{f.status}</strong></div>
                    {f.details && <p className="text-slate-500">{f.details}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. PUBLIC CITY PROJECTS */}
      {activeSub === 'projects' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#123B28]">City Development Projects & Progress (2027–2030)</h2>
              <p className="text-xs text-slate-500">Clearly separates officially approved/ongoing schemes from proposed city concepts.</p>
            </div>
            <div className="flex gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Verified Items' },
                { id: 'official', label: 'Approved / In Progress' },
                { id: 'proposed', label: 'Proposed Concepts' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProjectStatusFilter(opt.id as typeof projectStatusFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                    projectStatusFilter === opt.id
                      ? 'bg-[#123B28] text-white border-[#123B28]'
                      : 'bg-[#F7F9F7] text-slate-700 border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {publicProjects.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No public city development schemes published yet for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {publicProjects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#087A43]">{p.projectCode} · {p.targetYear}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getProjectStatusBadgeClass(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#123B28]">{p.name}</h3>
                  <div className="text-slate-600">{p.sector} · {p.locality}</div>
                  {OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status) && p.approvedCostPkr > 0 && (
                    <div className="text-[#087A43] font-semibold">Approved Allocation: {formatPkr(p.approvedCostPkr)}</div>
                  )}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Physical Progress</span>
                      <span>{p.physicalProgressPercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#087A43]" style={{ width: `${p.physicalProgressPercent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PUBLIC CITY MAP */}
      {activeSub === 'map' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#123B28]">Chichawatni Public Facilities & Projects GIS Map</h2>
          <p className="text-xs text-slate-500">Displays public mapped wards, facilities, and city projects only.</p>
          <div ref={mapRef} className="w-full h-[480px] rounded-xl border border-slate-200 z-0" />
        </div>
      )}

      {/* 5. PUBLISHED REPORTS & NOTICES */}
      {activeSub === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">Published City Performance Reports</h2>
            {publishedReports.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No public performance reports published yet.</p>
            ) : (
              publishedReports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200 space-y-1.5">
                  <div className="font-bold text-sm text-[#123B28]">{r.title}</div>
                  <div className="text-[11px] text-[#087A43] font-semibold">Period: {r.period} · Dept: {r.department} · Status: {r.verificationStatus}</div>
                  <p className="text-slate-600">{r.summary}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">Public Municipal Advisories & Notices</h2>
            {publishedNotices.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No active city advisories at this time.</p>
            ) : (
              publishedNotices.map((n) => (
                <div key={n.id} className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200 space-y-1">
                  <div className="font-bold text-sm text-[#123B28]">{n.title}</div>
                  <div className="text-[11px] text-slate-500">{n.category} · {n.publishDate}</div>
                  <p className="text-slate-600">{n.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. PUBLIC SERVICE CONTACTS */}
      {activeSub === 'contacts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#123B28]">Chichawatni Municipal & Civic Coordination Contacts</h2>
            <p className="text-slate-500">These departments operate independently under provincial/municipal authority; the Secretariat assists citizens with escalation.</p>
          </div>
          {cityDepartments.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">Department directory entries will appear once verified.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cityDepartments.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200 space-y-1">
                  <div className="font-bold text-sm text-[#123B28]">{d.name}</div>
                  <div className="text-slate-600">{d.jurisdiction}</div>
                  <div className="text-[11px] text-[#087A43] font-semibold">
                    Focal Desk: {d.focalPerson || 'Pending Verification'} · {d.contactPhone || 'Contact via Secretariat'}
                  </div>
                  {d.officeAddress && <div className="text-[11px] text-slate-500">{d.officeAddress}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. SUBMIT & TRACK MUNICIPAL COMPLAINT */}
      {activeSub === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <form onSubmit={handleSubmitComplaint} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3.5">
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">
              {language === 'ur' ? 'بلدیاتی و شہری شکایت درج کروائیں' : 'Submit Municipal City Complaint'}
            </h2>
            {submittedId && (
              <div className="bg-emerald-50 border border-emerald-300 text-[#123B28] p-3.5 rounded-xl space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#087A43]">
                  <CheckCircle2 className="w-4 h-4" /> Complaint Registered Successfully
                </div>
                <div>Your Municipal Tracking ID: <strong className="font-mono">{submittedId}</strong> (save this ID to track progress).</div>
              </div>
            )}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" required value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Citizen Full Name" className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]" />
              <input type="tel" required value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="Mobile Number (e.g. 03001234567)" className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]" />
              <input type="text" value={cArea} onChange={(e) => setCArea(e.target.value)} placeholder="Ward / Block (optional)" className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]" />
              <input type="text" required value={cLocality} onChange={(e) => setCLocality(e.target.value)} placeholder="Mohallah / Bazaar / Street" className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]" />
            </div>
            <select value={cCategory} onChange={(e) => setCCategory(e.target.value as CityComplaintCategory)} className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]">
              {CITY_COMPLAINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea rows={3} required value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="Describe location landmark and issue clearly..." className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
            <button type="submit" disabled={submitting} className="w-full min-h-[44px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
              {submitting ? 'Submitting...' : 'Submit Municipal Complaint'}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">
              {language === 'ur' ? 'شہری شکایت کا اسٹیٹس ٹریک کریں' : 'Track Municipal Complaint by Tracking ID'}
            </h2>
            <form onSubmit={handleLookup} className="flex gap-2">
              <input type="text" required value={trackInput} onChange={(e) => setTrackInput(e.target.value)} placeholder="Enter Tracking ID (e.g. CITY-2026-AB12)" className="flex-1 px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono min-h-[42px]" />
              <button type="submit" disabled={trackLoading} className="min-h-[42px] px-4 rounded-xl bg-[#123B28] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer">
                <Search className="w-4 h-4 text-[#C9A227]" />
                <span>Track</span>
              </button>
            </form>

            {trackNotFound && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                No municipal complaint found with Tracking ID <strong>{trackInput}</strong>.
              </div>
            )}

            {trackedResult && (
              <div className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#087A43]">{trackedResult.trackingId}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#123B28] text-white font-bold">{trackedResult.status}</span>
                </div>
                <div><strong>Category:</strong> {trackedResult.category} · <strong>Locality:</strong> {trackedResult.locality}</div>
                <div><strong>Phone:</strong> {trackedResult.maskedPhone} · <strong>Priority:</strong> {trackedResult.priority}</div>
                {trackedResult.department && <div><strong>Assigned Department:</strong> {trackedResult.department}</div>}
                {trackedResult.resolutionNotes && <div><strong>Status Update:</strong> {trackedResult.resolutionNotes}</div>}
                <div className="text-[11px] text-slate-500">Updated: {trackedResult.updatedAt.slice(0, 16).replace('T', ' ')}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
