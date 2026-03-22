import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, Text, View, StyleSheet } from 'react-native';

import { AppColors } from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
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
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: '👤 My Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
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
