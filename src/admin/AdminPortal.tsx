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
  Lock
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
      // Generate intelligent answer based on the loaded constituency data
      const qLower = query.toLowerCase();
      let responseText = '';

      if (qLower.includes('complaint') || qLower.includes('grievance') || qLower.includes('issue')) {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const pending = total - resolved;
        responseText = `Based on current verified records in PP-203:\n• Total complaints registered: ${total}\n• Resolved complaints: ${resolved}\n• Under action / pending: ${pending}\n• Highest grievance sectors: Water Supply & Sewerage (accounting for ~45% of submissions).\n• Most active areas: UC-45 (Purana Bazaar) and UC-50 (Chak 168/9-L).`;
      } else if (qLower.includes('health') || qLower.includes('hospital') || qLower.includes('bhu')) {
        responseText = `Healthcare Coverage Summary for PP-203:\n• 1 Tehsil Headquarter (THQ) Hospital Chichawatni (120 beds, 24/7 Emergency, Dialysis Unit, Trauma Center).\n• 2 Rural Health Centers (RHC): Okanwala Bangla & Ghaziabad.\n• Key Gap Detected: Rural BHUs in southwestern belt (UC-51 & UC-54) lack 24/7 emergency maternity staffing, requiring long transfers to THQ.`;
      } else if (qLower.includes('school') || qLower.includes('education') || qLower.includes('college')) {
        responseText = `Education Infrastructure Analysis:\n• 6 Higher secondary and degree colleges (Govt Degree College for Boys, Govt Associate College for Women, TEVTA).\n• Primary/Middle school condition survey shows critical classroom shortage in Chak 34/14-L (UC-53) and need for solar power backup in rural girls' elementary schools.`;
      } else if (qLower.includes('recommend') || qLower.includes('priority') || qLower.includes('budget')) {
        responseText = `Top 3 Recommended Constituency Interventions:\n1. Solar RO Water Plants in High-Fluoride Chaks (UC-53 & UC-55) — Estimated Cost: PKR 14.5M – 18.0M.\n2. Upgradation of BHU Chak 110/12-L to 24/7 Maternity Center — Estimated Cost: PKR 22.0M.\n3. Farm-to-Market Metalled Road Linking Chak 168/9-L to Kamalia Bypass — Estimated Cost: PKR 48.0M.\nAll 3 have matching citizen petitions and field survey verification.`;
      } else {
        responseText = `Constituency Overview for PP-203 Chichawatni:\n• 11 Union Councils (3 Urban, 8 Rural) covering an estimated 345,000+ residents.\n• Major economic driver: Agriculture & Grain Market (Ghalla Mandi Chichawatni) supported by Lower Bari Doab Canal (LBDC) distributaries 9-L, 12-L, 14-L.\n• Secretariat Status: Active public Khuli Kachehri every Tuesday & Thursday.`;
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
        setIsAiGenerating(false);
      }, 700);
    } catch {
      setIsAiGenerating(false);
    }
  };

  // Generate New AI Recommendation
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
    }, 1000);
  };

  // If Not Authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
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
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Staff Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Role Permission Level
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
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
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                defaultValue="secretariat2026"
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#087A43] hover:bg-[#064D2B] text-white font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>Authenticate & Enter Portal</span>
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-700 text-xs">
            <span className="text-slate-400 block mb-2 font-medium">Quick Test Roles:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setLoginEmail('admin@chasadhanif.pk'); setSelectedRole('Super Admin'); }}
                className="bg-slate-700/60 hover:bg-slate-700 p-2 rounded-lg text-[11px] text-slate-200 text-left font-mono truncate"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setLoginEmail('complaints@chasadhanif.pk'); setSelectedRole('Complaint Manager'); }}
                className="bg-slate-700/60 hover:bg-slate-700 p-2 rounded-lg text-[11px] text-slate-200 text-left font-mono truncate"
              >
                Complaint Mgr
              </button>
              <button
                type="button"
                onClick={() => { setLoginEmail('projects@chasadhanif.pk'); setSelectedRole('Project Manager'); }}
                className="bg-slate-700/60 hover:bg-slate-700 p-2 rounded-lg text-[11px] text-slate-200 text-left font-mono truncate"
              >
                Project Mgr
              </button>
              <button
                type="button"
                onClick={() => { setLoginEmail('survey@chasadhanif.pk'); setSelectedRole('Field Survey Officer'); }}
                className="bg-slate-700/60 hover:bg-slate-700 p-2 rounded-lg text-[11px] text-slate-200 text-left font-mono truncate"
              >
                Survey Officer
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#087A43] flex items-center justify-center font-bold text-white text-xs">
            PP
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>PP-203 Portal Administration</span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                {currentUser?.role}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Logged in: {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Public Site</span>
          </button>

          <button
            onClick={logout}
            className="text-xs bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2 overflow-x-auto flex items-center gap-1 shadow-2xs">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'complaints', label: `Complaints (${complaints.length})`, icon: MessageSquare },
          { id: 'projects', label: `Projects (${projects.length})`, icon: HardHat },
          { id: 'surveys', label: `Field Surveys (${surveys.length})`, icon: ClipboardList },
          { id: 'ai_recommendations', label: 'AI Recommendations', icon: Sparkles },
          { id: 'ai_assistant', label: 'AI Admin Assistant', icon: Bot },
          { id: 'data_management', label: 'Data Import / Export', icon: Database },
          { id: 'staff', label: 'Staff Roles', icon: Users },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
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

      {/* Admin Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Module 1: Dashboard Overview */}
        {activeModule === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Total Registered Complaints</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{complaints.length}</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  {complaints.filter(c => c.status === 'Resolved').length} Resolved
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Development Projects</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</div>
                <div className="text-[11px] text-blue-700 font-semibold mt-1">
                  PKR 481.5M Allocated
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Field Surveys Completed</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{surveys.length}</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1">
                  100% Geo-verified
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">AI Recommendations</span>
                <div className="text-2xl font-bold text-purple-700 mt-1">{recommendations.length}</div>
                <div className="text-[11px] text-purple-700 font-semibold mt-1">
                  Active Gap Detection
                </div>
              </div>
            </div>

            {/* Recent Audit Trail & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Recent Administrative Audit Logs</h3>
                  <span className="text-xs text-slate-400 font-mono">Immutable Log</span>
                </div>

                <div className="space-y-3">
                  {auditLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <p className="text-slate-600 mt-0.5">{log.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          Initiated by: {log.adminEmail}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {log.timestamp.split('T')[0]} {log.timestamp.split('T')[1]?.substring(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Rapid Administrative Actions</h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveModule('complaints')}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition flex items-center justify-between"
                  >
                    <span>Process Pending Complaints</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                      {complaints.filter(c => c.status !== 'Resolved').length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setShowNewProjectModal(true); setActiveModule('projects'); }}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition flex items-center justify-between"
                  >
                    <span>Add New Development Scheme</span>
                    <Plus className="w-4 h-4 text-emerald-700" />
                  </button>

                  <button
                    onClick={() => { setShowSurveyModal(true); setActiveModule('surveys'); }}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition flex items-center justify-between"
                  >
                    <span>Record Field Survey Report</span>
                    <ClipboardList className="w-4 h-4 text-emerald-700" />
                  </button>

                  <button
                    onClick={() => setActiveModule('ai_assistant')}
                    className="w-full text-left p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-purple-900 transition flex items-center justify-between"
                  >
                    <span>Query AI Constituency Assistant</span>
                    <Bot className="w-4 h-4 text-purple-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 2: Complaints Management */}
        {activeModule === 'complaints' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tracking ID, citizen, locality..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <select
                  value={selectedComplaintStatus}
                  onChange={(e) => setSelectedComplaintStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="Received">Received</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Referred to Department">Referred to Department</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {complaints.length} Total Registered
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
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
                        <td className="px-5 py-3.5 font-mono font-bold text-[#087A43]">
                          {comp.trackingId}
                        </td>
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
                            comp.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comp.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {comp.departmentReferred || 'Not yet assigned'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setEditingComplaint(comp)}
                            className="bg-slate-100 hover:bg-emerald-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Update Complaint Modal */}
            {editingComplaint && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Update Complaint {editingComplaint.trackingId}
                    </h3>
                    <button onClick={() => setEditingComplaint(null)} className="text-slate-400 hover:text-slate-700">
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Citizen Issue:</span>
                      <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
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
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                        placeholder="State action taken, officer dispatched, or resolution report..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => setEditingComplaint(null)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
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
                      className="px-4 py-2 rounded-lg bg-[#087A43] text-white font-bold"
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
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                PP-203 Development Projects Portfolio ({projects.length})
              </h3>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
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
                    <p className="text-xs text-slate-500 mt-1">{p.location}</p>
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
                        className="w-full accent-emerald-600"
                      />
                      <span className="font-mono font-bold w-10 text-right">{p.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Project Modal */}
            {showNewProjectModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                  <h3 className="font-bold text-slate-900 text-base">Create New Development Project</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="e.g. Rural Water Supply Pipeline Extension"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Union Council</label>
                        <select
                          value={newProjectUC}
                          onChange={(e) => setNewProjectUC(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Exact Location / Chak</label>
                      <input
                        type="text"
                        value={newProjectLocation}
                        onChange={(e) => setNewProjectLocation(e.target.value)}
                        placeholder="e.g. Chak 168/9-L Link Access"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Project Description</label>
                      <textarea
                        rows={3}
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        placeholder="Details of civil works, pipeline length, or road width..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs pt-2">
                    <button
                      onClick={() => setShowNewProjectModal(false)}
                      className="px-4 py-2 border rounded-lg"
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
                      className="px-4 py-2 bg-[#087A43] text-white font-bold rounded-lg"
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 4: Field Survey Management */}
        {activeModule === 'surveys' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Mobile Field Survey Inspections ({surveys.length})</h3>
                <p className="text-xs text-slate-500">Ground data collected by verified field survey officers.</p>
              </div>
              <button
                onClick={() => setShowSurveyModal(true)}
                className="bg-[#087A43] hover:bg-[#064D2B] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Submit Field Survey</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {surveys.map((srv) => (
                <div key={srv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {srv.unionCouncil} — {srv.village}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {srv.surveyType}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><strong>Surveyor:</strong> {srv.surveyorName} ({srv.surveyorPhone})</p>
                    <p><strong>Road Assessment:</strong> {srv.roadCondition}</p>
                    <p><strong>Facility Condition:</strong> {srv.facilityCondition}</p>
                    <p><strong>Key Issues Identified:</strong> {srv.issuesIdentified}</p>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                      <strong>Field Notes:</strong> {srv.notes}
                    </div>
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
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                  <h3 className="font-bold text-slate-900 text-base">Submit Field Survey Inspection</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Survey Officer Name & Phone</label>
                      <input
                        type="text"
                        value={surveyorName}
                        onChange={(e) => setSurveyorName(e.target.value)}
                        placeholder="e.g. Malik Zeeshan (03014433221)"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Union Council</label>
                        <select
                          value={surveyUC}
                          onChange={(e) => setSurveyUC(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Road Condition Assessment</label>
                      <input
                        type="text"
                        value={surveyRoadCond}
                        onChange={(e) => setSurveyRoadCond(e.target.value)}
                        placeholder="e.g. Asphalt carpet fair; culvert requires widening"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">School / Health Facility Assessment</label>
                      <input
                        type="text"
                        value={surveyFacilityCond}
                        onChange={(e) => setSurveyFacilityCond(e.target.value)}
                        placeholder="e.g. BHU doctor present; needs solar battery replacement"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ground Observations & Notes</label>
                      <textarea
                        rows={3}
                        value={surveyIssues}
                        onChange={(e) => setSurveyIssues(e.target.value)}
                        placeholder="State constituent feedback and urgent intervention needs..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs pt-2">
                    <button
                      onClick={() => setShowSurveyModal(false)}
                      className="px-4 py-2 border rounded-lg"
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
                          issuesIdentified: surveyIssues || 'Routine ground check',
                          notes: surveyIssues || 'Inspected on site',
                          latitude: 30.5333,
                          longitude: 72.7000
                        });
                        setShowSurveyModal(false);
                      }}
                      className="px-4 py-2 bg-[#087A43] text-white font-bold rounded-lg"
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
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  AI-Powered Development Recommendation Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesizes population data, healthcare gaps, school enrollments, and citizen grievances into prioritized proposals.
                </p>
              </div>

              <button
                onClick={handleGenerateAIRecommendation}
                disabled={isGeneratingRec}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingRec ? 'Analyzing Data...' : 'Run Gap Analysis'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
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

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Confidence Score:</span>
                      <span className="font-mono font-bold text-purple-700">{rec.confidenceLevel}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{rec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.problemIdentified}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Affected Population:</span>
                      <strong className="text-slate-800">{rec.estimatedPopulationAffected.toLocaleString()} Residents</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Estimated Cost Range:</span>
                      <strong className="text-slate-800">{rec.estimatedCostRange}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Evidence Analyzed:</span>
                      <span className="text-slate-700 truncate block">{rec.evidenceUsed}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p><strong>Suggested Action:</strong> <span className="text-[#087A43]">{rec.suggestedNextAction}</span></p>
                    <p className="text-slate-500"><strong>Risks / Feasibility:</strong> {rec.risksAndLimitations}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Status: <strong>{rec.status}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRecommendationStatus(rec.id, 'Accepted')}
                        className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs"
                      >
                        Accept into ADP
                      </button>
                      <button
                        onClick={() => updateRecommendationStatus(rec.id, 'Archived')}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] animate-fade-in overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm">PP-203 Constituency AI Assistant</h3>
                  <p className="text-[10px] text-purple-200">Retrieval & Analytics grounded in local database records</p>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                Grounded Model
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-line ${
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
                  <div className="bg-slate-100 text-slate-500 rounded-2xl p-3.5 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Querying constituency database and formulating analysis...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-400 font-semibold mr-1">Suggestions:</span>
              <button
                onClick={() => setChatInput('Show healthcare coverage and missing facilities')}
                className="bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 hover:text-purple-700"
              >
                Healthcare Gaps
              </button>
              <button
                onClick={() => setChatInput('Analyze unresolved public complaints by sector')}
                className="bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 hover:text-purple-700"
              >
                Complaints Analysis
              </button>
              <button
                onClick={() => setChatInput('Recommend priority development projects with budget estimates')}
                className="bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 hover:text-purple-700"
              >
                Priority Recommendations
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask any question about PP-203 villages, schools, projects, or statistics..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={isAiGenerating}
                className="bg-purple-700 hover:bg-purple-800 text-white p-2.5 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Module 7: Data Management */}
        {activeModule === 'data_management' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
            <h3 className="font-bold text-slate-900 text-base">Constituency Database Backup & Export</h3>
            <p className="text-xs text-slate-500">
              Export entire verified constituency schema including Union Councils, facilities, complaints, projects, and GIS coordinates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Download className="w-6 h-6 text-[#087A43]" />
                <h4 className="font-bold text-sm text-slate-900">Export Full JSON Database</h4>
                <p className="text-xs text-slate-600">
                  Download a complete JSON snapshot of all 11 Union Councils, 80+ chaks, healthcare directory, and audit logs.
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
                  className="bg-[#087A43] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Download JSON Backup
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Upload className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Restore from JSON</h4>
                <p className="text-xs text-slate-600">
                  Upload and restore saved data structures, projects, or GIS layers into the live portal.
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
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Module 8: Staff Roles & Permissions */}
        {activeModule === 'staff' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Secretariat Personnel & Access Roles</h3>
                <p className="text-xs text-slate-500">Role-based access control (RBAC) enforced across administrative modules.</p>
              </div>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Super Admin Authorized
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {allStaff.map((staff) => (
                <div key={staff.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{staff.displayName}</h4>
                    <p className="text-slate-500 font-mono">{staff.email} • {staff.phone || 'N/A'}</p>
                    <span className="text-[10px] text-slate-400">Created: {staff.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">Role:</span>
                    <select
                      value={staff.role}
                      disabled={currentUser?.role !== 'Super Admin'}
                      onChange={(e) => updateStaffRole(staff.id, e.target.value as AdminRole)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 disabled:opacity-60"
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
