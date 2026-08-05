import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export const AI_NOT_CONFIGURED_MESSAGE =
  'AI generation is not configured. Set ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY on the server.';

/**
 * Picks whichever AI provider has a server-side key configured — Anthropic (Claude) if
 * ANTHROPIC_API_KEY is set, otherwise Google (Gemini, which has a free tier with no credit card
 * required) if GOOGLE_GENERATIVE_AI_API_KEY is set. Returns null if neither is configured.
 *
 * No explicit return type here — `LanguageModel` from `ai` also includes plain model-id strings
 * for its provider-router feature, which would erase the `.provider`/`.modelId` fields callers
 * (and this module's own tests) rely on. Letting TS infer keeps the concrete object type.
 */
export function resolveAiModel() {
  if (process.env.ANTHROPIC_API_KEY) return anthropic('claude-sonnet-5');
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return google('gemini-2.5-flash');
  return null;
}
