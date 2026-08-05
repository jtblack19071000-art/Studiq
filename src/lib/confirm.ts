import { Alert, Platform } from 'react-native';

/**
 * Yes/No confirmation that actually works on web — react-native-web's Alert.alert is a no-op
 * stub, so this falls back to window.confirm there instead of silently doing nothing.
 */
export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : false);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'No', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Yes', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
