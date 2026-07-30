import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(),
});

const unitStudyGuideSchema = z.object({
  studyGuide: z.string().describe('A comprehensive study guide in markdown covering the whole unit.'),
  reviewSheet: z.string().describe('A dense, scannable one-page review sheet in markdown.'),
  chapterSummary: z.string().describe('A narrative summary tying the unit together.'),
  keyConcepts: z.array(z.string()),
  vocabulary: z.array(z.object({ term: z.string(), definition: z.string() })),
  equationsAndFormulas: z.array(z.string()),
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })),
  practiceQuiz: z.array(quizQuestionSchema).describe('A short practice quiz, roughly 5-10 questions.'),
  practiceExam: z.array(quizQuestionSchema).describe('A longer practice exam, roughly 10-20 questions.'),
  likelyExamTopics: z.array(z.string()),
  professorEmphasis: z.array(z.string()).describe('Topics the professor emphasized across the lectures.'),
  mnemonics: z.array(z.string()).describe('Memory tricks and mnemonics for hard-to-remember material.'),
  reviewChecklist: z.array(z.string()).describe('A checklist of things the student should be able to do or explain.'),
});

interface LectureInput {
  title: string;
  transcript: string;
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI generation is not configured. Set ANTHROPIC_API_KEY on the server.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const unitTitle = typeof body?.unitTitle === 'string' ? body.unitTitle : 'Untitled unit';
  const lectures: LectureInput[] = Array.isArray(body?.lectures) ? body.lectures : [];
  const usableLectures = lectures.filter((lecture) => lecture.transcript?.trim());

  if (usableLectures.length === 0) {
    return Response.json(
      { error: 'No transcribed lectures in this unit yet. Record and transcribe at least one lecture first.' },
      { status: 400 },
    );
  }

  const transcriptsBlock = usableLectures
    .map((lecture, index) => `Lecture ${index + 1}: ${lecture.title}\n${lecture.transcript}`)
    .join('\n\n---\n\n');

  try {
    const { output } = await generateText({
      model: anthropic('claude-sonnet-5'),
      prompt: [
        `You are an expert study assistant. A student recorded ${usableLectures.length} lecture(s)`,
        `for the unit "${unitTitle}". Analyze ALL of the lecture transcripts below TOGETHER as one`,
        'combined body of material (not lecture-by-lecture) and produce a comprehensive unit study',
        'guide: a full study guide, a dense review sheet, a chapter summary, key concepts,',
        'vocabulary with definitions, equations/formulas, flashcards, a short practice quiz, a',
        'longer practice exam, likely exam topics, points the professor emphasized across the',
        'lectures, memory tricks/mnemonics, and a review checklist. Base everything strictly on',
        "the transcripts — do not invent material that isn't supported by them.",
        '',
        'Lecture transcripts:',
        transcriptsBlock,
      ].join('\n'),
      output: Output.object({ schema: unitStudyGuideSchema }),
    });
    return Response.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    return Response.json({ error: message }, { status: 502 });
  }
}
