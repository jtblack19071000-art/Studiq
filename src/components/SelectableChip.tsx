import type { ReactNode } from 'react';
import { Text, YStack } from 'tamagui';

import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

const SIZES = {
  $2: { paddingHorizontal: '$2.5', paddingVertical: '$1.5', fontSize: 12 },
  $3: { paddingHorizontal: '$3', paddingVertical: '$2', fontSize: 14 },
  $4: { paddingHorizontal: '$4', paddingVertical: '$2.5', fontSize: 15 },
} as const;

/**
 * A pill-style option button for choose-one/toggle-many groups (category filters, status
 * pickers, size preferences, ...). Deliberately built on YStack, not Tamagui's <Button> — Button
 * applies its own theme-driven backgroundColor internally, at a higher precedence than any prop
 * or style override could beat on web, so a selected/unselected color difference never actually
 * rendered no matter how it was passed in. Plain YStack has no such built-in styling to fight.
 */
export function SelectableChip({
  selected,
  onPress,
  children,
  size = '$2',
  flex,
  disabled,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  size?: '$2' | '$3' | '$4';
  flex?: number;
  disabled?: boolean;
}) {
  const accentColor = useThemeStore((state) => state.accentColor);
  const tint = ACCENT_TINT[accentColor];
  const { paddingHorizontal, paddingVertical, fontSize } = SIZES[size];

  return (
    <YStack
      flex={flex}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      borderRadius="$10"
      alignItems="center"
      justifyContent="center"
      borderWidth={selected ? 0 : 1.5}
      borderColor="$borderColor"
      opacity={disabled ? 0.5 : 1}
      onPress={disabled ? undefined : onPress}
      pressStyle={disabled ? undefined : { opacity: 0.75 }}
      style={{ backgroundColor: selected ? tint : undefined }}>
      <Text color={selected ? 'white' : '$color11'} fontWeight={selected ? '700' : '500'} fontSize={fontSize}>
        {children}
      </Text>
    </YStack>
  );
}
