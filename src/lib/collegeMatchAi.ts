import type { CollegePreferences, SavedSchool } from '@/src/types';

export class CollegeMatchAiError extends Error {}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === 'string') return body.error;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${response.status}.`;
}

export interface CollegeMatchGuidance {
  fitSummary: string;
  thingsToLookFor: string[];
  questionsToAsk: string[];
  perSchoolNotes: { school: string; note: string }[];
}

export async function generateCollegeMatchGuidance(
  preferences: CollegePreferences,
  schools: SavedSchool[],
): Promise<CollegeMatchGuidance> {
  const response = await fetch('/api/college-match-guidance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences,
      schools: schools.map((school) => ({ name: school.name, program: school.program })),
    }),
  });
  if (!response.ok) {
    throw new CollegeMatchAiError(await parseErrorResponse(response));
  }
  return response.json();
}
