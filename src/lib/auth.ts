
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  Auth
} from 'firebase/auth';

/**
 * Creates a new user with email and password.
 */
export async function signUp(auth: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
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
