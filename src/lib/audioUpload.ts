import { Platform } from 'react-native';

/**
 * Appends a locally-recorded audio file to a FormData for upload. Native and web give back
 * different URI schemes (file:// vs blob:), so they need different Blob-construction paths.
 */
export async function appendAudioToFormData(
  formData: FormData,
  uri: string,
  fileName: string,
  mimeType: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('audio', blob, fileName);
  } else {
    formData.append('audio', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }
}
