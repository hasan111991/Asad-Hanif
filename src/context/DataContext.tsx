import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LeaderProfile,
  UnionCouncil,
  VillageMouza,
  EducationFacility,
  HealthcareFacility,
  InfrastructureItem,
  Project,
  CitizenComplaint,
  FieldSurvey,
  AIRecommendation,
  PublicNotice,
  NewsItem,
  GalleryMedia,
  SiteSettings,
  AuditLog,
  ComplaintStatus
} from '../types';
import {
  initialProfile,
  initialUnionCouncils,
  initialVillages,
  initialEducation,
  initialHealthcare,
  initialInfrastructure,
  initialProjects,
  initialComplaints,
  initialSurveys,
  initialRecommendations,
  initialNotices,
  initialNews,
  initialGallery,
  initialSettings
} from '../data/constituencyData';

interface DataContextType {
  profile: LeaderProfile;
  unionCouncils: UnionCouncil[];
  villages: VillageMouza[];
  education: EducationFacility[];
  healthcare: HealthcareFacility[];
  infrastructure: InfrastructureItem[];
  projects: Project[];
  complaints: CitizenComplaint[];
  surveys: FieldSurvey[];
  recommendations: AIRecommendation[];
  notices: PublicNotice[];
  news: NewsItem[];
  gallery: GalleryMedia[];
  settings: SiteSettings;
  auditLogs: AuditLog[];
  
  // Actions
  submitComplaint: (data: Omit<CitizenComplaint, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt'>) => CitizenComplaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, remarks?: string, department?: string, officer?: string, evidenceUrl?: string) => void;
  getComplaintByTracking: (trackingId: string, phone: string) => CitizenComplaint | null;
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  submitSurvey: (survey: Omit<FieldSurvey, 'id' | 'timestamp' | 'status'>) => FieldSurvey;
  updateSurveyStatus: (id: string, status: FieldSurvey['status']) => void;
  addRecommendation: (rec: Omit<AIRecommendation, 'id' | 'createdAt'>) => AIRecommendation;
  updateRecommendationStatus: (id: string, status: AIRecommendation['status']) => void;
  addNotice: (notice: Omit<PublicNotice, 'id'>) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  logAuditAction: (action: string, adminEmail: string, details: string, collection?: string, targetId?: string) => void;
  resetToDefaults: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const DataContext = createContext<DataContextType | null>(null);

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<LeaderProfile>(() => {
    const loaded = loadStorage('pp203_profile', initialProfile);
    return {
      ...loaded,
      photoUrl: '/images/chaudhry_asad_hanif_jutt.jpg',
      leadPortraitUrl: '/images/chaudhry_asad_hanif_jutt.jpg'
    };
  });
  const [unionCouncils, setUnionCouncils] = useState<UnionCouncil[]>(() => loadStorage('pp203_ucs', initialUnionCouncils));
  const [villages, setVillages] = useState<VillageMouza[]>(() => loadStorage('pp203_villages', initialVillages));
  const [education, setEducation] = useState<EducationFacility[]>(() => loadStorage('pp203_education', initialEducation));
  const [healthcare, setHealthcare] = useState<HealthcareFacility[]>(() => loadStorage('pp203_healthcare', initialHealthcare));
  const [infrastructure, setInfrastructure] = useState<InfrastructureItem[]>(() => loadStorage('pp203_infrastructure', initialInfrastructure));
  const [projects, setProjects] = useState<Project[]>(() => {
    const loaded = loadStorage('pp203_projects', initialProjects);
    return loaded.map(p => p.imageUrl && p.imageUrl.includes('portrait_lead') ? { ...p, imageUrl: '/images/chichawatni_scene_1794225848060.jpg' } : p);
  });
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(() => loadStorage('pp203_complaints', initialComplaints));
  const [surveys, setSurveys] = useState<FieldSurvey[]>(() => loadStorage('pp203_surveys', initialSurveys));
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(() => loadStorage('pp203_recs', initialRecommendations));
  const [notices, setNotices] = useState<PublicNotice[]>(() => loadStorage('pp203_notices', initialNotices));
  const [news, setNews] = useState<NewsItem[]>(() => {
    const loaded = loadStorage('pp203_news', initialNews);
    return loaded.map(n => n.imageUrl && n.imageUrl.includes('portrait_lead') ? { ...n, imageUrl: '/images/chaudhry_asad_hanif_jutt.jpg' } : n);
  });
  const [gallery, setGallery] = useState<GalleryMedia[]>(() => {
    const loaded = loadStorage('pp203_gallery', initialGallery);
    return loaded.map(g => g.mediaUrl && g.mediaUrl.includes('portrait_lead') ? { ...g, mediaUrl: '/images/chaudhry_asad_hanif_jutt.jpg' } : g);
  });
  const [settings, setSettings] = useState<SiteSettings>(() => loadStorage('pp203_settings', initialSettings));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage('pp203_audit_logs', [
    {
      id: 'aud-1',
      action: 'System Initialized',
      adminEmail: 'system@chasadhanif.pk',
      details: 'PP-203 Smart Constituency Management & Development Portal active.',
      timestamp: new Date().toISOString()
    }
  ]));

  useEffect(() => { localStorage.setItem('pp203_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('pp203_ucs', JSON.stringify(unionCouncils)); }, [unionCouncils]);
  useEffect(() => { localStorage.setItem('pp203_villages', JSON.stringify(villages)); }, [villages]);
  useEffect(() => { localStorage.setItem('pp203_education', JSON.stringify(education)); }, [education]);
  useEffect(() => { localStorage.setItem('pp203_healthcare', JSON.stringify(healthcare)); }, [healthcare]);
  useEffect(() => { localStorage.setItem('pp203_infrastructure', JSON.stringify(infrastructure)); }, [infrastructure]);
  useEffect(() => { localStorage.setItem('pp203_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('pp203_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('pp203_surveys', JSON.stringify(surveys)); }, [surveys]);
  useEffect(() => { localStorage.setItem('pp203_recs', JSON.stringify(recommendations)); }, [recommendations]);
  useEffect(() => { localStorage.setItem('pp203_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('pp203_news', JSON.stringify(news)); }, [news]);
  useEffect(() => { localStorage.setItem('pp203_gallery', JSON.stringify(gallery)); }, [gallery]);
  useEffect(() => { localStorage.setItem('pp203_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('pp203_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  const logAuditAction = (action: string, adminEmail: string, details: string, collection?: string, targetId?: string) => {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      adminEmail: adminEmail || 'admin@chasadhanif.pk',
      details,
      targetCollection: collection,
      targetId,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const submitComplaint = (data: Omit<CitizenComplaint, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt'>): CitizenComplaint => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `PP203-${new Date().getFullYear()}-${randomSuffix}`;
    const newComplaint: CitizenComplaint = {
      ...data,
      id: `cmp-${Date.now()}`,
      trackingId,
      status: 'Received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComplaints(prev => [newComplaint, ...prev]);
    logAuditAction('Complaint Submitted', 'citizen_portal', `Complaint ${trackingId} logged for UC ${data.unionCouncil}`, 'complaints', newComplaint.id);
    return newComplaint;
  };

  const updateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    remarks?: string,
    department?: string,
    officer?: string,
    evidenceUrl?: string
  ) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status,
            adminRemarks: remarks !== undefined ? remarks : c.adminRemarks,
            departmentReferred: department !== undefined ? department : c.departmentReferred,
            assignedOfficer: officer !== undefined ? officer : c.assignedOfficer,
            resolutionEvidenceUrl: evidenceUrl !== undefined ? evidenceUrl : c.resolutionEvidenceUrl,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    logAuditAction('Complaint Status Updated', 'admin', `Complaint ${id} status updated to ${status}`, 'complaints', id);
  };

  const getComplaintByTracking = (trackingId: string, phone: string): CitizenComplaint | null => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanTracking = trackingId.trim().toUpperCase();

    const match = complaints.find(c => {
      const matchTrack = c.trackingId.toUpperCase() === cleanTracking;
      const matchPhone = c.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7));
      return matchTrack && matchPhone;
    });

    return match || null;
  };

  const addProject = (projectData: Omit<Project, 'id'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: `prj-${Date.now()}`
    };
    setProjects(prev => [newProject, ...prev]);
    logAuditAction('Project Created', 'admin', `Project ${newProject.title} added`, 'projects', newProject.id);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logAuditAction('Project Updated', 'admin', `Project ${id} details updated`, 'projects', id);
  };

  const submitSurvey = (surveyData: Omit<FieldSurvey, 'id' | 'timestamp' | 'status'>): FieldSurvey => {
    const newSurvey: FieldSurvey = {
      ...surveyData,
      id: `srv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'Submitted'
    };
    setSurveys(prev => [newSurvey, ...prev]);
    logAuditAction('Field Survey Submitted', surveyData.surveyorName, `Survey for ${surveyData.village} (${surveyData.unionCouncil})`, 'surveys', newSurvey.id);
    return newSurvey;
  };

  const updateSurveyStatus = (id: string, status: FieldSurvey['status']) => {
    setSurveys(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const addRecommendation = (recData: Omit<AIRecommendation, 'id' | 'createdAt'>): AIRecommendation => {
    const newRec: AIRecommendation = {
      ...recData,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setRecommendations(prev => [newRec, ...prev]);
    logAuditAction('AI Recommendation Generated', 'gemini_engine', `Generated: ${newRec.title}`, 'ai_recommendations', newRec.id);
    return newRec;
  };

  const updateRecommendationStatus = (id: string, status: AIRecommendation['status']) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addNotice = (noticeData: Omit<PublicNotice, 'id'>) => {
    const newNotice: PublicNotice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setProfile(initialProfile);
    setUnionCouncils(initialUnionCouncils);
    setVillages(initialVillages);
    setEducation(initialEducation);
    setHealthcare(initialHealthcare);
    setInfrastructure(initialInfrastructure);
    setProjects(initialProjects);
    setComplaints(initialComplaints);
    setSurveys(initialSurveys);
    setRecommendations(initialRecommendations);
    setNotices(initialNotices);
    setNews(initialNews);
    setGallery(initialGallery);
    setSettings(initialSettings);
  };

  const exportDatabaseJSON = (): string => {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      unionCouncils,
      villages,
      education,
      healthcare,
      infrastructure,
      projects,
      complaints,
      surveys,
      recommendations,
      notices,
      news,
      gallery,
      settings
    }, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (data.unionCouncils) setUnionCouncils(data.unionCouncils);
      if (data.villages) setVillages(data.villages);
      if (data.education) setEducation(data.education);
      if (data.healthcare) setHealthcare(data.healthcare);
      if (data.infrastructure) setInfrastructure(data.infrastructure);
      if (data.projects) setProjects(data.projects);
      if (data.complaints) setComplaints(data.complaints);
      if (data.surveys) setSurveys(data.surveys);
      if (data.recommendations) setRecommendations(data.recommendations);
      if (data.notices) setNotices(data.notices);
      if (data.news) setNews(data.news);
      if (data.gallery) setGallery(data.gallery);
      if (data.settings) setSettings(data.settings);
      logAuditAction('Database Imported', 'admin', 'Full database restored from uploaded JSON backup.');
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        unionCouncils,
        villages,
        education,
        healthcare,
        infrastructure,
        projects,
        complaints,
        surveys,
        recommendations,
        notices,
        news,
        gallery,
        settings,
        auditLogs,
        submitComplaint,
        updateComplaintStatus,
        getComplaintByTracking,
        addProject,
        updateProject,
        submitSurvey,
        updateSurveyStatus,
        addRecommendation,
        updateRecommendationStatus,
        addNotice,
        updateSettings,
        logAuditAction,
        resetToDefaults,
        exportDatabaseJSON,
        importDatabaseJSON
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
