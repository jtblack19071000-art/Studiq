/// <reference types="jest" />

import { CollegeMatchAiError, generateCollegeMatchGuidance } from '@/src/lib/collegeMatchAi';

function jsonResponse(status: number, ok: boolean, body: unknown) {
  return { ok, status, json: jest.fn().mockResolvedValue(body) };
}

function brokenJsonResponse(status: number) {
  return { ok: false, status, json: jest.fn().mockRejectedValue(new Error('not JSON')) };
}

describe('generateCollegeMatchGuidance', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns the parsed guidance on success', async () => {
    const result = {
      fitSummary: 'Looks like a good fit.',
      thingsToLookFor: ['Research opportunities'],
      questionsToAsk: ['What is the average class size?'],
      perSchoolNotes: [{ school: 'State University', note: 'Strong chemistry program.' }],
    };
    globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, true, result)) as unknown as typeof fetch;

    await expect(
      generateCollegeMatchGuidance({ intendedMajor: 'Chemistry' }, [
        { id: 's1', name: 'State University', program: 'Chemistry', status: 'researching' },
      ]),
    ).resolves.toEqual(result);
  });

  it('sends only name/program for each school, not the full saved-school record', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(200, true, {})) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    await generateCollegeMatchGuidance({}, [
      { id: 's1', name: 'State University', program: 'Chemistry', status: 'applied', notes: 'private note' },
    ]);

    const [, requestInit] = (fetchMock as jest.Mock).mock.calls[0];
    const sentBody = JSON.parse(requestInit.body);
    expect(sentBody.schools).toEqual([{ name: 'State University', program: 'Chemistry' }]);
  });

  it('throws CollegeMatchAiError with the server-provided message on failure', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse(401, false, { error: 'ANTHROPIC_API_KEY is not configured.' })) as unknown as typeof fetch;

    await expect(generateCollegeMatchGuidance({}, [])).rejects.toThrow(
      new CollegeMatchAiError('ANTHROPIC_API_KEY is not configured.'),
    );
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(brokenJsonResponse(500)) as unknown as typeof fetch;

    await expect(generateCollegeMatchGuidance({}, [])).rejects.toThrow(
      new CollegeMatchAiError('Request failed with status 500.'),
    );
  });
});
