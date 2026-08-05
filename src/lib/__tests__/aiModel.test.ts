/// <reference types="jest" />

import { AI_NOT_CONFIGURED_MESSAGE, resolveAiModel } from '@/src/lib/aiModel';

// @ai-sdk/anthropic and @ai-sdk/google are ESM-only packages that Jest's default
// transformIgnorePatterns doesn't transform (same issue as react-native-purchases in
// subscriptionStore.test.ts) — mocked here with just enough shape (a `provider` field) to tell
// which one resolveAiModel picked, without loading the real SDKs.
jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: (modelId: string) => ({ provider: 'anthropic.messages', modelId }),
}));
jest.mock('@ai-sdk/google', () => ({
  google: (modelId: string) => ({ provider: 'google.generative-ai', modelId }),
}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('resolveAiModel', () => {
  it('returns null when neither key is configured', () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    expect(resolveAiModel()).toBeNull();
  });

  it('uses Anthropic when only ANTHROPIC_API_KEY is set', () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const model = resolveAiModel();

    expect(model?.provider).toBe('anthropic.messages');
  });

  it('uses Google when only GOOGLE_GENERATIVE_AI_API_KEY is set — the free-tier option', () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-google-key';

    const model = resolveAiModel();

    expect(model?.provider).toBe('google.generative-ai');
  });

  it('prefers Anthropic when both keys are set', () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-google-key';

    const model = resolveAiModel();

    expect(model?.provider).toBe('anthropic.messages');
  });
});

describe('AI_NOT_CONFIGURED_MESSAGE', () => {
  it('mentions both configuration options', () => {
    expect(AI_NOT_CONFIGURED_MESSAGE).toContain('ANTHROPIC_API_KEY');
    expect(AI_NOT_CONFIGURED_MESSAGE).toContain('GOOGLE_GENERATIVE_AI_API_KEY');
  });
});
