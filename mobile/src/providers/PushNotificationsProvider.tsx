/**
 * Provider push notifications — demande permission au démarrage et enregistre le token/subscription.
 * Supporte Web Push (PWA) et Expo Push (native).
 */
import { ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  usePushNotifications,
  sendPushTokenToBackend,
  sendWebPushSubscriptionToBackend,
} from '@/src/hooks/usePushNotifications';
import { getApiBaseUrl } from '@/src/lib/api';

type Props = { children: ReactNode };

/**
 * Initialise les push notifications au montage.
 * - Demande la permission
 * - Récupère le token (Expo) ou subscription (Web Push)
 * - Envoie au backend
 */
export function PushNotificationsProvider({ children }: Props) {
  const { expoPushToken, webPushSubscription, permission } = usePushNotifications();

  // Enregistre le token Expo (native)
  useEffect(() => {
    if (!expoPushToken || Platform.OS === 'web') return;

    sendPushTokenToBackend(expoPushToken, getApiBaseUrl())
      .then((success) => {
        if (success) {
          console.log('Expo push token registered with backend');
        } else {
          console.warn('Failed to register Expo push token');
        }
      })
      .catch((err) => {
        console.error('Error registering Expo push token:', err);
      });
  }, [expoPushToken]);

  // Enregistre la subscription Web Push (PWA)
  useEffect(() => {
    if (!webPushSubscription || Platform.OS !== 'web') return;

    sendWebPushSubscriptionToBackend(webPushSubscription, getApiBaseUrl())
      .then((success) => {
        if (success) {
          console.log('Web push subscription registered with backend');
        } else {
          console.warn('Failed to register web push subscription');
        }
      })
      .catch((err) => {
        console.error('Error registering web push subscription:', err);
      });
  }, [webPushSubscription]);

  useEffect(() => {
    if (permission && permission !== 'granted') {
      console.log('Push notification permission:', permission);
    }
  }, [permission]);

  return <>{children}</>;
}
