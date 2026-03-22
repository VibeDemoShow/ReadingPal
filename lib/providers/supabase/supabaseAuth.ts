// Supabase auth provider — stub for future implementation
// Install: npm install @supabase/supabase-js
import { AuthProvider, AuthUser } from '../types';

export const supabaseAuth: AuthProvider = {
  async login(_credentials: Record<string, string>): Promise<AuthUser> {
    // TODO: Implement Supabase email/password login
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: credentials.email,
    //   password: credentials.password,
    // });
    throw new Error('Supabase auth not yet implemented');
  },

  async signup(_credentials: Record<string, string>): Promise<AuthUser> {
    // TODO: Implement Supabase signup
    // const { data, error } = await supabase.auth.signUp({
    //   email: credentials.email,
    //   password: credentials.password,
    //   options: { data: { displayName: credentials.name, gradeLevel: credentials.gradeLevel } },
    // });
    throw new Error('Supabase auth not yet implemented');
  },

  async logout(): Promise<void> {
    // TODO: await supabase.auth.signOut();
    throw new Error('Supabase auth not yet implemented');
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: const { data } = await supabase.auth.getUser();
    return null;
  },

  async updateUser(_uid: string, _updates: Partial<AuthUser>): Promise<AuthUser> {
    // TODO: implement Supabase profile updates
    throw new Error('Supabase auth not yet implemented');
  },

  onAuthStateChanged(_callback: (user: AuthUser | null) => void): () => void {
    // TODO: const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
    return () => {};
  },
};
