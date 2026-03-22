import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { useAppContext } from '@/lib/AppContext';
import { useProvider } from '@/lib/providers/ProviderContext';
import { getGradeLabel } from '@/lib/wordBank';

export default function ProfileScreen() {
  const { state, dispatch } = useAppContext();
  const { auth, storage } = useProvider();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state with current user
  useEffect(() => {
    if (state.user) {
      setDisplayName(state.user.displayName);
      setGradeLevel(state.user.gradeLevel);
    }
  }, [state.user]);

  const handleSave = async () => {
    if (!state.user) return;
    if (!displayName.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');
      await auth.updateUser(state.user.uid, {
        displayName: displayName.trim(),
        gradeLevel,
      });

      if (state.profile) {
        const updatedProfile = {
          ...state.profile,
          displayName: displayName.trim(),
          gradeLevel: gradeLevel
        };
        await storage.saveProfile(state.user.uid, updatedProfile);
        dispatch({ type: 'SET_PROFILE', profile: updatedProfile });
      }

      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        alert('Profile updated successfully!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    const doLogout = async () => {
      await auth.logout();
      setTimeout(() => {
        router.replace('/login' as any);
      }, 100);
    };

    if (Platform.OS === 'web') {
      doLogout();
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Edit Profile Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Edit Profile</Text>
        
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {state.user?.username && (
          <>
            <Text style={styles.label}>Username</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.disabledText}>{state.user.username}</Text>
            </View>
          </>
        )}

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
        />

        <Text style={styles.label}>Grade Level</Text>
        <View style={styles.gradeContainer}>
          {[0, 1, 2, 3, 4, 5].map((grade) => (
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

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Settings Section (Placeholder) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Text style={styles.settingValue}>On</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Data Sync</Text>
          <Text style={styles.settingValue}>Wi-Fi Only</Text>
        </View>
        <Text style={styles.comingSoon}>More settings coming soon!</Text>
      </View>

      {/* Switch User / Log Out Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Switch User / Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.logoutHint}>
          Logged in as {state.user?.displayName || 'Guest'}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.textPrimary,
    marginBottom: 20,
  },
  inputDisabled: {
    backgroundColor: AppColors.surfaceElevated,
    borderColor: 'transparent',
  },
  disabledText: {
    color: AppColors.textLight,
    fontSize: 16,
  },
  gradeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  gradeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceElevated,
    alignItems: 'center',
  },
  gradeButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: '#E6F4FE', // Very light primary
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  gradeButtonTextActive: {
    color: AppColors.primary,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: AppColors.error,
    marginBottom: 16,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: AppColors.textPrimary,
  },
  settingValue: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  comingSoon: {
    marginTop: 16,
    fontSize: 14,
    color: AppColors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logoutSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: AppColors.error,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    shadowColor: AppColors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutHint: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 10,
  },
});
