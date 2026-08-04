import { Text, XStack } from 'tamagui';

/** Solid color chips (not Tamagui $tokens) so a badge reads the same regardless of the user's
 * chosen accent theme or light/dark mode — reuses the same hex language as EVENT_COLOR_SWATCHES. */
const TONE_COLORS: Record<string, string> = {
  neutral: '#8A8F98',
  info: '#3B6FE0',
  success: '#4C9F4C',
  warning: '#D9862B',
  danger: '#E0473B',
};

export type BadgeTone = keyof typeof TONE_COLORS;

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <XStack
      paddingHorizontal="$2.5"
      paddingVertical="$1"
      borderRadius="$10"
      alignSelf="flex-start"
      style={{ backgroundColor: TONE_COLORS[tone] }}>
      <Text color="white" fontSize="$2" fontWeight="700">
        {label}
      </Text>
    </XStack>
  );
}
