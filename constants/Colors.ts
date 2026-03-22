// Kid-friendly color palette for the reading app
export const AppColors = {
  // Primary palette
  primary: '#6C63FF',        // Playful purple
  primaryLight: '#9B94FF',
  primaryDark: '#4A42D4',

  // Accent colors
  accent: '#FF6B9D',         // Warm pink
  accentLight: '#FF9DC2',
  sunshine: '#FFD93D',       // Star/reward yellow
  sunshineLight: '#FFE88A',
  sky: '#4ECDC4',            // Friendly teal
  skyLight: '#7EDDD7',
  coral: '#FF8A65',          // Warm orange
  mint: '#69DB7C',           // Success green

  // Neutrals
  background: '#F8F6FF',     // Soft lavender white
  surface: '#FFFFFF',
  surfaceElevated: '#F0EDFF',
  textPrimary: '#2D2047',    // Deep purple-black
  textSecondary: '#6B5E83',
  textLight: '#9B8FB8',
  border: '#E8E2F4',

  // Feedback
  success: '#51CF66',
  successLight: '#D3F9D8',
  error: '#FF6B6B',
  errorLight: '#FFE3E3',

  // Gradients (start, end)
  gradientPurple: ['#6C63FF', '#9B94FF'],
  gradientSunset: ['#FF6B9D', '#FFD93D'],
  gradientSky: ['#4ECDC4', '#6C63FF'],
  gradientWarm: ['#FF8A65', '#FFD93D'],
};

// For backwards compatibility with the Expo template
const tintColorLight = AppColors.primary;
const tintColorDark = '#fff';

export default {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    tint: tintColorLight,
    tabIconDefault: AppColors.textLight,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#1A1130',
    tint: tintColorDark,
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
  },
};
