import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Must pass firestoreDatabaseId as second parameter for named Firestore instances
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates Firestore connection on boot without breaking offline/public previews.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'portal'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase connection offline. Check firebase-applet-config.json.');
    }
    return false;
  }
}

testFirestoreConnection();

/**
 * Provisions a new Firebase Auth staff user using a secondary isolated Firebase App instance
 * so the active Super Admin session remains signed in uninterrupted.
 */
export async function createStaffFirebaseUser(
  email: string,
  password: string,
  displayName: string
): Promise<string> {
  const secondaryAppName = `staff-provisioner-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    const uid = credential.user.uid;
    await firebaseSignOut(secondaryAuth);
    return uid;
  } finally {
    try {
      await deleteApp(secondaryApp);
    } catch {
      // ignore cleanup error
    }
  }
}
