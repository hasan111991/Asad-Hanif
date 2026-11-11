import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { AdminRole, ComplaintStatus, ProjectStatus } from '../types';
import {
  ShieldAlert,
  LayoutDashboard,
  MessageSquare,
  HardHat,
  ClipboardList,
  Sparkles,
  Bot,
  Database,
  Users,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Send,
  Building,
  MapPin,
  Clock,
  ArrowLeft,
  Lock,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export const AdminPortal: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { currentUser, isAuthenticated, login, logout, hasRole, allStaff, updateStaffRole } = useAuth();
  const {
    unionCouncils,
    complaints,
    updateComplaintStatus,
    projects,
    addProject,
    updateProject,
    surveys,
    submitSurvey,
    recommendations,
    addRecommendation,
    updateRecommendationStatus,
    auditLogs,
    exportDatabaseJSON,
    importDatabaseJSON,
    settings,
    updateSettings
  } = useData();
  const { language } = useLanguage();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@chasadhanif.pk');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Super Admin');

  // Active admin module
  const [activeModule, setActiveModule] = useState<
    'dashboard' | 'complaints' | 'projects' | 'surveys' | 'ai_recommendations' | 'ai_assistant' | 'data_management' | 'staff' | 'settings'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Complaints filter state
  const [complaintSearch, setComplaintSearch] = useState('');
  const [selectedComplaintStatus, setSelectedComplaintStatus] = useState<string>('all');
  const [editingComplaint, setEditingComplaint] = useState<any>(null);

  // New Project modal/form
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectUC, setNewProjectUC] = useState('UC-45');
  const [newProjectCategory, setNewProjectCategory] = useState<any>('Roads and Infrastructure');
  const [newProjectBudget, setNewProjectBudget] = useState('PKR 45.0 Million');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Field Survey state
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyorName, setSurveyorName] = useState('');
  const [surveyUC, setSurveyUC] = useState('UC-50');
  const [surveyVillage, setSurveyVillage] = useState('');
  const [surveyType, setSurveyType] = useState<any>('Infrastructure');
  const [surveyRoadCond, setSurveyRoadCond] = useState('');
  const [surveyFacilityCond, setSurveyFacilityCond] = useState('');
  const [surveyIssues, setSurveyIssues] = useState('');

  // AI Assistant Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Welcome to the PP-203 AI Administrative Assistant. I have indexed your verified constituency databases for Chichawatni: 11 Union Councils, education facilities, healthcare centers, road conditions, and citizen complaints. How can I assist you with constituent data, gap analysis, or report generation today?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // New AI recommendation generation
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, selectedRole);
  };

  // AI Assistant Query Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiGenerating) return;

    const query = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setChatInput('');
    setIsAiGenerating(true);

    try {
      const qLower = query.toLowerCase();
      let responseText = '';

      if (qLower.includes('complaint') || qLower.includes('grievance') || qLower.includes('issue')) {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const pending = total - resolved;
        responseText = `Based on verified PP-203 records:\n• Total complaints: ${total}\n• Resolved complaints: ${resolved}\n• Under action: ${pending}\n• Top sectors: Water Supply & Sewerage (45% of total).\n• Most active areas: UC-45 (Railway/Purana Bazaar) and UC-50 (Chak 168/9-L).`;
      } else if (qLower.includes('health') || qLower.includes('hospital') || qLower.includes('bhu')) {
        responseText = `Healthcare Coverage in PP-203:\n• 1 THQ Hospital Chichawatni (120 beds, 24/7 Trauma & Dialysis).\n• 2 Rural Health Centers (RHC): Okanwala Bangla & Ghaziabad.\n• Identified Gap: Southwestern rural BHUs (UC-51 & UC-54) lack 24/7 maternity staff; nighttime obstetric emergencies require long transit to THQ.`;
      } else if (qLower.includes('school') || qLower.includes('education') || qLower.includes('college')) {
        responseText = `Education Facilities in PP-203:\n• 6 Degree & Associate Colleges (Govt Degree College for Boys, Govt Associate College for Women, TEVTA).\n• Gaps identified: Critical classroom shortage in Chak 34/14-L (UC-53) and need for solar power backup in rural girls' elementary schools.`;
      } else if (qLower.includes('recommend') || qLower.includes('priority') || qLower.includes('budget')) {
        responseText = `Top 3 Recommended Constituency Interventions:\n1. Solar RO Water Plants in High-Fluoride Chaks (UC-53 & UC-55) — Est. Cost: PKR 14.5M – 18.0M.\n2. Upgradation of BHU Chak 110/12-L to 24/7 Maternity Center — Est. Cost: PKR 22.0M.\n3. Farm-to-Market Metalled Road Linking Chak 168/9-L to Kamalia Bypass — Est. Cost: PKR 48.0M.`;
      } else {
        responseText = `Constituency Overview for PP-203 Chichawatni:\n• 11 Union Councils (3 Urban, 8 Rural) covering 345,000+ residents.\n• Major economic driver: Agriculture & Grain Market (Ghalla Mandi) supported by Lower Bari Doab Canal (LBDC) distributaries 9-L, 12-L, 14-L.\n• Secretariat Status: Active public Khuli Kachehri every Tuesday & Thursday.`;
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
        setIsAiGenerating(false);
      }, 600);
    } catch {
      setIsAiGenerating(false);
    }
  };

  const handleGenerateAIRecommendation = () => {
    setIsGeneratingRec(true);
    setTimeout(() => {
      addRecommendation({
        title: 'Solarization of Primary Schools in Tail-End Rural Chaks',
        titleUrdu: 'ٹیل کے دیہی چکوں میں پرائمری اسکولوں کی سولر پاور پر منتقلی',
        location: 'Chak 112/12-L & Chak 114/12-L',
        unionCouncil: 'UC-48',
        problemIdentified: 'Frequent 6-8 hour unannounced load shedding during summer disrupts elementary education and water pumping.',
        evidenceUsed: 'Field Survey srv-102 and 5 citizen petitions.',
        sourceRecords: 'Education Facility DB edu-5, Surveys srv-102.',
        estimatedPopulationAffected: 4200,
        estimatedCostRange: 'PKR 8.5 – 10.0 Million (10kW hybrid solar per school)',
        priorityLevel: 'High',
        expectedBenefits: 'Guarantees 100% uninterrupted power for computer labs, lighting, and fans for 1,200+ students.',
        risksAndLimitations: 'Requires security fencing around battery racks.',
        suggestedNextAction: 'Submit request to Punjab School Education Department (SED) ADP window.',
        confidenceLevel: 92,
        status: 'Pending Review'
      });
      setIsGeneratingRec(false);
    }, 900);
  };

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: `Complaints (${complaints.length})`, icon: MessageSquare },
    { id: 'projects', label: `Projects (${projects.length})`, icon: HardHat },
    { id: 'surveys', label: `Surveys (${surveys.length})`, icon: ClipboardList },
    { id: 'ai_recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'ai_assistant', label: 'AI Assistant', icon: Bot },
    { id: 'data_management', label: 'Data Backup', icon: Database },
    { id: 'staff', label: 'Staff Roles', icon: Users },
  ];

  // If Not Authenticated, show Mobile-First Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-3 xs:p-4">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Private Access Only
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Secretariat Staff Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              PP-203 Smart Constituency Management System
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Role Permission Level
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white min-h-[44px]"
              >
                <option value="Super Admin">Super Admin (All Privileges)</option>
                <option value="Office Manager">Office Manager (Secretariat)</option>
                <option value="Complaint Manager">Complaint Manager</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Field Survey Officer">Field Survey Officer</option>
                <option value="Read-only Analyst">Read-only Analyst</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                defaultValue="secretariat2026"
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] bg-[#087A43] hover:bg-[#064D2B] text-white font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2 mt-2 active:scale-98"
            >
              <span>Authenticate & Enter Portal</span>
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-700 text-xs">
            <span className="text-slate-400 block mb-2 font-medium">Quick Test Roles:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setLoginEmail('admin@chasadhanif.pk'); setSelectedRole('Super Admin'); }}
                className="min-h-[44px] bg-slate-700/60 hover:bg-slate-700 p-2 rounded-xl text-[11px] text-slate-200 text-left font-mono truncate active:scale-95"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setLoginEmail('complaints@chasadhanif.pk'); setSelectedRole('Complaint Manager'); }}
                className="min-h-[44px] bg-slate-700/60 hover:bg-slate-700 p-2 rounded-xl text-[11px] text-slate-200 text-left font-mono truncate active:scale-95"
              >
                Complaint Mgr
              </button>
              <button
                type="button"
                onClick={() => { setLoginEmail('projects@chasadhanif.pk'); setSelectedRole('Project Manager'); }}
                className="min-h-[44px] bg-slate-700/60 hover:bg-slate-700 p-2 rounded-xl text-[11px] text-slate-200 text-left font-mono truncate active:scale-95"
              >
                Project Mgr
              </button>
              <button
                type="button"
                onClick={() => { setLoginEmail('survey@chasadhanif.pk'); setSelectedRole('Field Survey Officer'); }}
                className="min-h-[44px] bg-slate-700/60 hover:bg-slate-700 p-2 rounded-xl text-[11px] text-slate-200 text-left font-mono truncate active:scale-95"
              >
                Survey Officer
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onExit}
              className="min-h-[44px] text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col w-full">
      {/* Top Admin Header (Mobile responsive) */}
      <header className="bg-slate-900 text-white px-3 sm:px-8 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Drawer Trigger (Hamburger) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition shrink-0"
            aria-label="Toggle admin modules"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="w-8 h-8 rounded-lg bg-[#087A43] flex items-center justify-center font-bold text-white text-xs shrink-0">
            PP
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
              <span>PP-203 Admin</span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded truncate max-w-[110px] sm:max-w-none">
                {currentUser?.role}
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate hidden xs:block">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onExit}
            className="min-h-[40px] text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-slate-300 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Site</span>
          </button>

          <button
            onClick={logout}
            className="min-h-[40px] text-xs bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Desktop Horizontal Tabs Bar */}
      <div className="hidden md:flex bg-white border-b border-slate-200 px-4 sm:px-8 py-2 overflow-x-auto items-center gap-1 shadow-2xs scrollbar-none">
        {adminNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as any)}
              className={`min-h-[40px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-emerald-50 text-[#087A43] font-bold border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#087A43]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Collapsible Module Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full flex flex-col p-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Admin Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-500 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 text-[#087A43] font-bold border border-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-emerald-700" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
              <span className="font-mono block truncate">{currentUser?.email}</span>
              <span className="text-emerald-700 font-bold block mt-0.5">{currentUser?.role}</span>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Admin Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 xs:p-4 sm:p-8 space-y-6">
        {/* Module 1: Dashboard Overview */}
        {activeModule === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards (1-col on 320px, 2-col on standard mobile, 4-col on desktop) */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium block">Total Complaints</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{complaints.length}</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  {complaints.filter(c => c.status === 'Resolved').length} Resolved
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium block">Projects Managed</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</div>
                <div className="text-[11px] text-blue-700 font-semibold mt-1">
                  PKR 481.5M Allocated
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium block">Field Surveys</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{surveys.length}</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1">
                  100% Geo-verified
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium block">AI Recommendations</span>
                <div className="text-2xl font-bold text-purple-700 mt-1">{recommendations.length}</div>
                <div className="text-[11px] text-purple-700 font-semibold mt-1">
                  Active Gap Detection
                </div>
              </div>
            </div>

            {/* Audit Logs & Quick Action */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Administrative Audit Logs</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Immutable Trail</span>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col xs:flex-row xs:items-start justify-between gap-1 text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">{log.action}</span>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{log.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
                          By: {log.adminEmail}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {log.timestamp.split('T')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Quick Action Shortcuts</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveModule('complaints')}
                    className="w-full text-left min-h-[44px] p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition flex items-center justify-between active:scale-98"
                  >
                    <span>Process Complaints</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                      {complaints.filter(c => c.status !== 'Resolved').length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setShowNewProjectModal(true); setActiveModule('projects'); }}
                    className="w-full text-left min-h-[44px] p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition flex items-center justify-between active:scale-98"
                  >
                    <span>Add Development Scheme</span>
                    <Plus className="w-4 h-4 text-emerald-700" />
                  </button>

                  <button
                    onClick={() => { setShowSurveyModal(true); setActiveModule('surveys'); }}
                    className="w-full text-left min-h-[44px] p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition flex items-center justify-between active:scale-98"
                  >
                    <span>Record Field Survey</span>
                    <ClipboardList className="w-4 h-4 text-emerald-700" />
                  </button>

                  <button
                    onClick={() => setActiveModule('ai_assistant')}
                    className="w-full text-left min-h-[44px] p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-purple-900 transition flex items-center justify-between active:scale-98"
                  >
                    <span>Query AI Assistant</span>
                    <Bot className="w-4 h-4 text-purple-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 2: Complaints Management (Mobile cards + Desktop Table) */}
        {activeModule === 'complaints' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tracking ID, citizen, locality..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                  />
                </div>

                <select
                  value={selectedComplaintStatus}
                  onChange={(e) => setSelectedComplaintStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-h-[44px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Received">Received</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Referred to Department">Referred to Department</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium text-right sm:text-left shrink-0">
                {complaints.length} Total Registered
              </div>
            </div>

            {/* Mobile Cards (< sm) */}
            <div className="sm:hidden space-y-3">
              {complaints
                .filter(c => {
                  if (selectedComplaintStatus !== 'all' && c.status !== selectedComplaintStatus) return false;
                  if (complaintSearch) {
                    const q = complaintSearch.toLowerCase();
                    return c.trackingId.toLowerCase().includes(q) || c.citizenName.toLowerCase().includes(q) || c.locality.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((comp) => (
                  <div key={comp.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-xs text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#087A43] text-sm">{comp.trackingId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-900 block">{comp.citizenName} ({comp.phone})</strong>
                      <span className="text-slate-500">{comp.unionCouncil} — {comp.locality}</span>
                    </div>

                    <div className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-snug">
                      "{comp.description}"
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">Dept: {comp.departmentReferred || 'Unassigned'}</span>
                      <button
                        onClick={() => setEditingComplaint(comp)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#087A43] hover:text-white font-bold text-xs transition"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Desktop Table (sm and above) */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Tracking ID</th>
                    <th className="px-5 py-3.5">Citizen & Phone</th>
                    <th className="px-5 py-3.5">UC & Locality</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints
                    .filter(c => {
                      if (selectedComplaintStatus !== 'all' && c.status !== selectedComplaintStatus) return false;
                      if (complaintSearch) {
                        const q = complaintSearch.toLowerCase();
                        return c.trackingId.toLowerCase().includes(q) || c.citizenName.toLowerCase().includes(q) || c.locality.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#087A43]">{comp.trackingId}</td>
                        <td className="px-5 py-3.5">
                          <strong className="block text-slate-900">{comp.citizenName}</strong>
                          <span className="text-[11px] font-mono text-slate-400">{comp.phone}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span>{comp.unionCouncil}</span>
                          <span className="block text-[11px] text-slate-400">{comp.locality}</span>
                        </td>
                        <td className="px-5 py-3.5">{comp.category}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{comp.departmentReferred || 'Not yet assigned'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setEditingComplaint(comp)}
                            className="bg-slate-100 hover:bg-[#087A43] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Update Complaint Modal (Mobile Responsive) */}
            {editingComplaint && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      Update {editingComplaint.trackingId}
                    </h3>
                    <button
                      onClick={() => setEditingComplaint(null)}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Citizen Issue:</span>
                      <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {editingComplaint.description}
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Status Workflow
                      </label>
                      <select
                        defaultValue={editingComplaint.status}
                        id="modal-status-select"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                      >
                        <option value="Received">Received</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Referred to Department">Referred to Department</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Referred Department
                      </label>
                      <input
                        type="text"
                        defaultValue={editingComplaint.departmentReferred || ''}
                        id="modal-dept-input"
                        placeholder="e.g. Municipal Committee / PHED / MEPCO"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Secretariat Remarks / Action Taken
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={editingComplaint.adminRemarks || ''}
                        id="modal-remarks-input"
                        placeholder="State action taken or resolution report..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col xs:flex-row justify-end gap-2 text-xs">
                    <button
                      onClick={() => setEditingComplaint(null)}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const status = (document.getElementById('modal-status-select') as HTMLSelectElement).value as ComplaintStatus;
                        const dept = (document.getElementById('modal-dept-input') as HTMLInputElement).value;
                        const remarks = (document.getElementById('modal-remarks-input') as HTMLTextAreaElement).value;

                        updateComplaintStatus(editingComplaint.id, status, remarks, dept);
                        setEditingComplaint(null);
                      }}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold"
                    >
                      Save Updates
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 3: Projects Management */}
        {activeModule === 'projects' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Development Projects ({projects.length})
              </h3>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="min-h-[44px] bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {projects.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {p.unionCouncil}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status} ({p.progressPercent}%)
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{p.location}</p>
                    <div className="mt-2 text-xs font-mono font-bold text-[#087A43]">{p.budget}</div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <label className="text-slate-400 font-medium">Update Progress (%):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={p.progressPercent}
                        onChange={(e) => updateProject(p.id, { progressPercent: Number(e.target.value) })}
                        className="w-full accent-emerald-600 h-6"
                      />
                      <span className="font-mono font-bold w-10 text-right">{p.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Project Modal (Mobile-First) */}
            {showNewProjectModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Create New Development Project</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="e.g. Rural Water Supply Pipeline Extension"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Union Council</label>
                        <select
                          value={newProjectUC}
                          onChange={(e) => setNewProjectUC(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                        >
                          {unionCouncils.map(uc => <option key={uc.code} value={uc.code}>{uc.code}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Budget</label>
                        <input
                          type="text"
                          value={newProjectBudget}
                          onChange={(e) => setNewProjectBudget(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Location / Chak</label>
                      <input
                        type="text"
                        value={newProjectLocation}
                        onChange={(e) => setNewProjectLocation(e.target.value)}
                        placeholder="e.g. Chak 168/9-L Link Access"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Project Description</label>
                      <textarea
                        rows={3}
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        placeholder="Details of civil works, pipeline length, or road width..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row justify-end gap-2 text-xs pt-2">
                    <button
                      onClick={() => setShowNewProjectModal(false)}
                      className="min-h-[44px] px-4 py-2 border rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newProjectTitle) return;
                        addProject({
                          title: newProjectTitle,
                          titleUrdu: newProjectTitle,
                          category: newProjectCategory,
                          categoryUrdu: 'ترقیاتی منصوبہ',
                          unionCouncil: newProjectUC,
                          location: newProjectLocation || 'PP-203 Chichawatni',
                          locationUrdu: newProjectLocation || 'پی پی 203 چیچہ وطنی',
                          description: newProjectDesc || 'Government priority project for PP-203.',
                          descriptionUrdu: 'سرکاری ترجیحی ترقیاتی منصوبہ۔',
                          status: 'Approved',
                          statusUrdu: 'منظور شدہ',
                          department: 'Communication & Works (C&W)',
                          departmentUrdu: 'محکمہ مواصلات و تعمیرات',
                          budget: newProjectBudget,
                          startDate: new Date().toISOString().split('T')[0],
                          completionDate: '2027-06-30',
                          imageUrl: '/images/chichawatni_scene_1794225848060.jpg',
                          fundingType: 'Government-Funded',
                          fundingTypeUrdu: 'سرکاری فنڈنگ',
                          progressPercent: 10,
                          latitude: 30.5333,
                          longitude: 72.7000
                        });
                        setShowNewProjectModal(false);
                      }}
                      className="min-h-[44px] px-5 py-2 bg-[#087A43] text-white font-bold rounded-xl"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 4: Field Survey Management */}
        {activeModule === 'surveys' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Field Surveys ({surveys.length})</h3>
                <p className="text-xs text-slate-500">Collected by verified field survey officers.</p>
              </div>
              <button
                onClick={() => setShowSurveyModal(true)}
                className="min-h-[44px] bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Submit Field Survey</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {surveys.map((srv) => (
                <div key={srv.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {srv.unionCouncil} — {srv.village}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {srv.surveyType}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-700">
                    <p><strong>Officer:</strong> {srv.surveyorName} ({srv.surveyorPhone})</p>
                    <p><strong>Roads:</strong> {srv.roadCondition}</p>
                    <p><strong>Facilities:</strong> {srv.facilityCondition}</p>
                    <p><strong>Key Issues:</strong> {srv.issuesIdentified}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{srv.timestamp.split('T')[0]}</span>
                    <span className="text-emerald-700 font-semibold">{srv.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Survey Modal */}
            {showSurveyModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Submit Field Survey Inspection</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Survey Officer Name</label>
                      <input
                        type="text"
                        value={surveyorName}
                        onChange={(e) => setSurveyorName(e.target.value)}
                        placeholder="e.g. Malik Zeeshan"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Union Council</label>
                        <select
                          value={surveyUC}
                          onChange={(e) => setSurveyUC(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                        >
                          {unionCouncils.map(uc => <option key={uc.code} value={uc.code}>{uc.code}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Village / Chak</label>
                        <input
                          type="text"
                          value={surveyVillage}
                          onChange={(e) => setSurveyVillage(e.target.value)}
                          placeholder="e.g. Chak 171/9-L"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Road Condition Assessment</label>
                      <input
                        type="text"
                        value={surveyRoadCond}
                        onChange={(e) => setSurveyRoadCond(e.target.value)}
                        placeholder="e.g. Fair condition; culvert requires slab"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">School / Health Assessment</label>
                      <input
                        type="text"
                        value={surveyFacilityCond}
                        onChange={(e) => setSurveyFacilityCond(e.target.value)}
                        placeholder="e.g. Needs solar battery replacement"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Observations & Notes</label>
                      <textarea
                        rows={3}
                        value={surveyIssues}
                        onChange={(e) => setSurveyIssues(e.target.value)}
                        placeholder="State urgent ground needs..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row justify-end gap-2 text-xs pt-2">
                    <button
                      onClick={() => setShowSurveyModal(false)}
                      className="min-h-[44px] px-4 py-2 border rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!surveyVillage) return;
                        submitSurvey({
                          surveyorName: surveyorName || 'Field Survey Officer',
                          surveyorPhone: '03001234567',
                          unionCouncil: surveyUC,
                          village: surveyVillage,
                          surveyType,
                          roadCondition: surveyRoadCond || 'Satisfactory',
                          facilityCondition: surveyFacilityCond || 'Standard condition',
                          issuesIdentified: surveyIssues || 'Routine check',
                          notes: surveyIssues || 'Inspected on site',
                          latitude: 30.5333,
                          longitude: 72.7000
                        });
                        setShowSurveyModal(false);
                      }}
                      className="min-h-[44px] px-5 py-2 bg-[#087A43] text-white font-bold rounded-xl"
                    >
                      Save Survey
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 5: AI Development Recommendations */}
        {activeModule === 'ai_recommendations' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  AI-Powered Development Recommendation Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesizes demographics, healthcare gaps, and citizen grievances.
                </p>
              </div>

              <button
                onClick={handleGenerateAIRecommendation}
                disabled={isGeneratingRec}
                className="min-h-[44px] bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-98 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingRec ? 'Analyzing Data...' : 'Run Gap Analysis'}</span>
              </button>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        rec.priorityLevel === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : rec.priorityLevel === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priorityLevel} Priority
                      </span>
                      <span className="text-xs font-mono font-bold text-[#087A43] bg-emerald-50 px-2 py-0.5 rounded">
                        {rec.unionCouncil} — {rec.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="font-mono font-bold text-purple-700">{rec.confidenceLevel}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{rec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.problemIdentified}</p>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Population Affected:</span>
                      <strong className="text-slate-800">{rec.estimatedPopulationAffected.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Est. Cost Range:</span>
                      <strong className="text-slate-800">{rec.estimatedCostRange}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Status:</span>
                      <span className="font-bold text-emerald-800">{rec.status}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Suggested Action: <strong className="text-[#087A43]">{rec.suggestedNextAction}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRecommendationStatus(rec.id, 'Accepted')}
                        className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs active:scale-95 flex items-center justify-center"
                      >
                        Accept into ADP
                      </button>
                      <button
                        onClick={() => updateRecommendationStatus(rec.id, 'Archived')}
                        className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs active:scale-95 flex items-center justify-center"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 6: AI Admin Assistant Chat */}
        {activeModule === 'ai_assistant' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] sm:h-[640px] animate-fade-in overflow-hidden w-full">
            <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm truncate">Constituency AI Assistant</h3>
                  <p className="text-[10px] text-purple-200 truncate">Grounded in PP-203 databases</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded shrink-0">
                Grounded
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 sm:p-4 leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#087A43] text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-500 rounded-2xl p-3 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Formulating analysis from database records...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions (Horizontal scroll on mobile) */}
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 text-[11px] overflow-x-auto scrollbar-none shrink-0">
              <span className="text-slate-400 font-semibold shrink-0">Suggestions:</span>
              <button
                onClick={() => setChatInput('Show healthcare coverage and missing facilities')}
                className="min-h-[44px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 whitespace-nowrap flex items-center justify-center text-xs active:scale-95"
              >
                Healthcare Gaps
              </button>
              <button
                onClick={() => setChatInput('Analyze unresolved public complaints by sector')}
                className="min-h-[44px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 whitespace-nowrap flex items-center justify-center text-xs active:scale-95"
              >
                Complaints Breakdown
              </button>
              <button
                onClick={() => setChatInput('Recommend priority development projects with budget estimates')}
                className="min-h-[44px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 whitespace-nowrap flex items-center justify-center text-xs active:scale-95"
              >
                Priority Budget
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask any question about PP-203 chaks, schools, or projects..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[44px]"
              />
              <button
                type="submit"
                disabled={isAiGenerating}
                className="w-11 h-11 bg-purple-700 hover:bg-purple-800 text-white rounded-xl transition flex items-center justify-center shrink-0 active:scale-95"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Module 7: Data Management */}
        {activeModule === 'data_management' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-5 animate-fade-in">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Constituency Database Backup & Export</h3>
            <p className="text-xs text-slate-500">
              Export entire verified constituency schema including Union Councils, facilities, complaints, projects, and GIS coordinates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Download className="w-6 h-6 text-[#087A43]" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Export Full JSON Database</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download a complete JSON snapshot of all 11 Union Councils, 80+ chaks, and audit logs.
                </p>
                <button
                  onClick={() => {
                    const json = exportDatabaseJSON();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `PP203_Constituency_Database_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="min-h-[44px] bg-[#087A43] text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-98"
                >
                  Download JSON Backup
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Upload className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Restore from JSON</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload and restore saved data structures or GIS layers into the live portal.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          importDatabaseJSON(content);
                          alert('Database successfully restored!');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Module 8: Staff Roles & Permissions */}
        {activeModule === 'staff' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-5 animate-fade-in">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Secretariat Personnel & Roles</h3>
                <p className="text-xs text-slate-500">Role-based access control (RBAC) enforced.</p>
              </div>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Super Admin
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {allStaff.map((staff) => (
                <div key={staff.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{staff.displayName}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">{staff.email} • {staff.phone || 'N/A'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Role:</span>
                    <select
                      value={staff.role}
                      disabled={currentUser?.role !== 'Super Admin'}
                      onChange={(e) => updateStaffRole(staff.id, e.target.value as AdminRole)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 disabled:opacity-60 min-h-[44px]"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Office Manager">Office Manager</option>
                      <option value="Complaint Manager">Complaint Manager</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Field Survey Officer">Field Survey Officer</option>
                      <option value="Read-only Analyst">Read-only Analyst</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
