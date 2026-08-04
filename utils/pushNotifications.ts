import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// How notifications are handled while the app is in the foreground — without
// this, iOS silently drops foreground notifications by default.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Requests permission (if not already granted/denied) and returns an Expo
// push token, or null if permission was denied or registration otherwise
// failed (e.g. running in a simulator, which can't receive real push).
// Never throws — every caller treats "no token" as a normal, silent no-op.
const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E6B45',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted — notifications will be in-app-inbox only.');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResponse.data;
  } catch (err) {
    // Expected on simulators/emulators, which can't register for real push.
    console.log('[push] Could not get an Expo push token:', err);
    return null;
  }
};

// Call once per authenticated session (see AuthContext.tsx) — requests
// permission if needed, registers the device, and PUTs the resulting token
// onto the user's record so the backend's notify() helper can reach it.
export const syncPushTokenWithServer = async (): Promise<void> => {
  const token = await registerForPushNotificationsAsync();
  if (!token) return;

  try {
    await api.put('/auth/push-token', { pushToken: token });
  } catch (err) {
    console.error('[push] Failed to sync push token with server:', err);
  }
};

// Call on logout — an access token surviving on the server past logout is
// harmless (it just means a push might still arrive for a signed-out
// device), but explicitly clearing it is the correct, tidy behavior.
export const clearPushTokenOnServer = async (): Promise<void> => {
  try {
    await api.put('/auth/push-token', { pushToken: null });
  } catch (err) {
    // Non-fatal — logout should proceed regardless.
    console.error('[push] Failed to clear push token on server:', err);
  }
};
