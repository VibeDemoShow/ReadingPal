import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { useAppContext } from '@/lib/AppContext';

const { width } = Dimensions.get('window');

interface QuizResult {
  wordId: string;
  word: string;
  correct: boolean;
  correctAnswer: string;
}

export default function QuizScreen() {
  const { state, dispatch, saveState } = useAppContext();
  const router = useRouter();
  const story = state.currentStory;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion]);

  const questions = story?.quizQuestions || [];
  const question = questions[currentQuestion];
  const totalQuestions = questions.length;

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const isCorrect = answerIndex === question.correctIndex;

    // Update familiarity
    dispatch({ type: 'ANSWER_QUIZ', wordId: question.wordId, correct: isCorrect });

    if (isCorrect) {
      setStarsEarned(prev => prev + 1);
      // Star animation
      Animated.sequence([
        Animated.timing(starAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(starAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    // Show feedback animation
    Animated.timing(feedbackAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setResults(prev => [
      ...prev,
      {
        wordId: question.wordId,
        word: question.word,
        correct: isCorrect,
        correctAnswer: question.options[question.correctIndex],
      },
    ]);

    // Auto-proceed after delay
    setTimeout(async () => {
      if (currentQuestion < totalQuestions - 1) {
        scaleAnim.setValue(0);
        feedbackAnim.setValue(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setCurrentQuestion(prev => prev + 1);
      } else {
        await saveState();
        setQuizComplete(true);
      }
    }, isCorrect ? 1200 : 2500);
  };

  if (!story || questions.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyIcon}>🧩</Text>
        <Text style={styles.emptyTitle}>No Quiz Available</Text>
        <Text style={styles.emptyText}>
          Read a story first, then come back to take the quiz!
        </Text>
      </View>
    );
  }

  if (quizComplete) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContent}>
        <Text style={styles.resultsEmoji}>
          {starsEarned === totalQuestions ? '🎉' : starsEarned > 0 ? '🌟' : '💪'}
        </Text>
        <Text style={styles.resultsTitle}>
          {starsEarned === totalQuestions
            ? 'Perfect Score!'
            : starsEarned > 0
            ? 'Great Job!'
            : 'Great Try!'}
        </Text>

        <View style={styles.starsEarnedCard}>
          <Text style={styles.starsEarnedIcon}>⭐</Text>
          <Text style={styles.starsEarnedCount}>+{starsEarned}</Text>
          <Text style={styles.starsEarnedLabel}>Stars Earned</Text>
        </View>

        <Text style={styles.resultsSubtitle}>
          {starsEarned}/{totalQuestions} correct
        </Text>

        <Text style={styles.encouragement}>
          {starsEarned === totalQuestions
            ? "You're a word master! 🏆"
            : starsEarned > totalQuestions / 2
            ? 'You\'re doing great! Keep reading! 📚'
            : 'Let\'s read another story to practice these words! 📖'}
        </Text>

        {/* Results breakdown */}
        <View style={styles.resultsList}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultEmoji}>{result.correct ? '✅' : '📝'}</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultWord}>{result.word}</Text>
                {!result.correct && (
                  <Text style={styles.resultCorrectAnswer}>
                    Answer: {result.correctAnswer}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.resultsButtons}>
          <TouchableOpacity
            style={styles.newStoryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.newStoryText}>📖 Read Another Story</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <Text style={styles.progressText}>📊 View Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestion + 1) / totalQuestions) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.questionCount}>
          Question {currentQuestion + 1} of {totalQuestions}
        </Text>

        {/* Stars earned so far */}
        <Animated.View style={[styles.starsBadge, { transform: [{ scale: starAnim.interpolate({ inputRange: [0, 1, 1.3], outputRange: [1, 1, 1.3] }) }] }]}>
          <Text style={styles.starsBadgeText}>⭐ {starsEarned}</Text>
        </Animated.View>

        {/* Question */}
        <Animated.View style={[styles.questionCard, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.questionEmoji}>🤔</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            let optionStyle = styles.option;
            let textStyle = styles.optionText;

            if (showFeedback) {
              if (index === question.correctIndex) {
                optionStyle = { ...styles.option, ...styles.optionCorrect };
                textStyle = { ...styles.optionText, ...styles.optionTextCorrect };
              } else if (index === selectedAnswer && index !== question.correctIndex) {
                optionStyle = { ...styles.option, ...styles.optionWrong };
                textStyle = { ...styles.optionText, ...styles.optionTextWrong };
              }
            } else if (index === selectedAnswer) {
              optionStyle = { ...styles.option, ...styles.optionSelected };
            }

            return (
              <TouchableOpacity
                key={index}
                style={[optionStyle]}
                onPress={() => handleAnswer(index)}
                disabled={showFeedback}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={[textStyle]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback message */}
        {showFeedback && (
          <Animated.View style={[styles.feedbackCard, { opacity: feedbackAnim }]}>
            {selectedAnswer === question.correctIndex ? (
              <>
                <Text style={styles.feedbackEmoji}>🌟</Text>
                <Text style={styles.feedbackCorrect}>Awesome! You got it! +1 ⭐</Text>
              </>
            ) : (
              <>
                <Text style={styles.feedbackEmoji}>💡</Text>
                <Text style={styles.feedbackWrong}>
                  The answer is: {question.options[question.correctIndex]}
                </Text>
                <Text style={styles.feedbackEncourage}>
                  You'll see this word again in your next story!
                </Text>
              </>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 16, color: AppColors.textSecondary, textAlign: 'center', lineHeight: 24 },

  progressBar: {
    height: 8,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  questionCount: {
    fontSize: 14,
    color: AppColors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsBadge: {
    alignSelf: 'center',
    backgroundColor: AppColors.sunshineLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  starsBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  questionCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  questionEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  optionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.surfaceElevated,
  },
  optionCorrect: {
    borderColor: AppColors.success,
    backgroundColor: AppColors.successLight,
  },
  optionWrong: {
    borderColor: AppColors.error,
    backgroundColor: AppColors.errorLight,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.surfaceElevated,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
    marginRight: 14,
    overflow: 'hidden',
  },
  optionText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  optionTextCorrect: {
    fontWeight: '600',
  },
  optionTextWrong: {
    color: AppColors.textSecondary,
  },
  feedbackCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  feedbackEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  feedbackCorrect: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.success,
    textAlign: 'center',
  },
  feedbackWrong: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  feedbackEncourage: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Results
  resultsContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  resultsEmoji: {
    fontSize: 72,
    marginBottom: 8,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  starsEarnedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.sunshineLight,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  starsEarnedIcon: { fontSize: 28 },
  starsEarnedCount: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary },
  starsEarnedLabel: { fontSize: 16, color: AppColors.textSecondary },
  resultsSubtitle: {
    fontSize: 18,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  encouragement: {
    fontSize: 16,
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  resultsList: {
    width: '100%',
    marginBottom: 24,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  resultEmoji: { fontSize: 20, marginRight: 12 },
  resultInfo: { flex: 1 },
  resultWord: { fontSize: 16, fontWeight: '600', color: AppColors.textPrimary },
  resultCorrectAnswer: { fontSize: 13, color: AppColors.textSecondary, marginTop: 2 },
  resultsButtons: {
    width: '100%',
    gap: 12,
  },
  newStoryButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  newStoryText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  progressButton: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  progressText: { fontSize: 17, fontWeight: '700', color: AppColors.primary },
});
