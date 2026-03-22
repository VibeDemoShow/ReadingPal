// Supabase storage provider — stub for future implementation
// Data will be stored in Supabase PostgreSQL tables scoped by user ID
import { StorageProvider, UserProfile } from '../types';
import { LearningState, initLearningState } from '../../learning';
import { Story } from '../../ai';

export const supabaseStorage: StorageProvider = {
  async saveProfile(_uid: string, _profile: UserProfile): Promise<void> {
    // TODO: await supabase.from('profiles').upsert({ uid, ...profile });
    throw new Error('Supabase storage not yet implemented');
  },

  async loadProfile(_uid: string): Promise<UserProfile | null> {
    // TODO: const { data } = await supabase.from('profiles').select().eq('uid', uid).single();
    return null;
  },

  async saveLearningState(_uid: string, _state: LearningState): Promise<void> {
    // TODO: await supabase.from('learning_states').upsert({ uid, data: state });
    throw new Error('Supabase storage not yet implemented');
  },

  async loadLearningState(_uid: string, gradeLevel: number): Promise<LearningState> {
    // TODO: const { data } = await supabase.from('learning_states').select().eq('uid', uid).single();
    return initLearningState(gradeLevel);
  },

  async saveStories(_uid: string, _stories: Story[]): Promise<void> {
    // TODO: Batch upsert stories to supabase
    throw new Error('Supabase storage not yet implemented');
  },

  async loadStories(_uid: string): Promise<Story[]> {
    // TODO: const { data } = await supabase.from('stories').select().eq('uid', uid).order('createdAt', { ascending: false });
    return [];
  },

  async addStory(_uid: string, _story: Story): Promise<void> {
    // TODO: await supabase.from('stories').insert({ uid, ...story });
    throw new Error('Supabase storage not yet implemented');
  },

  async clearAllData(_uid: string): Promise<void> {
    // TODO: Delete all user data from all tables
    throw new Error('Supabase storage not yet implemented');
  },
};
