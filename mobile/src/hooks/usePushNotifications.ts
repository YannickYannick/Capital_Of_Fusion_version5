/**
 * Hook pour les push notifications — Web Push (PWA) + Expo Push (native).
 */
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Clé publique VAPID pour Web Push (générée avec web-push)
const VAPID_PUBLIC_KEY = 'BKQipokym9Ph68CMgvzCAZqJUAYTh9FflToDSkGuwqm4HdbXbajFzWPDoRcxxhgEnMlpUetVWKWTVvQQgBm19Z0';

/** Configure le comportement quand une notif arrive (app ouverte) — Expo native only. */
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PushNotificationState = {
  expoPushToken: string | null;
  webPushSubscription: PushSubscription | null;
  permission: NotificationPermission | Notifications.PermissionStatus | null;
  notification: Notifications.Notification | null;
};

/**
 * Demande la permission et récupère le token (Expo ou Web Push).
 */
export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [webPushSubscription, setWebPushSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | Notifications.PermissionStatus | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web Push
      registerForWebPushAsync().then(({ subscription, status }) => {
        setWebPushSubscription(subscription);
        setPermission(status);
      });
    } else {
      // Expo Push (native)
      registerForExpoPushAsync().then(({ token, status }) => {
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
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken, webPushSubscription, permission, notification };
}

// ─────────────────────────────────────────────────────────────────────────────
// WEB PUSH (PWA)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enregistre le Service Worker et demande la permission Web Push.
 */
async function registerForWebPushAsync(): Promise<{
  subscription: PushSubscription | null;
  status: NotificationPermission | null;
}> {
  // Vérifie le support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Web Push not supported in this browser');
    return { subscription: null, status: null };
  }

  try {
    // Enregistre le service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });

    // Force la vérification d'une nouvelle version : sans ça, un SW déjà
    // installé sans handler `push` reste actif et les notifications
    // arrivent sans jamais être affichées.
    try {
      await registration.update();
    } catch {
      // Pas bloquant
    }

    // Attend que le SW soit prêt
    const ready = await navigator.serviceWorker.ready;
    console.log('Service Worker ready, scope:', ready.scope);

    // Demande la permission
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);

    if (permission !== 'granted') {
      return { subscription: null, status: permission };
    }

    // S'abonne aux push via le SW actif
    const subscription = await ready.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('Web Push subscription:', subscription.endpoint);
    return { subscription, status: permission };

  } catch (error) {
    console.error('Error registering for web push:', error);
    return { subscription: null, status: null };
  }
}

/**
 * Décrit l'appareil web courant (mode d'affichage + user agent tronqué).
 * Permet de distinguer « PWA installée » de « onglet navigateur ».
 */
function describeWebDevice(): string {
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari expose navigator.standalone hors standard
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const mode = standalone ? 'PWA installee' : 'Navigateur';
  return `${mode} — ${navigator.userAgent.slice(0, 140)}`;
}

/**
 * Convertit la clé VAPID base64 en Uint8Array.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPO PUSH (NATIVE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Demande la permission et récupère le token Expo Push (native).
 */
async function registerForExpoPushAsync(): Promise<{
  token: string | null;
  status: Notifications.PermissionStatus | null;
}> {
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

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envoie le token Expo au backend pour stockage.
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
        type: 'expo',
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending push token to backend:', error);
    return false;
  }
}

/**
 * Envoie la subscription Web Push au backend pour stockage.
 */
export async function sendWebPushSubscriptionToBackend(
  subscription: PushSubscription,
  apiBaseUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/push/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        platform: 'web',
        type: 'webpush',
        device_label: describeWebDevice(),
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending web push subscription to backend:', error);
    return false;
  }
}
