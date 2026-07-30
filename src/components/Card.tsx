import { YStack } from 'tamagui';
import type { GetProps } from 'tamagui';

export function Card(props: GetProps<typeof YStack>) {
  return (
    <YStack
      backgroundColor="$color2"
      borderRadius="$6"
      padding="$3.5"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
      {...props}
    />
  );
}
