// Global app state context
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { LearningState, initLearningState, updateFamiliarity, markStoryRead, getProgress } from './learning';
import { Story } from './ai';
import { UserProfile, loadProfile, saveProfile, loadLearningState, saveLearningState, loadStories, saveStories, addStory } from './storage';
import { getWordsForGrade, Word } from './wordBank';

interface AppState {
  profile: UserProfile | null;
  learningState: LearningState;
  stories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  allWords: Word[];
}

type Action =
  | { type: 'SET_PROFILE'; profile: UserProfile }
  | { type: 'SET_LEARNING_STATE'; state: LearningState }
  | { type: 'SET_STORIES'; stories: Story[] }
  | { type: 'SET_CURRENT_STORY'; story: Story | null }
  | { type: 'ADD_STORY'; story: Story }
  | { type: 'ANSWER_QUIZ'; wordId: string; correct: boolean }
  | { type: 'MARK_STORY_READ'; wordIds: string[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_WORDS'; words: Word[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
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
    default:
      return state;
  }
}

const initialState: AppState = {
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

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        const profile = await loadProfile();
        const gradeLevel = profile?.gradeLevel ?? 1;
        const learningState = await loadLearningState(gradeLevel);
        const stories = await loadStories();
        const words = getWordsForGrade(gradeLevel);

        if (profile) dispatch({ type: 'SET_PROFILE', profile });
        dispatch({ type: 'SET_LEARNING_STATE', state: learningState });
        dispatch({ type: 'SET_STORIES', stories });
        dispatch({ type: 'SET_WORDS', words });
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    })();
  }, []);

  // Auto-save when learning state changes
  const saveState = async () => {
    try {
      await saveLearningState(state.learningState);
      if (state.profile) await saveProfile(state.profile);
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
