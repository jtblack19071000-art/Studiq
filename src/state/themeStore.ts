import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/src/lib/mmkvStorage';

/** Matches Tamagui's built-in `${scheme}_${accent}` sub-themes from @tamagui/config/v4. */
export type AccentColor = 'blue' | 'green' | 'red' | 'yellow';
export type ColorSchemeOverride = 'system' | 'light' | 'dark';

export const ACCENT_COLORS: AccentColor[] = ['blue', 'green', 'red', 'yellow'];

export const ACCENT_TINT: Record<AccentColor, string> = {
  blue: '#3B6FE0',
  green: '#4C9F4C',
  red: '#E0473B',
  yellow: '#E0B93B',
};

interface ThemeState {
  accentColor: AccentColor;
  colorSchemeOverride: ColorSchemeOverride;
  setAccentColor: (color: AccentColor) => void;
  setColorSchemeOverride: (override: ColorSchemeOverride) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: 'blue',
      colorSchemeOverride: 'system',
      setAccentColor: (color) => set({ accentColor: color }),
      setColorSchemeOverride: (override) => set({ colorSchemeOverride: override }),
    }),
    { name: 'studiq-theme', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
