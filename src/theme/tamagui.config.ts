import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

const config = createTamagui({
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
});

export default config;

export type StudiqConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends StudiqConfig {}
}
