import { Platform } from 'react-native';

export type ThemeColors = {
  // Brand
  primary: string;
  primaryLight: string;
  tint: string;
  primarySubtle: string;
  primarySubtleBorder: string;
  // Backgrounds
  background: string;
  surfaceBackground: string;
  cardBackground: string;
  drawerBackground: string;
  mapPlaceholder: string;
  emptyStateBg: string;
  // Borders
  cardBorder: string;
  inputBorder: string;
  border: string;
  borderSubtle: string;
  headerBorder: string;
  drawerHandle: string;
  // Inputs
  inputBackground: string;
  // Tab bar
  tabBarBackground: string;
  tabIconDefault: string;
  tabIconSelected: string;
  // Text — `text` kept for ThemedText backward compat
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textLabel: string;
  // Icons — `icon` kept for ThemedView/ThemedText compat
  icon: string;
  // Profile
  profileAvatar: string;
  // Streak pill
  streakPillBg: string;
  streakPillBorder: string;
  // Semantic states
  danger: string;
  dangerSubtle: string;
  dangerBorder: string;
  warning: string;
  warningSubtle: string;
  info: string;
  infoSubtle: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    primary: '#059669',
    primaryLight: '#10B981',
    tint: '#059669',
    primarySubtle: '#ECFDF5',
    primarySubtleBorder: '#A7F3D0',
    background: '#FFFFFF',
    surfaceBackground: '#F9FAFB',
    cardBackground: '#FFFFFF',
    drawerBackground: '#FFFFFF',
    mapPlaceholder: '#F1F5F9',
    emptyStateBg: '#F3F4F6',
    cardBorder: '#E2E8F0',
    inputBorder: '#D1D5DB',
    border: '#E5E7EB',
    borderSubtle: '#F3F4F6',
    headerBorder: '#E5E7EB',
    drawerHandle: '#CBD5E1',
    inputBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    tabIconDefault: '#687076',
    tabIconSelected: '#059669',
    text: '#11181C',
    textPrimary: '#0F172A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textLabel: '#374151',
    icon: '#64748B',
    profileAvatar: '#10B981',
    streakPillBg: '#F5E9DA',
    streakPillBorder: '#FCD9BD',
    danger: '#EF4444',
    dangerSubtle: '#FEF2F2',
    dangerBorder: '#FECACA',
    warning: '#F59E0B',
    warningSubtle: '#FEF3C7',
    info: '#3B82F6',
    infoSubtle: '#E8F0FE',
  },
  dark: {
    // primary stays #059669 — white text on it passes AA in both modes
    primary: '#059669',
    primaryLight: '#10B981',
    // tint is green used AS a text/icon color — lighter for dark backgrounds
    tint: '#34D399',
    primarySubtle: '#064E3B',
    primarySubtleBorder: '#065F46',
    background: '#0F172A',
    surfaceBackground: '#1E293B',
    cardBackground: '#1E293B',
    drawerBackground: '#1E293B',
    mapPlaceholder: '#1E293B',
    emptyStateBg: '#1E293B',
    cardBorder: '#334155',
    inputBorder: '#475569',
    border: '#334155',
    borderSubtle: '#1E293B',
    headerBorder: '#334155',
    drawerHandle: '#475569',
    inputBackground: '#1E293B',
    tabBarBackground: '#1E293B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#34D399',
    text: '#ECEDEE',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textLabel: '#CBD5E1',
    icon: '#94A3B8',
    profileAvatar: '#059669',
    streakPillBg: '#431407',
    streakPillBorder: '#7C2D12',
    danger: '#F87171',
    dangerSubtle: '#450A0A',
    dangerBorder: '#7F1D1D',
    warning: '#FCD34D',
    warningSubtle: '#422006',
    info: '#60A5FA',
    infoSubtle: '#1E3A5F',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
