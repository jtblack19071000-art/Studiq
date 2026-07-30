import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const lectureMaterialsSchema = z.object({
  notes: z.string().describe('Organized, well-structured lecture notes in markdown.'),
  summary: z.string().describe('A concise 2-4 sentence summary of the lecture.'),
  vocabulary: z.array(z.object({ term: z.string(), definition: z.string() })),
  formulas: z.array(z.string()).describe('Key equations or formulas mentioned, if any.'),
  professorEmphasis: z
    .array(z.string())
    .describe('Points the professor explicitly emphasized, repeated, or flagged as important.'),
  detectedAssignments: z
    .array(z.string())
    .describe('Any assignments, readings, or deadlines mentioned in the lecture.'),
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
      answer: z.string(),
    }),
  ),
  conceptExplanations: z.array(z.object({ concept: z.string(), explanation: z.string() })),
});

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI generation is not configured. Set ANTHROPIC_API_KEY on the server.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const transcript = typeof body?.transcript === 'string' ? body.transcript : '';
  if (!transcript.trim()) {
    return Response.json({ error: 'Missing transcript.' }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model: anthropic('claude-sonnet-5'),
      prompt: [
        'You are an expert study assistant analyzing a college lecture transcript.',
        'Produce organized notes, a summary, vocabulary with definitions, any formulas mentioned,',
        'points the professor emphasized, any assignments or deadlines mentioned, flashcards,',
        'a short practice quiz, and plain-language explanations of the key concepts.',
        'Base everything strictly on the transcript content below — do not invent material that',
        "isn't supported by the transcript.",
        '',
        'Transcript:',
        transcript,
      ].join('\n'),
      output: Output.object({ schema: lectureMaterialsSchema }),
    });
    return Response.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    return Response.json({ error: message }, { status: 502 });
  }
}
