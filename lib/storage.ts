// Local storage for persisting learning state
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningState, initLearningState } from './learning';
import { Story } from './ai';

const LEARNING_STATE_KEY = 'reading_app_learning_state';
const STORIES_KEY = 'reading_app_stories';
const PROFILE_KEY = 'reading_app_profile';

export interface UserProfile {
  displayName: string;
  gradeLevel: number;
  createdAt: string;
}

// Profile
export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

// Learning state
export async function saveLearningState(state: LearningState): Promise<void> {
  await AsyncStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(state));
}

export async function loadLearningState(gradeLevel: number): Promise<LearningState> {
  const data = await AsyncStorage.getItem(LEARNING_STATE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return initLearningState(gradeLevel);
}

// Stories
export async function saveStories(stories: Story[]): Promise<void> {
  await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export async function loadStories(): Promise<Story[]> {
  const data = await AsyncStorage.getItem(STORIES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addStory(story: Story): Promise<void> {
  const stories = await loadStories();
  stories.unshift(story); // Add to beginning
  // Keep only last 50 stories
  if (stories.length > 50) stories.length = 50;
  await saveStories(stories);
}

// Clear all data (for development/testing)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([LEARNING_STATE_KEY, STORIES_KEY, PROFILE_KEY]);
}
