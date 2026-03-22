import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { useAppContext } from '@/lib/AppContext';

export default function ReadScreen() {
  const { state } = useAppContext();
  const router = useRouter();
  const story = state.currentStory;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.85);
  const [selectedWord, setSelectedWord] = useState<{ text: string; definition: string; example: string } | null>(null);
  const [showWordModal, setShowWordModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [story]);

  const handleSpeak = useCallback(async () => {
    if (!story) return;

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    Speech.speak(story.content, {
      rate: speechRate,
      language: 'en-US',
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  }, [story, isSpeaking, speechRate]);

  const handleWordTap = useCallback((wordText: string) => {
    if (!story) return;
    const targetWord = story.targetWords.find(
      w => w.text.toLowerCase() === wordText.toLowerCase().replace(/[^a-zA-Z]/g, '')
    );
    if (targetWord) {
      setSelectedWord({
        text: targetWord.text,
        definition: targetWord.definition,
        example: targetWord.exampleSentence,
      });
      setShowWordModal(true);
    }
  }, [story]);

  const renderStoryContent = () => {
    if (!story) return null;
    const words = story.content.split(/(\s+)/);
    const targetWordTexts = story.targetWords.map(w => w.text.toLowerCase());

    return (
      <Text style={styles.storyText}>
        {words.map((w, i) => {
          const cleanWord = w.toLowerCase().replace(/[^a-zA-Z]/g, '');
          const isTarget = targetWordTexts.includes(cleanWord);

          if (isTarget) {
            return (
              <Text
                key={i}
                style={styles.highlightedWord}
                onPress={() => handleWordTap(w)}
              >
                {w}
              </Text>
            );
          }
          return <Text key={i}>{w}</Text>;
        })}
      </Text>
    );
  };

  if (!story) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No Story Yet</Text>
        <Text style={styles.emptyText}>
          Go to the Home tab and tap "Read a New Story!" to get started.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Story illustration placeholder */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustrationEmoji}>📖✨</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{story.title}</Text>

          {/* Read-aloud controls */}
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
              onPress={handleSpeak}
            >
              <Text style={styles.speakIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
              <Text style={[styles.speakText, isSpeaking && styles.speakTextActive]}>
                {isSpeaking ? 'Stop' : 'Read Aloud'}
              </Text>
            </TouchableOpacity>

            <View style={styles.speedControls}>
              <Text style={styles.speedLabel}>Speed:</Text>
              {[
                { label: '🐢', value: 0.6 },
                { label: '🚶', value: 0.85 },
                { label: '🏃', value: 1.1 },
              ].map(speed => (
                <TouchableOpacity
                  key={speed.value}
                  style={[
                    styles.speedButton,
                    speechRate === speed.value && styles.speedButtonActive,
                  ]}
                  onPress={() => setSpeechRate(speed.value)}
                >
                  <Text style={styles.speedEmoji}>{speed.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Story content */}
          <View style={styles.storyCard}>
            {renderStoryContent()}
          </View>

          {/* Word list */}
          <View style={styles.wordListSection}>
            <Text style={styles.wordListTitle}>📝 Words to Learn</Text>
            {story.targetWords.map(word => (
              <TouchableOpacity
                key={word.id}
                style={styles.wordChip}
                onPress={() => {
                  setSelectedWord({
                    text: word.text,
                    definition: word.definition,
                    example: word.exampleSentence,
                  });
                  setShowWordModal(true);
                }}
              >
                <Text style={styles.wordChipText}>{word.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Take Quiz button */}
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => router.push('/(tabs)/quiz')}
          >
            <Text style={styles.quizButtonIcon}>🧩</Text>
            <Text style={styles.quizButtonText}>Take the Quiz!</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Word definition modal */}
      <Modal
        visible={showWordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWordModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWordModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalWord}>{selectedWord?.text}</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalLabel}>Meaning:</Text>
            <Text style={styles.modalDefinition}>{selectedWord?.definition}</Text>
            <Text style={styles.modalLabel}>Example:</Text>
            <Text style={styles.modalExample}>"{selectedWord?.example}"</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowWordModal(false)}
            >
              <Text style={styles.modalCloseText}>Got it! 👍</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  illustrationContainer: {
    height: 180,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  speakButtonActive: {
    backgroundColor: AppColors.primary,
  },
  speakIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  speakText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.primary,
  },
  speakTextActive: {
    color: '#fff',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  speedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  speedButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.surfaceElevated,
  },
  speedEmoji: {
    fontSize: 18,
  },
  storyCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 30,
    color: AppColors.textPrimary,
  },
  highlightedWord: {
    backgroundColor: '#FFE88A',
    color: AppColors.primaryDark,
    fontWeight: '700',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  wordListSection: {
    marginBottom: 20,
  },
  wordListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  wordChip: {
    backgroundColor: AppColors.sunshineLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  wordChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  quizButton: {
    backgroundColor: AppColors.sky,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: AppColors.sky,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  quizButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  quizButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  modalWord: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDivider: {
    height: 2,
    backgroundColor: AppColors.border,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalDefinition: {
    fontSize: 17,
    color: AppColors.textPrimary,
    marginBottom: 16,
    lineHeight: 24,
  },
  modalExample: {
    fontSize: 15,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalClose: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
