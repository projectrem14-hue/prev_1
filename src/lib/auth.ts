
/**
 * Mock Authentication Service
 * 
 * This service simulates Firebase Auth using local storage.
 * It provides the same interface to the app without requiring real Firebase Auth keys.
 */

export interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
}

const STORAGE_KEY = 'gaplogic_user';

/**
 * Simulates user registration.
 */
export async function signUp(auth: any, db: any, email: string, _password: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user: MockUser = {
    uid: btoa(email).substring(0, 20), // Simple deterministic UID based on email
    email: email,
    displayName: email.split('@')[0]
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-state-change'));
  return user;
}

/**
 * Simulates user login.
 */
export async function signIn(auth: any, email: string, _password: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user: MockUser = {
    uid: btoa(email).substring(0, 20),
    email: email,
    displayName: email.split('@')[0]
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-state-change'));
  return user;
}

/**
 * Simulates logout.
 */
export async function signOut(_auth: any) {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('auth-state-change'));
}
