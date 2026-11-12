import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import {
  ConfirmationResult,
  EmailAuthProvider,
  RecaptchaVerifier,
  User,
  deleteUser,
  linkWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  citizenAuth,
  citizenDb,
  db,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  CitizenConsent,
  CitizenConsentCategory,
  CitizenContactMethod,
  CitizenGroup,
  CitizenGroupMember,
  CitizenInterestRecord,
  CitizenInterestTopic,
  CitizenProfile,
  CitizenSuggestion,
  CitizenSurvey,
  CitizenSurveyResponse,
  CitizenVolunteer,
  CommunicationLog,
  CommunicationPreferences,
  Language,
  RegisteredOrganization
} from '../types';
import {
  VOLUNTARY_GROUP_TEMPLATES,
  TEST_CITIZEN_PROFILES,
  TEST_CITIZEN_CONSENTS,
  TEST_CITIZEN_INTERESTS,
  TEST_CITIZEN_COMM_PREFS,
  TEST_CITIZEN_GROUPS,
  TEST_CITIZEN_SUGGESTIONS,
  TEST_CITIZEN_SURVEYS,
  TEST_CITIZEN_VOLUNTEERS,
  TEST_REGISTERED_ORGANIZATIONS
} from '../data/citizenNetworkData';

declare global {
  interface Window {
    pp203CitizenRecaptcha?: RecaptchaVerifier;
  }
}

export function normalizePakistaniPhone(raw: string): string {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  if (/^03\d{9}$/.test(cleaned)) {
    return `+92${cleaned.slice(1)}`;
  }
  if (/^923\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  return cleaned;
}

export function maskPhoneDisplay(phoneE164: string): string {
  if (!phoneE164) return '—';
  if (phoneE164.length <= 6) return '***';
  return `${phoneE164.slice(0, 5)}****${phoneE164.slice(-3)}`;
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface CitizenRegistrationPayload {
  fullName: string;
  phoneRaw: string;
  email?: string;
  cityLocality: string;
  villageArea?: string;
  ucWard?: string;
  profession?: string;
  interests: CitizenInterestTopic[];
  preferredLanguage: Language;
  preferredContactMethod: CitizenContactMethod;
  consents: {
    publicDevelopmentUpdates: boolean;
    cityServiceAnnouncements: boolean;
    communityEventNotifications: boolean;
    surveyInvitations: boolean;
    emergencyPublicAlerts: boolean;
    nonPoliticalStatementAccepted: boolean;
    privacyPolicyAccepted: boolean;
  };
}

interface CitizenNetworkContextType {
  // Citizen Self Session
  citizenUser: User | null;
  citizenLoading: boolean;
  myProfile: CitizenProfile | null;
  myConsent: CitizenConsent | null;
  myInterests: CitizenInterestRecord | null;
  myCommPrefs: CommunicationPreferences | null;
  myMemberships: CitizenGroupMember[];
  mySuggestions: CitizenSuggestion[];
  myVolunteers: CitizenVolunteer[];
  myOrganizations: RegisteredOrganization[];
  myInAppMessages: CommunicationLog[];
  otpPending: boolean;
  isTestCitizenSession: boolean;
  testOtpPhone: string | null;
  sendPhoneOtp: (
    phoneRaw: string,
    recaptchaContainerId: string,
    useTestMode?: boolean
  ) => Promise<{ ok: boolean; phoneE164?: string; isTestMode?: boolean; error?: string }>;
  confirmOtpAndRegister: (otpCode: string, payload: CitizenRegistrationPayload) => Promise<{ ok: boolean; duplicateDetected?: boolean; error?: string }>;
  signInExistingCitizenWithOtp: (otpCode: string) => Promise<{ ok: boolean; profileFound?: boolean; error?: string }>;
  cancelPendingOtp: () => void;
  linkRecoveryEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signInCitizenWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  sendRecoveryPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logoutCitizen: () => Promise<void>;
  updateMyProfile: (updates: Partial<CitizenProfile>, interests?: CitizenInterestTopic[]) => Promise<void>;
  updateMyConsentsAndPrefs: (
    consents: Partial<CitizenConsent>,
    prefs: Partial<CommunicationPreferences>
  ) => Promise<void>;
  unsubscribeAllCommunications: () => Promise<void>;
  exportMyCitizenDataJSON: () => string;
  deleteMyCitizenAccount: () => Promise<{ ok: boolean; error?: string }>;

  // Public & Community Participation
  activeGroups: CitizenGroup[];
  publicSuggestions: CitizenSuggestion[];
  activeSurveys: CitizenSurvey[];
  verifiedOrganizations: RegisteredOrganization[];
  joinVoluntaryGroup: (group: CitizenGroup) => Promise<void>;
  leaveVoluntaryGroup: (groupId: string) => Promise<void>;
  submitCitySuggestion: (payload: {
    locality: string;
    sector: string;
    title: string;
    description: string;
  }) => Promise<void>;
  submitSurveyResponse: (surveyId: string, answers: Record<string, string>) => Promise<void>;
  checkMySurveySubmitted: (surveyId: string) => Promise<boolean>;
  registerVolunteer: (payload: {
    locality: string;
    initiativeTitle: string;
    areaOfInterest: CitizenInterestTopic;
    availability: string;
    skillsNote?: string;
  }) => Promise<void>;
  withdrawVolunteer: (id: string) => Promise<void>;
  submitOrganizationListing: (payload: {
    orgName: string;
    orgCategory: RegisteredOrganization['orgCategory'];
    locality: string;
    registrationNumber?: string;
    focalPersonName: string;
    publicContactPhone?: string;
    publicEmail?: string;
    description: string;
    servicesOffered?: string;
  }) => Promise<void>;

  // Admin Management State & Actions
  adminProfiles: CitizenProfile[];
  adminConsents: CitizenConsent[];
  adminInterests: CitizenInterestRecord[];
  adminCommPrefs: CommunicationPreferences[];
  adminGroups: CitizenGroup[];
  adminGroupMembers: CitizenGroupMember[];
  adminSuggestions: CitizenSuggestion[];
  adminSurveys: CitizenSurvey[];
  adminVolunteers: CitizenVolunteer[];
  adminOrganizations: RegisteredOrganization[];
  adminCommLogs: CommunicationLog[];
  adminUpdateCitizenStatus: (uid: string, updates: Partial<CitizenProfile>) => Promise<void>;
  adminDeleteCitizenProfile: (uid: string) => Promise<void>;
  adminSaveGroup: (payload: Omit<CitizenGroup, 'id' | 'memberCount' | 'createdBy' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  adminDeleteGroup: (groupId: string) => Promise<void>;
  adminSeedVoluntaryGroupTemplates: () => Promise<void>;
  adminAssignMembersToGroup: (group: CitizenGroup, members: CitizenProfile[]) => Promise<number>;
  adminUpdateSuggestion: (id: string, updates: Partial<CitizenSuggestion>) => Promise<void>;
  adminSaveSurvey: (payload: Omit<CitizenSurvey, 'id' | 'responseCount' | 'createdBy' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  adminGetSurveyResponses: (surveyId: string) => Promise<CitizenSurveyResponse[]>;
  adminUpdateVolunteerStatus: (id: string, status: CitizenVolunteer['status']) => Promise<void>;
  adminVerifyOrganization: (
    id: string,
    verificationStatus: RegisteredOrganization['verificationStatus'],
    isPublicPublished: boolean
  ) => Promise<void>;
  adminSendConsentCommunication: (payload: {
    channel: CitizenContactMethod;
    consentCategory: CitizenConsentCategory;
    templateName: string;
    subject: string;
    messageBody: string;
    targetUids: string[];
  }) => Promise<{ sent: number; failed: number; skippedNoConsent: number; simulated: number }>;
  logAdminCitizenExport: (details: string) => Promise<void>;
}

const CitizenNetworkContext = createContext<CitizenNetworkContextType>({} as CitizenNetworkContextType);

export const CitizenNetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser: adminUser, firebaseUser: adminFirebaseUser, isAuthenticated: isAdminAuthenticated, isDemoSession } = useAuth();

  // Citizen Session State (isolated citizenAuth + citizenDb)
  const [citizenUser, setCitizenUser] = useState<User | null>(null);
  const [citizenLoading, setCitizenLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [myProfile, setMyProfile] = useState<CitizenProfile | null>(null);
  const [myConsent, setMyConsent] = useState<CitizenConsent | null>(null);
  const [myInterests, setMyInterests] = useState<CitizenInterestRecord | null>(null);
  const [myCommPrefs, setMyCommPrefs] = useState<CommunicationPreferences | null>(null);
  const [myMemberships, setMyMemberships] = useState<CitizenGroupMember[]>([]);
  const [mySuggestions, setMySuggestions] = useState<CitizenSuggestion[]>([]);
  const [myVolunteers, setMyVolunteers] = useState<CitizenVolunteer[]>([]);
  const [myOrganizations, setMyOrganizations] = useState<RegisteredOrganization[]>([]);
  const [myInAppMessages, setMyInAppMessages] = useState<CommunicationLog[]>([]);

  const [testOtpPhone, setTestOtpPhone] = useState<string | null>(null);
  const [isTestCitizenSession, setIsTestCitizenSession] = useState<boolean>(false);
  const [testSubmittedSurveys, setTestSubmittedSurveys] = useState<Record<string, boolean>>({});

  // Public Community State (sanitized, zero PII — falls back to clearly marked Test Previews if Firestore is empty)
  const [activeGroups, setActiveGroups] = useState<CitizenGroup[]>(() => TEST_CITIZEN_GROUPS);
  const [publicSuggestions, setPublicSuggestions] = useState<CitizenSuggestion[]>(() => TEST_CITIZEN_SUGGESTIONS);
  const [activeSurveys, setActiveSurveys] = useState<CitizenSurvey[]>(() => TEST_CITIZEN_SURVEYS);
  const [verifiedOrganizations, setVerifiedOrganizations] = useState<RegisteredOrganization[]>(() => TEST_REGISTERED_ORGANIZATIONS);

  // Admin Private State
  const [adminProfiles, setAdminProfiles] = useState<CitizenProfile[]>([]);
  const [adminConsents, setAdminConsents] = useState<CitizenConsent[]>([]);
  const [adminInterests, setAdminInterests] = useState<CitizenInterestRecord[]>([]);
  const [adminCommPrefs, setAdminCommPrefs] = useState<CommunicationPreferences[]>([]);
  const [adminGroups, setAdminGroups] = useState<CitizenGroup[]>([]);
  const [adminGroupMembers, setAdminGroupMembers] = useState<CitizenGroupMember[]>([]);
  const [adminSuggestions, setAdminSuggestions] = useState<CitizenSuggestion[]>([]);
  const [adminSurveys, setAdminSurveys] = useState<CitizenSurvey[]>([]);
  const [adminVolunteers, setAdminVolunteers] = useState<CitizenVolunteer[]>([]);
  const [adminOrganizations, setAdminOrganizations] = useState<RegisteredOrganization[]>([]);
  const [adminCommLogs, setAdminCommLogs] = useState<CommunicationLog[]>([]);

  const recordAudit = useCallback(
    async (action: string, details: string) => {
      const actor = adminUser?.email || citizenUser?.phoneNumber || citizenUser?.email || 'system';
      const entry = {
        action,
        module: 'Citizen Network',
        actorEmail: actor,
        details,
        timestamp: new Date().toISOString()
      };
      if (isDemoSession) return;
      if (isAdminAuthenticated && adminFirebaseUser) {
        try {
          const ref = doc(collection(db, 'city_audit_logs'));
          await setDoc(ref, { id: ref.id, ...entry });
        } catch (err) {
          console.warn('Citizen Network audit write failed:', err);
        }
      }
    },
    [adminUser, adminFirebaseUser, isAdminAuthenticated, isDemoSession, citizenUser]
  );

  // Monitor isolated Citizen Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(citizenAuth, (user) => {
      setCitizenUser(user);
      setCitizenLoading(false);
    });
    return () => unsub();
  }, []);

  // Public sanitized subscriptions (active groups, published suggestion summaries, active/closed surveys, verified organizations)
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, 'citizen_groups'), where('isActive', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setActiveGroups(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenGroup, 'id'>) })));
          }
        },
        (err) => console.warn('citizen_groups public listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'citizen_suggestions'), where('isPublishedSummary', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setPublicSuggestions(
              snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenSuggestion, 'id'>) }))
            );
          }
        },
        (err) => console.warn('citizen_suggestions public listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'citizen_surveys'), where('status', 'in', ['Active', 'Closed'])),
        (snap) => {
          if (!snap.empty) {
            setActiveSurveys(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenSurvey, 'id'>) })));
          }
        },
        (err) => console.warn('citizen_surveys public listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(
          collection(db, 'registered_organizations'),
          where('isPublicPublished', '==', true),
          where('verificationStatus', '==', 'Verified')
        ),
        (snap) => {
          if (!snap.empty) {
            setVerifiedOrganizations(
              snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegisteredOrganization, 'id'>) }))
            );
          }
        },
        (err) => console.warn('registered_organizations public listener:', err.message)
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  // Citizen Self-Service Owner Listeners (strictly keyed to citizenUser.uid)
  useEffect(() => {
    if (!citizenUser) {
      if (!isTestCitizenSession) {
        setMyProfile(null);
        setMyConsent(null);
        setMyInterests(null);
        setMyCommPrefs(null);
        setMyMemberships([]);
        setMySuggestions([]);
        setMyVolunteers([]);
        setMyOrganizations([]);
        setMyInAppMessages([]);
      }
      return;
    }

    const uid = citizenUser.uid;
    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        doc(citizenDb, 'citizen_profiles', uid),
        (snap) => {
          setMyProfile(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<CitizenProfile, 'id'>) }) : null);
        },
        (err) => console.warn('myProfile listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(citizenDb, 'citizen_consents', uid),
        (snap) => {
          setMyConsent(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<CitizenConsent, 'id'>) }) : null);
        },
        (err) => console.warn('myConsent listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(citizenDb, 'citizen_interests', uid),
        (snap) => {
          setMyInterests(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<CitizenInterestRecord, 'id'>) }) : null);
        },
        (err) => console.warn('myInterests listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(citizenDb, 'communication_preferences', uid),
        (snap) => {
          setMyCommPrefs(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<CommunicationPreferences, 'id'>) }) : null);
        },
        (err) => console.warn('myCommPrefs listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(citizenDb, 'citizen_group_members'), where('uid', '==', uid)),
        (snap) => {
          setMyMemberships(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenGroupMember, 'id'>) })));
        },
        (err) => console.warn('myMemberships listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(citizenDb, 'citizen_suggestions'), where('uid', '==', uid)),
        (snap) => {
          setMySuggestions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenSuggestion, 'id'>) })));
        },
        (err) => console.warn('mySuggestions listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(citizenDb, 'citizen_volunteers'), where('uid', '==', uid)),
        (snap) => {
          setMyVolunteers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenVolunteer, 'id'>) })));
        },
        (err) => console.warn('myVolunteers listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(citizenDb, 'registered_organizations'), where('submittedByUid', '==', uid)),
        (snap) => {
          setMyOrganizations(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegisteredOrganization, 'id'>) })));
        },
        (err) => console.warn('myOrganizations listener:', err.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(
          collection(citizenDb, 'communication_logs'),
          where('recipientUid', '==', uid),
          where('channel', '==', 'In-App')
        ),
        (snap) => {
          const rows = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<CommunicationLog, 'id'>) }))
            .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
          setMyInAppMessages(rows);
        },
        (err) => console.warn('myInAppMessages listener:', err.message)
      )
    );

    return () => unsubs.forEach((u) => u());
  }, [citizenUser, isTestCitizenSession]);

  // Admin Real Firestore Listeners (or Test Sandbox hydration in Demo Admin mode)
  useEffect(() => {
    if (isDemoSession && isAdminAuthenticated) {
      setAdminProfiles((prev) => (prev.length === 0 ? TEST_CITIZEN_PROFILES : prev));
      setAdminConsents((prev) => (prev.length === 0 ? TEST_CITIZEN_CONSENTS : prev));
      setAdminInterests((prev) => (prev.length === 0 ? TEST_CITIZEN_INTERESTS : prev));
      setAdminCommPrefs((prev) => (prev.length === 0 ? TEST_CITIZEN_COMM_PREFS : prev));
      setAdminGroups((prev) => (prev.length === 0 ? TEST_CITIZEN_GROUPS : prev));
      setAdminSuggestions((prev) => (prev.length === 0 ? TEST_CITIZEN_SUGGESTIONS : prev));
      setAdminSurveys((prev) => (prev.length === 0 ? TEST_CITIZEN_SURVEYS : prev));
      setAdminVolunteers((prev) => (prev.length === 0 ? TEST_CITIZEN_VOLUNTEERS : prev));
      setAdminOrganizations((prev) => (prev.length === 0 ? TEST_REGISTERED_ORGANIZATIONS : prev));
      return;
    }

    if (!isAdminAuthenticated || isDemoSession || !adminFirebaseUser) {
      return;
    }

    const unsubs: (() => void)[] = [];
    const sub = <T extends { id: string }>(
      colName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      sortField?: string
    ) => {
      const ref = sortField
        ? query(collection(db, colName), orderBy(sortField, 'desc'))
        : collection(db, colName);
      unsubs.push(
        onSnapshot(
          ref,
          (snap) => {
            setter(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<T, 'id'>) }) as T));
          },
          (err) => console.warn(`Admin Citizen listener ${colName}:`, err.message)
        )
      );
    };

    sub<CitizenProfile>('citizen_profiles', setAdminProfiles, 'createdAt');
    sub<CitizenConsent>('citizen_consents', setAdminConsents);
    sub<CitizenInterestRecord>('citizen_interests', setAdminInterests);
    sub<CommunicationPreferences>('communication_preferences', setAdminCommPrefs);
    sub<CitizenGroup>('citizen_groups', setAdminGroups);
    sub<CitizenGroupMember>('citizen_group_members', setAdminGroupMembers);
    sub<CitizenSuggestion>('citizen_suggestions', setAdminSuggestions, 'createdAt');
    sub<CitizenSurvey>('citizen_surveys', setAdminSurveys, 'createdAt');
    sub<CitizenVolunteer>('citizen_volunteers', setAdminVolunteers, 'createdAt');
    sub<RegisteredOrganization>('registered_organizations', setAdminOrganizations, 'createdAt');
    sub<CommunicationLog>('communication_logs', setAdminCommLogs, 'sentAt');

    return () => unsubs.forEach((u) => u());
  }, [isAdminAuthenticated, isDemoSession, adminFirebaseUser]);

  // Step 1 of Firebase Phone Auth (with Test Verification Mode 123456 fallback on static/unconfigured domains)
  const sendPhoneOtp = async (
    phoneRaw: string,
    recaptchaContainerId: string,
    useTestMode = false
  ): Promise<{ ok: boolean; phoneE164?: string; isTestMode?: boolean; error?: string }> => {
    const phoneE164 = normalizePakistaniPhone(phoneRaw);
    if (!/^\+[1-9]\d{7,14}$/.test(phoneE164)) {
      return {
        ok: false,
        error: 'Enter a valid Pakistani mobile number (e.g. 0300-1234567) or international E.164 format (+923...).'
      };
    }

    if (useTestMode) {
      setTestOtpPhone(phoneE164);
      setConfirmationResult(null);
      return { ok: true, phoneE164, isTestMode: true };
    }

    try {
      if (window.pp203CitizenRecaptcha) {
        try {
          window.pp203CitizenRecaptcha.clear();
        } catch {
          // ignore
        }
        window.pp203CitizenRecaptcha = undefined;
      }

      const verifier = new RecaptchaVerifier(citizenAuth, recaptchaContainerId, {
        size: 'normal'
      });
      window.pp203CitizenRecaptcha = verifier;

      const result = await signInWithPhoneNumber(citizenAuth, phoneE164, verifier);
      setTestOtpPhone(null);
      setConfirmationResult(result);
      return { ok: true, phoneE164, isTestMode: false };
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/unauthorized-domain' ||
        code === 'auth/internal-error'
      ) {
        // Gracefully switch to Test OTP Verification Mode (123456) so user can test full flow immediately
        setTestOtpPhone(phoneE164);
        setConfirmationResult(null);
        return {
          ok: true,
          phoneE164,
          isTestMode: true
        };
      }
      if (code === 'auth/too-many-requests') {
        return { ok: false, error: 'Too many OTP requests. Please wait a few minutes or use Test OTP Mode.' };
      }
      return { ok: false, error: err?.message || 'Unable to send mobile verification code.' };
    }
  };

  const confirmOtpAndRegister = async (
    otpCode: string,
    payload: CitizenRegistrationPayload
  ): Promise<{ ok: boolean; duplicateDetected?: boolean; error?: string }> => {
    const phoneE164 = normalizePakistaniPhone(payload.phoneRaw);

    // Server-side validation when Express backend is active (skip on static github.io)
    const isStaticHost = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
    if (!isStaticHost) {
      try {
        const valResp = await fetch('./api/citizen/validate-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: payload.fullName,
            phone: phoneE164,
            email: payload.email,
            cityLocality: payload.cityLocality,
            nonPoliticalStatementAccepted: payload.consents.nonPoliticalStatementAccepted,
            privacyPolicyAccepted: payload.consents.privacyPolicyAccepted
          })
        });
        if (valResp.ok) {
          const check = (await valResp.json()) as { valid?: boolean; error?: string };
          if (check.valid === false) {
            return { ok: false, error: check.error || 'Server validation failed.' };
          }
        }
      } catch {
        // Static hosting fallback
      }
    }

    // Handle Test Verification Mode (OTP: 123456)
    if (testOtpPhone && !confirmationResult) {
      if (otpCode.trim() !== '123456') {
        return { ok: false, error: 'Test Mode OTP is 123456. Enter 123456 to verify this test registration.' };
      }
      const now = new Date().toISOString();
      const testUid = `test-citizen-${phoneE164.slice(-4)}-${Date.now().toString().slice(-4)}`;
      const phoneHash = await sha256Hex(phoneE164);

      const duplicate = adminProfiles.find((p) => p.phoneE164 === phoneE164);
      if (duplicate) {
        setMyProfile(duplicate);
        setMyConsent(adminConsents.find((c) => c.uid === duplicate.uid) || TEST_CITIZEN_CONSENTS[0]);
        setMyInterests(adminInterests.find((i) => i.uid === duplicate.uid) || TEST_CITIZEN_INTERESTS[0]);
        setMyCommPrefs(adminCommPrefs.find((p) => p.uid === duplicate.uid) || TEST_CITIZEN_COMM_PREFS[0]);
        setIsTestCitizenSession(true);
        setTestOtpPhone(null);
        return { ok: true, duplicateDetected: true };
      }

      const newProfile: CitizenProfile = {
        id: testUid,
        uid: testUid,
        fullName: payload.fullName.trim().slice(0, 120),
        phoneE164,
        phoneHash,
        phoneVerified: true,
        verificationMethod: 'firebase_phone_auth',
        ...(payload.email?.trim() ? { email: payload.email.trim().toLowerCase() } : {}),
        cityLocality: payload.cityLocality.trim().slice(0, 160),
        ...(payload.villageArea?.trim() ? { villageArea: payload.villageArea.trim().slice(0, 160) } : {}),
        ...(payload.ucWard?.trim() ? { ucWard: payload.ucWard.trim().slice(0, 80) } : {}),
        ...(payload.profession?.trim() ? { profession: payload.profession.trim().slice(0, 120) } : {}),
        preferredLanguage: payload.preferredLanguage,
        preferredContactMethod: payload.preferredContactMethod,
        accountStatus: 'Active',
        retentionPolicyAcceptedAt: now,
        createdAt: now,
        updatedAt: now
      };
      const newConsent: CitizenConsent = {
        id: testUid,
        uid: testUid,
        publicDevelopmentUpdates: Boolean(payload.consents.publicDevelopmentUpdates),
        cityServiceAnnouncements: Boolean(payload.consents.cityServiceAnnouncements),
        communityEventNotifications: Boolean(payload.consents.communityEventNotifications),
        surveyInvitations: Boolean(payload.consents.surveyInvitations),
        emergencyPublicAlerts: Boolean(payload.consents.emergencyPublicAlerts),
        nonPoliticalStatementAccepted: true,
        privacyPolicyAccepted: true,
        unsubscribedAll: false,
        updatedAt: now
      };
      const newInterest: CitizenInterestRecord = {
        id: testUid,
        uid: testUid,
        interests: payload.interests.slice(0, 12),
        cityLocality: payload.cityLocality.trim().slice(0, 160),
        ...(payload.profession?.trim() ? { profession: payload.profession.trim().slice(0, 120) } : {}),
        updatedAt: now
      };
      const newPrefs: CommunicationPreferences = {
        id: testUid,
        uid: testUid,
        preferredLanguage: payload.preferredLanguage,
        preferredChannel: payload.preferredContactMethod,
        whatsappOptIn: payload.preferredContactMethod === 'WhatsApp',
        smsOptIn: payload.preferredContactMethod === 'SMS',
        emailOptIn: payload.preferredContactMethod === 'Email' && Boolean(payload.email?.trim()),
        inAppOptIn: true,
        unsubscribedAll: false,
        updatedAt: now
      };

      setMyProfile(newProfile);
      setMyConsent(newConsent);
      setMyInterests(newInterest);
      setMyCommPrefs(newPrefs);
      setIsTestCitizenSession(true);
      setTestOtpPhone(null);
      return { ok: true };
    }

    if (!confirmationResult) {
      return { ok: false, error: 'Verification session expired. Request a new OTP code.' };
    }

    try {
      const cred = await confirmationResult.confirm(otpCode.trim());
      const user = cred.user;
      const uid = user.uid;
      const verifiedPhone = user.phoneNumber || phoneE164;
      const phoneHash = await sha256Hex(verifiedPhone);
      const now = new Date().toISOString();

      // Prevent duplicate accounts using the same mobile number
      const phoneIdxRef = doc(citizenDb, 'citizen_phone_index', phoneHash);
      const phoneIdxSnap = await getDoc(phoneIdxRef);
      if (phoneIdxSnap.exists() && phoneIdxSnap.data()?.ownerUid !== uid) {
        return {
          ok: false,
          duplicateDetected: true,
          error: 'An account with this verified mobile number already exists under another profile.'
        };
      }

      const existingProfileSnap = await getDoc(doc(citizenDb, 'citizen_profiles', uid));
      if (existingProfileSnap.exists()) {
        setConfirmationResult(null);
        return {
          ok: true,
          duplicateDetected: true
        };
      }

      const batch = writeBatch(citizenDb);

      batch.set(phoneIdxRef, {
        ownerUid: uid,
        createdAt: now
      });

      const profileDoc: Omit<CitizenProfile, 'id'> = {
        uid,
        fullName: payload.fullName.trim().slice(0, 120),
        phoneE164: verifiedPhone,
        phoneHash,
        phoneVerified: Boolean(user.phoneNumber),
        verificationMethod: user.phoneNumber ? 'firebase_phone_auth' : 'pending_verification',
        ...(payload.email?.trim() ? { email: payload.email.trim().toLowerCase() } : {}),
        cityLocality: payload.cityLocality.trim().slice(0, 160),
        ...(payload.villageArea?.trim() ? { villageArea: payload.villageArea.trim().slice(0, 160) } : {}),
        ...(payload.ucWard?.trim() ? { ucWard: payload.ucWard.trim().slice(0, 80) } : {}),
        ...(payload.profession?.trim() ? { profession: payload.profession.trim().slice(0, 120) } : {}),
        preferredLanguage: payload.preferredLanguage,
        preferredContactMethod: payload.preferredContactMethod,
        accountStatus: 'Active',
        retentionPolicyAcceptedAt: now,
        createdAt: now,
        updatedAt: now
      };
      batch.set(doc(citizenDb, 'citizen_profiles', uid), profileDoc);

      const consentDoc: Omit<CitizenConsent, 'id'> = {
        uid,
        publicDevelopmentUpdates: Boolean(payload.consents.publicDevelopmentUpdates),
        cityServiceAnnouncements: Boolean(payload.consents.cityServiceAnnouncements),
        communityEventNotifications: Boolean(payload.consents.communityEventNotifications),
        surveyInvitations: Boolean(payload.consents.surveyInvitations),
        emergencyPublicAlerts: Boolean(payload.consents.emergencyPublicAlerts),
        nonPoliticalStatementAccepted: true,
        privacyPolicyAccepted: true,
        unsubscribedAll: false,
        updatedAt: now
      };
      batch.set(doc(citizenDb, 'citizen_consents', uid), consentDoc);

      const interestDoc: Omit<CitizenInterestRecord, 'id'> = {
        uid,
        interests: payload.interests.slice(0, 12),
        cityLocality: payload.cityLocality.trim().slice(0, 160),
        ...(payload.profession?.trim() ? { profession: payload.profession.trim().slice(0, 120) } : {}),
        updatedAt: now
      };
      batch.set(doc(citizenDb, 'citizen_interests', uid), interestDoc);

      const prefDoc: Omit<CommunicationPreferences, 'id'> = {
        uid,
        preferredLanguage: payload.preferredLanguage,
        preferredChannel: payload.preferredContactMethod,
        whatsappOptIn: payload.preferredContactMethod === 'WhatsApp',
        smsOptIn: payload.preferredContactMethod === 'SMS',
        emailOptIn: payload.preferredContactMethod === 'Email' && Boolean(payload.email?.trim()),
        inAppOptIn: true,
        unsubscribedAll: false,
        updatedAt: now
      };
      batch.set(doc(citizenDb, 'communication_preferences', uid), prefDoc);

      await batch.commit();
      setConfirmationResult(null);
      return { ok: true };
    } catch (err: any) {
      if (err?.code === 'auth/invalid-verification-code') {
        return { ok: false, error: 'Incorrect 6-digit OTP verification code.' };
      }
      if (err?.code === 'auth/code-expired') {
        return { ok: false, error: 'OTP expired. Please request a fresh verification code.' };
      }
      return { ok: false, error: err?.message || 'Verification failed.' };
    }
  };

  const signInExistingCitizenWithOtp = async (
    otpCode: string
  ): Promise<{ ok: boolean; profileFound?: boolean; error?: string }> => {
    if (testOtpPhone && !confirmationResult) {
      if (otpCode.trim() !== '123456') {
        return { ok: false, error: 'Enter test OTP code 123456.' };
      }
      const existing = TEST_CITIZEN_PROFILES.find((p) => p.phoneE164 === testOtpPhone) || TEST_CITIZEN_PROFILES[0];
      setMyProfile({ ...existing, phoneE164: testOtpPhone });
      setMyConsent(TEST_CITIZEN_CONSENTS.find((c) => c.uid === existing.uid) || TEST_CITIZEN_CONSENTS[0]);
      setMyInterests(TEST_CITIZEN_INTERESTS.find((i) => i.uid === existing.uid) || TEST_CITIZEN_INTERESTS[0]);
      setMyCommPrefs(TEST_CITIZEN_COMM_PREFS.find((p) => p.uid === existing.uid) || TEST_CITIZEN_COMM_PREFS[0]);
      setIsTestCitizenSession(true);
      setTestOtpPhone(null);
      return { ok: true, profileFound: true };
    }

    if (!confirmationResult) {
      return { ok: false, error: 'Request an OTP code first.' };
    }
    try {
      const cred = await confirmationResult.confirm(otpCode.trim());
      const snap = await getDoc(doc(citizenDb, 'citizen_profiles', cred.user.uid));
      setConfirmationResult(null);
      return { ok: true, profileFound: snap.exists() };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'OTP sign-in failed.' };
    }
  };

  const cancelPendingOtp = () => {
    setConfirmationResult(null);
    setTestOtpPhone(null);
  };

  const linkRecoveryEmail = async (email: string, password: string) => {
    if (isTestCitizenSession && myProfile) {
      setMyProfile({ ...myProfile, email: email.trim().toLowerCase(), updatedAt: new Date().toISOString() });
      return { ok: true };
    }
    if (!citizenUser) return { ok: false, error: 'Sign in with your verified mobile first.' };
    if (password.length < 6) {
      return { ok: false, error: 'Recovery password must be at least 6 characters.' };
    }
    try {
      const cred = EmailAuthProvider.credential(email.trim().toLowerCase(), password);
      await linkWithCredential(citizenUser, cred);
      const now = new Date().toISOString();
      await updateDoc(doc(citizenDb, 'citizen_profiles', citizenUser.uid), {
        email: email.trim().toLowerCase(),
        updatedAt: now
      });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Could not link recovery email.' };
    }
  };

  const signInCitizenWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(citizenAuth, email.trim().toLowerCase(), password);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Invalid recovery email or password.' };
    }
  };

  const sendRecoveryPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(citizenAuth, email.trim().toLowerCase());
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Could not dispatch password reset email.' };
    }
  };

  const logoutCitizen = async () => {
    setConfirmationResult(null);
    setTestOtpPhone(null);
    setIsTestCitizenSession(false);
    setMyProfile(null);
    setMyConsent(null);
    setMyInterests(null);
    setMyCommPrefs(null);
    setMyMemberships([]);
    setMySuggestions([]);
    setMyVolunteers([]);
    setMyOrganizations([]);
    setMyInAppMessages([]);
    await firebaseSignOut(citizenAuth);
  };

  const updateMyProfile = async (
    updates: Partial<CitizenProfile>,
    interests?: CitizenInterestTopic[]
  ) => {
    if (isTestCitizenSession && myProfile) {
      const now = new Date().toISOString();
      setMyProfile({ ...myProfile, ...updates, updatedAt: now });
      if (interests) {
        setMyInterests({
          id: myProfile.uid,
          uid: myProfile.uid,
          interests: interests.slice(0, 12),
          cityLocality: (updates.cityLocality ?? myProfile.cityLocality).trim(),
          profession: updates.profession ?? myProfile.profession,
          updatedAt: now
        });
      }
      return;
    }
    if (!citizenUser || !myProfile) return;
    const uid = citizenUser.uid;
    const now = new Date().toISOString();
    try {
      const sanitized: Record<string, unknown> = {
        fullName: (updates.fullName ?? myProfile.fullName).trim().slice(0, 120),
        cityLocality: (updates.cityLocality ?? myProfile.cityLocality).trim().slice(0, 160),
        preferredLanguage: updates.preferredLanguage ?? myProfile.preferredLanguage,
        preferredContactMethod: updates.preferredContactMethod ?? myProfile.preferredContactMethod,
        updatedAt: now
      };
      if (updates.villageArea !== undefined) sanitized.villageArea = updates.villageArea.trim().slice(0, 160);
      if (updates.ucWard !== undefined) sanitized.ucWard = updates.ucWard.trim().slice(0, 80);
      if (updates.profession !== undefined) sanitized.profession = updates.profession.trim().slice(0, 120);
      if (updates.email !== undefined) sanitized.email = updates.email.trim().toLowerCase();

      await updateDoc(doc(citizenDb, 'citizen_profiles', uid), sanitized);

      if (interests) {
        await setDoc(doc(citizenDb, 'citizen_interests', uid), {
          uid,
          interests: interests.slice(0, 12),
          cityLocality: sanitized.cityLocality as string,
          ...(sanitized.profession ? { profession: sanitized.profession } : {}),
          updatedAt: now
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `citizen_profiles/${uid}`);
    }
  };

  const updateMyConsentsAndPrefs = async (
    consents: Partial<CitizenConsent>,
    prefs: Partial<CommunicationPreferences>
  ) => {
    if (isTestCitizenSession && myConsent && myCommPrefs) {
      const now = new Date().toISOString();
      setMyConsent({ ...myConsent, ...consents, updatedAt: now });
      setMyCommPrefs({ ...myCommPrefs, ...prefs, updatedAt: now });
      return;
    }
    if (!citizenUser || !myConsent || !myCommPrefs) return;
    const uid = citizenUser.uid;
    const now = new Date().toISOString();
    try {
      await setDoc(doc(citizenDb, 'citizen_consents', uid), {
        uid,
        publicDevelopmentUpdates: consents.publicDevelopmentUpdates ?? myConsent.publicDevelopmentUpdates,
        cityServiceAnnouncements: consents.cityServiceAnnouncements ?? myConsent.cityServiceAnnouncements,
        communityEventNotifications: consents.communityEventNotifications ?? myConsent.communityEventNotifications,
        surveyInvitations: consents.surveyInvitations ?? myConsent.surveyInvitations,
        emergencyPublicAlerts: consents.emergencyPublicAlerts ?? myConsent.emergencyPublicAlerts,
        nonPoliticalStatementAccepted: true,
        privacyPolicyAccepted: true,
        unsubscribedAll: consents.unsubscribedAll ?? myConsent.unsubscribedAll,
        updatedAt: now
      });

      await setDoc(doc(citizenDb, 'communication_preferences', uid), {
        uid,
        preferredLanguage: prefs.preferredLanguage ?? myCommPrefs.preferredLanguage,
        preferredChannel: prefs.preferredChannel ?? myCommPrefs.preferredChannel,
        whatsappOptIn: prefs.whatsappOptIn ?? myCommPrefs.whatsappOptIn,
        smsOptIn: prefs.smsOptIn ?? myCommPrefs.smsOptIn,
        emailOptIn: prefs.emailOptIn ?? myCommPrefs.emailOptIn,
        inAppOptIn: prefs.inAppOptIn ?? myCommPrefs.inAppOptIn,
        unsubscribedAll: prefs.unsubscribedAll ?? myCommPrefs.unsubscribedAll,
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `citizen_consents/${uid}`);
    }
  };

  const unsubscribeAllCommunications = async () => {
    await updateMyConsentsAndPrefs(
      {
        publicDevelopmentUpdates: false,
        cityServiceAnnouncements: false,
        communityEventNotifications: false,
        surveyInvitations: false,
        emergencyPublicAlerts: false,
        unsubscribedAll: true
      },
      {
        whatsappOptIn: false,
        smsOptIn: false,
        emailOptIn: false,
        inAppOptIn: false,
        unsubscribedAll: true
      }
    );
  };

  const exportMyCitizenDataJSON = () => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        portal: 'Chichawatni Community Network (Civic Voluntary Portal)',
        profile: myProfile,
        consents: myConsent,
        interests: myInterests,
        communicationPreferences: myCommPrefs,
        groupMemberships: myMemberships,
        suggestions: mySuggestions,
        volunteerRegistrations: myVolunteers,
        organizationsSubmitted: myOrganizations,
        inAppNotifications: myInAppMessages
      },
      null,
      2
    );
  };

  const deleteMyCitizenAccount = async (): Promise<{ ok: boolean; error?: string }> => {
    if (isTestCitizenSession) {
      setIsTestCitizenSession(false);
      setMyProfile(null);
      setMyConsent(null);
      setMyInterests(null);
      setMyCommPrefs(null);
      setMyMemberships([]);
      setMySuggestions([]);
      setMyVolunteers([]);
      setMyOrganizations([]);
      return { ok: true };
    }
    if (!citizenUser) return { ok: false, error: 'Not authenticated.' };
    const uid = citizenUser.uid;
    try {
      const batch = writeBatch(citizenDb);
      if (myProfile?.phoneHash) {
        batch.delete(doc(citizenDb, 'citizen_phone_index', myProfile.phoneHash));
      }
      batch.delete(doc(citizenDb, 'citizen_profiles', uid));
      batch.delete(doc(citizenDb, 'citizen_consents', uid));
      batch.delete(doc(citizenDb, 'citizen_interests', uid));
      batch.delete(doc(citizenDb, 'communication_preferences', uid));
      myMemberships.forEach((m) => batch.delete(doc(citizenDb, 'citizen_group_members', m.id)));
      myVolunteers.forEach((v) => batch.delete(doc(citizenDb, 'citizen_volunteers', v.id)));
      await batch.commit();

      try {
        await deleteUser(citizenUser);
      } catch (authErr: any) {
        // If Firebase requires recent login for Auth user deletion, personal Firestore docs are already deleted.
        await firebaseSignOut(citizenAuth);
        if (authErr?.code === 'auth/requires-recent-login') {
          return {
            ok: true,
            error: 'All Firestore profile & consent records deleted. Re-verify OTP if you wish to purge the Firebase Auth UID.'
          };
        }
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to delete citizen records.' };
    }
  };

  // Community Participation Methods
  const joinVoluntaryGroup = async (group: CitizenGroup) => {
    if (isTestCitizenSession && myProfile) {
      const membershipId = `${group.id}_${myProfile.uid}`;
      setMyMemberships((prev) => [
        {
          id: membershipId,
          groupId: group.id,
          groupName: group.name,
          uid: myProfile.uid,
          memberDisplayName: myProfile.fullName,
          locality: myProfile.cityLocality,
          joinedVia: 'Citizen Self-Join',
          status: 'Active',
          joinedAt: new Date().toISOString()
        },
        ...prev.filter((m) => m.id !== membershipId)
      ]);
      return;
    }
    if (!citizenUser || !myProfile) throw new Error('Verify your mobile registration first.');
    const membershipId = `${group.id}_${citizenUser.uid}`;
    try {
      await setDoc(doc(citizenDb, 'citizen_group_members', membershipId), {
        groupId: group.id,
        groupName: group.name,
        uid: citizenUser.uid,
        memberDisplayName: myProfile.fullName,
        locality: myProfile.cityLocality,
        joinedVia: 'Citizen Self-Join',
        status: 'Active',
        joinedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `citizen_group_members/${membershipId}`);
    }
  };

  const leaveVoluntaryGroup = async (groupId: string) => {
    if (isTestCitizenSession && myProfile) {
      const membershipId = `${groupId}_${myProfile.uid}`;
      setMyMemberships((prev) => prev.filter((m) => m.id !== membershipId));
      return;
    }
    if (!citizenUser) return;
    const membershipId = `${groupId}_${citizenUser.uid}`;
    try {
      await deleteDoc(doc(citizenDb, 'citizen_group_members', membershipId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `citizen_group_members/${membershipId}`);
    }
  };

  const submitCitySuggestion = async (payload: {
    locality: string;
    sector: string;
    title: string;
    description: string;
  }) => {
    if (isTestCitizenSession && myProfile) {
      const now = new Date().toISOString();
      const s: CitizenSuggestion = {
        id: `sug-test-${Date.now()}`,
        uid: myProfile.uid,
        citizenDisplayName: myProfile.fullName,
        locality: payload.locality.trim(),
        sector: payload.sector,
        title: payload.title.trim(),
        description: payload.description.trim(),
        status: 'Submitted',
        isPublishedSummary: true,
        createdAt: now,
        updatedAt: now
      };
      setMySuggestions((prev) => [s, ...prev]);
      setPublicSuggestions((prev) => [s, ...prev]);
      return;
    }
    if (!citizenUser || !myProfile) throw new Error('Verify your mobile registration first.');
    const ref = doc(collection(citizenDb, 'citizen_suggestions'));
    const now = new Date().toISOString();
    try {
      await setDoc(ref, {
        id: ref.id,
        uid: citizenUser.uid,
        citizenDisplayName: myProfile.fullName,
        locality: payload.locality.trim(),
        sector: payload.sector,
        title: payload.title.trim(),
        description: payload.description.trim(),
        status: 'Submitted',
        isPublishedSummary: false,
        createdAt: now,
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `citizen_suggestions/${ref.id}`);
    }
  };

  const submitSurveyResponse = async (surveyId: string, answers: Record<string, string>) => {
    if (isTestCitizenSession && myProfile) {
      setTestSubmittedSurveys((prev) => ({ ...prev, [surveyId]: true }));
      return;
    }
    if (!citizenUser || !myProfile) throw new Error('Verify your mobile registration first.');
    const path = `citizen_surveys/${surveyId}/responses/${citizenUser.uid}`;
    try {
      await setDoc(doc(citizenDb, 'citizen_surveys', surveyId, 'responses', citizenUser.uid), {
        surveyId,
        uid: citizenUser.uid,
        locality: myProfile.cityLocality,
        answers,
        submittedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const checkMySurveySubmitted = async (surveyId: string): Promise<boolean> => {
    if (isTestCitizenSession) return Boolean(testSubmittedSurveys[surveyId]);
    if (!citizenUser) return false;
    try {
      const snap = await getDoc(doc(citizenDb, 'citizen_surveys', surveyId, 'responses', citizenUser.uid));
      return snap.exists();
    } catch {
      return false;
    }
  };

  const registerVolunteer = async (payload: {
    locality: string;
    initiativeTitle: string;
    areaOfInterest: CitizenInterestTopic;
    availability: string;
    skillsNote?: string;
  }) => {
    if (isTestCitizenSession && myProfile) {
      const now = new Date().toISOString();
      const vol: CitizenVolunteer = {
        id: `vol-test-${Date.now()}`,
        uid: myProfile.uid,
        volunteerName: myProfile.fullName,
        locality: payload.locality.trim() || myProfile.cityLocality,
        initiativeTitle: payload.initiativeTitle.trim(),
        areaOfInterest: payload.areaOfInterest,
        availability: payload.availability.trim(),
        ...(payload.skillsNote?.trim() ? { skillsNote: payload.skillsNote.trim() } : {}),
        status: 'Registered',
        isNonPoliticalConfirmed: true,
        createdAt: now,
        updatedAt: now
      };
      setMyVolunteers((prev) => [vol, ...prev]);
      return;
    }
    if (!citizenUser || !myProfile) throw new Error('Verify your mobile registration first.');
    const ref = doc(collection(citizenDb, 'citizen_volunteers'));
    const now = new Date().toISOString();
    try {
      await setDoc(ref, {
        id: ref.id,
        uid: citizenUser.uid,
        volunteerName: myProfile.fullName,
        locality: payload.locality.trim() || myProfile.cityLocality,
        initiativeTitle: payload.initiativeTitle.trim(),
        areaOfInterest: payload.areaOfInterest,
        availability: payload.availability.trim(),
        ...(payload.skillsNote?.trim() ? { skillsNote: payload.skillsNote.trim() } : {}),
        status: 'Registered',
        isNonPoliticalConfirmed: true,
        createdAt: now,
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `citizen_volunteers/${ref.id}`);
    }
  };

  const withdrawVolunteer = async (id: string) => {
    if (isTestCitizenSession) {
      setMyVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'Withdrawn' } : v)));
      return;
    }
    if (!citizenUser) return;
    try {
      await updateDoc(doc(citizenDb, 'citizen_volunteers', id), {
        status: 'Withdrawn',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `citizen_volunteers/${id}`);
    }
  };

  const submitOrganizationListing = async (payload: {
    orgName: string;
    orgCategory: RegisteredOrganization['orgCategory'];
    locality: string;
    registrationNumber?: string;
    focalPersonName: string;
    publicContactPhone?: string;
    publicEmail?: string;
    description: string;
    servicesOffered?: string;
  }) => {
    if (isTestCitizenSession && myProfile) {
      const now = new Date().toISOString();
      const org: RegisteredOrganization = {
        id: `org-test-${Date.now()}`,
        submittedByUid: myProfile.uid,
        orgName: payload.orgName.trim(),
        orgCategory: payload.orgCategory,
        locality: payload.locality.trim(),
        ...(payload.registrationNumber?.trim() ? { registrationNumber: payload.registrationNumber.trim() } : {}),
        focalPersonName: payload.focalPersonName.trim(),
        ...(payload.publicContactPhone?.trim() ? { publicContactPhone: payload.publicContactPhone.trim() } : {}),
        ...(payload.publicEmail?.trim() ? { publicEmail: payload.publicEmail.trim().toLowerCase() } : {}),
        description: payload.description.trim(),
        ...(payload.servicesOffered?.trim() ? { servicesOffered: payload.servicesOffered.trim() } : {}),
        verificationStatus: 'Pending Verification',
        isPublicPublished: false,
        createdAt: now,
        updatedAt: now
      };
      setMyOrganizations((prev) => [org, ...prev]);
      return;
    }
    if (!citizenUser) throw new Error('Please sign in or verify your mobile before submitting an organization listing.');
    const ref = doc(collection(citizenDb, 'registered_organizations'));
    const now = new Date().toISOString();
    try {
      await setDoc(ref, {
        id: ref.id,
        submittedByUid: citizenUser.uid,
        orgName: payload.orgName.trim(),
        orgCategory: payload.orgCategory,
        locality: payload.locality.trim(),
        ...(payload.registrationNumber?.trim() ? { registrationNumber: payload.registrationNumber.trim() } : {}),
        focalPersonName: payload.focalPersonName.trim(),
        ...(payload.publicContactPhone?.trim() ? { publicContactPhone: payload.publicContactPhone.trim() } : {}),
        ...(payload.publicEmail?.trim() ? { publicEmail: payload.publicEmail.trim().toLowerCase() } : {}),
        description: payload.description.trim(),
        ...(payload.servicesOffered?.trim() ? { servicesOffered: payload.servicesOffered.trim() } : {}),
        verificationStatus: 'Pending Verification',
        isPublicPublished: false,
        createdAt: now,
        updatedAt: now
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `registered_organizations/${ref.id}`);
    }
  };

  // Admin Management Operations
  const adminUpdateCitizenStatus = async (uid: string, updates: Partial<CitizenProfile>) => {
    const now = new Date().toISOString();
    if (isDemoSession) {
      setAdminProfiles((prev) => prev.map((p) => (p.uid === uid ? { ...p, ...updates, updatedAt: now } : p)));
      return;
    }
    try {
      await updateDoc(doc(db, 'citizen_profiles', uid), { ...updates, updatedAt: now });
      await recordAudit('Updated Citizen Record', `UID ${uid}: ${JSON.stringify(updates)}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `citizen_profiles/${uid}`);
    }
  };

  const adminDeleteCitizenProfile = async (uid: string) => {
    if (isDemoSession) {
      setAdminProfiles((prev) => prev.filter((p) => p.uid !== uid));
      return;
    }
    try {
      const profile = adminProfiles.find((p) => p.uid === uid);
      const batch = writeBatch(db);
      if (profile?.phoneHash) batch.delete(doc(db, 'citizen_phone_index', profile.phoneHash));
      batch.delete(doc(db, 'citizen_profiles', uid));
      batch.delete(doc(db, 'citizen_consents', uid));
      batch.delete(doc(db, 'citizen_interests', uid));
      batch.delete(doc(db, 'communication_preferences', uid));
      await batch.commit();
      await recordAudit('Deleted Citizen Account Data', `Purged citizen records for UID ${uid}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `citizen_profiles/${uid}`);
    }
  };

  const adminSaveGroup = async (
    payload: Omit<CitizenGroup, 'id' | 'memberCount' | 'createdBy' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    const id = payload.id || `grp-${Date.now()}`;
    const existing = adminGroups.find((g) => g.id === id);
    const fullDoc: CitizenGroup = {
      id,
      name: payload.name.trim(),
      ...(payload.nameUrdu?.trim() ? { nameUrdu: payload.nameUrdu.trim() } : {}),
      interestCategory: payload.interestCategory,
      ...(payload.localityFilter?.trim() ? { localityFilter: payload.localityFilter.trim() } : {}),
      description: payload.description.trim(),
      isNonPoliticalConfirmed: true,
      isActive: payload.isActive,
      memberCount: existing?.memberCount || 0,
      createdBy: adminUser?.email || 'admin',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    if (isDemoSession) {
      setAdminGroups((prev) => [fullDoc, ...prev.filter((g) => g.id !== id)]);
      setActiveGroups((prev) => [fullDoc, ...prev.filter((g) => g.id !== id)].filter((g) => g.isActive));
      return;
    }
    try {
      await setDoc(doc(db, 'citizen_groups', id), fullDoc);
      await recordAudit('Saved Community Group', `${fullDoc.name} (${id})`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `citizen_groups/${id}`);
    }
  };

  const adminDeleteGroup = async (groupId: string) => {
    if (isDemoSession) {
      setAdminGroups((prev) => prev.filter((g) => g.id !== groupId));
      return;
    }
    try {
      await deleteDoc(doc(db, 'citizen_groups', groupId));
      await recordAudit('Deleted Community Group', `Removed group ${groupId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `citizen_groups/${groupId}`);
    }
  };

  const adminSeedVoluntaryGroupTemplates = async () => {
    for (const tpl of VOLUNTARY_GROUP_TEMPLATES) {
      const exists = adminGroups.some((g) => g.name.toLowerCase() === tpl.name.toLowerCase());
      if (!exists) {
        await adminSaveGroup({
          name: tpl.name,
          nameUrdu: tpl.nameUrdu,
          interestCategory: tpl.interestCategory,
          description: tpl.description,
          isNonPoliticalConfirmed: true,
          isActive: true
        });
      }
    }
  };

  const adminAssignMembersToGroup = async (group: CitizenGroup, members: CitizenProfile[]): Promise<number> => {
    const now = new Date().toISOString();
    let added = 0;
    for (const member of members) {
      const mId = `${group.id}_${member.uid}`;
      const already = adminGroupMembers.some((m) => m.id === mId && m.status === 'Active');
      if (already) continue;
      const docData: Omit<CitizenGroupMember, 'id'> = {
        groupId: group.id,
        groupName: group.name,
        uid: member.uid,
        memberDisplayName: member.fullName,
        locality: member.cityLocality,
        joinedVia: 'Admin Organized',
        status: 'Active',
        joinedAt: now
      };
      if (!isDemoSession) {
        await setDoc(doc(db, 'citizen_group_members', mId), docData);
      } else {
        setAdminGroupMembers((prev) => [{ id: mId, ...docData }, ...prev]);
      }
      added++;
    }
    if (added > 0 && !isDemoSession) {
      await updateDoc(doc(db, 'citizen_groups', group.id), {
        memberCount: (group.memberCount || 0) + added,
        updatedAt: now
      });
      await recordAudit('Organized Group Members', `Assigned ${added} opted-in members to ${group.name}`);
    }
    return added;
  };

  const adminUpdateSuggestion = async (id: string, updates: Partial<CitizenSuggestion>) => {
    const now = new Date().toISOString();
    if (isDemoSession) {
      setAdminSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s)));
      return;
    }
    try {
      await updateDoc(doc(db, 'citizen_suggestions', id), { ...updates, updatedAt: now });
      await recordAudit('Updated Citizen Suggestion', `Suggestion ${id} -> ${updates.status || 'edited'}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `citizen_suggestions/${id}`);
    }
  };

  const adminSaveSurvey = async (
    payload: Omit<CitizenSurvey, 'id' | 'responseCount' | 'createdBy' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    const id = payload.id || `srv-${Date.now()}`;
    const existing = adminSurveys.find((s) => s.id === id);
    const fullDoc: CitizenSurvey = {
      id,
      title: payload.title.trim(),
      ...(payload.titleUrdu?.trim() ? { titleUrdu: payload.titleUrdu.trim() } : {}),
      topic: payload.topic.trim(),
      description: payload.description.trim(),
      questions: payload.questions.slice(0, 10),
      status: payload.status,
      responseCount: existing?.responseCount || 0,
      createdBy: adminUser?.email || 'admin',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    if (isDemoSession) {
      setAdminSurveys((prev) => [fullDoc, ...prev.filter((s) => s.id !== id)]);
      return;
    }
    try {
      await setDoc(doc(db, 'citizen_surveys', id), fullDoc);
      await recordAudit('Saved Community Survey', `${fullDoc.title} [${fullDoc.status}]`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `citizen_surveys/${id}`);
    }
  };

  const adminGetSurveyResponses = async (surveyId: string): Promise<CitizenSurveyResponse[]> => {
    if (isDemoSession) return [];
    try {
      const snap = await getDocs(collection(db, 'citizen_surveys', surveyId, 'responses'));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CitizenSurveyResponse, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `citizen_surveys/${surveyId}/responses`);
    }
  };

  const adminUpdateVolunteerStatus = async (id: string, status: CitizenVolunteer['status']) => {
    const now = new Date().toISOString();
    if (isDemoSession) {
      setAdminVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status, updatedAt: now } : v)));
      return;
    }
    try {
      await updateDoc(doc(db, 'citizen_volunteers', id), { status, updatedAt: now });
      await recordAudit('Updated Volunteer Status', `Volunteer ${id} -> ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `citizen_volunteers/${id}`);
    }
  };

  const adminVerifyOrganization = async (
    id: string,
    verificationStatus: RegisteredOrganization['verificationStatus'],
    isPublicPublished: boolean
  ) => {
    const now = new Date().toISOString();
    if (isDemoSession) {
      setAdminOrganizations((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                verificationStatus,
                isPublicPublished: verificationStatus === 'Verified' ? isPublicPublished : false,
                verifiedByAdmin: adminUser?.email || 'admin',
                updatedAt: now
              }
            : o
        )
      );
      return;
    }
    try {
      await updateDoc(doc(db, 'registered_organizations', id), {
        verificationStatus,
        isPublicPublished: verificationStatus === 'Verified' ? isPublicPublished : false,
        verifiedByAdmin: adminUser?.email || 'admin',
        updatedAt: now
      });
      await recordAudit(
        'Verified Organization Directory Entry',
        `Org ${id} status=${verificationStatus}, published=${isPublicPublished}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `registered_organizations/${id}`);
    }
  };

  // Strictly enforces explicit opt-in consent before any communication dispatch!
  const adminSendConsentCommunication = async (payload: {
    channel: CitizenContactMethod;
    consentCategory: CitizenConsentCategory;
    templateName: string;
    subject: string;
    messageBody: string;
    targetUids: string[];
  }): Promise<{ sent: number; failed: number; skippedNoConsent: number; simulated: number }> => {
    const batchId = `COMM-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    let sent = 0;
    let failed = 0;
    let skippedNoConsent = 0;
    let simulated = 0;

    const evaluated = payload.targetUids.map((uid) => {
      const profile = adminProfiles.find((p) => p.uid === uid);
      const consent = adminConsents.find((c) => c.uid === uid);
      const pref = adminCommPrefs.find((p) => p.uid === uid);

      const categoryOpted = Boolean(consent && consent[payload.consentCategory]);
      const unsubscribed = Boolean(consent?.unsubscribedAll || pref?.unsubscribedAll);
      const channelOptIn =
        payload.channel === 'WhatsApp'
          ? Boolean(pref?.whatsappOptIn ?? profile?.preferredContactMethod === 'WhatsApp')
          : payload.channel === 'SMS'
            ? Boolean(pref?.smsOptIn ?? profile?.preferredContactMethod === 'SMS')
            : payload.channel === 'Email'
              ? Boolean(pref?.emailOptIn && profile?.email)
              : Boolean(pref?.inAppOptIn ?? true);

      return {
        uid,
        name: profile?.fullName || 'Citizen',
        phoneE164: profile?.phoneE164,
        email: profile?.email,
        consentVerified: categoryOpted,
        channelOptIn,
        unsubscribedAll: unsubscribed,
        maskedContact:
          payload.channel === 'Email'
            ? profile?.email || 'No email'
            : payload.channel === 'In-App'
              ? `UID:${uid.slice(0, 8)}`
              : maskPhoneDisplay(profile?.phoneE164 || '')
      };
    });

    // Dispatch through backend Express gateway when available (skip on static github.io)
    let gatewayMap: Record<string, { deliveryStatus: CommunicationLog['deliveryStatus']; failedReason?: string }> = {};
    const isStaticHost = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
    if (!isStaticHost) {
      try {
        const resp = await fetch('./api/citizen/communications/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: payload.channel,
            consentCategory: payload.consentCategory,
            subject: payload.subject,
            messageBody: payload.messageBody,
            recipients: evaluated.map((r) => ({
              uid: r.uid,
              name: r.name,
              phoneE164: r.phoneE164,
              email: r.email,
              consentVerified: r.consentVerified,
              channelOptIn: r.channelOptIn,
              unsubscribedAll: r.unsubscribedAll
            }))
          })
        });
        if (resp.ok) {
          const data = (await resp.json()) as {
            results: { uid: string; deliveryStatus: CommunicationLog['deliveryStatus']; failedReason?: string }[];
          };
          data.results.forEach((item) => {
            gatewayMap[item.uid] = item;
          });
        }
      } catch {
        // Static hosting mode: enforce consent locally & mark In-App Delivered or external Simulated
      }
    }

    for (const r of evaluated) {
      let status: CommunicationLog['deliveryStatus'];
      let reason: string | undefined;

      if (r.unsubscribedAll || !r.consentVerified || !r.channelOptIn) {
        status = 'Skipped - No Consent';
        reason = 'Excluded automatically: missing explicit category opt-in, channel opt-in, or unsubscribed.';
        skippedNoConsent++;
      } else if (gatewayMap[r.uid]) {
        status = gatewayMap[r.uid].deliveryStatus;
        reason = gatewayMap[r.uid].failedReason;
        if (status === 'Sent' || status === 'Delivered') sent++;
        else if (status === 'Failed') failed++;
        else if (status === 'Simulated - Gateway Pending') simulated++;
      } else if (payload.channel === 'In-App') {
        status = 'Delivered';
        sent++;
      } else {
        status = 'Simulated - Gateway Pending';
        reason = 'External gateway API credentials not active on static host; consent verified & queued.';
        simulated++;
      }

      const logRef = doc(collection(db, 'communication_logs'));
      const logDoc: CommunicationLog = {
        id: logRef.id,
        batchId,
        channel: payload.channel,
        consentCategory: payload.consentCategory,
        templateName: payload.templateName,
        subject: payload.subject.trim(),
        messageBody: payload.messageBody.trim(),
        recipientUid: r.uid,
        recipientName: r.name,
        recipientMaskedContact: r.maskedContact,
        deliveryStatus: status,
        ...(reason ? { failedReason: reason } : {}),
        sentByEmail: adminUser?.email || 'admin',
        sentAt: now
      };

      if (isDemoSession) {
        setAdminCommLogs((prev) => [logDoc, ...prev]);
      } else {
        try {
          await setDoc(logRef, logDoc);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `communication_logs/${logRef.id}`);
        }
      }
    }

    await recordAudit(
      'Dispatched Consent-Verified Communication',
      `Batch ${batchId} (${payload.channel}, ${payload.consentCategory}): ${sent} sent/delivered, ${skippedNoConsent} skipped (no consent), ${failed} failed, ${simulated} gateway-pending`
    );

    return { sent, failed, skippedNoConsent, simulated };
  };

  const logAdminCitizenExport = async (details: string) => {
    await recordAudit('Accessed / Exported Citizen Network Records', details);
  };

  return (
    <CitizenNetworkContext.Provider
      value={{
        citizenUser,
        citizenLoading,
        myProfile,
        myConsent,
        myInterests,
        myCommPrefs,
        myMemberships,
        mySuggestions,
        myVolunteers,
        myOrganizations,
        myInAppMessages,
        otpPending: Boolean(confirmationResult || testOtpPhone),
        isTestCitizenSession,
        testOtpPhone,
        sendPhoneOtp,
        confirmOtpAndRegister,
        signInExistingCitizenWithOtp,
        cancelPendingOtp,
        linkRecoveryEmail,
        signInCitizenWithEmail,
        sendRecoveryPasswordReset,
        logoutCitizen,
        updateMyProfile,
        updateMyConsentsAndPrefs,
        unsubscribeAllCommunications,
        exportMyCitizenDataJSON,
        deleteMyCitizenAccount,
        activeGroups,
        publicSuggestions,
        activeSurveys,
        verifiedOrganizations,
        joinVoluntaryGroup,
        leaveVoluntaryGroup,
        submitCitySuggestion,
        submitSurveyResponse,
        checkMySurveySubmitted,
        registerVolunteer,
        withdrawVolunteer,
        submitOrganizationListing,
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
        adminGetSurveyResponses,
        adminUpdateVolunteerStatus,
        adminVerifyOrganization,
        adminSendConsentCommunication,
        logAdminCitizenExport
      }}
    >
      {children}
    </CitizenNetworkContext.Provider>
  );
};

export const useCitizenNetwork = () => useContext(CitizenNetworkContext);
