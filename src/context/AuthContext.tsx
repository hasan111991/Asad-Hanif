import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  createStaffFirebaseUser,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { AdminUser, AdminRole } from '../types';

export const BOOTSTRAPPED_SUPER_ADMIN_EMAIL = 'hasanaamir815@gmail.com';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_STORAGE_KEY = 'pp203_admin_login_lockout';

export type AdminModuleId =
  | 'dashboard'
  | 'projects'
  | 'complaints'
  | 'notices'
  | 'appointments'
  | 'news'
  | 'gallery'
  | 'analytics'
  | 'settings'
  | 'staff'
  | 'audit';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminModuleId[]> = {
  'Super Admin': [
    'dashboard',
    'projects',
    'complaints',
    'notices',
    'appointments',
    'news',
    'gallery',
    'analytics',
    'settings',
    'staff',
    'audit'
  ],
  'Office Manager': [
    'dashboard',
    'complaints',
    'notices',
    'appointments',
    'settings'
  ],
  'Project Manager': [
    'dashboard',
    'projects',
    'analytics'
  ],
  'Media Manager': [
    'dashboard',
    'news',
    'gallery',
    'notices'
  ],
  'Data Entry Operator': [
    'dashboard',
    'projects',
    'complaints',
    'notices',
    'appointments'
  ]
};

interface AuthResult {
  success: boolean;
  error?: string;
}

interface LockoutState {
  attempts: number;
  lockedUntil: number | null;
}

interface AuthContextType {
  firebaseUser: User | null;
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  failedAttempts: number;
  lockoutSecondsLeft: number;
  loginWithEmail: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  hasRole: (requiredRoles: AdminRole[]) => boolean;
  canAccessModule: (moduleId: AdminModuleId) => boolean;
  allStaff: AdminUser[];
  createStaffAccount: (payload: {
    email: string;
    password: string;
    displayName: string;
    role: AdminRole;
    phone?: string;
  }) => Promise<AuthResult>;
  updateStaffRole: (uid: string, newRole: AdminRole) => Promise<void>;
  toggleStaffStatus: (uid: string, status: 'Active' | 'Suspended') => Promise<void>;
  deleteStaffAccount: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  currentUser: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,
  failedAttempts: 0,
  lockoutSecondsLeft: 0,
  loginWithEmail: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
  hasRole: () => false,
  canAccessModule: () => false,
  allStaff: [],
  createStaffAccount: async () => ({ success: false }),
  updateStaffRole: async () => {},
  toggleStaffStatus: async () => {},
  deleteStaffAccount: async () => {}
});

function loadLockout(): LockoutState {
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as LockoutState;
    if (parsed.lockedUntil && Date.now() >= parsed.lockedUntil) {
      localStorage.removeItem(LOCKOUT_STORAGE_KEY);
      return { attempts: 0, lockedUntil: null };
    }
    return parsed;
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function saveLockout(state: LockoutState) {
  try {
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [allStaff, setAllStaff] = useState<AdminUser[]>([]);
  const [lockout, setLockout] = useState<LockoutState>(() => loadLockout());
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(() => {
    const initial = loadLockout();
    return initial.lockedUntil ? Math.max(0, Math.ceil((initial.lockedUntil - Date.now()) / 1000)) : 0;
  });

  // Countdown tick for persistent rate-limiting lockout
  useEffect(() => {
    if (!lockout.lockedUntil) {
      setLockoutSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((lockout.lockedUntil! - Date.now()) / 1000));
      setLockoutSecondsLeft(remaining);
      if (remaining === 0) {
        const reset = { attempts: 0, lockedUntil: null };
        setLockout(reset);
        saveLockout(reset);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockout.lockedUntil]);

  const recordFailedAttempt = useCallback(() => {
    setLockout((prev) => {
      const nextAttempts = prev.attempts + 1;
      const lockedUntil = nextAttempts >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
      const nextState = { attempts: nextAttempts, lockedUntil };
      saveLockout(nextState);
      return nextState;
    });
  }, []);

  const clearLockout = useCallback(() => {
    const clean = { attempts: 0, lockedUntil: null };
    setLockout(clean);
    saveLockout(clean);
  }, []);

  // Resolve Firebase Auth session against Firestore /admins/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthError(null);

      if (!user) {
        setCurrentUser(null);
        setAllStaff([]);
        setAuthLoading(false);
        return;
      }

      try {
        const isBootstrapped =
          user.email?.toLowerCase() === BOOTSTRAPPED_SUPER_ADMIN_EMAIL && user.emailVerified;
        const adminDocRef = doc(db, 'admins', user.uid);
        const snap = await getDoc(adminDocRef);

        if (snap.exists()) {
          const data = snap.data() as AdminUser;
          if (data.status === 'Suspended' && !isBootstrapped) {
            await firebaseSignOut(auth);
            setCurrentUser(null);
            setAuthError('Your staff account is currently suspended. Contact the Super Administrator.');
            setAuthLoading(false);
            return;
          }

          const updatedProfile: AdminUser = {
            ...data,
            id: user.uid,
            uid: user.uid,
            lastLogin: new Date().toISOString()
          };
          setCurrentUser(updatedProfile);
          if (isBootstrapped) {
            await setDoc(
              adminDocRef,
              {
                uid: user.uid,
                email: user.email || BOOTSTRAPPED_SUPER_ADMIN_EMAIL,
                displayName: data.displayName || user.displayName || 'Super Administrator',
                role: 'Super Admin',
                status: 'Active',
                createdAt: data.createdAt || new Date().toISOString(),
                lastLogin: updatedProfile.lastLogin
              },
              { merge: true }
            );
          }
        } else if (isBootstrapped) {
          const superAdminDoc: AdminUser = {
            id: user.uid,
            uid: user.uid,
            email: user.email || BOOTSTRAPPED_SUPER_ADMIN_EMAIL,
            displayName: user.displayName || 'Chaudhry Secretariat Super Admin',
            role: 'Super Admin',
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          await setDoc(adminDocRef, {
            uid: user.uid,
            email: superAdminDoc.email,
            displayName: superAdminDoc.displayName,
            role: 'Super Admin',
            status: 'Active',
            createdAt: superAdminDoc.createdAt,
            lastLogin: superAdminDoc.lastLogin
          });
          setCurrentUser(superAdminDoc);
        } else {
          // Authenticated Firebase user is NOT registered in /admins
          await firebaseSignOut(auth);
          setCurrentUser(null);
          setAuthError('Access restricted: This account is not authorized in the Secretariat staff directory.');
        }
      } catch (err) {
        console.error('Admin verification error:', err);
        setAuthError('Unable to verify staff authorization with Firestore.');
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to staff directory only when authenticated admin is active
  useEffect(() => {
    if (!currentUser) {
      setAllStaff([]);
      return;
    }

    const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: AdminUser[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdminUser, 'id'>)
        }));
        setAllStaff(list);
      },
      (error) => {
        console.warn('Staff directory listener:', error);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const loginWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    if (lockoutSecondsLeft > 0) {
      return {
        success: false,
        error: `Too many failed attempts. Please wait ${Math.ceil(lockoutSecondsLeft / 60)}m ${lockoutSecondsLeft % 60}s before retrying.`
      };
    }

    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      clearLockout();
      return { success: true };
    } catch (err: any) {
      recordFailedAttempt();
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error: 'Email/Password sign-in provider is not yet enabled in Firebase Console -> Authentication -> Sign-in method.'
        };
      }
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return { success: false, error: 'Invalid staff email or password.' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Firebase temporarily blocked requests. Wait a few minutes and retry.' };
      }
      return { success: false, error: err?.message || 'Sign-in failed.' };
    }
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    if (lockoutSecondsLeft > 0) {
      return {
        success: false,
        error: `Login locked. Wait ${lockoutSecondsLeft} seconds before trying again.`
      };
    }

    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const isBootstrapped =
        user.email?.toLowerCase() === BOOTSTRAPPED_SUPER_ADMIN_EMAIL && user.emailVerified;
      const snap = await getDoc(doc(db, 'admins', user.uid));

      if (!snap.exists() && !isBootstrapped) {
        await firebaseSignOut(auth);
        recordFailedAttempt();
        return {
          success: false,
          error: `Account (${user.email}) is not registered as authorized Secretariat staff.`
        };
      }
      clearLockout();
      return { success: true };
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        recordFailedAttempt();
      }
      if (err?.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error: 'Google Sign-In provider is not yet enabled in Firebase Console -> Authentication -> Sign-in method.'
        };
      }
      return { success: false, error: err?.message || 'Google sign-in failed.' };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setAuthError(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const hasRole = (requiredRoles: AdminRole[]): boolean => {
    if (!currentUser || currentUser.status !== 'Active') return false;
    if (currentUser.role === 'Super Admin') return true;
    return requiredRoles.includes(currentUser.role);
  };

  const canAccessModule = (moduleId: AdminModuleId): boolean => {
    if (!currentUser || currentUser.status !== 'Active') return false;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(moduleId);
  };

  const createStaffAccount = async (payload: {
    email: string;
    password: string;
    displayName: string;
    role: AdminRole;
    phone?: string;
  }): Promise<AuthResult> => {
    if (currentUser?.role !== 'Super Admin') {
      return { success: false, error: 'Only Super Admin can provision new staff accounts.' };
    }

    try {
      const uid = await createStaffFirebaseUser(
        payload.email.trim(),
        payload.password,
        payload.displayName.trim()
      );
      const staffData = {
        uid,
        email: payload.email.trim().toLowerCase(),
        displayName: payload.displayName.trim(),
        role: payload.role,
        status: 'Active' as const,
        phone: payload.phone?.trim() || '',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'admins', uid), staffData);
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        return { success: false, error: 'This email is already registered in Firebase Authentication.' };
      }
      if (err?.code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      return { success: false, error: err?.message || 'Failed to provision staff account.' };
    }
  };

  const updateStaffRole = async (uid: string, newRole: AdminRole) => {
    if (currentUser?.role !== 'Super Admin') return;
    const path = `admins/${uid}`;
    try {
      await updateDoc(doc(db, 'admins', uid), { role: newRole });
      if (currentUser.id === uid) {
        setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const toggleStaffStatus = async (uid: string, status: 'Active' | 'Suspended') => {
    if (currentUser?.role !== 'Super Admin' || uid === currentUser.id) return;
    const path = `admins/${uid}`;
    try {
      await updateDoc(doc(db, 'admins', uid), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteStaffAccount = async (uid: string) => {
    if (currentUser?.role !== 'Super Admin' || uid === currentUser.id) return;
    const path = `admins/${uid}`;
    try {
      await deleteDoc(doc(db, 'admins', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        isAuthenticated: !!currentUser && currentUser.status === 'Active',
        authLoading,
        authError,
        failedAttempts: lockout.attempts,
        lockoutSecondsLeft,
        loginWithEmail,
        loginWithGoogle,
        logout,
        hasRole,
        canAccessModule,
        allStaff,
        createStaffAccount,
        updateStaffRole,
        toggleStaffStatus,
        deleteStaffAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
