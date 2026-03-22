// Provider dependency injection context
// Selects backend based on EXPO_PUBLIC_BACKEND env var + platform
import React, { createContext, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import { AuthProvider, StorageProvider } from './types';
import { sqliteAuth, sqliteStorage } from './sqlite';
import { supabaseAuth, supabaseStorage } from './supabase';
import { asyncStorageAuth, asyncStorageStorage } from './asyncstorage';

interface ProviderContextType {
  auth: AuthProvider;
  storage: StorageProvider;
}

// Determine which backend to use based on env var and platform
function getDefaultProviders(): ProviderContextType {
  const backend = process.env.EXPO_PUBLIC_BACKEND || 'sqlite';

  if (backend === 'supabase') {
    return { auth: supabaseAuth, storage: supabaseStorage };
  }

  // backend === 'sqlite'
  // On web, fall back to AsyncStorage since expo-sqlite WASM
  // doesn't work with static export (npx expo export)
  if (Platform.OS === 'web') {
    return { auth: asyncStorageAuth, storage: asyncStorageStorage };
  }

  // Native (iOS/Android) — use real SQLite
  return { auth: sqliteAuth, storage: sqliteStorage };
}

const defaults = getDefaultProviders();
const ProviderContext = createContext<ProviderContextType>(defaults);

interface ProviderContextProviderProps {
  children: ReactNode;
  auth?: AuthProvider;
  storage?: StorageProvider;
}

export function ProviderContextProvider({
  children,
  auth = defaults.auth,
  storage = defaults.storage,
}: ProviderContextProviderProps) {
  return (
    <ProviderContext.Provider value={{ auth, storage }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  return useContext(ProviderContext);
}
