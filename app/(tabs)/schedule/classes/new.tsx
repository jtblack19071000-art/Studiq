import { router } from 'expo-router';
import { H2 } from 'tamagui';

import { ClassForm } from '@/src/components/ClassForm';
import { Screen } from '@/src/components/Screen';
import { createId } from '@/src/lib/id';
import { anchorMeetingTimes } from '@/src/lib/time';
import { useClassesStore } from '@/src/state/classesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';

export default function NewClassScreen() {
  const addClass = useClassesStore((state) => state.addClass);
  const activeTerm = useClassesStore((state) => state.activeTerm);
  const addEvent = useScheduleStore((state) => state.addEvent);

  return (
    <Screen>
      <H2 paddingTop="$2">Add class</H2>
      <ClassForm
        submitLabel="Add class"
        defaultTerm={activeTerm ?? undefined}
        onSubmit={({ classInput, meeting }) => {
          const created = addClass(classInput);

          if (meeting) {
            const times = anchorMeetingTimes(meeting.startTime, meeting.endTime)!;
            addEvent({
              title: `${created.name} — Lecture`,
              category: 'class',
              classId: created.id,
              startsAt: times.startsAt.toISOString(),
              endsAt: times.endsAt.toISOString(),
              location: created.classroom,
              recurrence: { frequency: 'WEEKLY', byWeekday: meeting.byWeekday },
              reminders: [{ id: createId(), minutesBefore: 10 }],
            });
          }

          router.replace(`/schedule/classes/${created.id}`);
        }}
      />
    </Screen>
  );
}
