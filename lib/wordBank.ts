// Built-in word bank organized by grade level
// Sources: Dolch sight words, Fry word list, Common Core vocabulary

export interface Word {
  id: string;
  text: string;
  definition: string;
  exampleSentence: string;
  gradeLevel: number; // 0 = Kindergarten, 1-5 = grades
}

export interface UserWord {
  wordId: string;
  familiarity: number; // 0-5
  lastTested: string | null;
  timesSeen: number;
}

// Grade-level word bank
export const WORD_BANK: Word[] = [
  // Kindergarten (grade 0)
  { id: 'k1', text: 'big', definition: 'Very large in size', exampleSentence: 'The elephant is very big.', gradeLevel: 0 },
  { id: 'k2', text: 'little', definition: 'Small in size', exampleSentence: 'The mouse is little.', gradeLevel: 0 },
  { id: 'k3', text: 'happy', definition: 'Feeling glad and joyful', exampleSentence: 'She was happy to see her friend.', gradeLevel: 0 },
  { id: 'k4', text: 'sad', definition: 'Feeling unhappy', exampleSentence: 'He was sad when his toy broke.', gradeLevel: 0 },
  { id: 'k5', text: 'run', definition: 'To move your legs quickly', exampleSentence: 'The dog likes to run in the park.', gradeLevel: 0 },
  { id: 'k6', text: 'jump', definition: 'To push yourself up into the air', exampleSentence: 'She can jump very high.', gradeLevel: 0 },
  { id: 'k7', text: 'look', definition: 'To use your eyes to see something', exampleSentence: 'Look at the pretty butterfly!', gradeLevel: 0 },
  { id: 'k8', text: 'play', definition: 'To have fun doing something', exampleSentence: 'The children play in the garden.', gradeLevel: 0 },
  { id: 'k9', text: 'help', definition: 'To do something useful for someone', exampleSentence: 'Can you help me carry this?', gradeLevel: 0 },
  { id: 'k10', text: 'friend', definition: 'A person you like and enjoy being with', exampleSentence: 'My friend and I play together.', gradeLevel: 0 },
  { id: 'k11', text: 'home', definition: 'The place where you live', exampleSentence: 'I love going home after school.', gradeLevel: 0 },
  { id: 'k12', text: 'fast', definition: 'Moving very quickly', exampleSentence: 'The rabbit runs fast.', gradeLevel: 0 },

  // Grade 1
  { id: 'g1_1', text: 'beautiful', definition: 'Very pretty or pleasing to look at', exampleSentence: 'The sunset is beautiful tonight.', gradeLevel: 1 },
  { id: 'g1_2', text: 'kind', definition: 'Being nice and caring to others', exampleSentence: 'She is always kind to everyone.', gradeLevel: 1 },
  { id: 'g1_3', text: 'brave', definition: 'Not afraid; having courage', exampleSentence: 'The brave knight faced the dragon.', gradeLevel: 1 },
  { id: 'g1_4', text: 'quiet', definition: 'Making very little or no sound', exampleSentence: 'The library is a quiet place.', gradeLevel: 1 },
  { id: 'g1_5', text: 'share', definition: 'To give part of something to someone else', exampleSentence: 'Let us share the cookies.', gradeLevel: 1 },
  { id: 'g1_6', text: 'careful', definition: 'Trying to avoid mistakes or danger', exampleSentence: 'Be careful when you cross the street.', gradeLevel: 1 },
  { id: 'g1_7', text: 'bright', definition: 'Giving off a lot of light; shining', exampleSentence: 'The bright sun woke me up.', gradeLevel: 1 },
  { id: 'g1_8', text: 'discover', definition: 'To find or learn something new', exampleSentence: 'I want to discover what is in the box.', gradeLevel: 1 },
  { id: 'g1_9', text: 'imagine', definition: 'To make a picture in your mind', exampleSentence: 'Can you imagine a world made of candy?', gradeLevel: 1 },
  { id: 'g1_10', text: 'special', definition: 'Different from usual; important', exampleSentence: 'Today is a special day.', gradeLevel: 1 },
  { id: 'g1_11', text: 'gentle', definition: 'Soft and careful; not rough', exampleSentence: 'Be gentle with the baby kitten.', gradeLevel: 1 },
  { id: 'g1_12', text: 'enormous', definition: 'Very, very big', exampleSentence: 'The dinosaur was enormous.', gradeLevel: 1 },

  // Grade 2
  { id: 'g2_1', text: 'adventure', definition: 'An exciting experience or journey', exampleSentence: 'We went on an adventure in the forest.', gradeLevel: 2 },
  { id: 'g2_2', text: 'curious', definition: 'Wanting to know or learn about something', exampleSentence: 'The curious cat looked in the box.', gradeLevel: 2 },
  { id: 'g2_3', text: 'dangerous', definition: 'Something that could hurt you', exampleSentence: 'Swimming in the deep ocean can be dangerous.', gradeLevel: 2 },
  { id: 'g2_4', text: 'enormous', definition: 'Very, very big', exampleSentence: 'The whale was enormous!', gradeLevel: 2 },
  { id: 'g2_5', text: 'favorite', definition: 'The one you like the most', exampleSentence: 'Pizza is my favorite food.', gradeLevel: 2 },
  { id: 'g2_6', text: 'grateful', definition: 'Feeling thankful for something', exampleSentence: 'I am grateful for my family.', gradeLevel: 2 },
  { id: 'g2_7', text: 'protect', definition: 'To keep safe from harm', exampleSentence: 'The mother bird protects her babies.', gradeLevel: 2 },
  { id: 'g2_8', text: 'journey', definition: 'A long trip from one place to another', exampleSentence: 'The journey to grandma\'s house took two hours.', gradeLevel: 2 },
  { id: 'g2_9', text: 'weather', definition: 'What it is like outside (sunny, rainy, etc.)', exampleSentence: 'The weather today is warm and sunny.', gradeLevel: 2 },
  { id: 'g2_10', text: 'remember', definition: 'To keep something in your mind', exampleSentence: 'I will remember this happy day.', gradeLevel: 2 },
  { id: 'g2_11', text: 'secret', definition: 'Something that is hidden or not told', exampleSentence: 'She whispered a secret to her friend.', gradeLevel: 2 },
  { id: 'g2_12', text: 'treasure', definition: 'Something very valuable or precious', exampleSentence: 'The pirate found a treasure chest.', gradeLevel: 2 },

  // Grade 3
  { id: 'g3_1', text: 'accomplish', definition: 'To finish something successfully', exampleSentence: 'She worked hard to accomplish her goal.', gradeLevel: 3 },
  { id: 'g3_2', text: 'brilliant', definition: 'Very smart or very bright', exampleSentence: 'She had a brilliant idea for the project.', gradeLevel: 3 },
  { id: 'g3_3', text: 'community', definition: 'A group of people who live in the same area', exampleSentence: 'Our community has a beautiful park.', gradeLevel: 3 },
  { id: 'g3_4', text: 'determined', definition: 'Having made a firm decision to do something', exampleSentence: 'He was determined to finish the race.', gradeLevel: 3 },
  { id: 'g3_5', text: 'ecosystem', definition: 'All living things in an area and how they interact', exampleSentence: 'A pond is a small ecosystem.', gradeLevel: 3 },
  { id: 'g3_6', text: 'fascinate', definition: 'To attract and hold the attention of someone', exampleSentence: 'The magic show fascinated the children.', gradeLevel: 3 },
  { id: 'g3_7', text: 'generous', definition: 'Willing to give and share; not selfish', exampleSentence: 'The generous woman donated food to the shelter.', gradeLevel: 3 },
  { id: 'g3_8', text: 'hesitate', definition: 'To pause before doing something', exampleSentence: 'Don\'t hesitate to ask for help.', gradeLevel: 3 },
  { id: 'g3_9', text: 'invisible', definition: 'Not able to be seen', exampleSentence: 'The wind is invisible but we can feel it.', gradeLevel: 3 },
  { id: 'g3_10', text: 'knowledge', definition: 'What you know; facts and understanding', exampleSentence: 'Reading increases your knowledge.', gradeLevel: 3 },
  { id: 'g3_11', text: 'mysterious', definition: 'Hard to explain or understand', exampleSentence: 'We heard a mysterious sound in the attic.', gradeLevel: 3 },
  { id: 'g3_12', text: 'ordinary', definition: 'Normal; not special or different', exampleSentence: 'It started as an ordinary day.', gradeLevel: 3 },

  // Grade 4
  { id: 'g4_1', text: 'abundant', definition: 'Existing in large amounts; plentiful', exampleSentence: 'The garden had an abundant harvest this year.', gradeLevel: 4 },
  { id: 'g4_2', text: 'cautious', definition: 'Being very careful to avoid danger', exampleSentence: 'She was cautious when walking on the icy sidewalk.', gradeLevel: 4 },
  { id: 'g4_3', text: 'demonstrate', definition: 'To show how something works', exampleSentence: 'The teacher will demonstrate the experiment.', gradeLevel: 4 },
  { id: 'g4_4', text: 'elaborate', definition: 'Having many details; very detailed', exampleSentence: 'She drew an elaborate map of the fantasy world.', gradeLevel: 4 },
  { id: 'g4_5', text: 'fundamental', definition: 'Very basic and important; essential', exampleSentence: 'Reading is a fundamental skill.', gradeLevel: 4 },
  { id: 'g4_6', text: 'independent', definition: 'Able to do things by yourself', exampleSentence: 'The independent girl made her own lunch.', gradeLevel: 4 },
  { id: 'g4_7', text: 'navigate', definition: 'To find your way from one place to another', exampleSentence: 'Birds can navigate across oceans.', gradeLevel: 4 },
  { id: 'g4_8', text: 'perspective', definition: 'A way of thinking about something', exampleSentence: 'Try to see things from a different perspective.', gradeLevel: 4 },
  { id: 'g4_9', text: 'resilient', definition: 'Able to recover quickly from difficulties', exampleSentence: 'The resilient plant grew back after the storm.', gradeLevel: 4 },
  { id: 'g4_10', text: 'significant', definition: 'Important; having a big effect', exampleSentence: 'The discovery was significant for science.', gradeLevel: 4 },
  { id: 'g4_11', text: 'transform', definition: 'To change completely', exampleSentence: 'The caterpillar will transform into a butterfly.', gradeLevel: 4 },
  { id: 'g4_12', text: 'witness', definition: 'To see something happen', exampleSentence: 'We were lucky to witness the rainbow.', gradeLevel: 4 },

  // Grade 5
  { id: 'g5_1', text: 'analyze', definition: 'To study something carefully to understand it', exampleSentence: 'Scientists analyze data to find patterns.', gradeLevel: 5 },
  { id: 'g5_2', text: 'controversy', definition: 'A disagreement or argument about something', exampleSentence: 'The new rule caused some controversy at school.', gradeLevel: 5 },
  { id: 'g5_3', text: 'efficient', definition: 'Working well without wasting time or energy', exampleSentence: 'The efficient machine finished the work quickly.', gradeLevel: 5 },
  { id: 'g5_4', text: 'hypothesis', definition: 'An educated guess that can be tested', exampleSentence: 'Her hypothesis was proven correct by the experiment.', gradeLevel: 5 },
  { id: 'g5_5', text: 'influence', definition: 'The power to change how someone thinks or acts', exampleSentence: 'Teachers have a positive influence on students.', gradeLevel: 5 },
  { id: 'g5_6', text: 'legitimate', definition: 'Real, genuine, or allowed by rules', exampleSentence: 'She had a legitimate reason for being late.', gradeLevel: 5 },
  { id: 'g5_7', text: 'phenomenon', definition: 'Something that happens or exists; an event', exampleSentence: 'The Northern Lights are a natural phenomenon.', gradeLevel: 5 },
  { id: 'g5_8', text: 'substantial', definition: 'Large in size, amount, or importance', exampleSentence: 'She made substantial progress on her project.', gradeLevel: 5 },
  { id: 'g5_9', text: 'unanimous', definition: 'When everyone agrees on something', exampleSentence: 'The vote was unanimous — everyone said yes.', gradeLevel: 5 },
  { id: 'g5_10', text: 'versatile', definition: 'Able to be used in many ways; flexible', exampleSentence: 'A Swiss army knife is a versatile tool.', gradeLevel: 5 },
  { id: 'g5_11', text: 'consequence', definition: 'Something that happens as a result of an action', exampleSentence: 'One consequence of not studying is poor grades.', gradeLevel: 5 },
  { id: 'g5_12', text: 'elaborate', definition: 'To give more details about something', exampleSentence: 'Can you elaborate on your answer?', gradeLevel: 5 },
];

// Get words for a specific grade level (includes that grade and below)
export function getWordsForGrade(gradeLevel: number): Word[] {
  return WORD_BANK.filter(w => w.gradeLevel <= gradeLevel);
}

// Get the grade label
export function getGradeLabel(gradeLevel: number): string {
  if (gradeLevel === 0) return 'Kindergarten';
  return `Grade ${gradeLevel}`;
}

// Story length config by grade
export const STORY_CONFIG: Record<number, { minWords: number; maxWords: number; targetWordCount: number }> = {
  0: { minWords: 50, maxWords: 100, targetWordCount: 4 },
  1: { minWords: 70, maxWords: 120, targetWordCount: 5 },
  2: { minWords: 100, maxWords: 200, targetWordCount: 6 },
  3: { minWords: 150, maxWords: 250, targetWordCount: 7 },
  4: { minWords: 200, maxWords: 300, targetWordCount: 7 },
  5: { minWords: 200, maxWords: 300, targetWordCount: 8 },
};
