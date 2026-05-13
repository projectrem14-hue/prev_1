
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  Auth,
  User
} from 'firebase/auth';
import { doc, setDoc, Firestore, serverTimestamp } from 'firebase/firestore';

/**
 * Registers a new user and creates their Firestore profile.
 */
export async function signUp(auth: Auth, db: Firestore, email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  
  // Initialize user profile in Firestore
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || email.split('@')[0],
    createdAt: serverTimestamp(),
  });
  
  return user;
}

/**
 * Authenticates an existing user.
 */
export async function signIn(auth: Auth, email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Signs out the current user.
 */
export async function signOut(auth: Auth) {
  return firebaseSignOut(auth);
}
