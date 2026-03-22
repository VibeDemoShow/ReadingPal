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
  username?: string;
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
      throw new Error('Username and PIN are required');
    }

    const users = await getUsers();
    const found = users.find(u => (u.username || u.displayName) === name.trim());

    if (!found) {
      throw new Error('User not found. Please sign up first.');
    }
    if (found.pin !== pin) {
      throw new Error('Incorrect PIN. Please try again.');
    }

    const user: AuthUser = {
      uid: found.uid,
      username: found.username || found.displayName,
      displayName: found.displayName,
      gradeLevel: found.gradeLevel,
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    notifyListeners(user);
    return user;
  },

  async signup(credentials: Record<string, string>): Promise<AuthUser> {
    const { username, displayName, gradeLevel, pin } = credentials;
    if (!username || !pin) {
      throw new Error('Username and PIN are required');
    }

    const cleanUsername = username.trim();
    const finalDisplayName = (displayName || username).trim();

    const users = await getUsers();
    if (users.find(u => (u.username || u.displayName) === cleanUsername)) {
      throw new Error('A user with this username already exists. Please log in or use a different username.');
    }

    const uid = generateUid();
    const grade = parseInt(gradeLevel || '1', 10);

    const newUser: StoredUser = {
      uid,
      username: cleanUsername,
      displayName: finalDisplayName,
      gradeLevel: grade,
      pin,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    const user: AuthUser = { uid, username: cleanUsername, displayName: finalDisplayName, gradeLevel: grade };
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

  async updateUser(uid: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.uid === uid);
    
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    const user = users[userIndex];
    const { displayName = user.displayName, gradeLevel = user.gradeLevel } = updates;
    const newName = displayName.trim();

    users[userIndex] = { ...user, displayName: newName, gradeLevel };
    await saveUsers(users);

    const updatedUser: AuthUser = { 
      uid, 
      username: user.username || user.displayName, 
      displayName: newName, 
      gradeLevel 
    };

    const currentSession = await AsyncStorage.getItem(SESSION_KEY);
    if (currentSession) {
      try {
        const currentUser: AuthUser = JSON.parse(currentSession);
        if (currentUser.uid === uid) {
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
          notifyListeners(updatedUser);
        }
      } catch {}
    }

    return updatedUser;
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    listeners.add(callback);
    asyncStorageAuth.getCurrentUser().then(callback);
    return () => { listeners.delete(callback); };
  },
};
