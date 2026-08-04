import { useThemeStore } from '@/src/state/themeStore';

// NOTE: The default React Native styling doesn't support server rendering, so this doesn't read
// the browser's prefers-color-scheme — it only respects the in-app Light/Dark/System override,
// defaulting to 'light' when set to 'system' (matching the original template stub's behavior).
export function useColorScheme() {
  const override = useThemeStore((state) => state.colorSchemeOverride);
  return override === 'system' ? 'light' : override;
}
