/**
 * Hook pour les push notifications — demande permission, récupère le token Expo Push.
 */
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/** Configure le comportement quand une notif arrive (app ouverte). */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushNotificationState = {
  expoPushToken: string | null;
  permission: Notifications.PermissionStatus | null;
  notification: Notifications.Notification | null;
};

/**
 * Demande la permission et récupère le token Expo Push.
 * Retourne aussi la dernière notification reçue.
 */
export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<Notifications.PermissionStatus | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(({ token, status }) => {
      setExpoPushToken(token);
      setPermission(status);
    });

    // Écoute les notifications reçues (app ouverte)
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    // Écoute les taps sur les notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // TODO: navigation selon response.notification.request.content.data
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken, permission, notification };
}

/**
 * Demande la permission et récupère le token.
 */
async function registerForPushNotificationsAsync(): Promise<{
  token: string | null;
  status: Notifications.PermissionStatus | null;
}> {
  // Sur web, les push notifications utilisent l'API Web Push
  if (Platform.OS === 'web') {
    // Web push nécessite une config VAPID — on skip pour l'instant
    console.log('Web push notifications require VAPID setup');
    return { token: null, status: null };
  }

  // Sur mobile, il faut un appareil physique
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return { token: null, status: null };
  }

  // Configure le canal Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f3ac41',
    });
  }

  // Vérifie/demande la permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return { token: null, status: finalStatus };
  }

  // Récupère le token Expo Push
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return { token: tokenData.data, status: finalStatus };
  } catch (error) {
    console.error('Error getting push token:', error);
    return { token: null, status: finalStatus };
  }
}

/**
 * Envoie le token au backend pour stockage.
 */
export async function sendPushTokenToBackend(
  token: string,
  apiBaseUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/push/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending push token to backend:', error);
    return false;
  }
}
