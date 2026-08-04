import { useColorScheme as useColorSchemeCore } from 'react-native';

import { useThemeStore } from '@/src/state/themeStore';

export const useColorScheme = () => {
  const coreScheme = useColorSchemeCore();
  const override = useThemeStore((state) => state.colorSchemeOverride);
  const deviceScheme = coreScheme === 'unspecified' ? 'light' : coreScheme;
  return override === 'system' ? deviceScheme : override;
};
