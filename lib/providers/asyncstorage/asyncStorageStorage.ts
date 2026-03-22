// AsyncStorage-based storage provider — web fallback for SQLite
// All data scoped by uid prefix in AsyncStorage keys
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageProvider, UserProfile } from '../types';
import { LearningState, initLearningState } from '../../learning';
import { Story } from '../../ai';

function key(uid: string, suffix: string): string {
  return `reading_${uid}_${suffix}`;
}

export const asyncStorageStorage: StorageProvider = {
  async saveProfile(uid: string, profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(key(uid, 'profile'), JSON.stringify(profile));
  },

  async loadProfile(uid: string): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(key(uid, 'profile'));
    return data ? JSON.parse(data) : null;
  },

  async saveLearningState(uid: string, state: LearningState): Promise<void> {
    await AsyncStorage.setItem(key(uid, 'learning'), JSON.stringify(state));
  },

  async loadLearningState(uid: string, gradeLevel: number): Promise<LearningState> {
    const data = await AsyncStorage.getItem(key(uid, 'learning'));
    if (data) {
      try {
        return JSON.parse(data) as LearningState;
      } catch { /* fallthrough */ }
    }
    return initLearningState(gradeLevel);
  },

  async saveStories(uid: string, stories: Story[]): Promise<void> {
    await AsyncStorage.setItem(key(uid, 'stories'), JSON.stringify(stories));
  },

  async loadStories(uid: string): Promise<Story[]> {
    const data = await AsyncStorage.getItem(key(uid, 'stories'));
    return data ? JSON.parse(data) : [];
  },

  async addStory(uid: string, story: Story): Promise<void> {
    const stories = await this.loadStories(uid);
    stories.unshift(story);
    if (stories.length > 50) stories.length = 50;
    await this.saveStories(uid, stories);
  },

  async clearAllData(uid: string): Promise<void> {
    await AsyncStorage.multiRemove([
      key(uid, 'profile'),
      key(uid, 'learning'),
      key(uid, 'stories'),
    ]);
  },
};
