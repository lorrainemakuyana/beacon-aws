import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, ThemeColors } from '@/constants/theme';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = '@beacon:theme_preference';

interface ThemeContextType {
  themePreference: ThemePreference;
  effectiveColorScheme: 'light' | 'dark';
  colors: ThemeColors;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const deviceScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemePreferenceState(stored);
      }
    });
  }, []);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const effectiveColorScheme: 'light' | 'dark' =
    themePreference === 'system' ? deviceScheme : themePreference;
  const colors = Colors[effectiveColorScheme];

  return (
    <ThemeContext.Provider value={{ themePreference, effectiveColorScheme, colors, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemePreferenceProvider');
  return ctx;
}
