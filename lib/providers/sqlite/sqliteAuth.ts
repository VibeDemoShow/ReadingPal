// SQLite-based local authentication provider
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, AuthUser } from '../types';

const SESSION_KEY = 'reading_app_current_user';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('readingpal.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        displayName TEXT NOT NULL,
        gradeLevel INTEGER NOT NULL DEFAULT 1,
        pin TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  }
  return db;
}

// Simple uid generator
function generateUid(): string {
  return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

// Listeners for auth state changes
type AuthListener = (user: AuthUser | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: AuthUser | null) {
  listeners.forEach(cb => cb(user));
}

export const sqliteAuth: AuthProvider = {
  async login(credentials: Record<string, string>): Promise<AuthUser> {
    const { name, pin } = credentials;
    if (!name || !pin) {
      throw new Error('Name and PIN are required');
    }

    const database = await getDb();
    const row = await database.getFirstAsync<{
      uid: string;
      displayName: string;
      gradeLevel: number;
      pin: string;
    }>(
      'SELECT uid, displayName, gradeLevel, pin FROM users WHERE displayName = ?',
      [name.trim()]
    );

    if (!row) {
      throw new Error('User not found. Please sign up first.');
    }

    if (row.pin !== pin) {
      throw new Error('Incorrect PIN. Please try again.');
    }

    const user: AuthUser = {
      uid: row.uid,
      displayName: row.displayName,
      gradeLevel: row.gradeLevel,
    };

    // Persist session
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    notifyListeners(user);
    return user;
  },

  async signup(credentials: Record<string, string>): Promise<AuthUser> {
    const { name, gradeLevel, pin } = credentials;
    if (!name || !pin) {
      throw new Error('Name and PIN are required');
    }

    const database = await getDb();

    // Check if name already exists
    const existing = await database.getFirstAsync<{ uid: string }>(
      'SELECT uid FROM users WHERE displayName = ?',
      [name.trim()]
    );
    if (existing) {
      throw new Error('A user with this name already exists. Please log in or use a different name.');
    }

    const uid = generateUid();
    const grade = parseInt(gradeLevel || '1', 10);
    const createdAt = new Date().toISOString();

    await database.runAsync(
      'INSERT INTO users (uid, displayName, gradeLevel, pin, createdAt) VALUES (?, ?, ?, ?, ?)',
      [uid, name.trim(), grade, pin, createdAt]
    );

    const user: AuthUser = {
      uid,
      displayName: name.trim(),
      gradeLevel: grade,
    };

    // Persist session
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
      const user: AuthUser = JSON.parse(data);
      // Verify user still exists in DB
      const database = await getDb();
      const row = await database.getFirstAsync<{ uid: string }>(
        'SELECT uid FROM users WHERE uid = ?',
        [user.uid]
      );
      if (!row) {
        await AsyncStorage.removeItem(SESSION_KEY);
        return null;
      }
      return user;
    } catch {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    listeners.add(callback);
    // Emit current state immediately
    sqliteAuth.getCurrentUser().then(callback);
    return () => {
      listeners.delete(callback);
    };
  },
};
