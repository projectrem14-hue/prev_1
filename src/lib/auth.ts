
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  Auth
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';

/**
 * Creates a new user with email and password and initializes their Firestore profile.
 */
export async function signUp(auth: Auth, db: Firestore, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    createdAt: serverTimestamp(),
  });

  return userCredential;
}

/**
 * Logs in an existing user with email and password.
 */
export async function signIn(auth: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logs out the current user.
 */
export async function signOut(auth: Auth) {
  return firebaseSignOut(auth);
}
