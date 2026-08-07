import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { Button, H2, Paragraph } from 'tamagui';

import { ClassForm } from '@/src/components/ClassForm';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { createId } from '@/src/lib/id';
import { anchorMeetingTimes, formatTimeOfDay } from '@/src/lib/time';
import { useClassesStore } from '@/src/state/classesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';

export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const studiqClass = useClassesStore((state) => state.classById(id));
  const updateClass = useClassesStore((state) => state.updateClass);
  const removeClass = useClassesStore((state) => state.removeClass);
  const events = useScheduleStore((state) => state.events);
  const addEvent = useScheduleStore((state) => state.addEvent);
  const updateEvent = useScheduleStore((state) => state.updateEvent);
  const removeEvent = useScheduleStore((state) => state.removeEvent);

  if (!studiqClass) {
    return (
      <Screen>
        <EmptyState message="Class not found." />
      </Screen>
    );
  }

  const meetingEvent = events.find((event) => event.classId === studiqClass.id && event.recurrence);
  const initialMeeting = meetingEvent
    ? {
        byWeekday: meetingEvent.recurrence!.byWeekday ?? [],
        startTime: formatTimeOfDay(meetingEvent.startsAt),
        endTime: formatTimeOfDay(meetingEvent.endsAt),
      }
    : undefined;

  function handleDelete() {
    function performDelete() {
      removeClass(studiqClass!.id);
      router.replace('/schedule');
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${studiqClass!.name}? This also removes its assignments, exams, and schedule.`)) {
        performDelete();
      }
      return;
    }

    Alert.alert('Delete class?', `This also removes ${studiqClass!.name}'s assignments, exams, and schedule.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: performDelete },
    ]);
  }

  return (
    <Screen>
      <H2 paddingTop="$2">Edit class</H2>
      <ClassForm
        initialClass={studiqClass}
        initialMeeting={initialMeeting}
        submitLabel="Save changes"
        onSubmit={({ classInput, meeting }) => {
          updateClass(studiqClass.id, classInput);

          if (meeting) {
            const times = anchorMeetingTimes(meeting.startTime, meeting.endTime)!;
            const startsAt = times.startsAt.toISOString();
            const endsAt = times.endsAt.toISOString();
            const recurrence = { frequency: 'WEEKLY' as const, byWeekday: meeting.byWeekday };
            if (meetingEvent) {
              updateEvent(meetingEvent.id, {
                title: `${classInput.name} — Lecture`,
                startsAt,
                endsAt,
                location: classInput.classroom,
                recurrence,
              });
            } else {
              addEvent({
                title: `${classInput.name} — Lecture`,
                category: 'class',
                classId: studiqClass.id,
                startsAt,
                endsAt,
                location: classInput.classroom,
                recurrence,
                reminders: [{ id: createId(), minutesBefore: 10 }],
              });
            }
          } else if (meetingEvent) {
            removeEvent(meetingEvent.id);
          }

          router.replace(`/schedule/classes/${studiqClass.id}`);
        }}
      />

      <Paragraph color="$red10" fontSize="$3" paddingTop="$4">
        Deleting a class also removes its assignments, exams, announcements, and its meeting time from your
        Schedule.
      </Paragraph>
      <Button size="$4" theme="red" onPress={handleDelete}>
        Delete class
      </Button>
    </Screen>
  );
}
