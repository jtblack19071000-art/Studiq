import { openai } from '@ai-sdk/openai';
import { transcribe } from 'ai';

export async function POST(request: Request): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'Transcription is not configured. Set OPENAI_API_KEY on the server.' },
      { status: 503 },
    );
  }

  // API routes run on the real Fetch API FormData, but React Native's ambient FormData
  // type (which only declares `append`/`getAll`) shadows it project-wide, so `.get` needs
  // a narrow escape hatch here.
  const formData = (await request.formData()) as unknown as { get: (key: string) => unknown };
  const audio = formData.get('audio');
  if (!(audio instanceof Blob)) {
    return Response.json({ error: 'Missing audio file.' }, { status: 400 });
  }

  const audioBytes = new Uint8Array(await audio.arrayBuffer());

  try {
    const result = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: audioBytes,
    });
    return Response.json({ text: result.text, durationInSeconds: result.durationInSeconds ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transcription failed.';
    return Response.json({ error: message }, { status: 502 });
  }
}
