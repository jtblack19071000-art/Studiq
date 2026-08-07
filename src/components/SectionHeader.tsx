import type { ReactNode } from 'react';
import { H4, XStack } from 'tamagui';

import { Icon, type IconName } from '@/src/components/Icon';

export function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <XStack alignItems="center" gap="$2">
        {icon ? <Icon name={icon} size={18} color="#8A8F98" /> : null}
        <H4>{title}</H4>
      </XStack>
      {action}
    </XStack>
  );
}
