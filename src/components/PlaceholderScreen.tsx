import { H2, Paragraph } from 'tamagui';

import { Screen } from '@/src/components/Screen';

export function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  return (
    <Screen>
      <H2 paddingTop="$2">{title}</H2>
      <Paragraph color="$color10">{description}</Paragraph>
    </Screen>
  );
}
