import { YStack } from 'tamagui';
import type { GetProps } from 'tamagui';

interface CardProps extends GetProps<typeof YStack> {
  /** Colored left accent bar — pass a class/category color to tie a card to its subject at a glance. */
  accentColor?: string;
}

export function Card({ accentColor, ...props }: CardProps) {
  return (
    <YStack
      backgroundColor="$color2"
      borderRadius="$7"
      padding="$4"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
      borderLeftWidth={accentColor ? 4 : 1}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.12}
      shadowRadius={10}
      elevation={2}
      {...(accentColor ? { style: { borderLeftColor: accentColor } } : null)}
      {...props}
    />
  );
}
