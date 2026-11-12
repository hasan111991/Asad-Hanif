import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  CityArea,
  CityLocality,
  CityRoad,
  CityAsset,
  CityWaterFacility,
  CitySewerageAsset,
  CityWasteRoute,
  CityProject,
  CityProjectUpdate,
  CityBudgetRecord,
  CityDepartment,
  CityComplaint,
  CitySurvey,
  CityInspection,
  CityReport,
  CityNotice,
  CityAuditLog
} from '../types';
import {
  STRUCTURAL_CITY_DEPARTMENTS,
  generateSampleCityProjectTemplates,
  getDemoCitySandboxState
} from '../data/cityManagementData';

const OFFLINE_SURVEY_KEY = 'pp203_offline_city_surveys';

export interface PublicCityComplaintTrackingView {
  trackingId: string;
  category: string;
  locality: string;
  area?: string;
  status: CityComplaint['status'];
  priority: CityComplaint['priority'];
  department?: string;
  resolutionNotes?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  citizenFeedback?: string;
  createdAt: string;
  updatedAt: string;
  maskedPhone: string;
}

interface CityDataContextType {
  cityAreas: CityArea[];
  cityLocalities: CityLocality[];
  cityRoads: CityRoad[];
  cityAssets: CityAsset[];
  cityWaterFacilities: CityWaterFacility[];
  citySewerageAssets: CitySewerageAsset[];
  cityWasteRoutes: CityWasteRoute[];
  cityProjects: CityProject[];
  cityProjectUpdates: CityProjectUpdate[];
  cityBudgets: CityBudgetRecord[];
  cityDepartments: CityDepartment[];
  cityComplaints: CityComplaint[];
  citySurveys: CitySurvey[];
  offlineSurveys: CitySurvey[];
  cityInspections: CityInspection[];
  cityReports: CityReport[];
  cityNotices: CityNotice[];
  cityAuditLogs: CityAuditLog[];
  isLoadingCityData: boolean;

  // Areas & Localities
  saveCityArea: (item: Omit<CityArea, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteCityArea: (id: string) => Promise<void>;
  saveCityLocality: (item: Omit<CityLocality, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteCityLocality: (id: string) => Promise<void>;

  // Roads & City Infrastructure Assets
  saveCityRoad: (item: Omit<CityRoad, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteCityRoad: (id: string) => Promise<void>;
  saveCityAsset: (item: Omit<CityAsset, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteCityAsset: (id: string) => Promise<void>;

  // Water, Sewerage & Sanitation
  saveWaterFacility: (item: Omit<CityWaterFacility, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteWaterFacility: (id: string) => Promise<void>;
  saveSewerageAsset: (item: Omit<CitySewerageAsset, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteSewerageAsset: (id: string) => Promise<void>;
  saveWasteRoute: (item: Omit<CityWasteRoute, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteWasteRoute: (id: string) => Promise<void>;

  // Master Plan 2027-2030 & 100+ Projects
  saveCityProject: (item: Omit<CityProject, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  duplicateCityProject: (project: CityProject) => Promise<void>;
  deleteCityProject: (id: string) => Promise<void>;
  addCityProjectUpdate: (update: Omit<CityProjectUpdate, 'id' | 'createdAt'>) => Promise<void>;
  importSampleProjectTemplates: () => Promise<number>;
  clearSampleProjectTemplates: () => Promise<number>;

  // Municipal Budgets & Finance
  saveBudgetRecord: (item: Omit<CityBudgetRecord, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteBudgetRecord: (id: string) => Promise<void>;

  // Departments
  saveDepartment: (item: Omit<CityDepartment, 'id' | 'updatedAt'>, existingId?: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  seedStructuralDepartments: () => Promise<number>;

  // Municipal Citizen Complaints (Public + Admin)
  submitCityComplaint: (
    data: Omit<CityComplaint, 'id' | 'trackingId' | 'status' | 'priority' | 'createdAt' | 'updatedAt'>
  ) => Promise<CityComplaint>;
  lookupCityComplaint: (trackingId: string) => Promise<PublicCityComplaintTrackingView | null>;
  updateCityComplaint: (
    trackingId: string,
    updates: Partial<CityComplaint>
  ) => Promise<void>;
  deleteCityComplaint: (trackingId: string) => Promise<void>;

  // Surveys (with offline queue) & Inspections
  saveCitySurvey: (item: Omit<CitySurvey, 'id' | 'createdAt'>) => Promise<'synced' | 'offline'>;
  updateCitySurvey: (id: string, updates: Partial<CitySurvey>) => Promise<void>;
  deleteCitySurvey: (id: string) => Promise<void>;
  syncOfflineSurveys: () => Promise<number>;
  saveCityInspection: (item: Omit<CityInspection, 'id'>) => Promise<void>;
  deleteCityInspection: (id: string) => Promise<void>;

  // Reports & Notices
  saveCityReport: (item: Omit<CityReport, 'id' | 'lastUpdated'>, existingId?: string) => Promise<void>;
  deleteCityReport: (id: string) => Promise<void>;
  saveCityNotice: (item: Omit<CityNotice, 'id'>, existingId?: string) => Promise<void>;
  deleteCityNotice: (id: string) => Promise<void>;
}

const CityDataContext = createContext<CityDataContextType | null>(null);

function makeDocId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function cleanFirestorePayload<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

function loadOfflineSurveyQueue(): CitySurvey[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SURVEY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOfflineSurveyQueue(items: CitySurvey[]) {
  try {
    localStorage.setItem(OFFLINE_SURVEY_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export const CityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, isDemoSession } = useAuth();
  const isRealAdmin = isAuthenticated && !isDemoSession;

  const initialDemo = React.useMemo(() => getDemoCitySandboxState(), []);

  const [cityAreas, setCityAreas] = useState<CityArea[]>(() => initialDemo.areas);
  const [cityLocalities, setCityLocalities] = useState<CityLocality[]>([]);
  const [cityRoads, setCityRoads] = useState<CityRoad[]>(() => initialDemo.roads);
  const [cityAssets, setCityAssets] = useState<CityAsset[]>(() => initialDemo.assets);
  const [cityWaterFacilities, setCityWaterFacilities] = useState<CityWaterFacility[]>(() => initialDemo.water);
  const [citySewerageAssets, setCitySewerageAssets] = useState<CitySewerageAsset[]>(() => initialDemo.sewerage);
  const [cityWasteRoutes, setCityWasteRoutes] = useState<CityWasteRoute[]>([]);
  const [cityProjects, setCityProjects] = useState<CityProject[]>(() => initialDemo.projects);
  const [cityProjectUpdates, setCityProjectUpdates] = useState<CityProjectUpdate[]>([]);
  const [cityBudgets, setCityBudgets] = useState<CityBudgetRecord[]>([]);
  const [cityDepartments, setCityDepartments] = useState<CityDepartment[]>(() => initialDemo.departments);
  const [cityComplaints, setCityComplaints] = useState<CityComplaint[]>([]);
  const [citySurveys, setCitySurveys] = useState<CitySurvey[]>([]);
  const [offlineSurveys, setOfflineSurveys] = useState<CitySurvey[]>(() => loadOfflineSurveyQueue());
  const [cityInspections, setCityInspections] = useState<CityInspection[]>([]);
  const [cityReports, setCityReports] = useState<CityReport[]>(() => initialDemo.reports);
  const [cityNotices, setCityNotices] = useState<CityNotice[]>(() => initialDemo.notices);
  const [cityAuditLogs, setCityAuditLogs] = useState<CityAuditLog[]>([]);
  const [isLoadingCityData, setIsLoadingCityData] = useState(true);

  const actorEmail = currentUser?.email || 'system@pp203.pk';

  const logCityAudit = useCallback(
    async (action: string, module: string, details: string) => {
      const entry: Omit<CityAuditLog, 'id'> = {
        action,
        module,
        actorEmail,
        details,
        timestamp: new Date().toISOString()
      };
      if (!isRealAdmin) {
        setCityAuditLogs((prev) => [{ id: makeDocId('audit'), ...entry }, ...prev]);
        return;
      }
      try {
        const id = makeDocId('clog');
        await setDoc(doc(db, 'city_audit_logs', id), { id, ...entry });
      } catch (err) {
        console.warn('City audit log skipped:', err);
      }
    },
    [actorEmail, isRealAdmin]
  );

  // Public-readable City collections
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const subPublic = <T extends { id: string }>(
      colName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      publishedOnly = false
    ) => {
      const ref = collection(db, colName);
      const q = publishedOnly ? query(ref, where('isPublished', '==', true)) : ref;
      const unsub = onSnapshot(
        q,
        (snap) => {
          const rows = snap.docs.map((d) => ({
            ...(d.data() as Omit<T, 'id'>),
            id: d.id
          })) as T[];
          if (rows.length > 0 || isRealAdmin) {
            setter(rows);
          }
        },
        (err) => {
          console.warn(`City listener [${colName}]:`, err);
        }
      );
      unsubs.push(unsub);
    };

    subPublic<CityArea>('city_areas', setCityAreas);
    subPublic<CityLocality>('city_localities', setCityLocalities);
    subPublic<CityRoad>('city_roads', setCityRoads);
    subPublic<CityAsset>('city_assets', setCityAssets);
    subPublic<CityWaterFacility>('city_water_facilities', setCityWaterFacilities);
    subPublic<CitySewerageAsset>('city_sewerage_assets', setCitySewerageAssets);
    subPublic<CityProject>('city_projects', setCityProjects);
    subPublic<CityProjectUpdate>('city_project_updates', setCityProjectUpdates);
    subPublic<CityDepartment>('city_departments', setCityDepartments);

    if (!isRealAdmin) {
      subPublic<CityReport>('city_reports', setCityReports, true);
      subPublic<CityNotice>('city_notices', setCityNotices, true);
    }

    setIsLoadingCityData(false);
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isRealAdmin]);

  // Private City collections (Admin / Staff authenticated sessions only)
  useEffect(() => {
    if (!isRealAdmin) {
      if (isDemoSession) {
        const sandbox = getDemoCitySandboxState();
        setCityWasteRoutes((prev) => (prev.length === 0 ? sandbox.waste : prev));
        setCityBudgets((prev) => (prev.length === 0 ? sandbox.budgets : prev));
        setCityComplaints((prev) => (prev.length === 0 ? sandbox.complaints : prev));
        setCitySurveys((prev) => (prev.length === 0 ? sandbox.surveys : prev));
      } else {
        setCityWasteRoutes([]);
        setCityBudgets([]);
        setCityComplaints([]);
        setCitySurveys([]);
        setCityInspections([]);
        setCityAuditLogs([]);
      }
      return;
    }

    const unsubs: (() => void)[] = [];
    const subPrivate = <T extends { id: string }>(
      colName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      orderField?: string
    ) => {
      const ref = collection(db, colName);
      const q = orderField ? query(ref, orderBy(orderField, 'desc'), limit(200)) : ref;
      const unsub = onSnapshot(
        q,
        (snap) => {
          const rows = snap.docs.map((d) => ({
            ...(d.data() as Omit<T, 'id'>),
            id: d.id
          })) as T[];
          setter(rows);
        },
        (err) => {
          console.warn(`Private city listener [${colName}]:`, err);
        }
      );
      unsubs.push(unsub);
    };

    subPrivate<CityWasteRoute>('city_waste_routes', setCityWasteRoutes);
    subPrivate<CityBudgetRecord>('city_budgets', setCityBudgets);
    subPrivate<CityComplaint>('city_complaints', setCityComplaints, 'createdAt');
    subPrivate<CitySurvey>('city_surveys', setCitySurveys, 'createdAt');
    subPrivate<CityInspection>('city_inspections', setCityInspections);
    subPrivate<CityReport>('city_reports', setCityReports);
    subPrivate<CityNotice>('city_notices', setCityNotices);
    subPrivate<CityAuditLog>('city_audit_logs', setCityAuditLogs, 'timestamp');

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isRealAdmin, isDemoSession]);

  // Generic helper for safe CRUD in Firestore + Demo Mode
  const upsertRecord = async <T extends { id: string }>(
    colName: string,
    idPrefix: string,
    data: Omit<T, 'id'>,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    existingId: string | undefined,
    auditModule: string,
    auditLabel: string
  ) => {
    const id = existingId || makeDocId(idPrefix);
    const fullRecord = { id, ...data } as T;
    if (!isRealAdmin) {
      setter((prev) =>
        existingId ? prev.map((r) => (r.id === existingId ? fullRecord : r)) : [fullRecord, ...prev]
      );
      await logCityAudit(existingId ? 'Update' : 'Create', auditModule, `${auditLabel} (${id})`);
      return;
    }
    const path = `${colName}/${id}`;
    try {
      await setDoc(doc(db, colName, id), cleanFirestorePayload(fullRecord as unknown as Record<string, unknown>));
      await logCityAudit(existingId ? 'Update' : 'Create', auditModule, `${auditLabel} (${id})`);
    } catch (err) {
      handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const removeRecord = async <T extends { id: string }>(
    colName: string,
    id: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    auditModule: string,
    auditLabel: string
  ) => {
    if (!isRealAdmin) {
      setter((prev) => prev.filter((r) => r.id !== id));
      await logCityAudit('Delete', auditModule, `${auditLabel} (${id})`);
      return;
    }
    const path = `${colName}/${id}`;
    try {
      await deleteDoc(doc(db, colName, id));
      await logCityAudit('Delete', auditModule, `${auditLabel} (${id})`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Areas & Localities
  const saveCityArea = async (item: Omit<CityArea, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityArea>(
      'city_areas',
      'area',
      { ...item, updatedAt: new Date().toISOString() },
      setCityAreas,
      existingId,
      'Areas & Localities',
      `Area: ${item.name}`
    );
  };
  const deleteCityArea = (id: string) => removeRecord('city_areas', id, setCityAreas, 'Areas & Localities', 'Area deleted');

  const saveCityLocality = async (item: Omit<CityLocality, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityLocality>(
      'city_localities',
      'loc',
      { ...item, updatedAt: new Date().toISOString() },
      setCityLocalities,
      existingId,
      'Areas & Localities',
      `Locality: ${item.name}`
    );
  };
  const deleteCityLocality = (id: string) =>
    removeRecord('city_localities', id, setCityLocalities, 'Areas & Localities', 'Locality deleted');

  // Roads & Assets
  const saveCityRoad = async (item: Omit<CityRoad, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityRoad>(
      'city_roads',
      'road',
      { ...item, updatedAt: new Date().toISOString() },
      setCityRoads,
      existingId,
      'Roads & Infrastructure',
      `Road/Asset: ${item.name} (${item.condition})`
    );
  };
  const deleteCityRoad = (id: string) => removeRecord('city_roads', id, setCityRoads, 'Roads & Infrastructure', 'Road deleted');

  const saveCityAsset = async (item: Omit<CityAsset, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityAsset>(
      'city_assets',
      'asset',
      { ...item, updatedAt: new Date().toISOString() },
      setCityAssets,
      existingId,
      item.domain,
      `${item.domain} Asset: ${item.name}`
    );
  };
  const deleteCityAsset = (id: string) => removeRecord('city_assets', id, setCityAssets, 'City Assets', 'Asset deleted');

  // Water, Sewerage & Waste
  const saveWaterFacility = async (item: Omit<CityWaterFacility, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityWaterFacility>(
      'city_water_facilities',
      'water',
      { ...item, updatedAt: new Date().toISOString() },
      setCityWaterFacilities,
      existingId,
      'Water Supply',
      `Water Facility: ${item.name}`
    );
  };
  const deleteWaterFacility = (id: string) =>
    removeRecord('city_water_facilities', id, setCityWaterFacilities, 'Water Supply', 'Water facility deleted');

  const saveSewerageAsset = async (item: Omit<CitySewerageAsset, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CitySewerageAsset>(
      'city_sewerage_assets',
      'sewer',
      { ...item, updatedAt: new Date().toISOString() },
      setCitySewerageAssets,
      existingId,
      'Sewerage & Drainage',
      `Sewerage Asset: ${item.name}`
    );
  };
  const deleteSewerageAsset = (id: string) =>
    removeRecord('city_sewerage_assets', id, setCitySewerageAssets, 'Sewerage & Drainage', 'Sewerage asset deleted');

  const saveWasteRoute = async (item: Omit<CityWasteRoute, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityWasteRoute>(
      'city_waste_routes',
      'waste',
      { ...item, updatedAt: new Date().toISOString() },
      setCityWasteRoutes,
      existingId,
      'Sanitation & Waste',
      `Route ${item.routeCode}: ${item.status}`
    );
  };
  const deleteWasteRoute = (id: string) =>
    removeRecord('city_waste_routes', id, setCityWasteRoutes, 'Sanitation & Waste', 'Route deleted');

  // City Projects (2027-2030 Master Plan)
  const saveCityProject = async (item: Omit<CityProject, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityProject>(
      'city_projects',
      'cproj',
      { ...item, updatedAt: new Date().toISOString() },
      setCityProjects,
      existingId,
      'City Master Plan & Projects',
      `${item.projectCode} — ${item.name} [${item.status}]`
    );
  };

  const duplicateCityProject = async (project: CityProject) => {
    const { id: _id, updatedAt: _u, ...rest } = project;
    const copyCode = `${project.projectCode}-COPY`;
    await saveCityProject({
      ...rest,
      projectCode: copyCode,
      name: `${project.name} (Copy)`,
      status: 'Proposed',
      approvedCostPkr: 0,
      fundsReleasedPkr: 0,
      expenditurePkr: 0,
      physicalProgressPercent: 0,
      financialProgressPercent: 0
    });
  };

  const deleteCityProject = (id: string) =>
    removeRecord('city_projects', id, setCityProjects, 'City Master Plan & Projects', 'City project deleted');

  const addCityProjectUpdate = async (update: Omit<CityProjectUpdate, 'id' | 'createdAt'>) => {
    const id = makeDocId('cupd');
    const payload: CityProjectUpdate = {
      id,
      ...update,
      createdAt: new Date().toISOString()
    };
    if (!isRealAdmin) {
      setCityProjectUpdates((prev) => [payload, ...prev]);
      await logCityAudit('Milestone Update', 'City Master Plan', `Project ${update.projectId} (${update.year})`);
      return;
    }
    try {
      await setDoc(doc(db, 'city_project_updates', id), payload);
      await logCityAudit('Milestone Update', 'City Master Plan', `Project ${update.projectId} (${update.year})`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `city_project_updates/${id}`);
    }
  };

  const importSampleProjectTemplates = async (): Promise<number> => {
    const existingCodes = new Set(cityProjects.map((p) => p.projectCode));
    const templates = generateSampleCityProjectTemplates().filter((t) => !existingCodes.has(t.projectCode));
    if (templates.length === 0) return 0;

    if (!isRealAdmin) {
      const withIds: CityProject[] = templates.map((t, idx) => ({
        id: `sample-${Date.now()}-${idx}`,
        ...t
      }));
      setCityProjects((prev) => [...withIds, ...prev]);
      await logCityAudit('Import Templates', 'City Master Plan', `Imported ${templates.length} labeled sample planning templates`);
      return templates.length;
    }

    try {
      // Batch writes in chunks of 450 (Firestore limit is 500)
      for (let i = 0; i < templates.length; i += 450) {
        const batch = writeBatch(db);
        const chunk = templates.slice(i, i + 450);
        chunk.forEach((tpl) => {
          const id = `tpl-${tpl.projectCode.toLowerCase()}`;
          batch.set(doc(db, 'city_projects', id), cleanFirestorePayload({ id, ...tpl }));
        });
        await batch.commit();
      }
      await logCityAudit('Import Templates', 'City Master Plan', `Imported ${templates.length} labeled sample planning templates`);
      return templates.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'city_projects');
    }
  };

  const clearSampleProjectTemplates = async (): Promise<number> => {
    const samples = cityProjects.filter((p) => p.isSampleTemplate);
    if (samples.length === 0) return 0;
    if (!isRealAdmin) {
      setCityProjects((prev) => prev.filter((p) => !p.isSampleTemplate));
      await logCityAudit('Clear Templates', 'City Master Plan', `Removed ${samples.length} sample planning templates`);
      return samples.length;
    }
    try {
      for (let i = 0; i < samples.length; i += 450) {
        const batch = writeBatch(db);
        samples.slice(i, i + 450).forEach((s) => {
          batch.delete(doc(db, 'city_projects', s.id));
        });
        await batch.commit();
      }
      await logCityAudit('Clear Templates', 'City Master Plan', `Removed ${samples.length} sample planning templates`);
      return samples.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'city_projects');
    }
  };

  // Municipal Budgets
  const saveBudgetRecord = async (item: Omit<CityBudgetRecord, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityBudgetRecord>(
      'city_budgets',
      'budget',
      { ...item, updatedAt: new Date().toISOString() },
      setCityBudgets,
      existingId,
      'Budget & Finance',
      `${item.fundingStage}: PKR ${item.amountPkr.toLocaleString()} (${item.fundingSource})`
    );
  };
  const deleteBudgetRecord = (id: string) =>
    removeRecord('city_budgets', id, setCityBudgets, 'Budget & Finance', 'Budget entry deleted');

  // Departments
  const saveDepartment = async (item: Omit<CityDepartment, 'id' | 'updatedAt'>, existingId?: string) => {
    await upsertRecord<CityDepartment>(
      'city_departments',
      'dept',
      { ...item, updatedAt: new Date().toISOString() },
      setCityDepartments,
      existingId,
      'Department Management',
      `Department: ${item.name}`
    );
  };
  const deleteDepartment = (id: string) =>
    removeRecord('city_departments', id, setCityDepartments, 'Department Management', 'Department deleted');

  const seedStructuralDepartments = async (): Promise<number> => {
    const existingNames = new Set(cityDepartments.map((d) => d.name.toLowerCase()));
    const toAdd = STRUCTURAL_CITY_DEPARTMENTS.filter((d) => !existingNames.has(d.name.toLowerCase()));
    if (toAdd.length === 0) return 0;

    const now = new Date().toISOString();
    if (!isRealAdmin) {
      const mapped = toAdd.map((d, idx) => ({ id: `dept-std-${idx + 1}-${Date.now()}`, ...d, updatedAt: now }));
      setCityDepartments((prev) => [...prev, ...mapped]);
      return mapped.length;
    }
    try {
      const batch = writeBatch(db);
      toAdd.forEach((d, idx) => {
        const id = `dept-std-${Date.now()}-${idx}`;
        batch.set(doc(db, 'city_departments', id), cleanFirestorePayload({ id, ...d, updatedAt: now }));
      });
      await batch.commit();
      await logCityAudit('Initialize Departments', 'Department Management', `Added ${toAdd.length} coordination department entries`);
      return toAdd.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'city_departments');
    }
  };

  // Municipal Citizen Complaints
  const submitCityComplaint: CityDataContextType['submitCityComplaint'] = async (data) => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingId = `CITY-${new Date().getFullYear()}-${rand}`;
    const now = new Date().toISOString();

    // Enforce Firestore rules key allowlist cleanly
    const firestoreDoc: Record<string, unknown> = cleanFirestorePayload({
      id: trackingId,
      trackingId,
      citizenName: data.citizenName.trim(),
      phone: data.phone.trim(),
      area: data.area?.trim() || '',
      locality: data.locality.trim(),
      category: data.category,
      description: data.description.trim(),
      imageUrl: data.imageUrl || undefined,
      latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
      longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
      status: 'Submitted',
      priority: 'Medium',
      createdAt: now,
      updatedAt: now
    });

    try {
      await setDoc(doc(db, 'city_complaints', trackingId), firestoreDoc);
    } catch (err) {
      if (isRealAdmin) {
        handleFirestoreError(err, OperationType.CREATE, `city_complaints/${trackingId}`);
      } else {
        console.warn('Demo/offline fallback for city complaint create:', err);
      }
    }

    const fullObj: CityComplaint = {
      id: trackingId,
      trackingId,
      citizenName: data.citizenName.trim(),
      phone: data.phone.trim(),
      area: data.area?.trim(),
      locality: data.locality.trim(),
      category: data.category,
      description: data.description.trim(),
      imageUrl: data.imageUrl,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      status: 'Submitted',
      priority: 'Medium',
      createdAt: now,
      updatedAt: now
    };
    setCityComplaints((prev) => [fullObj, ...prev]);
    return fullObj;
  };

  const lookupCityComplaint = async (trackingId: string): Promise<PublicCityComplaintTrackingView | null> => {
    const normalized = trackingId.trim().toUpperCase();
    if (!normalized || normalized.length < 8) return null;

    const toPublicView = (c: CityComplaint): PublicCityComplaintTrackingView => ({
      trackingId: c.trackingId,
      category: c.category,
      locality: c.locality,
      area: c.area,
      status: c.status,
      priority: c.priority,
      department: c.department,
      resolutionNotes: c.resolutionNotes,
      beforePhotoUrl: c.beforePhotoUrl,
      afterPhotoUrl: c.afterPhotoUrl,
      citizenFeedback: c.citizenFeedback,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      maskedPhone: c.phone ? `${c.phone.slice(0, 4)}****${c.phone.slice(-3)}` : '***'
    });

    const localHit = cityComplaints.find((c) => c.trackingId.toUpperCase() === normalized);
    if (localHit) return toPublicView(localHit);

    try {
      const snap = await getDoc(doc(db, 'city_complaints', normalized));
      if (!snap.exists()) return null;
      return toPublicView(snap.data() as CityComplaint);
    } catch {
      return null;
    }
  };

  const updateCityComplaint = async (trackingId: string, updates: Partial<CityComplaint>) => {
    const now = new Date().toISOString();
    const merged = { ...updates, updatedAt: now };
    if (!isRealAdmin) {
      setCityComplaints((prev) =>
        prev.map((c) => (c.trackingId === trackingId ? { ...c, ...merged } : c))
      );
      await logCityAudit('Update Complaint', 'Citizen Complaints', `${trackingId} -> ${updates.status || 'Updated'}`);
      return;
    }
    try {
      await updateDoc(doc(db, 'city_complaints', trackingId), cleanFirestorePayload(merged as Record<string, unknown>));
      await logCityAudit('Update Complaint', 'Citizen Complaints', `${trackingId} -> ${updates.status || 'Updated'}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `city_complaints/${trackingId}`);
    }
  };

  const deleteCityComplaint = (trackingId: string) =>
    removeRecord('city_complaints', trackingId, setCityComplaints, 'Citizen Complaints', `Deleted ${trackingId}`);

  // Field Surveys with Offline Queue
  const saveCitySurvey = async (item: Omit<CitySurvey, 'id' | 'createdAt'>): Promise<'synced' | 'offline'> => {
    const id = makeDocId('surv');
    const now = new Date().toISOString();
    const record: CitySurvey = { id, ...item, createdAt: now };

    if (!navigator.onLine) {
      const queued = [{ ...record, offlinePendingSync: true }, ...offlineSurveys];
      setOfflineSurveys(queued);
      saveOfflineSurveyQueue(queued);
      return 'offline';
    }

    if (!isRealAdmin) {
      setCitySurveys((prev) => [record, ...prev]);
      await logCityAudit('Create Survey', 'Field Surveys', `Survey: ${item.title}`);
      return 'synced';
    }

    try {
      await setDoc(doc(db, 'city_surveys', id), cleanFirestorePayload(record as unknown as Record<string, unknown>));
      await logCityAudit('Create Survey', 'Field Surveys', `Survey: ${item.title}`);
      return 'synced';
    } catch {
      const queued = [{ ...record, offlinePendingSync: true }, ...offlineSurveys];
      setOfflineSurveys(queued);
      saveOfflineSurveyQueue(queued);
      return 'offline';
    }
  };

  const updateCitySurvey = async (id: string, updates: Partial<CitySurvey>) => {
    if (!isRealAdmin) {
      setCitySurveys((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      await logCityAudit('Update Survey', 'Field Surveys', `Survey ${id} -> ${updates.verificationStatus || 'updated'}`);
      return;
    }
    try {
      await updateDoc(doc(db, 'city_surveys', id), cleanFirestorePayload(updates as Record<string, unknown>));
      await logCityAudit('Update Survey', 'Field Surveys', `Survey ${id} -> ${updates.verificationStatus || 'updated'}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `city_surveys/${id}`);
    }
  };

  const deleteCitySurvey = (id: string) =>
    removeRecord('city_surveys', id, setCitySurveys, 'Field Surveys', 'Survey deleted');

  const syncOfflineSurveys = async (): Promise<number> => {
    if (offlineSurveys.length === 0) return 0;
    let syncedCount = 0;
    const remaining: CitySurvey[] = [];

    for (const s of offlineSurveys) {
      const { offlinePendingSync: _o, ...clean } = s;
      if (!isRealAdmin) {
        setCitySurveys((prev) => [clean, ...prev]);
        syncedCount++;
      } else {
        try {
          await setDoc(doc(db, 'city_surveys', s.id), cleanFirestorePayload(clean as unknown as Record<string, unknown>));
          syncedCount++;
        } catch {
          remaining.push(s);
        }
      }
    }
    setOfflineSurveys(remaining);
    saveOfflineSurveyQueue(remaining);
    if (syncedCount > 0) {
      await logCityAudit('Sync Offline Surveys', 'Field Surveys', `Synced ${syncedCount} field surveys`);
    }
    return syncedCount;
  };

  // Inspections
  const saveCityInspection = async (item: Omit<CityInspection, 'id'>) => {
    await upsertRecord<CityInspection>(
      'city_inspections',
      'insp',
      item,
      setCityInspections,
      undefined,
      'Field Inspections',
      `${item.targetType} inspection (${item.outcome})`
    );
  };
  const deleteCityInspection = (id: string) =>
    removeRecord('city_inspections', id, setCityInspections, 'Field Inspections', 'Inspection deleted');

  // Reports & Notices
  const saveCityReport = async (item: Omit<CityReport, 'id' | 'lastUpdated'>, existingId?: string) => {
    await upsertRecord<CityReport>(
      'city_reports',
      'rep',
      { ...item, lastUpdated: new Date().toISOString() },
      setCityReports,
      existingId,
      'City Reports',
      `Report: ${item.title} (${item.isPublished ? 'Published' : 'Draft'})`
    );
  };
  const deleteCityReport = (id: string) =>
    removeRecord('city_reports', id, setCityReports, 'City Reports', 'Report deleted');

  const saveCityNotice = async (item: Omit<CityNotice, 'id'>, existingId?: string) => {
    await upsertRecord<CityNotice>(
      'city_notices',
      'cnot',
      item,
      setCityNotices,
      existingId,
      'City Notices',
      `Notice: ${item.title}`
    );
  };
  const deleteCityNotice = (id: string) =>
    removeRecord('city_notices', id, setCityNotices, 'City Notices', 'City notice deleted');

  // Avoid unused import lint for addDoc if unused
  void addDoc;

  return (
    <CityDataContext.Provider
      value={{
        cityAreas,
        cityLocalities,
        cityRoads,
        cityAssets,
        cityWaterFacilities,
        citySewerageAssets,
        cityWasteRoutes,
        cityProjects,
        cityProjectUpdates,
        cityBudgets,
        cityDepartments,
        cityComplaints,
        citySurveys,
        offlineSurveys,
        cityInspections,
        cityReports,
        cityNotices,
        cityAuditLogs,
        isLoadingCityData,
        saveCityArea,
        deleteCityArea,
        saveCityLocality,
        deleteCityLocality,
        saveCityRoad,
        deleteCityRoad,
        saveCityAsset,
        deleteCityAsset,
        saveWaterFacility,
        deleteWaterFacility,
        saveSewerageAsset,
        deleteSewerageAsset,
        saveWasteRoute,
        deleteWasteRoute,
        saveCityProject,
        duplicateCityProject,
        deleteCityProject,
        addCityProjectUpdate,
        importSampleProjectTemplates,
        clearSampleProjectTemplates,
        saveBudgetRecord,
        deleteBudgetRecord,
        saveDepartment,
        deleteDepartment,
        seedStructuralDepartments,
        submitCityComplaint,
        lookupCityComplaint,
        updateCityComplaint,
        deleteCityComplaint,
        saveCitySurvey,
        updateCitySurvey,
        deleteCitySurvey,
        syncOfflineSurveys,
        saveCityInspection,
        deleteCityInspection,
        saveCityReport,
        deleteCityReport,
        saveCityNotice,
        deleteCityNotice
      }}
    >
      {children}
    </CityDataContext.Provider>
  );
};

export const useCityData = () => {
  const ctx = useContext(CityDataContext);
  if (!ctx) throw new Error('useCityData must be used inside CityDataProvider');
  return ctx;
};
