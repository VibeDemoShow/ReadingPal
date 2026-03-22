import React, { useState, useEffect } from 'react';
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
import { useAppContext, getProgress } from '@/lib/AppContext';
import { selectTargetWords } from '@/lib/learning';
import { generateStory } from '@/lib/ai';
import { addStory } from '@/lib/storage';
import { saveLearningState } from '@/lib/storage';
import { getStarMilestones } from '@/lib/learning';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, dispatch, saveState } = useAppContext();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [bounceAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  const progress = getProgress(state.learningState);
  const milestones = getStarMilestones(progress.totalStars);
  const nextMilestone = milestones.find(m => !m.unlocked);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleGenerateStory = async () => {
    animateButton();
    setIsGenerating(true);

    try {
      const gradeLevel = state.profile?.gradeLevel ?? 1;
      const targetWords = selectTargetWords(
        state.learningState,
        state.allWords,
        gradeLevel <= 1 ? 4 : gradeLevel <= 3 ? 6 : 7
      );

      const story = await generateStory(targetWords, gradeLevel);

      dispatch({ type: 'ADD_STORY', story });
      dispatch({ type: 'MARK_STORY_READ', wordIds: targetWords.map(w => w.id) });
      await addStory(story);
      await saveState();

      router.push('/(tabs)/read');
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const greetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  const greetingText = () => {
    const hour = new Date().getHours();
    const name = state.profile?.displayName || 'Reader';
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.greetingEmoji}>{greetingEmoji()}</Text>
        <Text style={styles.greeting}>{greetingText()}</Text>
        <Text style={styles.subtitle}>Ready for a reading adventure?</Text>
      </Animated.View>

      {/* Star count */}
      <Animated.View style={[styles.starCard, { opacity: fadeAnim }]}>
        <View style={styles.starRow}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.starCount}>{progress.totalStars}</Text>
          <Text style={styles.starLabel}>Stars Earned</Text>
        </View>
        {nextMilestone && (
          <View style={styles.milestoneHint}>
            <Text style={styles.milestoneText}>
              {progress.totalStars}/{nextMilestone.stars} to {nextMilestone.label}
            </Text>
            <View style={styles.milestoneBar}>
              <View
                style={[
                  styles.milestoneProgress,
                  { width: `${Math.min(100, (progress.totalStars / nextMilestone.stars) * 100)}%` },
                ]}
              />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.storiesRead}</Text>
          <Text style={styles.statLabel}>📚 Stories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.mastered}</Text>
          <Text style={styles.statLabel}>✅ Mastered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.learning}</Text>
          <Text style={styles.statLabel}>📖 Learning</Text>
        </View>
      </View>

      {/* Generate Story Button */}
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerateStory}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.generateIcon}>{isGenerating ? '✨' : '📖'}</Text>
          <Text style={styles.generateText}>
            {isGenerating ? 'Creating your story...' : 'Read a New Story!'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Recent stories */}
      {state.stories.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Stories</Text>
          {state.stories.slice(0, 3).map((story, index) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() => {
                dispatch({ type: 'SET_CURRENT_STORY', story });
                router.push('/(tabs)/read');
              }}
            >
              <Text style={styles.storyCardTitle}>{story.title}</Text>
              <Text style={styles.storyCardPreview} numberOfLines={2}>
                {story.content}
              </Text>
              <Text style={styles.storyCardMeta}>
                {story.targetWords.length} words · {new Date(story.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Setup prompt if no profile */}
      {!state.profile && (
        <View style={styles.setupCard}>
          <Text style={styles.setupIcon}>🎒</Text>
          <Text style={styles.setupTitle}>Welcome to ReadingPal!</Text>
          <Text style={styles.setupText}>
            Tap the button above to start reading your first AI-generated story!
          </Text>
        </View>
      )}
    </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greetingEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  starCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  starCount: {
    fontSize: 36,
    fontWeight: '800',
    color: AppColors.primary,
    marginRight: 8,
  },
  starLabel: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  milestoneHint: {
    marginTop: 12,
  },
  milestoneText: {
    fontSize: 13,
    color: AppColors.textLight,
    marginBottom: 6,
  },
  milestoneBar: {
    height: 8,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  milestoneProgress: {
    height: '100%',
    backgroundColor: AppColors.sunshine,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: AppColors.primaryLight,
  },
  generateIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  generateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  storyCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  storyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  storyCardPreview: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  storyCardMeta: {
    fontSize: 12,
    color: AppColors.textLight,
    marginTop: 8,
  },
  setupCard: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  setupIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 15,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
