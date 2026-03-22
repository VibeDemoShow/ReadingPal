// SQLite-based local storage provider
import * as SQLite from 'expo-sqlite';
import { StorageProvider, UserProfile } from '../types';
import { LearningState, initLearningState } from '../../learning';
import { Story } from '../../ai';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('readingpal.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles (
        uid TEXT PRIMARY KEY,
        displayName TEXT NOT NULL,
        gradeLevel INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS learning_states (
        uid TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        uid TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_stories_uid ON stories(uid);
    `);
  }
  return db;
}

export const sqliteStorage: StorageProvider = {
  // Profile
  async saveProfile(uid: string, profile: UserProfile): Promise<void> {
    const database = await getDb();
    await database.runAsync(
      `INSERT OR REPLACE INTO profiles (uid, displayName, gradeLevel, createdAt) VALUES (?, ?, ?, ?)`,
      [uid, profile.displayName, profile.gradeLevel, profile.createdAt]
    );
  },

  async loadProfile(uid: string): Promise<UserProfile | null> {
    const database = await getDb();
    const row = await database.getFirstAsync<{
      displayName: string;
      gradeLevel: number;
      createdAt: string;
    }>('SELECT displayName, gradeLevel, createdAt FROM profiles WHERE uid = ?', [uid]);

    if (!row) return null;
    return {
      displayName: row.displayName,
      gradeLevel: row.gradeLevel,
      createdAt: row.createdAt,
    };
  },

  // Learning state
  async saveLearningState(uid: string, state: LearningState): Promise<void> {
    const database = await getDb();
    await database.runAsync(
      `INSERT OR REPLACE INTO learning_states (uid, data) VALUES (?, ?)`,
      [uid, JSON.stringify(state)]
    );
  },

  async loadLearningState(uid: string, gradeLevel: number): Promise<LearningState> {
    const database = await getDb();
    const row = await database.getFirstAsync<{ data: string }>(
      'SELECT data FROM learning_states WHERE uid = ?',
      [uid]
    );

    if (row) {
      try {
        return JSON.parse(row.data) as LearningState;
      } catch {
        // Corrupted data, reinitialize
      }
    }
    return initLearningState(gradeLevel);
  },

  // Stories
  async saveStories(uid: string, stories: Story[]): Promise<void> {
    const database = await getDb();
    // Delete existing stories for user and re-insert
    await database.runAsync('DELETE FROM stories WHERE uid = ?', [uid]);
    for (const story of stories) {
      await database.runAsync(
        `INSERT INTO stories (id, uid, data, createdAt) VALUES (?, ?, ?, ?)`,
        [story.id, uid, JSON.stringify(story), story.createdAt]
      );
    }
  },

  async loadStories(uid: string): Promise<Story[]> {
    const database = await getDb();
    const rows = await database.getAllAsync<{ data: string }>(
      'SELECT data FROM stories WHERE uid = ? ORDER BY createdAt DESC',
      [uid]
    );
    return rows.map(row => JSON.parse(row.data) as Story);
  },

  async addStory(uid: string, story: Story): Promise<void> {
    const database = await getDb();
    await database.runAsync(
      `INSERT OR REPLACE INTO stories (id, uid, data, createdAt) VALUES (?, ?, ?, ?)`,
      [story.id, uid, JSON.stringify(story), story.createdAt]
    );

    // Keep only last 50 stories per user
    await database.runAsync(
      `DELETE FROM stories WHERE uid = ? AND id NOT IN (
        SELECT id FROM stories WHERE uid = ? ORDER BY createdAt DESC LIMIT 50
      )`,
      [uid, uid]
    );
  },

  // Cleanup
  async clearAllData(uid: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM profiles WHERE uid = ?', [uid]);
    await database.runAsync('DELETE FROM learning_states WHERE uid = ?', [uid]);
    await database.runAsync('DELETE FROM stories WHERE uid = ?', [uid]);
  },
};
