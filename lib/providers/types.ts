// Generic provider interfaces for auth and storage
// Implementations: SQLite (local), Supabase (cloud)

import { LearningState } from '../learning';
import { Story } from '../ai';

// Authenticated user identity
export interface AuthUser {
  uid: string;
  username: string;
  displayName: string;
  gradeLevel: number;
}

// User profile stored in the database
export interface UserProfile {
  username: string;
  displayName: string;
  gradeLevel: number;
  createdAt: string;
}

// Authentication provider interface
export interface AuthProvider {
  /**
   * Log in with existing credentials.
   * For SQLite: { name, pin }
   * For Supabase: { email, password }
   */
  login(credentials: Record<string, string>): Promise<AuthUser>;

  /**
   * Create a new account.
   * For SQLite: { name, gradeLevel, pin }
   * For Supabase: { email, password, name, gradeLevel }
   */
  signup(credentials: Record<string, string>): Promise<AuthUser>;

  /** Log out the current user */
  logout(): Promise<void>;

  /** Get the currently logged-in user, or null */
  getCurrentUser(): Promise<AuthUser | null>;

  /** Update current user's profile information (e.g. name, grade) */
  updateUser(uid: string, updates: Partial<AuthUser>): Promise<AuthUser>;

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}

// Data persistence provider interface
// All methods are scoped by uid to support multi-user
export interface StorageProvider {
  // Profile
  saveProfile(uid: string, profile: UserProfile): Promise<void>;
  loadProfile(uid: string): Promise<UserProfile | null>;

  // Learning state (word familiarity, stars, stories read count)
  saveLearningState(uid: string, state: LearningState): Promise<void>;
  loadLearningState(uid: string, gradeLevel: number): Promise<LearningState>;

  // Stories
  saveStories(uid: string, stories: Story[]): Promise<void>;
  loadStories(uid: string): Promise<Story[]>;
  addStory(uid: string, story: Story): Promise<void>;

  // Cleanup
  clearAllData(uid: string): Promise<void>;
}
