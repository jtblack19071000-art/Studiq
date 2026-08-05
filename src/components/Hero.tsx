import type { ReactNode } from 'react';
import { Image } from 'react-native';
import { YStack } from 'tamagui';
import type { GetProps } from 'tamagui';

import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

interface HeroProps extends GetProps<typeof YStack> {
  children: ReactNode;
  /** Shows a small Studiq logo mark in the top-right corner. */
  logo?: boolean;
}

/**
 * Soft accent-tinted header block used at the top of most regular tab screens. The two large
 * translucent circles peeking past the rounded edges are the non-emoji "background design" —
 * content renders in a padded inner layer above them. Layout props (alignItems, gap, padding, ...)
 * land on that inner layer, not the outer clipping container.
 */
export function Hero({ children, logo = false, ...contentProps }: HeroProps) {
  const accentColor = useThemeStore((state) => state.accentColor);
  const tint = ACCENT_TINT[accentColor];

  return (
    <YStack borderRadius="$8" overflow="hidden" position="relative" style={{ backgroundColor: ACCENT_SOFT_BG[accentColor] }}>
      <YStack
        position="absolute"
        top={-46}
        right={-36}
        width={150}
        height={150}
        borderRadius={999}
        style={{ backgroundColor: tint, opacity: 0.14 }}
      />
      <YStack
        position="absolute"
        bottom={-56}
        left={-30}
        width={120}
        height={120}
        borderRadius={999}
        style={{ backgroundColor: tint, opacity: 0.1 }}
      />
      {logo ? (
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 7, opacity: 0.85 }}
        />
      ) : null}
      <YStack padding="$5" zIndex={1} {...contentProps}>
        {children}
      </YStack>
    </YStack>
  );
}
