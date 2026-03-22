// Login / Sign Up screen
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AppColors } from '@/constants/Colors';
import { useProvider } from '@/lib/providers/ProviderContext';
import { getGradeLabel } from '@/lib/wordBank';

type Tab = 'login' | 'signup';

export default function LoginScreen() {
  const { auth } = useProvider();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [gradeLevel, setGradeLevel] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await auth.login({ name: name.trim(), pin });
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        if (pin.length < 4) {
          setError('PIN must be at least 4 digits');
          setIsLoading(false);
          return;
        }
        await auth.signup({
          name: name.trim(),
          gradeLevel: gradeLevel.toString(),
          pin,
        });
      }
      // Auth state change will be handled by _layout.tsx
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const grades = [0, 1, 2, 3, 4, 5];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoEmoji}>📚</Text>
            <Text style={styles.title}>ReadingPal</Text>
            <Text style={styles.subtitle}>Your reading adventure awaits!</Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => { setActiveTab('login'); setError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => { setActiveTab('signup'); setError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {/* Name input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={AppColors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* PIN input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 PIN (4+ digits)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your PIN"
                placeholderTextColor={AppColors.textLight}
                value={pin}
                onChangeText={(text) => setPin(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={8}
              />
            </View>

            {/* Grade level (sign up only) */}
            {activeTab === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>🎓 Grade Level</Text>
                <View style={styles.gradeGrid}>
                  {grades.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.gradeButton,
                        gradeLevel === grade && styles.gradeButtonActive,
                      ]}
                      onPress={() => setGradeLevel(grade)}
                    >
                      <Text
                        style={[
                          styles.gradeButtonText,
                          gradeLevel === grade && styles.gradeButtonTextActive,
                        ]}
                      >
                        {getGradeLabel(grade)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Error message */}
            {error !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {activeTab === 'login' ? '🚀 Let\'s Go!' : '🌟 Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer hint */}
          <Text style={styles.footerText}>
            {activeTab === 'login'
              ? "Don't have an account? Tap Sign Up above!"
              : 'Already have an account? Tap Log In above!'}
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: AppColors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceElevated,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  gradeButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  gradeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  gradeButtonTextActive: {
    color: '#fff',
  },
  errorBox: {
    backgroundColor: AppColors.errorLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.error,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: AppColors.primaryLight,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  footerText: {
    fontSize: 14,
    color: AppColors.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
