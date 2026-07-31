/// <reference types="jest" />

import { Platform } from 'react-native';

import { appendAudioToFormData } from '@/src/lib/audioUpload';

describe('appendAudioToFormData', () => {
  const originalFetch = globalThis.fetch;
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Platform.OS = originalPlatformOS;
  });

  it('on web, fetches the URI and appends the resulting blob', async () => {
    Platform.OS = 'web';
    const fakeBlob = new Blob(['fake audio bytes'], { type: 'audio/m4a' });
    globalThis.fetch = jest.fn().mockResolvedValue({ blob: jest.fn().mockResolvedValue(fakeBlob) }) as unknown as typeof fetch;

    const formData = new FormData();
    const appendSpy = jest.spyOn(formData, 'append');

    await appendAudioToFormData(formData, 'blob:http://localhost/abc', 'lecture.m4a', 'audio/m4a');

    expect(globalThis.fetch).toHaveBeenCalledWith('blob:http://localhost/abc');
    expect(appendSpy).toHaveBeenCalledWith('audio', fakeBlob, 'lecture.m4a');
  });

  it('on native, appends a {uri, name, type} descriptor without fetching', async () => {
    Platform.OS = 'ios';
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const formData = new FormData();
    const appendSpy = jest.spyOn(formData, 'append');

    await appendAudioToFormData(formData, 'file:///tmp/recording.m4a', 'lecture.m4a', 'audio/m4a');

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalledWith('audio', {
      uri: 'file:///tmp/recording.m4a',
      name: 'lecture.m4a',
      type: 'audio/m4a',
    });
  });
});
