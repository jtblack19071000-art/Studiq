import { generateText, Output } from 'ai';
import { z } from 'zod';

import { AI_NOT_CONFIGURED_MESSAGE, resolveAiModel } from '@/src/lib/aiModel';

const estimateSchema = z.object({
  estimatedHourlyRate: z.number().describe('Best single-number estimate of typical hourly pay for this role, in US dollars.'),
  rangeLow: z.number().describe('Low end of the typical hourly pay range, in US dollars.'),
  rangeHigh: z.number().describe('High end of the typical hourly pay range, in US dollars.'),
  reasoning: z.string().describe('One or two sentences on what drove this estimate (role, location, typical employer type).'),
});

export async function POST(request: Request): Promise<Response> {
  const model = resolveAiModel();
  if (!model) {
    return Response.json({ error: AI_NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const body = await request.json();
  const jobTitle = typeof body?.jobTitle === 'string' ? body.jobTitle.trim() : '';
  const employer = typeof body?.employer === 'string' ? body.employer.trim() : '';
  const location = typeof body?.location === 'string' ? body.location.trim() : '';

  if (!jobTitle) {
    return Response.json({ error: 'Enter a job title before requesting an estimate.' }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model,
      prompt: [
        'You are helping a college student estimate typical hourly pay for a part-time or campus',
        "job when they don't know their exact rate yet. You do not have live wage data, so reason",
        'from general knowledge of typical pay for this kind of role and be upfront that this is an',
        'estimate, not a guarantee — never state a figure as if it were verified fact.',
        '',
        `Job title: ${jobTitle}`,
        employer ? `Employer: ${employer}` : null,
        location ? `Location: ${location}` : 'Location: not specified, assume typical US campus/college-town pay.',
      ]
        .filter(Boolean)
        .join('\n'),
      output: Output.object({ schema: estimateSchema }),
    });
    return Response.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Estimate failed.';
    return Response.json({ error: message }, { status: 502 });
  }
}
