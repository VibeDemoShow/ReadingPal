import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { AppColors } from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useProvider } from '@/lib/providers/ProviderContext';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { auth } = useProvider();
  const router = useRouter();

  const handleLogout = () => {
    const doLogout = async () => {
      await auth.logout();
      router.replace('/login' as any);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        doLogout();
      }
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textLight,
        tabBarStyle: {
          backgroundColor: AppColors.surface,
          borderTopWidth: 1,
          borderTopColor: AppColors.border,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: AppColors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: AppColors.border,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: AppColors.textPrimary,
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: '🌟 ReadingPal',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          title: 'Read',
          headerTitle: '📖 Story Time',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          headerTitle: '🧩 Vocabulary Quiz',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧩" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: '📊 My Progress',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Log Out',
          tabBarIcon: () => <TabIcon emoji="🚪" focused={false} />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            color: AppColors.error,
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={handleLogout}
              style={props.style as any}
              accessibilityRole="button"
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tabIconFocused: {
    backgroundColor: AppColors.surfaceElevated,
  },
  tabEmoji: {
    fontSize: 20,
  },
});
