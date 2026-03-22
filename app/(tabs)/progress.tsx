import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { useAppContext, getProgress } from '@/lib/AppContext';
import { getStarMilestones } from '@/lib/learning';
import { WORD_BANK } from '@/lib/wordBank';
import { useProvider } from '@/lib/providers/ProviderContext';

export default function ProgressScreen() {
  const { state } = useAppContext();
  const { auth } = useProvider();
  const router = useRouter();
  const progress = getProgress(state.learningState);
  const milestones = getStarMilestones(progress.totalStars);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get word details with familiarity
  const wordProgress = Object.entries(state.learningState.userWords).map(([wordId, userWord]) => {
    const word = WORD_BANK.find(w => w.id === wordId) || state.allWords.find(w => w.id === wordId);
    return {
      ...userWord,
      word: word?.text || 'Unknown',
      definition: word?.definition || '',
    };
  });

  const mastered = wordProgress.filter(w => w.familiarity >= 4).sort((a, b) => b.familiarity - a.familiarity);
  const learning = wordProgress.filter(w => w.familiarity >= 1 && w.familiarity < 4).sort((a, b) => b.familiarity - a.familiarity);
  const notStarted = wordProgress.filter(w => w.familiarity === 0);

  const renderFamiliarityBar = (familiarity: number) => {
    const dots = [];
    for (let i = 0; i < 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.familiarityDot,
            i < familiarity && styles.familiarityDotFilled,
            i < familiarity && familiarity >= 4 && styles.familiarityDotMastered,
          ]}
        />
      );
    }
    return <View style={styles.familiarityBar}>{dots}</View>;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Overall progress */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Your Progress</Text>

          <View style={styles.ringContainer}>
            <View style={styles.ring}>
              <Text style={styles.ringPercent}>{progress.masteryPercent}%</Text>
              <Text style={styles.ringLabel}>Mastered</Text>
            </View>
          </View>

          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{progress.totalStars}</Text>
              <Text style={styles.overviewStatLabel}>⭐ Stars</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{progress.storiesRead}</Text>
              <Text style={styles.overviewStatLabel}>📚 Stories</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{progress.total}</Text>
              <Text style={styles.overviewStatLabel}>📝 Words</Text>
            </View>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Milestones</Text>
          <View style={styles.milestonesList}>
            {milestones.map((milestone, index) => (
              <View
                key={index}
                style={[
                  styles.milestoneItem,
                  milestone.unlocked && styles.milestoneUnlocked,
                ]}
              >
                <Text style={[styles.milestoneBadge, !milestone.unlocked && styles.milestoneLocked]}>
                  {milestone.unlocked ? milestone.label.split(' ')[0] : '🔒'}
                </Text>
                <View style={styles.milestoneInfo}>
                  <Text style={[styles.milestoneName, !milestone.unlocked && styles.milestoneNameLocked]}>
                    {milestone.label}
                  </Text>
                  <Text style={styles.milestoneStars}>
                    {milestone.stars} stars
                  </Text>
                </View>
                {milestone.unlocked && (
                  <Text style={styles.milestoneCheck}>✅</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Words by status */}
        {mastered.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Mastered ({mastered.length})</Text>
            {mastered.map((w, i) => (
              <View key={i} style={styles.wordRow}>
                <View style={styles.wordInfo}>
                  <Text style={styles.wordText}>{w.word}</Text>
                  <Text style={styles.wordDef} numberOfLines={1}>{w.definition}</Text>
                </View>
                {renderFamiliarityBar(w.familiarity)}
              </View>
            ))}
          </View>
        )}

        {learning.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Learning ({learning.length})</Text>
            {learning.map((w, i) => (
              <View key={i} style={styles.wordRow}>
                <View style={styles.wordInfo}>
                  <Text style={styles.wordText}>{w.word}</Text>
                  <Text style={styles.wordDef} numberOfLines={1}>{w.definition}</Text>
                </View>
                {renderFamiliarityBar(w.familiarity)}
              </View>
            ))}
          </View>
        )}

        {notStarted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Not Started ({notStarted.length})</Text>
            {notStarted.slice(0, 10).map((w, i) => (
              <View key={i} style={styles.wordRow}>
                <View style={styles.wordInfo}>
                  <Text style={[styles.wordText, styles.wordTextMuted]}>{w.word}</Text>
                  <Text style={styles.wordDef} numberOfLines={1}>{w.definition}</Text>
                </View>
                {renderFamiliarityBar(w.familiarity)}
              </View>
            ))}
            {notStarted.length > 10 && (
              <Text style={styles.moreText}>
                + {notStarted.length - 10} more words to discover
              </Text>
            )}
          </View>
        )}


      </Animated.View>
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
  overviewCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  ringContainer: {
    marginBottom: 20,
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceElevated,
  },
  ringPercent: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.primary,
  },
  ringLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStat: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  overviewStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  overviewStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: AppColors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  milestonesList: {
    gap: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  milestoneUnlocked: {
    backgroundColor: AppColors.sunshineLight,
    borderColor: AppColors.sunshine,
  },
  milestoneBadge: {
    fontSize: 24,
    marginRight: 12,
  },
  milestoneLocked: {
    opacity: 0.5,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  milestoneNameLocked: {
    color: AppColors.textLight,
  },
  milestoneStars: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  milestoneCheck: {
    fontSize: 18,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  wordInfo: {
    flex: 1,
    marginRight: 12,
  },
  wordText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  wordTextMuted: {
    color: AppColors.textLight,
  },
  wordDef: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  familiarityBar: {
    flexDirection: 'row',
    gap: 4,
  },
  familiarityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.surfaceElevated,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  familiarityDotFilled: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  familiarityDotMastered: {
    backgroundColor: AppColors.success,
    borderColor: AppColors.success,
  },
  moreText: {
    fontSize: 14,
    color: AppColors.textLight,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
