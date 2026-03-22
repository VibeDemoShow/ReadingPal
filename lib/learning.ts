// Spaced repetition learning engine
import { Word, UserWord, getWordsForGrade, STORY_CONFIG } from './wordBank';

export interface LearningState {
  userWords: Record<string, UserWord>;
  totalStars: number;
  storiesRead: number;
}

// Initialize learning state for a grade level
export function initLearningState(gradeLevel: number): LearningState {
  const words = getWordsForGrade(gradeLevel);
  const userWords: Record<string, UserWord> = {};

  words.forEach(word => {
    userWords[word.id] = {
      wordId: word.id,
      familiarity: 0,
      lastTested: null,
      timesSeen: 0,
    };
  });

  return {
    userWords,
    totalStars: 0,
    storiesRead: 0,
  };
}

// Select target words for story generation, weighted by inverse familiarity
export function selectTargetWords(
  state: LearningState,
  allWords: Word[],
  count: number
): Word[] {
  const wordWeights = allWords.map(word => {
    const userWord = state.userWords[word.id];
    if (!userWord) return { word, weight: 5 }; // New word, high priority

    // Weight is inverse of familiarity: less familiar = higher weight
    const familiarityWeight = 5 - userWord.familiarity;
    // Bonus weight for words never tested
    const untestedBonus = userWord.lastTested === null ? 2 : 0;
    // Slight time decay — words not seen recently get a small boost
    const weight = Math.max(1, familiarityWeight + untestedBonus);

    return { word, weight };
  });

  // Weighted random selection
  const selected: Word[] = [];
  const remaining = [...wordWeights];

  while (selected.length < count && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < remaining.length; i++) {
      random -= remaining[i].weight;
      if (random <= 0) {
        selected.push(remaining[i].word);
        remaining.splice(i, 1);
        break;
      }
    }
  }

  return selected;
}

// Update familiarity after a quiz answer
export function updateFamiliarity(
  state: LearningState,
  wordId: string,
  correct: boolean
): LearningState {
  const userWord = state.userWords[wordId] || {
    wordId,
    familiarity: 0,
    lastTested: null,
    timesSeen: 0,
  };

  const newFamiliarity = correct
    ? Math.min(5, userWord.familiarity + 1)
    : Math.max(0, userWord.familiarity - 1); // Decrease by 1 instead of full reset

  const newStars = correct ? state.totalStars + 1 : state.totalStars;

  return {
    ...state,
    totalStars: newStars,
    userWords: {
      ...state.userWords,
      [wordId]: {
        ...userWord,
        familiarity: newFamiliarity,
        lastTested: new Date().toISOString(),
        timesSeen: userWord.timesSeen + 1,
      },
    },
  };
}

// Mark a story as read
export function markStoryRead(state: LearningState, targetWordIds: string[]): LearningState {
  const updatedUserWords = { ...state.userWords };

  targetWordIds.forEach(wordId => {
    if (updatedUserWords[wordId]) {
      updatedUserWords[wordId] = {
        ...updatedUserWords[wordId],
        timesSeen: updatedUserWords[wordId].timesSeen + 1,
      };
    }
  });

  return {
    ...state,
    storiesRead: state.storiesRead + 1,
    userWords: updatedUserWords,
  };
}

// Get progress stats
export function getProgress(state: LearningState) {
  const words = Object.values(state.userWords);
  const total = words.length;
  const mastered = words.filter(w => w.familiarity >= 4).length;
  const learning = words.filter(w => w.familiarity >= 1 && w.familiarity < 4).length;
  const notStarted = words.filter(w => w.familiarity === 0).length;

  return {
    total,
    mastered,
    learning,
    notStarted,
    masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
    totalStars: state.totalStars,
    storiesRead: state.storiesRead,
  };
}

// Get star milestones
export function getStarMilestones(totalStars: number) {
  const milestones = [
    { stars: 5, label: '🌟 Reading Starter', unlocked: false },
    { stars: 15, label: '📚 Bookworm', unlocked: false },
    { stars: 30, label: '🦋 Word Explorer', unlocked: false },
    { stars: 50, label: '🚀 Super Reader', unlocked: false },
    { stars: 75, label: '🏆 Reading Champion', unlocked: false },
    { stars: 100, label: '👑 Word Master', unlocked: false },
  ];

  return milestones.map(m => ({
    ...m,
    unlocked: totalStars >= m.stars,
  }));
}
