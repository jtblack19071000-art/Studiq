/// <reference types="jest" />

// src/lib/supabase.ts reads process.env eagerly at module-load time, so each scenario needs a
// fresh module instance (jest.resetModules) rather than re-importing the already-evaluated module.
// require() (not a dynamic import()) is needed here so the re-evaluation happens synchronously,
// inside jest.resetModules's synchronous reset — this test environment doesn't run Jest with
// --experimental-vm-modules, so top-level dynamic import() isn't available.
/* eslint-disable @typescript-eslint/no-require-imports */
describe('supabase client configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('is null when neither Supabase env var is set', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    const { supabase } = require('@/src/lib/supabase');
    expect(supabase).toBeNull();
  });

  it('is null when only the URL is set', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    const { supabase } = require('@/src/lib/supabase');
    expect(supabase).toBeNull();
  });

  it('is null when only the anon key is set', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { supabase } = require('@/src/lib/supabase');
    expect(supabase).toBeNull();
  });

  it('is a configured client when both env vars are set', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { supabase } = require('@/src/lib/supabase');
    expect(supabase).not.toBeNull();
  });
});
