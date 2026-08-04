import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

const config = createTamagui({
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
    // Studiq lets users force Light/Dark independent of the OS preference (Settings > Appearance).
    // Tamagui's default media-query-driven scheme switching would otherwise always win over that
    // manual override on web, since it applies dark/light CSS variables based on the OS's
    // prefers-color-scheme rather than the theme class name.
    shouldAddPrefersColorThemes: false,
  },
});

export default config;

export type StudiqConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends StudiqConfig {}
}
