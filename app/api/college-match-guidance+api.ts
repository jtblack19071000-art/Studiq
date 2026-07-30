import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const guidanceSchema = z.object({
  fitSummary: z.string().describe('A short narrative on what this student should look for in a school, given their answers.'),
  thingsToLookFor: z.array(z.string()).describe('Concrete criteria to evaluate schools against, based on their preferences.'),
  questionsToAsk: z.array(z.string()).describe('Questions to ask admissions/current students at schools they are considering.'),
  perSchoolNotes: z
    .array(z.object({ school: z.string(), note: z.string() }))
    .describe('One honest, specific note per saved school on how well it seems to fit the stated preferences, or what to check.'),
});

interface SchoolInput {
  name: string;
  program?: string;
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI generation is not configured. Set ANTHROPIC_API_KEY on the server.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const preferences = body?.preferences ?? {};
  const schools: SchoolInput[] = Array.isArray(body?.schools) ? body.schools : [];

  const preferencesText = [
    preferences.intendedMajor ? `Intended major: ${preferences.intendedMajor}` : null,
    preferences.locationPreference ? `Location preference: ${preferences.locationPreference}` : null,
    preferences.sizePreference ? `School size preference: ${preferences.sizePreference}` : null,
    preferences.budgetNotes ? `Budget notes: ${preferences.budgetNotes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (!preferencesText.trim()) {
    return Response.json(
      { error: 'Fill in at least one preference before requesting guidance.' },
      { status: 400 },
    );
  }

  const schoolsText = schools.length > 0
    ? schools.map((school) => `- ${school.name}${school.program ? ` (${school.program})` : ''}`).join('\n')
    : 'None saved yet.';

  try {
    const { output } = await generateText({
      model: anthropic('claude-sonnet-5'),
      prompt: [
        "You are a thoughtful, honest college advisor. You do NOT have access to a real database",
        'of colleges, so you cannot verify facts about specific schools — never invent statistics,',
        "rankings, or claims about a school you don't have grounded knowledge of. Instead, reason",
        "over the student's own stated preferences: what kind of school fits them, what they",
        'should investigate themselves, and what to ask. If given specific saved schools, offer',
        'grounded, generic-but-honest guidance on what to check for each — not a fabricated match',
        'score.',
        '',
        "Student's preferences:",
        preferencesText,
        '',
        'Schools the student has saved:',
        schoolsText,
      ].join('\n'),
      output: Output.object({ schema: guidanceSchema }),
    });
    return Response.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    return Response.json({ error: message }, { status: 502 });
  }
}
