import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const syllabusItemSchema = z.object({
  title: z.string().describe('Short title, e.g. "Problem Set 3" or "Midterm Exam".'),
  dateLabel: z
    .string()
    .optional()
    .describe(
      'The date as written in the syllabus, normalized to something parseable if possible (e.g. "Feb 14, 2026"). Leave empty if genuinely not stated.',
    ),
});

const syllabusSchema = z.object({
  className: z.string().optional().describe('The course title, e.g. "Organic Chemistry II".'),
  courseCode: z.string().optional().describe('e.g. "CHEM 232".'),
  term: z.string().optional().describe('e.g. "Fall 2026". Infer from context (dates, semester name) if not explicit.'),
  professorName: z.string().optional(),
  professorEmail: z.string().optional(),
  classroom: z.string().optional(),
  meetingDays: z.array(z.enum(WEEKDAYS)).optional().describe('Days the class meets, if stated.'),
  meetingStartTime: z.string().optional().describe('e.g. "1:30 PM". Omit if not stated.'),
  meetingEndTime: z.string().optional().describe('e.g. "2:20 PM". Omit if not stated.'),
  assignments: z.array(syllabusItemSchema).describe('Homework, problem sets, papers — anything graded that is not an exam, reading, or project.'),
  exams: z.array(syllabusItemSchema).describe('Quizzes, midterms, finals.'),
  readings: z.array(syllabusItemSchema).describe('Assigned readings with a specific due date.'),
  projects: z.array(syllabusItemSchema).describe('Larger projects or presentations, distinct from regular assignments.'),
});

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI generation is not configured. Set ANTHROPIC_API_KEY on the server.' },
      { status: 503 },
    );
  }

  const formData = (await request.formData()) as unknown as { get: (key: string) => unknown };
  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return Response.json({ error: 'Missing syllabus file.' }, { status: 400 });
  }

  const mediaType = file.type || 'application/pdf';
  const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!supportedTypes.includes(mediaType)) {
    return Response.json(
      { error: `Unsupported file type "${mediaType}". Upload a PDF or a photo of the syllabus.` },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const { output } = await generateText({
      model: anthropic('claude-sonnet-5'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                "Extract structured data from this course syllabus. Only include what's actually",
                "stated or clearly implied — don't invent assignments, dates, or contact info that",
                "aren't in the document. For dates, prefer a fully-written form (\"Feb 14, 2026\")",
                'over relative terms ("Week 3") when the syllabus gives enough context to resolve',
                'the year and month; otherwise leave dateLabel empty rather than guessing.',
              ].join(' '),
            },
            { type: 'file', data: bytes, mediaType },
          ],
        },
      ],
      output: Output.object({ schema: syllabusSchema }),
    });
    return Response.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Syllabus import failed.';
    return Response.json({ error: message }, { status: 502 });
  }
}
