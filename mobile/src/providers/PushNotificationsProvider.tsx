/**
 * Provider push notifications — demande permission au démarrage et enregistre le token.
 */
import { ReactNode, useEffect } from 'react';
import { usePushNotifications, sendPushTokenToBackend } from '@/src/hooks/usePushNotifications';
import { API_BASE_URL } from '@/src/lib/api';

type Props = { children: ReactNode };

/**
 * Initialise les push notifications au montage.
 * - Demande la permission
 * - Récupère le token Expo Push
 * - Envoie le token au backend
 */
export function PushNotificationsProvider({ children }: Props) {
  const { expoPushToken, permission } = usePushNotifications();

  useEffect(() => {
    if (!expoPushToken) return;

    // Envoie le token au backend
    sendPushTokenToBackend(expoPushToken, API_BASE_URL)
      .then((success) => {
        if (success) {
          console.log('Push token registered with backend');
        } else {
          console.warn('Failed to register push token with backend');
        }
      })
      .catch((err) => {
        console.error('Error registering push token:', err);
      });
  }, [expoPushToken]);

  useEffect(() => {
    if (permission && permission !== 'granted') {
      console.log('Push notification permission:', permission);
    }
  }, [permission]);

  return <>{children}</>;
}
