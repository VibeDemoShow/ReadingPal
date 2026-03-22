// AsyncStorage-based auth provider — web fallback for SQLite
// Uses the same name+PIN approach but stores everything in AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, AuthUser } from '../types';

const SESSION_KEY = 'reading_app_current_user';
const USERS_KEY = 'reading_app_users';

// Simple uid generator
function generateUid(): string {
  return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

interface StoredUser {
  uid: string;
  displayName: string;
  gradeLevel: number;
  pin: string;
  createdAt: string;
}

async function getUsers(): Promise<StoredUser[]> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Listeners for auth state changes
type AuthListener = (user: AuthUser | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: AuthUser | null) {
  listeners.forEach(cb => cb(user));
}

export const asyncStorageAuth: AuthProvider = {
  async login(credentials: Record<string, string>): Promise<AuthUser> {
    const { name, pin } = credentials;
    if (!name || !pin) {
      throw new Error('Name and PIN are required');
    }

    const users = await getUsers();
    const found = users.find(u => u.displayName === name.trim());

    if (!found) {
      throw new Error('User not found. Please sign up first.');
    }
    if (found.pin !== pin) {
      throw new Error('Incorrect PIN. Please try again.');
    }

    const user: AuthUser = {
      uid: found.uid,
      displayName: found.displayName,
      gradeLevel: found.gradeLevel,
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    notifyListeners(user);
    return user;
  },

  async signup(credentials: Record<string, string>): Promise<AuthUser> {
    const { name, gradeLevel, pin } = credentials;
    if (!name || !pin) {
      throw new Error('Name and PIN are required');
    }

    const users = await getUsers();
    if (users.find(u => u.displayName === name.trim())) {
      throw new Error('A user with this name already exists. Please log in or use a different name.');
    }

    const uid = generateUid();
    const grade = parseInt(gradeLevel || '1', 10);

    const newUser: StoredUser = {
      uid,
      displayName: name.trim(),
      gradeLevel: grade,
      pin,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    const user: AuthUser = { uid, displayName: name.trim(), gradeLevel: grade };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    notifyListeners(user);
    return user;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
    notifyListeners(null);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthUser;
    } catch {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    listeners.add(callback);
    asyncStorageAuth.getCurrentUser().then(callback);
    return () => { listeners.delete(callback); };
  },
};
