// Global app state context — uses generic StorageProvider via ProviderContext
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { LearningState, initLearningState, updateFamiliarity, markStoryRead, getProgress } from './learning';
import { Story } from './ai';
import { UserProfile } from './providers/types';
import { useProvider } from './providers/ProviderContext';
import { getWordsForGrade, Word } from './wordBank';
import { AuthUser } from './providers/types';

interface AppState {
  user: AuthUser | null;
  profile: UserProfile | null;
  learningState: LearningState;
  stories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  allWords: Word[];
}

type Action =
  | { type: 'SET_USER'; user: AuthUser | null }
  | { type: 'SET_PROFILE'; profile: UserProfile }
  | { type: 'SET_LEARNING_STATE'; state: LearningState }
  | { type: 'SET_STORIES'; stories: Story[] }
  | { type: 'SET_CURRENT_STORY'; story: Story | null }
  | { type: 'ADD_STORY'; story: Story }
  | { type: 'ANSWER_QUIZ'; wordId: string; correct: boolean }
  | { type: 'MARK_STORY_READ'; wordIds: string[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_WORDS'; words: Word[] }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_LEARNING_STATE':
      return { ...state, learningState: action.state };
    case 'SET_STORIES':
      return { ...state, stories: action.stories };
    case 'SET_CURRENT_STORY':
      return { ...state, currentStory: action.story };
    case 'ADD_STORY':
      return { ...state, stories: [action.story, ...state.stories], currentStory: action.story };
    case 'ANSWER_QUIZ': {
      const newState = updateFamiliarity(state.learningState, action.wordId, action.correct);
      return { ...state, learningState: newState };
    }
    case 'MARK_STORY_READ': {
      const newState = markStoryRead(state.learningState, action.wordIds);
      return { ...state, learningState: newState };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_WORDS':
      return { ...state, allWords: action.words };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const initialState: AppState = {
  user: null,
  profile: null,
  learningState: initLearningState(1),
  stories: [],
  currentStory: null,
  isLoading: true,
  allWords: [],
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  saveState: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
  saveState: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { auth, storage } = useProvider();

  // Listen for auth state changes and load user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      dispatch({ type: 'SET_USER', user });

      if (user) {
        try {
          const gradeLevel = user.gradeLevel ?? 1;
          const profile = await storage.loadProfile(user.uid);
          const learningState = await storage.loadLearningState(user.uid, gradeLevel);
          const stories = await storage.loadStories(user.uid);
          const words = getWordsForGrade(gradeLevel);

          if (profile) {
            dispatch({ type: 'SET_PROFILE', profile });
          } else {
            // Create profile from auth user
            const newProfile: UserProfile = {
              displayName: user.displayName,
              gradeLevel,
              createdAt: new Date().toISOString(),
            };
            await storage.saveProfile(user.uid, newProfile);
            dispatch({ type: 'SET_PROFILE', profile: newProfile });
          }

          dispatch({ type: 'SET_LEARNING_STATE', state: learningState });
          dispatch({ type: 'SET_STORIES', stories });
          dispatch({ type: 'SET_WORDS', words });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        // User logged out — reset state
        dispatch({ type: 'RESET' });
      }

      dispatch({ type: 'SET_LOADING', loading: false });
    });

    return unsubscribe;
  }, [auth, storage]);

  // Save state to storage
  const saveState = async () => {
    if (!state.user) return;
    try {
      await storage.saveLearningState(state.user.uid, state.learningState);
      if (state.profile) {
        await storage.saveProfile(state.user.uid, state.profile);
      }
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, saveState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export { getProgress };
