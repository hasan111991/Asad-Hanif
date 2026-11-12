import React, { useState } from 'react';
import { useAuth, AdminModuleId } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  AdminRole,
  AssemblyActivity,
  AssemblyActivityCategory,
  CitizenComplaint,
  ComplaintStatus,
  ContactMessage,
  FundingType,
  NewsCategory,
  NewsItem,
  NoticeCategory,
  Project,
  ProjectCategory,
  ProjectStatus,
  PublicNotice
} from '../types';
import {
  getAssetUrl,
  PORTRAIT_IMAGE_PATH,
  CHICHAWATNI_SCENE_PATH,
  ASSEMBLY_IMAGE_PATH
} from '../utils/assetUrl';
import { AdminLogin } from './AdminLogin';
import { QRCardModal } from './QRCardModal';
import { MonthlyReportModal } from './MonthlyReportModal';
import { MediaFields } from './MediaFields';
import { CityOverviewDashboard } from './city/CityOverviewDashboard';
import { CityMasterPlanView } from './city/CityMasterPlanView';
import { CityGisMapView } from './city/CityGisMapView';
import { CityInfrastructureModule } from './city/CityInfrastructureModule';
import { CityUtilitiesOperationsModule } from './city/CityUtilitiesOperationsModule';
import { CityFacilitiesDirectoryModule } from './city/CityFacilitiesDirectoryModule';
import { CityFinanceDepartmentModule } from './city/CityFinanceDepartmentModule';
import { CityComplaintsSurveysModule } from './city/CityComplaintsSurveysModule';
import { CityReportsAndAIModule } from './city/CityReportsAndAIModule';
import { CitizenNetworkAdminModule } from './city/CitizenNetworkAdminModule';
import {
  LayoutDashboard,
  HardHat,
  MessageSquare,
  Bell,
  CalendarClock,
  Newspaper,
  Image as ImageIcon,
  BarChart3,
  Settings as SettingsIcon,
  Users,
  ShieldAlert,
  Lock,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  Download,
  QrCode,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  AlertCircle,
  Send,
  Search,
  Building2,
  Compass,
  Route,
  Droplets,
  Car,
  Trees,
  Stethoscope,
  Store,
  Lightbulb,
  MapPin,
  Wallet,
  ClipboardCheck,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AdminPortalProps {
  activeSubRoute: AdminModuleId;
  onNavigateRoute: (route: AdminModuleId) => void;
  onExitToPublic: () => void;
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Roads and Infrastructure',
  'Education',
  'Healthcare',
  'Clean Drinking Water',
  'Electricity',
  'Sanitation',
  'Public Facilities'
];

const PROJECT_STATUSES: ProjectStatus[] = [
  'Proposed',
  'Approved',
  'In Progress',
  'Completed'
];

const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'Received',
  'Under Review',
  'Referred to Department',
  'Resolved',
  'Closed'
];

const NOTICE_CATEGORIES: NoticeCategory[] = [
  'Public Announcements',
  'Development Updates',
  'Office Notifications',
  'Public Meetings',
  'Important Documents'
];

const NEWS_CATEGORIES: NewsCategory[] = [
  'Latest Updates',
  'Press Releases',
  'Assembly News',
  'Constituency Visits',
  'Public Darbar'
];

const ASSEMBLY_CATEGORIES: AssemblyActivityCategory[] = [
  'Question Raised',
  'Bill & Resolution',
  'Committee Participation',
  'Parliamentary Activity',
  'Official Announcement'
];

const ADMIN_ROLES: AdminRole[] = [
  'Super Admin',
  'Admin',
  'Office Manager',
  'Project Manager',
  'City Manager',
  'Department Manager',
  'Field Officer',
  'Finance Officer',
  'Media Manager',
  'Data Entry Operator'
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeSubRoute,
  onNavigateRoute,
  onExitToPublic
}) => {
  const {
    currentUser,
    isAuthenticated,
    isDemoSession,
    authLoading,
    logout,
    canAccessModule,
    allStaff,
    createStaffAccount,
    updateStaffRole,
    toggleStaffStatus,
    deleteStaffAccount
  } = useAuth();

  const {
    profile,
    unionCouncils,
    projects,
    assemblyActivities,
    complaints,
    contactMessages,
    notices,
    news,
    gallery,
    smsLogs,
    settings,
    auditLogs,
    seedInitialFirestore,
    updateProfile,
    addProject,
    updateProject,
    deleteProject,
    addAssemblyActivity,
    updateAssemblyActivity,
    deleteAssemblyActivity,
    updateComplaintStatus,
    addNotice,
    updateNotice,
    deleteNotice,
    updateContactStatus,
    deleteContactMessage,
    addNews,
    updateNews,
    deleteNews,
    addGalleryItem,
    deleteGalleryItem,
    updateSettings,
    exportDatabaseJSON
  } = useData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cityMenuOpen, setCityMenuOpen] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Module UI States
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectDraft, setProjectDraft] = useState<Omit<Project, 'id'>>({
    title: '',
    titleUrdu: '',
    category: 'Roads and Infrastructure',
    categoryUrdu: 'سڑکیں اور انفراسٹرکچر',
    unionCouncil: 'UC-91',
    location: 'Chichawatni',
    locationUrdu: 'چیچہ وطنی',
    description: '',
    descriptionUrdu: '',
    status: 'Proposed',
    statusUrdu: 'مجوزہ',
    department: 'Highway & Roads Department Sahiwal',
    departmentUrdu: 'محکمہ ہائی ویز ساہیوال',
    budget: 'Rs. 25 Million',
    startDate: new Date().toISOString().split('T')[0],
    completionDate: '2026-12-31',
    imageUrl: CHICHAWATNI_SCENE_PATH,
    videoUrl: '',
    fundingType: 'Government-Funded',
    fundingTypeUrdu: 'سرکاری فنڈنگ',
    progressPercent: 15,
    latitude: 30.5333,
    longitude: 72.7000
  });

  // Complaints triage state
  const [complaintFilter, setComplaintFilter] = useState<string>('all');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [triagingComplaint, setTriagingComplaint] = useState<CitizenComplaint | null>(null);
  const [triageStatus, setTriageStatus] = useState<ComplaintStatus>('Under Review');
  const [triageDept, setTriageDept] = useState('');
  const [triageOfficer, setTriageOfficer] = useState('');
  const [triageRemarks, setTriageRemarks] = useState('');
  const [triageSms, setTriageSms] = useState(true);

  // Notice modal state
  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<PublicNotice | null>(null);
  const [noticeDraft, setNoticeDraft] = useState<Omit<PublicNotice, 'id'>>({
    title: '',
    titleUrdu: '',
    category: 'Public Announcements',
    categoryUrdu: 'عوامی اعلانات',
    publishDate: new Date().toISOString().split('T')[0],
    description: '',
    descriptionUrdu: '',
    imageUrl: '',
    videoUrl: '',
    fileUrl: '',
    fileName: 'PP203-Official-Notice.pdf',
    fileSize: '420 KB',
    fileType: 'PDF',
    isPublished: true,
    officialRef: 'PP203/SEC/2026'
  });

  // Appointments notes state
  const [editingInquiry, setEditingInquiry] = useState<ContactMessage | null>(null);
  const [inquiryStatus, setInquiryStatus] = useState<ContactMessage['status']>('Reviewed');
  const [inquiryNotes, setInquiryNotes] = useState('');

  // News & Assembly dual-tab state
  const [editorialSubTab, setEditorialSubTab] = useState<'news' | 'assembly'>('news');
  const [newsFormOpen, setNewsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsDraft, setNewsDraft] = useState<Omit<NewsItem, 'id'>>({
    title: '',
    titleUrdu: '',
    category: 'Latest Updates',
    categoryUrdu: 'تازہ ترین اپڈیٹس',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    summaryUrdu: '',
    content: '',
    contentUrdu: '',
    imageUrl: CHICHAWATNI_SCENE_PATH,
    videoUrl: '',
    isFeatured: false
  });

  const [assemblyFormOpen, setAssemblyFormOpen] = useState(false);
  const [editingAssembly, setEditingAssembly] = useState<AssemblyActivity | null>(null);
  const [assemblyDraft, setAssemblyDraft] = useState<Omit<AssemblyActivity, 'id'>>({
    title: '',
    titleUrdu: '',
    category: 'Question Raised',
    categoryUrdu: 'اسمبلی سوال',
    sessionDate: new Date().toISOString().split('T')[0],
    referenceNo: 'PAP-Q-2026',
    summary: '',
    summaryUrdu: '',
    imageUrl: '',
    videoUrl: '',
    status: 'Submitted'
  });

  // Gallery state
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryTitleUr, setGalleryTitleUr] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState(CHICHAWATNI_SCENE_PATH);
  const [galleryVideoUrl, setGalleryVideoUrl] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('Constituency Visit');

  // Settings & Profile form state
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [profileDraft, setProfileDraft] = useState(profile);

  // Sync settings/profile drafts if needed cleanly
  React.useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  React.useEffect(() => {
    setProfileDraft(profile);
  }, [profile]);

  // Staff provisioning state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<AdminRole>('Office Manager');
  const [staffPhone, setStaffPhone] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const notify = (type: 'success' | 'error', text: string) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#123B28] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-emerald-100">
            Verifying Secretariat Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <AdminLogin onExitToPublic={onExitToPublic} />;
  }

  const navItems: {
    id: AdminModuleId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects CMS', icon: HardHat },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'notices', label: 'Public Notices', icon: Bell },
    { id: 'appointments', label: 'Appointments', icon: CalendarClock },
    { id: 'news', label: 'News & Assembly', icon: Newspaper },
    { id: 'gallery', label: 'Media Gallery', icon: ImageIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Profile', icon: SettingsIcon },
    { id: 'staff', label: 'Staff & Roles', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert }
  ];

  const cityNavItems: {
    id: AdminModuleId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'city-overview', label: '1. City Overview Dashboard', icon: LayoutDashboard },
    { id: 'city-master-plan', label: '2. Master Plan 2027–2030', icon: Compass },
    { id: 'city-gis', label: '3. City GIS Map', icon: MapPin },
    { id: 'city-areas', label: '4. Municipal Areas & Localities', icon: Layers },
    { id: 'city-roads', label: '5. Roads & Infrastructure', icon: Route },
    { id: 'city-water-sewerage', label: '6. Water & Sewerage', icon: Droplets },
    { id: 'city-sanitation', label: '7. Sanitation & Waste', icon: Trash2 },
    { id: 'city-traffic', label: '8. Traffic & Transport', icon: Car },
    { id: 'city-parks', label: '9. Parks & Public Spaces', icon: Trees },
    { id: 'city-health-edu', label: '10. Health & Education', icon: Stethoscope },
    { id: 'city-markets', label: '11. Business & Markets', icon: Store },
    { id: 'city-streetlights', label: '12. Streetlights & Safety', icon: Lightbulb },
    { id: 'city-town-planning', label: '13. Town Planning & Growth', icon: Building2 },
    { id: 'city-projects', label: '14. Development Projects (100+)', icon: HardHat },
    { id: 'city-budget', label: '15. Municipal Budget & Finance', icon: Wallet },
    { id: 'city-complaints', label: '16. City Citizen Complaints', icon: MessageSquare },
    { id: 'city-departments', label: '17. Department Management', icon: Users },
    { id: 'city-surveys', label: '18. Field Surveys & Inspections', icon: ClipboardCheck },
    { id: 'city-reports', label: '19. City Performance Reports', icon: FileSpreadsheet },
    { id: 'city-ai', label: '20. AI City Planning Assistant', icon: Sparkles },
    { id: 'city-citizens', label: '21. Citizen Network Management', icon: Users }
  ];

  const isRouteAllowed = canAccessModule(activeSubRoute);
  const currentNavMeta =
    navItems.find((n) => n.id === activeSubRoute) ||
    cityNavItems.find((n) => n.id === activeSubRoute) ||
    navItems[0];

  const resolvedComplaints = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const resolutionRate =
    complaints.length > 0 ? Math.round((resolvedComplaints / complaints.length) * 100) : 0;
  const pendingInquiries = contactMessages.filter((m) => m.status === 'Pending').length;

  const handleExportJSON = () => {
    const json = exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PP203-Secretariat-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', 'Full constituency JSON export downloaded.');
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectDraft);
        notify('success', 'Development project updated in Firestore.');
      } else {
        await addProject(projectDraft);
        notify('success', 'New development project published to Firestore.');
      }
      setProjectFormOpen(false);
      setEditingProject(null);
    } catch (err) {
      notify('error', 'Failed to save project record.');
    }
  };

  const handleOpenEditProject = (p: Project) => {
    setEditingProject(p);
    const { id: _id, ...rest } = p;
    setProjectDraft(rest);
    setProjectFormOpen(true);
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setProjectDraft({
      title: '',
      titleUrdu: '',
      category: 'Roads and Infrastructure',
      categoryUrdu: 'سڑکیں اور انفراسٹرکچر',
      unionCouncil: 'UC-91',
      location: 'Chichawatni',
      locationUrdu: 'چیچہ وطنی',
      description: '',
      descriptionUrdu: '',
      status: 'Proposed',
      statusUrdu: 'مجوزہ',
      department: 'Highway & Roads Department Sahiwal',
      departmentUrdu: 'محکمہ ہائی ویز ساہیوال',
      budget: 'Rs. 25 Million',
      startDate: new Date().toISOString().split('T')[0],
      completionDate: '2026-12-31',
      imageUrl: CHICHAWATNI_SCENE_PATH,
      videoUrl: '',
      fundingType: 'Government-Funded',
      fundingTypeUrdu: 'سرکاری فنڈنگ',
      progressPercent: 10,
      latitude: 30.5333,
      longitude: 72.7000
    });
    setProjectFormOpen(true);
  };

  const handleOpenTriage = (c: CitizenComplaint) => {
    setTriagingComplaint(c);
    setTriageStatus(c.status);
    setTriageDept(c.departmentReferred || '');
    setTriageOfficer(c.assignedOfficer || '');
    setTriageRemarks(c.adminRemarks || '');
    setTriageSms(true);
  };

  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triagingComplaint) return;
    try {
      await updateComplaintStatus(
        triagingComplaint.trackingId,
        triageStatus,
        triageRemarks,
        triageDept,
        triageOfficer,
        triageSms
      );
      setTriagingComplaint(null);
      notify(
        'success',
        `Complaint ${triagingComplaint.trackingId} updated to "${triageStatus}".`
      );
    } catch {
      notify('error', 'Failed to update complaint status.');
    }
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, noticeDraft);
        notify('success', 'Official notice updated.');
      } else {
        await addNotice(noticeDraft);
        notify('success', 'Official notice created.');
      }
      setNoticeFormOpen(false);
      setEditingNotice(null);
    } catch {
      notify('error', 'Failed to save notice.');
    }
  };

  const handleSaveInquiryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;
    try {
      await updateContactStatus(editingInquiry.id, inquiryStatus, inquiryNotes);
      setEditingInquiry(null);
      notify('success', 'Inquiry / Appointment record updated.');
    } catch {
      notify('error', 'Failed to update inquiry.');
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await updateNews(editingNews.id, newsDraft);
        notify('success', 'News update saved.');
      } else {
        await addNews(newsDraft);
        notify('success', 'News update published.');
      }
      setNewsFormOpen(false);
      setEditingNews(null);
    } catch {
      notify('error', 'Failed to save news article.');
    }
  };

  const handleSaveAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAssembly) {
        await updateAssemblyActivity(editingAssembly.id, assemblyDraft);
        notify('success', 'Punjab Assembly activity updated.');
      } else {
        await addAssemblyActivity(assemblyDraft);
        notify('success', 'Punjab Assembly activity published.');
      }
      setAssemblyFormOpen(false);
      setEditingAssembly(null);
    } catch {
      notify('error', 'Failed to save Assembly record.');
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const img = galleryImageUrl.trim();
    const vid = galleryVideoUrl.trim();
    if (!galleryTitle.trim() || (!img && !vid)) {
      notify('error', 'Please enter a title and attach an image or video.');
      return;
    }
    try {
      await addGalleryItem({
        title: galleryTitle.trim(),
        titleUrdu: galleryTitleUr.trim() || galleryTitle.trim(),
        category: galleryCategory,
        categoryUrdu: galleryCategory,
        mediaType: vid && !img ? 'video' : 'photo',
        mediaUrl: img || vid,
        imageUrl: img,
        videoUrl: vid,
        date: new Date().toISOString().split('T')[0],
        caption: galleryTitle.trim(),
        captionUrdu: galleryTitleUr.trim() || galleryTitle.trim()
      });
      setGalleryTitle('');
      setGalleryTitleUr('');
      setGalleryVideoUrl('');
      notify('success', 'Media item added to Gallery.');
    } catch {
      notify('error', 'Could not add gallery item.');
    }
  };

  const handleSaveSettingsAndProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsDraft);
      await updateProfile(profileDraft);
      notify('success', 'Portal settings and Representative Profile saved to Firestore.');
    } catch {
      notify('error', 'Failed to save settings.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createStaffAccount({
      email: staffEmail,
      password: staffPassword,
      displayName: staffName,
      role: staffRole,
      phone: staffPhone
    });
    if (res.success) {
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPhone('');
      notify('success', `Staff account provisioned (${staffRole}).`);
    } else {
      notify('error', res.error || 'Could not create staff user.');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesFilter = complaintFilter === 'all' || c.status === complaintFilter;
    const q = complaintSearch.toLowerCase();
    const matchesSearch =
      !q ||
      c.trackingId.toLowerCase().includes(q) ||
      c.citizenName.toLowerCase().includes(q) ||
      c.unionCouncil.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filteredAudit = auditLogs.filter((log) => {
    const q = auditSearch.toLowerCase();
    return (
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#123B28] text-white">
      {/* Brand Block */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#C9A227] overflow-hidden shrink-0">
          <img
            src={getAssetUrl(profile.photoUrl || PORTRAIT_IMAGE_PATH)}
            alt="Secretariat Crest"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <span className="font-editorial text-sm font-bold text-white block truncate">
            PP-203 Secretariat
          </span>
          <span className="text-[11px] text-[#C9A227] block truncate">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200/60">
          PP-203 Secretariat CMS
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const allowed = canAccessModule(item.id);
          const active = activeSubRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigateRoute(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                active
                  ? 'bg-[#087A43] text-white shadow-xs border border-[#C9A227]/40'
                  : allowed
                    ? 'text-emerald-100/85 hover:bg-white/10 hover:text-white'
                    : 'text-emerald-200/40 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0 text-[#C9A227]" />
                <span className="truncate">{item.label}</span>
              </span>
              {!allowed && <Lock className="w-3.5 h-3.5 shrink-0 opacity-70" />}
            </button>
          );
        })}

        {/* Chichawatni City Management (2027-2030) */}
        <div className="pt-3 mt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setCityMenuOpen((prev) => !prev)}
            className="w-full px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#C9A227] hover:bg-white/5 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Chichawatni City Management</span>
            </span>
            {cityMenuOpen ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>

          {cityMenuOpen && (
            <div className="mt-1 space-y-0.5">
              {cityNavItems.map((item) => {
                const Icon = item.icon;
                const allowed = canAccessModule(item.id);
                const active = activeSubRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigateRoute(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition cursor-pointer ${
                      active
                        ? 'bg-[#C9A227] text-[#123B28] shadow-xs font-bold'
                        : allowed
                          ? 'text-emerald-100/85 hover:bg-white/10 hover:text-white'
                          : 'text-emerald-200/40 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          active ? 'text-[#123B28]' : 'text-[#C9A227]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {!allowed && <Lock className="w-3 h-3 shrink-0 opacity-70" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/10 space-y-1.5">
        <button
          type="button"
          onClick={onExitToPublic}
          className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>Public Website</span>
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-xs font-semibold text-red-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#1B241E] flex w-full max-w-full overflow-x-hidden">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex bg-black/60 backdrop-blur-xs">
          <div className="w-72 max-w-[82%] h-full shadow-2xl">
            <SidebarContent />
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)}>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="m-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-[#123B28] hover:bg-slate-50 cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#087A43] block">
                Private Admin CMS · /admin/{activeSubRoute}
              </span>
              <h1 className="font-editorial text-sm sm:text-lg font-bold text-[#123B28] truncate">
                {currentNavMeta.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-[#123B28]">{currentUser.displayName}</div>
              <div className="text-[11px] text-slate-500">
                {currentUser.email} · {currentUser.role}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-[#F7F9F7] border border-slate-200 text-xs font-bold text-[#123B28] hover:bg-emerald-50 inline-flex items-center gap-1.5 cursor-pointer"
              title="QR Code & Visiting Card"
            >
              <QrCode className="w-4 h-4 text-[#087A43]" />
              <span className="hidden md:inline">QR Card</span>
            </button>
          </div>
        </header>

        {/* Temporary Demo Session Banner */}
        {isDemoSession && (
          <div className="px-4 sm:px-6 pt-4">
            <div className="rounded-xl px-4 py-2.5 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Demo Admin Mode ({currentUser.email}):</strong> Full CMS controls are active for this browser session. Sign in via Google (<span className="font-mono">hasanaamir815@gmail.com</span>) for permanent Firestore cloud persistence.
              </span>
            </div>
          </div>
        )}

        {/* Feedback Alert Banner */}
        {feedbackBanner && (
          <div className="px-4 sm:px-6 pt-4">
            <div
              className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center justify-between gap-3 border ${
                feedbackBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-[#123B28]'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackBanner.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#087A43] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedbackBanner.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {!isRouteAllowed ? (
            <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-editorial text-xl font-bold text-[#123B28]">
                Access Denied
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your Secretariat role (<strong className="text-[#123B28]">{currentUser.role}</strong>) does not have permission to access <span className="font-mono">/admin/{activeSubRoute}</span>.
              </p>
              <button
                type="button"
                onClick={() => onNavigateRoute('dashboard')}
                className="min-h-[42px] bg-[#123B28] text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-[#087A43] cursor-pointer"
              >
                Return to Overview
              </button>
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW DASHBOARD */}
              {activeSubRoute === 'dashboard' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium block">
                        Development Projects
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 tabular-nums">
                        {projects.length}
                      </div>
                      <span className="text-[11px] text-[#087A43] font-semibold mt-1 inline-block">
                        {projects.filter((p) => p.status === 'In Progress').length} In Progress
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium block">
                        Grievances & Resolution
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-[#087A43] mt-1 tabular-nums">
                        {complaints.length} · {resolutionRate}%
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                        {resolvedComplaints} Resolved / Closed
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium block">
                        Official Gazette Notices
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 tabular-nums">
                        {notices.length}
                      </div>
                      <span className="text-[11px] text-[#087A43] font-semibold mt-1 inline-block">
                        {notices.filter((n) => n.isPublished).length} Published Live
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium block">
                        Pending Appointments
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1 tabular-nums">
                        {pendingInquiries}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                        {contactMessages.length} Total Messages
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions Strip */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-sm text-[#123B28]">
                        Secretariat Quick Actions
                      </h2>
                      <p className="text-xs text-slate-500">
                        Generate official stationery, print public service PDF summaries, or export backups.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#123B28] hover:bg-[#087A43] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-[#C9A227]" />
                        <span>QR & Visiting Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-[#C9A227]" />
                        <span>Monthly Report PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#123B28] text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#087A43]" />
                        <span>Export JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await seedInitialFirestore();
                          notify('success', 'Firestore baseline seed checked/synced.');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#123B28] text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-[#087A43]" />
                        <span>Sync Baseline Seed</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Complaints & Pending Appointments Split */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#123B28]">
                          Recent Citizen Grievances
                        </h3>
                        {canAccessModule('complaints') && (
                          <button
                            type="button"
                            onClick={() => onNavigateRoute('complaints')}
                            className="text-xs font-bold text-[#087A43] hover:underline cursor-pointer"
                          >
                            Manage All
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {complaints.slice(0, 5).map((c) => (
                          <div key={c.trackingId} className="py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-[#123B28] truncate">
                                <span className="font-mono text-[#087A43] mr-2">
                                  {c.trackingId}
                                </span>
                                {c.citizenName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {c.category} · {c.unionCouncil} ({c.locality})
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-[#123B28] shrink-0">
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#123B28]">
                          Latest Inquiries & Appointments
                        </h3>
                        {canAccessModule('appointments') && (
                          <button
                            type="button"
                            onClick={() => onNavigateRoute('appointments')}
                            className="text-xs font-bold text-[#087A43] hover:underline cursor-pointer"
                          >
                            Open Desk
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {contactMessages.slice(0, 5).map((m) => (
                          <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-[#123B28] truncate">
                                {m.name} ·{' '}
                                <span className="text-slate-500 font-normal">
                                  {m.inquiryType}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {m.message}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-amber-700 shrink-0">
                              {m.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PROJECTS CRUD */}
              {activeSubRoute === 'projects' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-base text-[#123B28]">
                        PP-203 Development Schemes ({projects.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage constituency infrastructure, GPS coordinates, budgets, and progress metrics.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenNewProject}
                      className="min-h-[44px] bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#C9A227]" />
                      <span>Add Development Project</span>
                    </button>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-[#087A43]">{p.category}</span>
                          <span className="font-bold text-[#123B28] tabular-nums">
                            {p.progressPercent}%
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[#123B28]">{p.title}</h3>
                        <p className="text-slate-500">
                          {p.unionCouncil} · {p.budget} · {p.status}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(p)}
                            className="flex-1 min-h-[40px] bg-[#F7F9F7] border border-slate-200 rounded-xl font-bold text-[#123B28] inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProject(p.id)}
                            className="min-h-[40px] px-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F9F7] text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Project Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">UC</th>
                            <th className="px-4 py-3">Budget</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Progress</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {projects.map((p) => (
                            <tr key={p.id} className="hover:bg-[#F7F9F7]/70">
                              <td className="px-4 py-3 font-bold text-[#123B28] max-w-xs truncate">
                                {p.title}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{p.category}</td>
                              <td className="px-4 py-3 font-mono">{p.unionCouncil}</td>
                              <td className="px-4 py-3 font-mono tabular-nums">{p.budget}</td>
                              <td className="px-4 py-3 font-semibold text-[#087A43]">
                                {p.status}
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums">
                                {p.progressPercent}%
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProject(p)}
                                    className="p-2 rounded-lg hover:bg-emerald-50 text-[#087A43] cursor-pointer"
                                    aria-label="Edit project"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteProject(p.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                                    aria-label="Delete project"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. COMPLAINTS & SMS DESK */}
              {activeSubRoute === 'complaints' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={complaintSearch}
                        onChange={(e) => setComplaintSearch(e.target.value)}
                        placeholder="Search CMP ID, citizen name, UC..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl min-h-[42px]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['all', ...COMPLAINT_STATUSES].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setComplaintFilter(st)}
                          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            complaintFilter === st
                              ? 'bg-[#123B28] text-white'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          {st === 'all' ? 'All Cases' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complaints List */}
                  <div className="space-y-3">
                    {filteredComplaints.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                        No citizen complaints match the selected filter.
                      </div>
                    ) : (
                      filteredComplaints.map((c) => (
                        <div
                          key={c.trackingId}
                          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-[#087A43]">
                                {c.trackingId}
                              </span>
                              <span>·</span>
                              <strong className="text-[#123B28]">{c.citizenName}</strong>
                              <span>·</span>
                              <span className="font-mono text-slate-500">{c.phone}</span>
                              <span>·</span>
                              <span className="font-bold text-amber-700">{c.status}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {c.category} · {c.districtTehsil} ({c.unionCouncil} — {c.locality})
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              {c.description}
                            </p>
                            {c.departmentReferred && (
                              <div className="text-[11px] text-[#087A43] font-semibold">
                                Referred: {c.departmentReferred}
                                {c.assignedOfficer ? ` (${c.assignedOfficer})` : ''}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenTriage(c)}
                              className="w-full lg:w-auto min-h-[42px] bg-[#123B28] hover:bg-[#087A43] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                            >
                              Update / Refer Case
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* SMS Gateway Log History */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h3 className="font-bold text-sm text-[#123B28]">
                      Recent SMS Dispatch Logs ({smsLogs.length})
                    </h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      {smsLogs.slice(0, 8).map((s) => (
                        <div
                          key={s.id}
                          className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#087A43] mr-2">
                              {s.trackingId}
                            </span>
                            <span className="font-mono text-slate-500 mr-2">
                              {s.recipientPhone}
                            </span>
                            <span className="text-slate-700">{s.message}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 font-mono shrink-0">
                            {s.status} · {s.timestamp.split('T')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PUBLIC NOTICES CMS */}
              {activeSubRoute === 'notices' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-base text-[#123B28]">
                        Official Public Notices & Gazette ({notices.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Create, publish/unpublish, or remove official notifications and downloadable bulletins.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotice(null);
                        setNoticeDraft({
                          title: '',
                          titleUrdu: '',
                          category: 'Public Announcements',
                          categoryUrdu: 'عوامی اعلانات',
                          publishDate: new Date().toISOString().split('T')[0],
                          description: '',
                          descriptionUrdu: '',
                          imageUrl: '',
                          videoUrl: '',
                          fileUrl: '',
                          fileName: 'PP203-Official-Notice.pdf',
                          fileSize: '420 KB',
                          fileType: 'PDF',
                          isPublished: true,
                          officialRef: 'PP203/SEC/2026'
                        });
                        setNoticeFormOpen(true);
                      }}
                      className="min-h-[44px] bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#C9A227]" />
                      <span>Publish New Notice</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notices.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#087A43]">{n.category}</span>
                            <span
                              className={`font-bold ${
                                n.isPublished ? 'text-[#087A43]' : 'text-amber-700'
                              }`}
                            >
                              {n.isPublished ? 'Published Live' : 'Draft / Unpublished'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[#123B28]">{n.title}</h3>
                          <p className="text-xs text-slate-600 line-clamp-2">{n.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-mono text-slate-500">{n.publishDate}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateNotice(n.id, { isPublished: !n.isPublished })}
                              className="px-3 py-1.5 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold text-[#123B28] cursor-pointer"
                            >
                              {n.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNotice(n);
                                const { id: _id, ...rest } = n;
                                setNoticeDraft(rest);
                                setNoticeFormOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-emerald-50 text-[#087A43] cursor-pointer"
                              aria-label="Edit notice"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteNotice(n.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                              aria-label="Delete notice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. APPOINTMENTS & CONTACT INQUIRIES */}
              {activeSubRoute === 'appointments' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-bold text-base text-[#123B28]">
                      Constituent Appointments & Contact Messages ({contactMessages.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Review Khuli Kachehri meeting requests, delegations, and general Secretariat inquiries.
                    </p>
                  </div>

                  {contactMessages.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                      No contact inquiries received yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.map((m) => (
                        <div
                          key={m.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-sm text-[#123B28]">{m.name}</strong>
                              <span>·</span>
                              <span className="font-mono text-[#087A43]">{m.phone}</span>
                              {m.email && (
                                <>
                                  <span>·</span>
                                  <span className="text-slate-500">{m.email}</span>
                                </>
                              )}
                              <span>·</span>
                              <span className="font-bold text-amber-700">{m.status}</span>
                            </div>
                            <div className="text-slate-500">
                              {m.inquiryType}
                              {m.preferredDate ? ` · Preferred Date: ${m.preferredDate}` : ''}
                            </div>
                            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                              {m.message}
                            </p>
                            {m.adminNotes && (
                              <p className="text-[11px] text-[#087A43] font-semibold">
                                Secretariat Note: {m.adminNotes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingInquiry(m);
                                setInquiryStatus(m.status);
                                setInquiryNotes(m.adminNotes || '');
                              }}
                              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#123B28] hover:bg-[#087A43] text-white text-xs font-bold cursor-pointer"
                            >
                              Update Status
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteContactMessage(m.id)}
                              className="min-h-[40px] px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold cursor-pointer"
                              aria-label="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. NEWS & PUNJAB ASSEMBLY ACTIVITIES CMS */}
              {activeSubRoute === 'news' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex bg-white border border-slate-200 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setEditorialSubTab('news')}
                        className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          editorialSubTab === 'news'
                            ? 'bg-[#123B28] text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        News & Press Releases ({news.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorialSubTab('assembly')}
                        className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          editorialSubTab === 'assembly'
                            ? 'bg-[#123B28] text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        Punjab Assembly Activities ({assemblyActivities.length})
                      </button>
                    </div>

                    {editorialSubTab === 'news' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNews(null);
                          setNewsDraft({
                            title: '',
                            titleUrdu: '',
                            category: 'Latest Updates',
                            categoryUrdu: 'تازہ ترین اپڈیٹس',
                            date: new Date().toISOString().split('T')[0],
                            summary: '',
                            summaryUrdu: '',
                            content: '',
                            contentUrdu: '',
                            imageUrl: CHICHAWATNI_SCENE_PATH,
                            videoUrl: '',
                            isFeatured: false
                          });
                          setNewsFormOpen(true);
                        }}
                        className="min-h-[42px] bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#C9A227]" />
                        <span>Add News Update</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAssembly(null);
                          setAssemblyDraft({
                            title: '',
                            titleUrdu: '',
                            category: 'Question Raised',
                            categoryUrdu: 'اسمبلی سوال',
                            sessionDate: new Date().toISOString().split('T')[0],
                            referenceNo: 'PAP-Q-2026',
                            summary: '',
                            summaryUrdu: '',
                            imageUrl: '',
                            videoUrl: '',
                            status: 'Submitted'
                          });
                          setAssemblyFormOpen(true);
                        }}
                        className="min-h-[42px] bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#C9A227]" />
                        <span>Add Assembly Activity</span>
                      </button>
                    )}
                  </div>

                  {editorialSubTab === 'news' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {news.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#087A43]">{item.category}</span>
                              <span className="font-mono text-slate-500">{item.date}</span>
                            </div>
                            <h3 className="font-bold text-sm text-[#123B28]">{item.title}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-700">
                              {item.isFeatured ? 'Featured Spotlight' : 'Standard Update'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNews(item);
                                  const { id: _id, ...rest } = item;
                                  setNewsDraft(rest);
                                  setNewsFormOpen(true);
                                }}
                                className="p-2 rounded-lg hover:bg-emerald-50 text-[#087A43] cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNews(item.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assemblyActivities.map((act) => (
                        <div
                          key={act.id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#087A43]">{act.category}</span>
                              <span className="font-mono text-slate-500">{act.sessionDate}</span>
                            </div>
                            <h3 className="font-bold text-sm text-[#123B28]">{act.title}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2">{act.summary}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-500">
                              {act.referenceNo || 'PAP'} · {act.status || 'Recorded'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAssembly(act);
                                  const { id: _id, ...rest } = act;
                                  setAssemblyDraft(rest);
                                  setAssemblyFormOpen(true);
                                }}
                                className="p-2 rounded-lg hover:bg-emerald-50 text-[#087A43] cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAssemblyActivity(act.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. MEDIA GALLERY CMS */}
              {activeSubRoute === 'gallery' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddGallery}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
                  >
                    <h2 className="font-bold text-sm text-[#123B28]">
                      Add Photo or Video to Public Gallery
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Title (English)"
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      />
                      <input
                        type="text"
                        placeholder="Title (Urdu)"
                        value={galleryTitleUr}
                        onChange={(e) => setGalleryTitleUr(e.target.value)}
                        dir="rtl"
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      />
                      <input
                        type="text"
                        placeholder="Category (e.g. Assembly, Visits)"
                        value={galleryCategory}
                        onChange={(e) => setGalleryCategory(e.target.value)}
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      />
                    </div>

                    <MediaFields
                      imageUrl={galleryImageUrl}
                      videoUrl={galleryVideoUrl}
                      onImageChange={setGalleryImageUrl}
                      onVideoChange={setGalleryVideoUrl}
                      imageLabel="Gallery Photo (URL or Upload)"
                      videoLabel="Gallery Video (YouTube / MP4 URL or Small Clip)"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="min-h-[42px] bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
                      >
                        Add Media Item
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((g) => {
                      const thumbImg =
                        g.imageUrl || (g.mediaType === 'photo' ? g.mediaUrl : '');
                      const hasVid = Boolean(
                        g.videoUrl || (g.mediaType === 'video' ? g.mediaUrl : '')
                      );
                      return (
                        <div
                          key={g.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                        >
                          <div className="h-44 bg-slate-100 relative overflow-hidden">
                            {thumbImg ? (
                              <img
                                src={getAssetUrl(thumbImg)}
                                alt={g.title}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : hasVid ? (
                              <div className="w-full h-full bg-[#123B28] text-white flex items-center justify-center text-xs font-bold">
                                Video Attached
                              </div>
                            ) : (
                              <img
                                src={getAssetUrl(CHICHAWATNI_SCENE_PATH)}
                                alt={g.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {hasVid && (
                              <span className="absolute top-2.5 right-2.5 bg-[#123B28]/90 text-[#C9A227] text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Video
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <span className="font-bold text-[#087A43] uppercase text-[10px]">
                                {thumbImg && hasVid
                                  ? 'Photo & Video'
                                  : hasVid
                                    ? 'Video'
                                    : g.mediaType}{' '}
                                · {g.category}
                              </span>
                              <h3 className="font-bold text-[#123B28] truncate">{g.title}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteGalleryItem(g.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer shrink-0"
                              aria-label="Delete gallery item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. PRIVACY-PRESERVING ANALYTICS */}
              {activeSubRoute === 'analytics' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-base text-[#123B28]">
                        Privacy-Preserving Constituency Analytics
                      </h2>
                      <p className="text-xs text-slate-500">
                        Aggregated grievance and project metrics with zero citizen PII exposed.
                      </p>
                    </div>
                    <div className="text-xs font-mono bg-[#F7F9F7] px-3 py-2 rounded-xl border border-slate-200">
                      GA4 Telemetry:{' '}
                      <strong className="text-[#087A43]">
                        {settings.ga4MeasurementId?.startsWith('G-')
                          ? `${settings.ga4MeasurementId} (Anonymized IP)`
                          : 'Not Configured'}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Complaints by Status */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                      <h3 className="font-bold text-sm text-[#123B28]">
                        Grievance Status Distribution
                      </h3>
                      <div className="space-y-3 text-xs">
                        {COMPLAINT_STATUSES.map((st) => {
                          const count = complaints.filter((c) => c.status === st).length;
                          const pct =
                            complaints.length > 0
                              ? Math.round((count / complaints.length) * 100)
                              : 0;
                          return (
                            <div key={st} className="space-y-1">
                              <div className="flex justify-between tabular-nums">
                                <span className="font-medium text-slate-700">{st}</span>
                                <span className="font-mono font-bold text-[#123B28]">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#087A43] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Projects by Category */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                      <h3 className="font-bold text-sm text-[#123B28]">
                        Development Portfolio by Sector
                      </h3>
                      <div className="space-y-3 text-xs">
                        {PROJECT_CATEGORIES.map((cat) => {
                          const count = projects.filter((p) => p.category === cat).length;
                          const pct =
                            projects.length > 0 ? Math.round((count / projects.length) * 100) : 0;
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between tabular-nums">
                                <span className="font-medium text-slate-700">{cat}</span>
                                <span className="font-mono font-bold text-[#123B28]">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#C9A227] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Union Council Demand Table (No PII) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h3 className="font-bold text-sm text-[#123B28]">
                      Union Council Service Demand (Aggregated)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {unionCouncils.map((uc) => {
                        const ucComplaints = complaints.filter((c) => c.unionCouncil === uc.code).length;
                        const ucProjects = projects.filter((p) => p.unionCouncil === uc.code).length;
                        return (
                          <div
                            key={uc.code}
                            className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5 space-y-1 tabular-nums"
                          >
                            <div className="font-bold text-[#123B28]">
                              {uc.code} — {uc.name}
                            </div>
                            <div className="text-slate-600">
                              Projects: <strong>{ucProjects}</strong> · Logged Grievances:{' '}
                              <strong>{ucComplaints}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 9. PORTAL SETTINGS & REPRESENTATIVE PROFILE CMS */}
              {activeSubRoute === 'settings' && (
                <form onSubmit={handleSaveSettingsAndProfile} className="space-y-6">
                  {/* Announcement & Widgets */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                    <h2 className="font-bold text-base text-[#123B28] border-b border-slate-100 pb-2">
                      Portal Integrations, Ticker & Gateway Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Announcement Ticker (English)
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.announcement}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, announcement: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Announcement Ticker (Urdu)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={settingsDraft.announcementUrdu}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, announcementUrdu: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          WhatsApp Helpdesk Number
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.whatsappNumber}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, whatsappNumber: e.target.value })
                          }
                          className="w-full px-3 py-2.5 font-mono bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          GA4 Measurement ID (Privacy-Preserving)
                        </label>
                        <input
                          type="text"
                          placeholder="G-XXXXXXXXXX"
                          value={settingsDraft.ga4MeasurementId}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              ga4MeasurementId: e.target.value.trim()
                            })
                          }
                          className="w-full px-3 py-2.5 font-mono bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          SMS Gateway Provider
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.smsProvider}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, smsProvider: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">SMS Sender ID</label>
                        <input
                          type="text"
                          value={settingsDraft.smsSenderId}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, smsSenderId: e.target.value })
                          }
                          className="w-full px-3 py-2.5 font-mono bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-5 pt-2 text-xs font-semibold text-[#123B28]">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.announcementActive}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              announcementActive: e.target.checked
                            })
                          }
                          className="w-4 h-4 accent-[#087A43]"
                        />
                        <span>Show Top Announcement Ticker</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.whatsappEnabled}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              whatsappEnabled: e.target.checked
                            })
                          }
                          className="w-4 h-4 accent-[#087A43]"
                        />
                        <span>Enable Floating WhatsApp Widget</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.smsEnabled}
                          onChange={(e) =>
                            setSettingsDraft({ ...settingsDraft, smsEnabled: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#087A43]"
                        />
                        <span>Enable Citizen SMS Status Notifications</span>
                      </label>
                    </div>
                  </div>

                  {/* Representative Profile / About CMS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                    <h2 className="font-bold text-base text-[#123B28] border-b border-slate-100 pb-2">
                      Representative Profile & About Section CMS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Full Name (EN)</label>
                        <input
                          type="text"
                          value={profileDraft.fullName}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, fullName: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Full Name (UR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={profileDraft.fullNameUrdu}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, fullNameUrdu: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Education & Background (EN)
                        </label>
                        <input
                          type="text"
                          value={profileDraft.education}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, education: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Secretariat Hours (EN)
                        </label>
                        <input
                          type="text"
                          value={profileDraft.officeHours}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, officeHours: e.target.value })
                          }
                          className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Biography (EN)</label>
                        <textarea
                          rows={3}
                          value={profileDraft.bio}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, bio: e.target.value })
                          }
                          className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Biography (UR)</label>
                        <textarea
                          rows={3}
                          dir="rtl"
                          value={profileDraft.bioUrdu}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, bioUrdu: e.target.value })
                          }
                          className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Political Journey (EN)
                        </label>
                        <textarea
                          rows={3}
                          value={profileDraft.politicalJourney}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, politicalJourney: e.target.value })
                          }
                          className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Political Journey (UR)
                        </label>
                        <textarea
                          rows={3}
                          dir="rtl"
                          value={profileDraft.politicalJourneyUrdu}
                          onChange={(e) =>
                            setProfileDraft({
                              ...profileDraft,
                              politicalJourneyUrdu: e.target.value
                            })
                          }
                          className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Visual Media for Hero, About & Constituency Sections */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <h3 className="font-bold text-sm text-[#123B28]">
                        Hero, About & Constituency Section Media (Images & Videos)
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <MediaFields
                          imageUrl={profileDraft.photoUrl || ''}
                          videoUrl={profileDraft.introVideoUrl || ''}
                          onImageChange={(val) =>
                            setProfileDraft({
                              ...profileDraft,
                              photoUrl: val,
                              leadPortraitUrl: val
                            })
                          }
                          onVideoChange={(val) =>
                            setProfileDraft({ ...profileDraft, introVideoUrl: val })
                          }
                          imageLabel="Representative Portrait (Hero & About)"
                          videoLabel="Representative Intro Video (Hero & About)"
                        />

                        <MediaFields
                          imageUrl={profileDraft.chichawatniSceneUrl || ''}
                          videoUrl={profileDraft.constituencyVideoUrl || ''}
                          onImageChange={(val) =>
                            setProfileDraft({ ...profileDraft, chichawatniSceneUrl: val })
                          }
                          onVideoChange={(val) =>
                            setProfileDraft({ ...profileDraft, constituencyVideoUrl: val })
                          }
                          imageLabel="Constituency Scene Image (PP-203)"
                          videoLabel="Constituency Overview Video (PP-203)"
                        />
                      </div>

                      <div className="text-xs space-y-1">
                        <label className="font-bold text-slate-700 block">
                          Punjab Assembly Showcase Image (About Section)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={profileDraft.assemblyImageUrl || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, assemblyImageUrl: e.target.value })
                            }
                            placeholder={ASSEMBLY_IMAGE_PATH}
                            className="flex-1 px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl font-mono text-[11px] min-h-[40px]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProfileDraft({
                                ...profileDraft,
                                assemblyImageUrl: ASSEMBLY_IMAGE_PATH
                              })
                            }
                            className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-[#F7F9F7] font-semibold text-[#123B28] cursor-pointer shrink-0"
                          >
                            Reset Default
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="min-h-[46px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#C9A227]" />
                      <span>Save All Settings & Profile</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 10. STAFF & ROLES (SUPER ADMIN ONLY) */}
              {activeSubRoute === 'staff' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleCreateStaff}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
                  >
                    <h2 className="font-bold text-base text-[#123B28]">
                      Provision New Secretariat Staff Account
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Staff Full Name"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      />
                      <input
                        type="email"
                        required
                        placeholder="staff@chasadhanif.pk"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Initial Password (min 6 chars)"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      />
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value as AdminRole)}
                        className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                      >
                        {ADMIN_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="min-h-[42px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl px-4 cursor-pointer"
                      >
                        Create Staff User
                      </button>
                    </div>
                  </form>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h3 className="font-bold text-sm text-[#123B28]">
                      Authorized Secretariat Staff Directory ({allStaff.length})
                    </h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      {allStaff.map((s) => (
                        <div
                          key={s.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <strong className="text-[#123B28]">{s.displayName}</strong>{' '}
                            <span className="font-mono text-slate-500">({s.email})</span>
                            <div className="text-[11px] text-slate-500">
                              Status:{' '}
                              <strong
                                className={
                                  s.status === 'Active' ? 'text-[#087A43]' : 'text-red-600'
                                }
                              >
                                {s.status}
                              </strong>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={s.role}
                              disabled={s.id === currentUser.id}
                              onChange={(e) => updateStaffRole(s.id, e.target.value as AdminRole)}
                              className="px-2.5 py-1.5 bg-[#F7F9F7] border border-slate-200 rounded-lg text-xs"
                            >
                              {ADMIN_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            {s.id !== currentUser.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleStaffStatus(
                                      s.id,
                                      s.status === 'Active' ? 'Suspended' : 'Active'
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[#123B28] cursor-pointer"
                                >
                                  {s.status === 'Active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteStaffAccount(s.id)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 11. READ-ONLY AUDIT LOGS (SUPER ADMIN ONLY) */}
              {activeSubRoute === 'audit' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-base text-[#123B28]">
                        Immutable Admin Audit Logs ({filteredAudit.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Read-only system accountability record enforced by Firestore security rules.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Filter by action or admin email..."
                      className="w-full sm:w-72 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl min-h-[42px]"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="divide-y divide-slate-100 text-xs">
                      {filteredAudit.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          No audit log entries recorded yet.
                        </div>
                      ) : (
                        filteredAudit.map((log) => (
                          <div
                            key={log.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <strong className="text-[#123B28]">{log.action}</strong>
                              <p className="text-slate-600">{log.details}</p>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 sm:text-right shrink-0">
                              <div>{log.adminEmail}</div>
                              <div>{log.timestamp.replace('T', ' ').slice(0, 19)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CHICHAWATNI CITY MANAGEMENT (2027-2030) SUBMODULES */}
              {activeSubRoute === 'city-overview' && (
                <CityOverviewDashboard onNavigateModule={onNavigateRoute} />
              )}
              {activeSubRoute === 'city-master-plan' && (
                <CityMasterPlanView mode="master-plan" />
              )}
              {activeSubRoute === 'city-projects' && <CityMasterPlanView mode="projects" />}
              {activeSubRoute === 'city-gis' && <CityGisMapView />}
              {activeSubRoute === 'city-areas' && (
                <CityInfrastructureModule section="areas" />
              )}
              {activeSubRoute === 'city-roads' && (
                <CityInfrastructureModule section="roads" />
              )}
              {activeSubRoute === 'city-streetlights' && (
                <CityInfrastructureModule section="streetlights" />
              )}
              {activeSubRoute === 'city-town-planning' && (
                <CityInfrastructureModule section="town-planning" />
              )}
              {activeSubRoute === 'city-water-sewerage' && (
                <CityUtilitiesOperationsModule section="water-sewerage" />
              )}
              {activeSubRoute === 'city-sanitation' && (
                <CityUtilitiesOperationsModule section="sanitation" />
              )}
              {activeSubRoute === 'city-traffic' && (
                <CityUtilitiesOperationsModule section="traffic" />
              )}
              {activeSubRoute === 'city-parks' && (
                <CityFacilitiesDirectoryModule section="parks" />
              )}
              {activeSubRoute === 'city-health-edu' && (
                <CityFacilitiesDirectoryModule section="health-edu" />
              )}
              {activeSubRoute === 'city-markets' && (
                <CityFacilitiesDirectoryModule section="markets" />
              )}
              {activeSubRoute === 'city-budget' && (
                <CityFinanceDepartmentModule section="budget" />
              )}
              {activeSubRoute === 'city-departments' && (
                <CityFinanceDepartmentModule section="departments" />
              )}
              {activeSubRoute === 'city-complaints' && (
                <CityComplaintsSurveysModule section="complaints" />
              )}
              {activeSubRoute === 'city-surveys' && (
                <CityComplaintsSurveysModule section="surveys" />
              )}
              {activeSubRoute === 'city-reports' && (
                <CityReportsAndAIModule section="reports" />
              )}
              {activeSubRoute === 'city-ai' && <CityReportsAndAIModule section="ai" />}
              {activeSubRoute === 'city-citizens' && <CitizenNetworkAdminModule />}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {showQrModal && <QRCardModal onClose={() => setShowQrModal(false)} />}
      {showReportModal && <MonthlyReportModal onClose={() => setShowReportModal(false)} />}

      {/* Project Form Modal */}
      {projectFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSaveProject}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#123B28]">
                {editingProject ? 'Edit Development Project' : 'New Development Project'}
              </h3>
              <button
                type="button"
                onClick={() => setProjectFormOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Project Title (EN)"
                value={projectDraft.title}
                onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })}
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
              <input
                type="text"
                required
                dir="rtl"
                placeholder="Project Title (Urdu)"
                value={projectDraft.titleUrdu}
                onChange={(e) => setProjectDraft({ ...projectDraft, titleUrdu: e.target.value })}
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />

              <select
                value={projectDraft.category}
                onChange={(e) =>
                  setProjectDraft({
                    ...projectDraft,
                    category: e.target.value as ProjectCategory,
                    categoryUrdu: e.target.value
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={projectDraft.status}
                onChange={(e) =>
                  setProjectDraft({
                    ...projectDraft,
                    status: e.target.value as ProjectStatus,
                    statusUrdu: e.target.value
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={projectDraft.unionCouncil}
                onChange={(e) => setProjectDraft({ ...projectDraft, unionCouncil: e.target.value })}
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              >
                {unionCouncils.map((uc) => (
                  <option key={uc.code} value={uc.code}>
                    {uc.code} — {uc.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                required
                placeholder="Budget (e.g. Rs. 45 Million)"
                value={projectDraft.budget}
                onChange={(e) => setProjectDraft({ ...projectDraft, budget: e.target.value })}
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />

              <input
                type="text"
                required
                placeholder="Executing Department"
                value={projectDraft.department}
                onChange={(e) =>
                  setProjectDraft({
                    ...projectDraft,
                    department: e.target.value,
                    departmentUrdu: e.target.value
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />

              <input
                type="number"
                min={0}
                max={100}
                placeholder="Progress %"
                value={projectDraft.progressPercent}
                onChange={(e) =>
                  setProjectDraft({
                    ...projectDraft,
                    progressPercent: Number(e.target.value)
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />

              <input
                type="text"
                placeholder="Location (EN)"
                value={projectDraft.location}
                onChange={(e) => setProjectDraft({ ...projectDraft, location: e.target.value })}
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
              <select
                value={projectDraft.fundingType}
                onChange={(e) =>
                  setProjectDraft({
                    ...projectDraft,
                    fundingType: e.target.value as FundingType,
                    fundingTypeUrdu: e.target.value
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              >
                <option value="Government-Funded">Government-Funded</option>
                <option value="Department-Led">Department-Led</option>
                <option value="MPA Priority Grant">MPA Priority Grant</option>
                <option value="District ADP">District ADP</option>
              </select>
            </div>

            <textarea
              rows={3}
              required
              placeholder="Project Description (EN)"
              value={projectDraft.description}
              onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
              className="w-full p-3 text-xs bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />
            <textarea
              rows={2}
              dir="rtl"
              placeholder="Project Description (Urdu)"
              value={projectDraft.descriptionUrdu}
              onChange={(e) =>
                setProjectDraft({ ...projectDraft, descriptionUrdu: e.target.value })
              }
              className="w-full p-3 text-xs bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />

            <MediaFields
              imageUrl={projectDraft.imageUrl || ''}
              videoUrl={projectDraft.videoUrl || ''}
              onImageChange={(val) => setProjectDraft({ ...projectDraft, imageUrl: val })}
              onVideoChange={(val) => setProjectDraft({ ...projectDraft, videoUrl: val })}
              imageLabel="Project Photo (URL or Upload)"
              videoLabel="Project Video (YouTube / MP4 URL or Small Clip)"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectFormOpen(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaint Triage Modal */}
      {triagingComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSubmitTriage}
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#087A43]">
                  {triagingComplaint.trackingId}
                </span>
                <h3 className="font-bold text-base text-[#123B28]">
                  Triage & Refer Citizen Complaint
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTriagingComplaint(null)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                >
                  {COMPLAINT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Referred Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Municipal Committee Chichawatni / MEPCO / PHED"
                  value={triageDept}
                  onChange={(e) => setTriageDept(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Officer</label>
                <input
                  type="text"
                  placeholder="e.g. XEN Irrigation / SDO Highways"
                  value={triageOfficer}
                  onChange={(e) => setTriageOfficer(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Public Secretariat Remarks
                </label>
                <textarea
                  rows={3}
                  value={triageRemarks}
                  onChange={(e) => setTriageRemarks(e.target.value)}
                  className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
                />
              </div>
              <label className="inline-flex items-center gap-2 font-semibold text-[#123B28] cursor-pointer">
                <input
                  type="checkbox"
                  checked={triageSms}
                  onChange={(e) => setTriageSms(e.target.checked)}
                  className="w-4 h-4 accent-[#087A43]"
                />
                <span>Dispatch SMS Status Notification to {triagingComplaint.phone}</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTriagingComplaint(null)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold cursor-pointer"
              >
                Save Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notice Modal */}
      {noticeFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSaveNotice}
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#123B28]">
                {editingNotice ? 'Edit Public Notice' : 'Publish Official Notice'}
              </h3>
              <button
                type="button"
                onClick={() => setNoticeFormOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Notice Title (EN)"
                value={noticeDraft.title}
                onChange={(e) => setNoticeDraft({ ...noticeDraft, title: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
              <input
                type="text"
                dir="rtl"
                placeholder="Notice Title (Urdu)"
                value={noticeDraft.titleUrdu}
                onChange={(e) => setNoticeDraft({ ...noticeDraft, titleUrdu: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={noticeDraft.category}
                  onChange={(e) =>
                    setNoticeDraft({
                      ...noticeDraft,
                      category: e.target.value as NoticeCategory,
                      categoryUrdu: e.target.value
                    })
                  }
                  className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                >
                  {NOTICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={noticeDraft.publishDate}
                  onChange={(e) => setNoticeDraft({ ...noticeDraft, publishDate: e.target.value })}
                  className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
                />
              </div>
              <textarea
                rows={3}
                required
                placeholder="Description (EN)"
                value={noticeDraft.description}
                onChange={(e) => setNoticeDraft({ ...noticeDraft, description: e.target.value })}
                className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
              />
              <textarea
                rows={2}
                dir="rtl"
                placeholder="Description (Urdu)"
                value={noticeDraft.descriptionUrdu}
                onChange={(e) =>
                  setNoticeDraft({ ...noticeDraft, descriptionUrdu: e.target.value })
                }
                className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
              />

              <MediaFields
                imageUrl={noticeDraft.imageUrl || ''}
                videoUrl={noticeDraft.videoUrl || ''}
                onImageChange={(val) => setNoticeDraft({ ...noticeDraft, imageUrl: val })}
                onVideoChange={(val) => setNoticeDraft({ ...noticeDraft, videoUrl: val })}
                imageLabel="Notice Image / Scan (URL or Upload)"
                videoLabel="Notice Briefing Video (YouTube / MP4 URL or Clip)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoticeFormOpen(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] text-white text-xs font-bold cursor-pointer"
              >
                Save Notice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inquiry Modal */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSaveInquiryUpdate}
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-xs"
          >
            <h3 className="font-bold text-base text-[#123B28]">
              Update Inquiry — {editingInquiry.name}
            </h3>
            <select
              value={inquiryStatus}
              onChange={(e) => setInquiryStatus(e.target.value as ContactMessage['status'])}
              className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
            >
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
            <textarea
              rows={3}
              placeholder="Secretariat internal notes / meeting slot..."
              value={inquiryNotes}
              onChange={(e) => setInquiryNotes(e.target.value)}
              className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingInquiry(null)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer"
              >
                Save Status
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News Modal */}
      {newsFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSaveNews}
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#123B28]">
                {editingNews ? 'Edit News Article' : 'Publish News Article'}
              </h3>
              <button
                type="button"
                onClick={() => setNewsFormOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Headline (EN)"
              value={newsDraft.title}
              onChange={(e) => setNewsDraft({ ...newsDraft, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
            />
            <input
              type="text"
              dir="rtl"
              placeholder="Headline (Urdu)"
              value={newsDraft.titleUrdu}
              onChange={(e) => setNewsDraft({ ...newsDraft, titleUrdu: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={newsDraft.category}
                onChange={(e) =>
                  setNewsDraft({
                    ...newsDraft,
                    category: e.target.value as NewsCategory,
                    categoryUrdu: e.target.value
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newsDraft.date}
                onChange={(e) => setNewsDraft({ ...newsDraft, date: e.target.value })}
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
            </div>
            <textarea
              rows={2}
              required
              placeholder="Short Summary (EN)"
              value={newsDraft.summary}
              onChange={(e) =>
                setNewsDraft({ ...newsDraft, summary: e.target.value, content: e.target.value })
              }
              className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />
            <textarea
              rows={2}
              dir="rtl"
              placeholder="Short Summary (Urdu)"
              value={newsDraft.summaryUrdu}
              onChange={(e) =>
                setNewsDraft({
                  ...newsDraft,
                  summaryUrdu: e.target.value,
                  contentUrdu: e.target.value
                })
              }
              className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />

            <MediaFields
              imageUrl={newsDraft.imageUrl || ''}
              videoUrl={newsDraft.videoUrl || ''}
              onImageChange={(val) => setNewsDraft({ ...newsDraft, imageUrl: val })}
              onVideoChange={(val) => setNewsDraft({ ...newsDraft, videoUrl: val })}
              imageLabel="News Photo (URL or Upload)"
              videoLabel="News Video Clip (YouTube / MP4 URL or Small Clip)"
            />

            <label className="inline-flex items-center gap-2 font-semibold text-[#123B28] cursor-pointer">
              <input
                type="checkbox"
                checked={!!newsDraft.isFeatured}
                onChange={(e) => setNewsDraft({ ...newsDraft, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#087A43]"
              />
              <span>Pin as Featured News Spotlight</span>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewsFormOpen(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer"
              >
                Save Article
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assembly Modal */}
      {assemblyFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSaveAssembly}
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#123B28]">
                {editingAssembly ? 'Edit Assembly Activity' : 'Add Assembly Activity'}
              </h3>
              <button
                type="button"
                onClick={() => setAssemblyFormOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Activity Title (EN)"
              value={assemblyDraft.title}
              onChange={(e) => setAssemblyDraft({ ...assemblyDraft, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
            />
            <input
              type="text"
              dir="rtl"
              placeholder="Activity Title (Urdu)"
              value={assemblyDraft.titleUrdu}
              onChange={(e) => setAssemblyDraft({ ...assemblyDraft, titleUrdu: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={assemblyDraft.category}
                onChange={(e) =>
                  setAssemblyDraft({
                    ...assemblyDraft,
                    category: e.target.value as AssemblyActivityCategory,
                    categoryUrdu: e.target.value
                  })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              >
                {ASSEMBLY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={assemblyDraft.sessionDate}
                onChange={(e) =>
                  setAssemblyDraft({ ...assemblyDraft, sessionDate: e.target.value })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
              <input
                type="text"
                placeholder="Ref No (e.g. PAP-Q-114)"
                value={assemblyDraft.referenceNo || ''}
                onChange={(e) =>
                  setAssemblyDraft({ ...assemblyDraft, referenceNo: e.target.value })
                }
                className="px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl min-h-[42px]"
              />
            </div>
            <textarea
              rows={3}
              required
              placeholder="Summary (EN)"
              value={assemblyDraft.summary}
              onChange={(e) => setAssemblyDraft({ ...assemblyDraft, summary: e.target.value })}
              className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />
            <textarea
              rows={2}
              dir="rtl"
              placeholder="Summary (Urdu)"
              value={assemblyDraft.summaryUrdu}
              onChange={(e) =>
                setAssemblyDraft({ ...assemblyDraft, summaryUrdu: e.target.value })
              }
              className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />

            <MediaFields
              imageUrl={assemblyDraft.imageUrl || ''}
              videoUrl={assemblyDraft.videoUrl || ''}
              onImageChange={(val) => setAssemblyDraft({ ...assemblyDraft, imageUrl: val })}
              onVideoChange={(val) => setAssemblyDraft({ ...assemblyDraft, videoUrl: val })}
              imageLabel="Session / Document Image (URL or Upload)"
              videoLabel="Assembly Speech Video (YouTube / MP4 URL or Clip)"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssemblyFormOpen(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer"
              >
                Save Assembly Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
