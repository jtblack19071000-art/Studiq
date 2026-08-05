import { Platform } from 'react-native';

export class SyllabusAiError extends Error {}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === 'string') return body.error;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${response.status}.`;
}

export interface SyllabusItem {
  title: string;
  dateLabel?: string;
}

export interface SyllabusImportResult {
  className?: string;
  courseCode?: string;
  term?: string;
  professorName?: string;
  professorEmail?: string;
  classroom?: string;
  meetingDays?: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  meetingStartTime?: string;
  meetingEndTime?: string;
  assignments: SyllabusItem[];
  exams: SyllabusItem[];
  readings: SyllabusItem[];
  projects: SyllabusItem[];
}

/** Appends a document-picker result to a FormData for upload — same web/native Blob split as appendAudioToFormData. */
async function appendFileToFormData(formData: FormData, uri: string, fileName: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, fileName);
  } else {
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }
}

export async function importSyllabus(uri: string, fileName: string, mimeType: string): Promise<SyllabusImportResult> {
  const formData = new FormData();
  await appendFileToFormData(formData, uri, fileName, mimeType);

  const response = await fetch('/api/import-syllabus', { method: 'POST', body: formData });
  if (!response.ok) {
    throw new SyllabusAiError(await parseErrorResponse(response));
  }
  return response.json();
}
