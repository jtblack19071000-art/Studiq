import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
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

/** Translucent version of ACCENT_TINT for hero/highlight card backgrounds — works over light or dark. */
export const ACCENT_SOFT_BG: Record<AccentColor, string> = {
  blue: 'rgba(59, 111, 224, 0.14)',
  green: 'rgba(76, 159, 76, 0.14)',
  red: 'rgba(224, 71, 59, 0.14)',
  yellow: 'rgba(224, 185, 59, 0.18)',
};

interface ThemeState {
  accentColor: AccentColor;
  colorSchemeOverride: ColorSchemeOverride;
  setAccentColor: (color: AccentColor) => void;
  setColorSchemeOverride: (override: ColorSchemeOverride) => void;
}

const BLANK_THEME_DATA = { accentColor: 'blue' as AccentColor, colorSchemeOverride: 'system' as ColorSchemeOverride };

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...BLANK_THEME_DATA,
      setAccentColor: (color) => set({ accentColor: color }),
      setColorSchemeOverride: (override) => set({ colorSchemeOverride: override }),
    }),
    { name: 'studiq-theme', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);

registerCloudSyncedStore({
  name: 'theme',
  store: useThemeStore,
  serialize: (state) => ({ accentColor: state.accentColor, colorSchemeOverride: state.colorSchemeOverride }),
  blank: BLANK_THEME_DATA,
});
