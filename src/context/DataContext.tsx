import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  LeaderProfile,
  UnionCouncil,
  VillageMouza,
  EducationFacility,
  HealthcareFacility,
  InfrastructureItem,
  Project,
  AssemblyActivity,
  CitizenComplaint,
  ContactMessage,
  PublicNotice,
  NewsItem,
  GalleryMedia,
  SmsLog,
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
  initialAssemblyActivities,
  initialComplaints,
  initialContactMessages,
  initialNotices,
  initialNews,
  initialGallery,
  initialSmsLogs,
  initialSettings
} from '../data/constituencyData';

export interface PublicComplaintTrackingView {
  trackingId: string;
  category: string;
  districtTehsil: string;
  unionCouncil: string;
  locality: string;
  status: ComplaintStatus;
  priority: string;
  departmentReferred?: string;
  adminRemarks?: string;
  assignedOfficer?: string;
  createdAt: string;
  updatedAt: string;
  maskedPhone: string;
}

interface DataContextType {
  profile: LeaderProfile;
  unionCouncils: UnionCouncil[];
  villages: VillageMouza[];
  education: EducationFacility[];
  healthcare: HealthcareFacility[];
  infrastructure: InfrastructureItem[];
  projects: Project[];
  assemblyActivities: AssemblyActivity[];
  complaints: CitizenComplaint[];
  contactMessages: ContactMessage[];
  notices: PublicNotice[];
  news: NewsItem[];
  gallery: GalleryMedia[];
  smsLogs: SmsLog[];
  settings: SiteSettings;
  auditLogs: AuditLog[];
  isLoadingData: boolean;
  hasSeededFirestore: boolean;

  // Public Operations
  submitComplaint: (
    data: Omit<CitizenComplaint, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<CitizenComplaint>;
  lookupComplaintByTracking: (trackingId: string) => Promise<PublicComplaintTrackingView | null>;
  submitContactMessage: (
    data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
  ) => Promise<ContactMessage>;

  // Admin Operations
  seedInitialFirestore: () => Promise<void>;
  updateProfile: (updates: Partial<LeaderProfile>) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addAssemblyActivity: (activity: Omit<AssemblyActivity, 'id'>) => Promise<AssemblyActivity>;
  updateAssemblyActivity: (id: string, updates: Partial<AssemblyActivity>) => Promise<void>;
  deleteAssemblyActivity: (id: string) => Promise<void>;

  updateComplaintStatus: (
    id: string,
    status: ComplaintStatus,
    remarks?: string,
    department?: string,
    officer?: string,
    dispatchSms?: boolean
  ) => Promise<void>;

  addNotice: (notice: Omit<PublicNotice, 'id'>) => Promise<void>;
  updateNotice: (id: string, updates: Partial<PublicNotice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  updateContactStatus: (
    id: string,
    status: ContactMessage['status'],
    adminNotes?: string
  ) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;

  addNews: (item: Omit<NewsItem, 'id'>) => Promise<void>;
  updateNews: (id: string, updates: Partial<NewsItem>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;

  addGalleryItem: (item: Omit<GalleryMedia, 'id'>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  logAuditAction: (
    action: string,
    adminEmail: string,
    details: string,
    collectionName?: string,
    targetId?: string
  ) => Promise<void>;
  exportDatabaseJSON: () => string;
}

const DataContext = createContext<DataContextType | null>(null);

function maskPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 7) return '***-****';
  return `${digits.slice(0, 4)}-***-${digits.slice(-3)}`;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, isDemoSession } = useAuth();

  const [profile, setProfile] = useState<LeaderProfile>(initialProfile);
  const [unionCouncils] = useState<UnionCouncil[]>(initialUnionCouncils);
  const [villages] = useState<VillageMouza[]>(initialVillages);
  const [education] = useState<EducationFacility[]>(initialEducation);
  const [healthcare] = useState<HealthcareFacility[]>(initialHealthcare);
  const [infrastructure] = useState<InfrastructureItem[]>(initialInfrastructure);

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [assemblyActivities, setAssemblyActivities] = useState<AssemblyActivity[]>(initialAssemblyActivities);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(initialComplaints);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(initialContactMessages);
  const [notices, setNotices] = useState<PublicNotice[]>(initialNotices);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [gallery, setGallery] = useState<GalleryMedia[]>(initialGallery);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(initialSmsLogs);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasSeededFirestore, setHasSeededFirestore] = useState(false);

  // Public real-time Firestore listeners
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    // 1. Leader Profile
    unsubs.push(
      onSnapshot(
        doc(db, 'profile', 'leader'),
        (snap) => {
          if (snap.exists()) {
            setProfile({ ...initialProfile, ...(snap.data() as LeaderProfile) });
          }
        },
        (err) => console.warn('Profile listener notice:', err)
      )
    );

    // 2. Site Settings
    unsubs.push(
      onSnapshot(
        doc(db, 'settings', 'portal'),
        (snap) => {
          if (snap.exists()) {
            setSettings({ ...initialSettings, ...(snap.data() as SiteSettings) });
          }
          setIsLoadingData(false);
        },
        () => setIsLoadingData(false)
      )
    );

    // 3. Projects
    unsubs.push(
      onSnapshot(
        collection(db, 'projects'),
        (snap) => {
          if (!snap.empty) {
            setProjects(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Project, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('Projects listener notice:', err)
      )
    );

    // 4. Assembly Activities
    unsubs.push(
      onSnapshot(
        query(collection(db, 'assembly_activities'), orderBy('sessionDate', 'desc')),
        (snap) => {
          if (!snap.empty) {
            setAssemblyActivities(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<AssemblyActivity, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('Assembly listener notice:', err)
      )
    );

    // 5. Public Notices
    unsubs.push(
      onSnapshot(
        query(collection(db, 'public_notices'), orderBy('publishDate', 'desc')),
        (snap) => {
          if (!snap.empty) {
            setNotices(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<PublicNotice, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('Notices listener notice:', err)
      )
    );

    // 6. News
    unsubs.push(
      onSnapshot(
        query(collection(db, 'news'), orderBy('date', 'desc')),
        (snap) => {
          if (!snap.empty) {
            setNews(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<NewsItem, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('News listener notice:', err)
      )
    );

    // 7. Gallery
    unsubs.push(
      onSnapshot(
        query(collection(db, 'gallery'), orderBy('date', 'desc')),
        (snap) => {
          if (!snap.empty) {
            setGallery(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<GalleryMedia, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('Gallery listener notice:', err)
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  // Admin-only private Firestore listeners (subscribed only after real Firebase Admin authentication)
  useEffect(() => {
    if (!isAuthenticated || !currentUser || isDemoSession) return;

    const adminUnsubs: Array<() => void> = [];

    adminUnsubs.push(
      onSnapshot(
        query(collection(db, 'complaints'), orderBy('createdAt', 'desc')),
        (snap) => {
          if (!snap.empty) {
            setComplaints(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<CitizenComplaint, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('Admin complaints listener notice:', err)
      )
    );

    adminUnsubs.push(
      onSnapshot(
        query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')),
        (snap) => {
          if (!snap.empty) {
            setContactMessages(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<ContactMessage, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('Admin contacts listener notice:', err)
      )
    );

    adminUnsubs.push(
      onSnapshot(
        query(collection(db, 'sms_logs'), orderBy('timestamp', 'desc'), limit(100)),
        (snap) => {
          if (!snap.empty) {
            setSmsLogs(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<SmsLog, 'id'>)
              }))
            );
          }
        },
        (err) => console.warn('SMS logs listener notice:', err)
      )
    );

    adminUnsubs.push(
      onSnapshot(
        query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(150)),
        (snap) => {
          setAuditLogs(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<AuditLog, 'id'>)
            }))
          );
        },
        (err) => console.warn('Audit logs listener notice:', err)
      )
    );

    return () => {
      adminUnsubs.forEach((u) => u());
    };
  }, [isAuthenticated, currentUser, isDemoSession]);

  const logAuditAction = useCallback(
    async (
      action: string,
      adminEmail: string,
      details: string,
      collectionName?: string,
      targetId?: string
    ) => {
      const entry = {
        action,
        adminEmail: adminEmail || currentUser?.email || 'system@chasadhanif.pk',
        adminUid: currentUser?.uid || currentUser?.id || 'system',
        targetCollection: collectionName || 'portal',
        targetId: targetId || 'general',
        details,
        timestamp: new Date().toISOString()
      };

      if (isDemoSession) {
        setAuditLogs((prev) => [
          { id: `demo-audit-${Date.now()}`, ...entry },
          ...prev
        ]);
        return;
      }

      if (isAuthenticated && currentUser) {
        try {
          await addDoc(collection(db, 'audit_logs'), entry);
        } catch (err) {
          console.warn('Audit log write skipped:', err);
        }
      }
    },
    [currentUser, isAuthenticated, isDemoSession]
  );

  // Seed initial baseline records to Firestore when empty (called by Super Admin / Admin)
  const seedInitialFirestore = useCallback(async () => {
    if (!isAuthenticated || isDemoSession) return;
    try {
      const projSnap = await getDocs(collection(db, 'projects'));
      if (projSnap.empty) {
        await setDoc(doc(db, 'profile', 'leader'), initialProfile);
        await setDoc(doc(db, 'settings', 'portal'), initialSettings);
        for (const p of initialProjects) {
          await setDoc(doc(db, 'projects', p.id), p);
        }
        for (const a of initialAssemblyActivities) {
          await setDoc(doc(db, 'assembly_activities', a.id), a);
        }
        for (const n of initialNotices) {
          await setDoc(doc(db, 'public_notices', n.id), n);
        }
        for (const nw of initialNews) {
          await setDoc(doc(db, 'news', nw.id), nw);
        }
        for (const g of initialGallery) {
          await setDoc(doc(db, 'gallery', g.id), g);
        }
        for (const c of initialComplaints) {
          await setDoc(doc(db, 'complaints', c.trackingId), c);
        }
        for (const m of initialContactMessages) {
          await setDoc(doc(db, 'contact_messages', m.id), m);
        }
        for (const s of initialSmsLogs) {
          await setDoc(doc(db, 'sms_logs', s.id), s);
        }
        await logAuditAction(
          'Initial Firestore Seed Completed',
          currentUser?.email || 'admin',
          'Baseline constituency portfolio, notices, assembly records, and settings synced to Firestore.'
        );
      }
      setHasSeededFirestore(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'projects');
    }
  }, [isAuthenticated, isDemoSession, currentUser, logAuditAction]);

  // Automatically ensure baseline data exists in Firestore on first Super Admin sign-in
  useEffect(() => {
    if (isAuthenticated && !isDemoSession && currentUser?.role === 'Super Admin' && !hasSeededFirestore) {
      seedInitialFirestore().catch(() => {});
    }
  }, [isAuthenticated, isDemoSession, currentUser, hasSeededFirestore, seedInitialFirestore]);

  // Public Grievance Submission -> Firestore `/complaints/{trackingId}`
  const submitComplaint = async (
    data: Omit<CitizenComplaint, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<CitizenComplaint> => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CMP-${year}-${randomNum}`;
    const now = new Date().toISOString();

    const payload: CitizenComplaint = {
      id: trackingId,
      trackingId,
      citizenName: data.citizenName.trim(),
      phone: data.phone.trim(),
      districtTehsil: data.districtTehsil.trim(),
      unionCouncil: data.unionCouncil.trim(),
      locality: data.locality?.trim() || data.unionCouncil.trim(),
      category: data.category,
      description: data.description.trim(),
      status: 'Received',
      priority: data.priority || 'Normal',
      createdAt: now,
      updatedAt: now
    };

    const path = `complaints/${trackingId}`;
    try {
      await setDoc(doc(db, 'complaints', trackingId), payload);
      setComplaints((prev) => [payload, ...prev]);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  // Public Single-Document Tracking Lookup -> masks citizen PII
  const lookupComplaintByTracking = async (
    trackingId: string
  ): Promise<PublicComplaintTrackingView | null> => {
    const cleanId = trackingId.trim().toUpperCase();
    if (!cleanId) return null;

    const path = `complaints/${cleanId}`;
    try {
      const snap = await getDoc(doc(db, 'complaints', cleanId));
      if (snap.exists()) {
        const d = snap.data() as CitizenComplaint;
        return {
          trackingId: d.trackingId,
          category: d.category,
          districtTehsil: d.districtTehsil || 'Chichawatni, District Sahiwal',
          unionCouncil: d.unionCouncil,
          locality: d.locality || d.unionCouncil,
          status: d.status,
          priority: d.priority,
          departmentReferred: d.departmentReferred,
          adminRemarks: d.adminRemarks,
          assignedOfficer: d.assignedOfficer,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          maskedPhone: maskPhone(d.phone)
        };
      }

      // Check local seed showcase records if Firestore collection hasn't been seeded yet
      const localMatch = initialComplaints.find(
        (c) => c.trackingId.toUpperCase() === cleanId
      );
      if (localMatch) {
        return {
          trackingId: localMatch.trackingId,
          category: localMatch.category,
          districtTehsil: localMatch.districtTehsil,
          unionCouncil: localMatch.unionCouncil,
          locality: localMatch.locality,
          status: localMatch.status,
          priority: localMatch.priority,
          departmentReferred: localMatch.departmentReferred,
          adminRemarks: localMatch.adminRemarks,
          assignedOfficer: localMatch.assignedOfficer,
          createdAt: localMatch.createdAt,
          updatedAt: localMatch.updatedAt,
          maskedPhone: maskPhone(localMatch.phone)
        };
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  // Public Contact / Appointment Message -> Firestore `/contact_messages`
  const submitContactMessage = async (
    data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
  ): Promise<ContactMessage> => {
    const now = new Date().toISOString();
    const docData = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      ...(data.email?.trim() ? { email: data.email.trim() } : {}),
      inquiryType: data.inquiryType,
      ...(data.preferredDate ? { preferredDate: data.preferredDate } : {}),
      message: data.message.trim(),
      status: 'Pending' as const,
      createdAt: now
    };

    try {
      const ref = await addDoc(collection(db, 'contact_messages'), docData);
      const created: ContactMessage = { id: ref.id, ...docData };
      setContactMessages((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contact_messages');
    }
  };

  // Leader Profile CMS
  const updateProfile = async (updates: Partial<LeaderProfile>) => {
    const next = { ...profile, ...updates };
    if (isDemoSession) {
      setProfile(next);
      await logAuditAction(
        'Leader Profile Updated (Demo Session)',
        currentUser?.email || 'asad@gmail.com',
        'Updated representative biography / secretariat profile details',
        'profile',
        'leader'
      );
      return;
    }
    try {
      await setDoc(doc(db, 'profile', 'leader'), next, { merge: true });
      setProfile(next);
      await logAuditAction(
        'Leader Profile Updated',
        currentUser?.email || 'admin',
        'Updated representative biography / secretariat profile details',
        'profile',
        'leader'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'profile/leader');
    }
  };

  // Projects CRUD
  const addProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const id = `prj-${Date.now()}`;
    const created: Project = { ...projectData, id };
    if (isDemoSession) {
      setProjects((prev) => [created, ...prev]);
      await logAuditAction('Project Created (Demo)', currentUser?.email || 'asad@gmail.com', `Added project: ${created.title}`, 'projects', id);
      return created;
    }
    try {
      await setDoc(doc(db, 'projects', id), created);
      setProjects((prev) => [created, ...prev]);
      await logAuditAction(
        'Project Created',
        currentUser?.email || 'admin',
        `Added project: ${created.title}`,
        'projects',
        id
      );
      return created;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${id}`);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (isDemoSession) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      await logAuditAction('Project Updated (Demo)', currentUser?.email || 'asad@gmail.com', `Updated project ${id}`, 'projects', id);
      return;
    }
    try {
      await setDoc(doc(db, 'projects', id), updates, { merge: true });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      await logAuditAction(
        'Project Updated',
        currentUser?.email || 'admin',
        `Updated project ${id}`,
        'projects',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    if (isDemoSession) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await logAuditAction('Project Deleted (Demo)', currentUser?.email || 'asad@gmail.com', `Deleted project ${id}`, 'projects', id);
      return;
    }
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await logAuditAction(
        'Project Deleted',
        currentUser?.email || 'admin',
        `Deleted project ${id}`,
        'projects',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  // Assembly Activities CRUD
  const addAssemblyActivity = async (
    activityData: Omit<AssemblyActivity, 'id'>
  ): Promise<AssemblyActivity> => {
    const id = `asm-${Date.now()}`;
    const created: AssemblyActivity = { ...activityData, id };
    if (isDemoSession) {
      setAssemblyActivities((prev) => [created, ...prev]);
      await logAuditAction('Assembly Record Added (Demo)', currentUser?.email || 'asad@gmail.com', `Added Punjab Assembly activity: ${created.title}`, 'assembly_activities', id);
      return created;
    }
    try {
      await setDoc(doc(db, 'assembly_activities', id), created);
      setAssemblyActivities((prev) => [created, ...prev]);
      await logAuditAction(
        'Assembly Record Added',
        currentUser?.email || 'admin',
        `Added Punjab Assembly activity: ${created.title}`,
        'assembly_activities',
        id
      );
      return created;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assembly_activities/${id}`);
    }
  };

  const updateAssemblyActivity = async (id: string, updates: Partial<AssemblyActivity>) => {
    if (isDemoSession) {
      setAssemblyActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
      await logAuditAction('Assembly Record Updated (Demo)', currentUser?.email || 'asad@gmail.com', `Updated record ${id}`, 'assembly_activities', id);
      return;
    }
    try {
      await setDoc(doc(db, 'assembly_activities', id), updates, { merge: true });
      setAssemblyActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
      await logAuditAction(
        'Assembly Record Updated',
        currentUser?.email || 'admin',
        `Updated Punjab Assembly record ${id}`,
        'assembly_activities',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assembly_activities/${id}`);
    }
  };

  const deleteAssemblyActivity = async (id: string) => {
    if (isDemoSession) {
      setAssemblyActivities((prev) => prev.filter((a) => a.id !== id));
      await logAuditAction('Assembly Record Deleted (Demo)', currentUser?.email || 'asad@gmail.com', `Deleted record ${id}`, 'assembly_activities', id);
      return;
    }
    try {
      await deleteDoc(doc(db, 'assembly_activities', id));
      setAssemblyActivities((prev) => prev.filter((a) => a.id !== id));
      await logAuditAction(
        'Assembly Record Deleted',
        currentUser?.email || 'admin',
        `Deleted Punjab Assembly record ${id}`,
        'assembly_activities',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `assembly_activities/${id}`);
    }
  };

  // Complaint Update + SMS Notification Dispatch Log
  const updateComplaintStatus = async (
    id: string,
    status: ComplaintStatus,
    remarks?: string,
    department?: string,
    officer?: string,
    dispatchSms = true
  ) => {
    const target = complaints.find((c) => c.id === id || c.trackingId === id);
    const docId = target?.trackingId || id;
    const now = new Date().toISOString();

    const patch: Partial<CitizenComplaint> = {
      status,
      updatedAt: now,
      ...(remarks !== undefined ? { adminRemarks: remarks } : {}),
      ...(department !== undefined ? { departmentReferred: department } : {}),
      ...(officer !== undefined ? { assignedOfficer: officer } : {})
    };

    if (isDemoSession) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id || c.trackingId === docId ? { ...c, ...patch } : c))
      );
      if (dispatchSms && settings.smsEnabled && target?.phone) {
        const smsEntry: SmsLog = {
          id: `sms-${Date.now()}`,
          recipientPhone: target.phone,
          trackingId: docId,
          message: `PP-203 Secretariat: Complaint ${docId} status updated to "${status}".${department ? ` Referred to ${department}.` : ''}`,
          provider: settings.smsProvider || 'Secretariat Gateway',
          senderId: settings.smsSenderId || 'PP203-MPA',
          status: 'Simulated',
          sentBy: currentUser?.email || 'asad@gmail.com',
          timestamp: now
        };
        setSmsLogs((prev) => [smsEntry, ...prev]);
      }
      await logAuditAction('Complaint Triaged (Demo)', currentUser?.email || 'asad@gmail.com', `Updated ${docId} to "${status}"`, 'complaints', docId);
      return;
    }

    try {
      await setDoc(doc(db, 'complaints', docId), patch, { merge: true });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id || c.trackingId === docId ? { ...c, ...patch } : c))
      );

      await logAuditAction(
        'Complaint Triaged',
        currentUser?.email || 'admin',
        `Updated ${docId} to "${status}" (${department || 'Secretariat Desk'})`,
        'complaints',
        docId
      );

      // Dispatch / log SMS update if enabled
      if (dispatchSms && settings.smsEnabled && target?.phone) {
        const smsEntry: Omit<SmsLog, 'id'> = {
          recipientPhone: target.phone,
          trackingId: docId,
          message: `PP-203 Secretariat: Complaint ${docId} status updated to "${status}".${
            department ? ` Referred to ${department}.` : ''
          }`,
          provider: settings.smsProvider || 'Secretariat Gateway',
          senderId: settings.smsSenderId || 'PP203-MPA',
          status: 'Simulated',
          sentBy: currentUser?.email || 'admin',
          timestamp: now
        };
        const smsRef = await addDoc(collection(db, 'sms_logs'), smsEntry);
        setSmsLogs((prev) => [{ id: smsRef.id, ...smsEntry }, ...prev]);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `complaints/${docId}`);
    }
  };

  // Public Notices CRUD
  const addNotice = async (noticeData: Omit<PublicNotice, 'id'>) => {
    const id = `not-${Date.now()}`;
    const created: PublicNotice = {
      ...noticeData,
      id,
      createdAt: new Date().toISOString()
    };
    if (isDemoSession) {
      setNotices((prev) => [created, ...prev]);
      await logAuditAction('Notice Published (Demo)', currentUser?.email || 'asad@gmail.com', `Published notice: ${created.title}`, 'public_notices', id);
      return;
    }
    try {
      await setDoc(doc(db, 'public_notices', id), created);
      setNotices((prev) => [created, ...prev]);
      await logAuditAction(
        'Notice Published',
        currentUser?.email || 'admin',
        `Published notice: ${created.title}`,
        'public_notices',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `public_notices/${id}`);
    }
  };

  const updateNotice = async (id: string, updates: Partial<PublicNotice>) => {
    if (isDemoSession) {
      setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
      await logAuditAction('Notice Updated (Demo)', currentUser?.email || 'asad@gmail.com', `Updated notice ${id}`, 'public_notices', id);
      return;
    }
    try {
      await setDoc(doc(db, 'public_notices', id), updates, { merge: true });
      setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
      await logAuditAction(
        'Notice Updated',
        currentUser?.email || 'admin',
        `Updated notice ${id}`,
        'public_notices',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `public_notices/${id}`);
    }
  };

  const deleteNotice = async (id: string) => {
    if (isDemoSession) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
      await logAuditAction('Notice Deleted (Demo)', currentUser?.email || 'asad@gmail.com', `Removed notice ${id}`, 'public_notices', id);
      return;
    }
    try {
      await deleteDoc(doc(db, 'public_notices', id));
      setNotices((prev) => prev.filter((n) => n.id !== id));
      await logAuditAction(
        'Notice Deleted',
        currentUser?.email || 'admin',
        `Removed notice ${id}`,
        'public_notices',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `public_notices/${id}`);
    }
  };

  // Appointments & Contact Messages Management
  const updateContactStatus = async (
    id: string,
    status: ContactMessage['status'],
    adminNotes?: string
  ) => {
    const patch: Partial<ContactMessage> = {
      status,
      ...(adminNotes !== undefined ? { adminNotes } : {})
    };
    if (isDemoSession) {
      setContactMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      await logAuditAction('Appointment Updated (Demo)', currentUser?.email || 'asad@gmail.com', `Updated inquiry ${id} to ${status}`, 'contact_messages', id);
      return;
    }
    try {
      await updateDoc(doc(db, 'contact_messages', id), patch);
      setContactMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
      await logAuditAction(
        'Appointment / Inquiry Updated',
        currentUser?.email || 'admin',
        `Updated inquiry ${id} to ${status}`,
        'contact_messages',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${id}`);
    }
  };

  const deleteContactMessage = async (id: string) => {
    if (isDemoSession) {
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      await logAuditAction('Inquiry Deleted (Demo)', currentUser?.email || 'asad@gmail.com', `Deleted contact message ${id}`, 'contact_messages', id);
      return;
    }
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      await logAuditAction(
        'Inquiry Deleted',
        currentUser?.email || 'admin',
        `Deleted contact message ${id}`,
        'contact_messages',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contact_messages/${id}`);
    }
  };

  // News CRUD
  const addNews = async (itemData: Omit<NewsItem, 'id'>) => {
    const id = `news-${Date.now()}`;
    const created: NewsItem = { ...itemData, id };
    if (isDemoSession) {
      setNews((prev) => [created, ...prev]);
      await logAuditAction('News Published (Demo)', currentUser?.email || 'asad@gmail.com', `Published news: ${created.title}`, 'news', id);
      return;
    }
    try {
      await setDoc(doc(db, 'news', id), created);
      setNews((prev) => [created, ...prev]);
      await logAuditAction(
        'News Article Published',
        currentUser?.email || 'admin',
        `Published news: ${created.title}`,
        'news',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `news/${id}`);
    }
  };

  const updateNews = async (id: string, updates: Partial<NewsItem>) => {
    if (isDemoSession) {
      setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
      await logAuditAction('News Updated (Demo)', currentUser?.email || 'asad@gmail.com', `Updated news ${id}`, 'news', id);
      return;
    }
    try {
      await setDoc(doc(db, 'news', id), updates, { merge: true });
      setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
      await logAuditAction(
        'News Article Updated',
        currentUser?.email || 'admin',
        `Updated news ${id}`,
        'news',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `news/${id}`);
    }
  };

  const deleteNews = async (id: string) => {
    if (isDemoSession) {
      setNews((prev) => prev.filter((n) => n.id !== id));
      await logAuditAction('News Deleted (Demo)', currentUser?.email || 'asad@gmail.com', `Deleted news ${id}`, 'news', id);
      return;
    }
    try {
      await deleteDoc(doc(db, 'news', id));
      setNews((prev) => prev.filter((n) => n.id !== id));
      await logAuditAction(
        'News Article Deleted',
        currentUser?.email || 'admin',
        `Deleted news ${id}`,
        'news',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  };

  // Gallery CRUD
  const addGalleryItem = async (itemData: Omit<GalleryMedia, 'id'>) => {
    const id = `gal-${Date.now()}`;
    const created: GalleryMedia = { ...itemData, id };
    if (isDemoSession) {
      setGallery((prev) => [created, ...prev]);
      await logAuditAction('Gallery Media Added (Demo)', currentUser?.email || 'asad@gmail.com', `Added ${created.mediaType}: ${created.title}`, 'gallery', id);
      return;
    }
    try {
      await setDoc(doc(db, 'gallery', id), created);
      setGallery((prev) => [created, ...prev]);
      await logAuditAction(
        'Gallery Media Added',
        currentUser?.email || 'admin',
        `Added ${created.mediaType}: ${created.title}`,
        'gallery',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `gallery/${id}`);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    if (isDemoSession) {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      await logAuditAction('Gallery Media Removed (Demo)', currentUser?.email || 'asad@gmail.com', `Removed gallery item ${id}`, 'gallery', id);
      return;
    }
    try {
      await deleteDoc(doc(db, 'gallery', id));
      setGallery((prev) => prev.filter((g) => g.id !== id));
      await logAuditAction(
        'Gallery Media Removed',
        currentUser?.email || 'admin',
        `Removed gallery item ${id}`,
        'gallery',
        id
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
    }
  };

  // Settings CMS
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const next: SiteSettings = {
      ...settings,
      ...newSettings,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    if (isDemoSession) {
      setSettings(next);
      await logAuditAction('Portal Settings Updated (Demo)', currentUser?.email || 'asad@gmail.com', 'Updated settings in demo session', 'settings', 'portal');
      return;
    }
    try {
      await setDoc(doc(db, 'settings', 'portal'), next, { merge: true });
      setSettings(next);
      await logAuditAction(
        'Portal Settings Updated',
        currentUser?.email || 'admin',
        'Updated ticker announcement, WhatsApp widget, SMS gateway, or GA4 configuration',
        'settings',
        'portal'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/portal');
    }
  };

  const exportDatabaseJSON = (): string => {
    return JSON.stringify(
      {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        profile,
        projects,
        assemblyActivities,
        complaints,
        contactMessages,
        notices,
        news,
        gallery,
        smsLogs,
        settings
      },
      null,
      2
    );
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
        assemblyActivities,
        complaints,
        contactMessages,
        notices,
        news,
        gallery,
        smsLogs,
        settings,
        auditLogs,
        isLoadingData,
        hasSeededFirestore,
        submitComplaint,
        lookupComplaintByTracking,
        submitContactMessage,
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
        logAuditAction,
        exportDatabaseJSON
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
