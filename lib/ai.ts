// AI Story Generation using Gemini API
// For now, includes mock story generation for development
import { Word, STORY_CONFIG } from './wordBank';

export interface QuizQuestion {
  wordId: string;
  word: string;
  type: 'definition' | 'fill-in-blank' | 'sentence-usage';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  targetWords: Word[];
  quizQuestions: QuizQuestion[];
  illustrationUrl?: string;
  createdAt: string;
}

// Gemini API configuration
// Set your API key here or via environment variable
let GEMINI_API_KEY = '';

export function setGeminiApiKey(key: string) {
  GEMINI_API_KEY = key;
}

// Generate a story using Gemini API
export async function generateStory(
  targetWords: Word[],
  gradeLevel: number
): Promise<Story> {
  const config = STORY_CONFIG[gradeLevel] || STORY_CONFIG[2];

  if (GEMINI_API_KEY) {
    try {
      return await generateWithGemini(targetWords, gradeLevel, config);
    } catch (error) {
      console.warn('Gemini API failed, using mock story:', error);
      return generateMockStory(targetWords, gradeLevel);
    }
  }

  // Fallback to mock stories for development
  return generateMockStory(targetWords, gradeLevel);
}

async function generateWithGemini(
  targetWords: Word[],
  gradeLevel: number,
  config: { minWords: number; maxWords: number }
): Promise<Story> {
  const wordList = targetWords.map(w => `"${w.text}" (meaning: ${w.definition})`).join(', ');
  const gradeLabel = gradeLevel === 0 ? 'kindergarten' : `grade ${gradeLevel}`;

  const prompt = `You are a children's story writer. Write a fun, engaging story for a ${gradeLabel} student.

The story MUST naturally include ALL of these vocabulary words: ${wordList}

Requirements:
- Keep the story between ${config.minWords} and ${config.maxWords} words
- Use simple, age-appropriate sentences for ${gradeLabel}
- Make the story fun and imaginative
- The vocabulary words should feel natural in context, not forced

Also generate ${targetWords.length} quiz questions to test the vocabulary words. For each word, create a multiple-choice question with 4 options.

Respond ONLY with valid JSON in this exact format:
{
  "title": "Story Title",
  "content": "The full story text...",
  "quizQuestions": [
    {
      "word": "vocabulary_word",
      "type": "definition",
      "question": "What does 'vocabulary_word' mean?",
      "options": ["correct answer", "wrong 1", "wrong 2", "wrong 3"],
      "correctIndex": 0
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('No response from Gemini');

  const parsed = JSON.parse(text);

  return {
    id: `story_${Date.now()}`,
    title: parsed.title,
    content: parsed.content,
    targetWords,
    quizQuestions: parsed.quizQuestions.map((q: any, i: number) => ({
      wordId: targetWords[i]?.id || `unknown_${i}`,
      word: q.word,
      type: q.type || 'definition',
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    })),
    createdAt: new Date().toISOString(),
  };
}

// Mock story generator for development (no API key needed)
function generateMockStory(targetWords: Word[], gradeLevel: number): Story {
  const stories = getMockStories(targetWords, gradeLevel);
  const story = stories[Math.floor(Math.random() * stories.length)];

  const quizQuestions: QuizQuestion[] = targetWords.map(word => ({
    wordId: word.id,
    word: word.text,
    type: 'definition' as const,
    question: `What does "${word.text}" mean?`,
    options: shuffleWithCorrect(
      word.definition,
      getDistractors(word, targetWords)
    ),
    correctIndex: 0, // Will be set by shuffleWithCorrect
  }));

  // Fix correctIndex after shuffle
  quizQuestions.forEach(q => {
    const correctAnswer = targetWords.find(w => w.id === q.wordId)?.definition || '';
    q.correctIndex = q.options.indexOf(correctAnswer);
  });

  return {
    id: `story_${Date.now()}`,
    ...story,
    targetWords,
    quizQuestions,
    createdAt: new Date().toISOString(),
  };
}

function getMockStories(words: Word[], gradeLevel: number): { title: string; content: string }[] {
  const wordTexts = words.map(w => w.text);

  // Build stories that naturally incorporate the target words
  if (gradeLevel <= 1) {
    return [
      {
        title: 'A Day at the Park',
        content: `Once upon a time, there was a ${wordTexts[0] || 'happy'} little rabbit named Rosie. Rosie loved to ${wordTexts[1] || 'play'} at the park every day. One sunny morning, she saw her ${wordTexts[2] || 'friend'} Benny the bear. "Let's ${wordTexts[3] || 'run'} to the swings!" said Rosie. They had so much fun together. Benny was always ${wordTexts[0] || 'kind'} and liked to ${wordTexts[1] || 'share'} his snacks. What a wonderful day at the park!`,
      },
      {
        title: 'The Magic Garden',
        content: `In a ${wordTexts[0] || 'special'} garden, flowers could talk! A ${wordTexts[1] || 'little'} daisy said, "I want to ${wordTexts[2] || 'grow'} tall!" The wise old oak tree said, "Be ${wordTexts[3] || 'brave'} and reach for the sun." Every day, the daisy tried to ${wordTexts[1] || 'look'} up at the sky. Soon, it became the most ${wordTexts[0] || 'beautiful'} flower in the garden!`,
      },
    ];
  }

  return [
    {
      title: 'The Explorer\'s Journey',
      content: `Maya was a ${wordTexts[0] || 'curious'} girl who loved going on ${wordTexts[1] || 'adventures'}. One day, she found a ${wordTexts[2] || 'mysterious'} map in her grandmother's attic. "This could lead to ${wordTexts[3] || 'treasure'}!" she said with excitement. Maya decided to be ${wordTexts[4] || 'brave'} and follow the map into the deep forest. Along the way, she had to be ${wordTexts[5] || 'careful'} crossing a ${wordTexts[0] || 'dangerous'} bridge over a rushing river. Finally, she discovered something truly ${wordTexts[1] || 'special'} — a garden full of ${wordTexts[2] || 'beautiful'} butterflies that no one had seen before. Maya felt so ${wordTexts[3] || 'grateful'} for her amazing ${wordTexts[4] || 'journey'}. She couldn't wait to ${wordTexts[5] || 'remember'} this day forever.`,
    },
    {
      title: 'The Friendly Robot',
      content: `In a ${wordTexts[0] || 'bright'} workshop, Professor Lin built a ${wordTexts[1] || 'special'} robot named Zap. Zap was ${wordTexts[2] || 'curious'} about everything and wanted to ${wordTexts[3] || 'discover'} the world. "Can I ${wordTexts[4] || 'help'} people?" Zap asked. The professor smiled. "Of course! But you must be ${wordTexts[5] || 'gentle'} with humans." Zap went on a ${wordTexts[0] || 'fascinating'} walk through town. People were ${wordTexts[1] || 'amazed'} by Zap's ${wordTexts[2] || 'enormous'} smile. Zap learned that the most ${wordTexts[3] || 'important'} thing was being ${wordTexts[4] || 'kind'} to everyone. What a ${wordTexts[5] || 'wonderful'} robot!`,
    },
  ];
}

function getDistractors(word: Word, allWords: Word[]): string[] {
  const otherDefinitions = allWords
    .filter(w => w.id !== word.id)
    .map(w => w.definition);

  // Add some generic wrong answers
  const genericWrong = [
    'To eat something quickly',
    'A type of weather',
    'Something very small and round',
    'To sleep for a long time',
    'Moving in a circle',
    'A color that is very dark',
  ];

  const pool = [...otherDefinitions, ...genericWrong];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function shuffleWithCorrect(correct: string, distractors: string[]): string[] {
  const all = [correct, ...distractors.slice(0, 3)];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}
