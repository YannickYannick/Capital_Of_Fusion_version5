/**
 * Provider push notifications — demande permission au démarrage, enregistre le
 * token/subscription, et expose de quoi réactiver les notifs depuis l'UI.
 * Supporte Web Push (PWA) et Expo Push (native).
 */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  usePushNotifications,
  sendPushTokenToBackend,
  sendWebPushSubscriptionToBackend,
  enablePushNotifications,
  getCurrentPushPermission,
  isWebPushSupported,
} from '@/src/hooks/usePushNotifications';
import { getApiBaseUrl } from '@/src/lib/api';

type Props = { children: ReactNode };

/** État lisible par l'UI pour afficher/masquer le bouton d'activation. */
export type PushStatus = 'unsupported' | 'granted' | 'denied' | 'prompt';

type PushContextValue = {
  status: PushStatus;
  /** Requête en cours (bouton à désactiver). */
  isBusy: boolean;
  /** Relance la demande de permission puis l'enregistrement. */
  enable: () => Promise<void>;
};

const PushContext = createContext<PushContextValue | null>(null);

/**
 * Initialise les push notifications au montage et fournit le contexte.
 */
export function PushNotificationsProvider({ children }: Props) {
  const { expoPushToken, webPushSubscription, permission } = usePushNotifications();
  const [isBusy, setIsBusy] = useState(false);
  /** Permission relue après une action manuelle (prioritaire sur celle du montage). */
  const [manualPermission, setManualPermission] = useState<string | null>(null);

  // Enregistre le token Expo (native)
  useEffect(() => {
    if (!expoPushToken || Platform.OS === 'web') return;

    sendPushTokenToBackend(expoPushToken, getApiBaseUrl())
      .then((success) => {
        if (!success) console.warn('Failed to register Expo push token');
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
        if (!success) console.warn('Failed to register web push subscription');
      })
      .catch((err) => {
        console.error('Error registering web push subscription:', err);
      });
  }, [webPushSubscription]);

  const enable = useCallback(async () => {
    setIsBusy(true);
    try {
      const result = await enablePushNotifications(getApiBaseUrl());
      // Relit la permission réelle : `denied` doit rester affiché même si
      // l'enregistrement backend a échoué pour une autre raison.
      setManualPermission(getCurrentPushPermission() ?? result.status ?? null);
    } catch (err) {
      console.error('Error enabling push notifications:', err);
    } finally {
      setIsBusy(false);
    }
  }, []);

  // Au retour des réglages (PWA mise en arrière-plan), relit la permission
  // et ré-enregistre la souscription si elle est redevenue `granted`.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const current = getCurrentPushPermission();
      if (!current) return;
      setManualPermission(current);
      if (current === 'granted') {
        enablePushNotifications(getApiBaseUrl()).catch((err) => {
          console.error('Error re-syncing push after visibility:', err);
        });
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const status: PushStatus = useMemo(() => {
    if (!isWebPushSupported()) return 'unsupported';

    const current = manualPermission ?? permission ?? getCurrentPushPermission();
    if (current === 'granted') return 'granted';
    if (current === 'denied') return 'denied';
    return 'prompt';
  }, [manualPermission, permission]);

  const value = useMemo(() => ({ status, isBusy, enable }), [status, isBusy, enable]);

  return <PushContext.Provider value={value}>{children}</PushContext.Provider>;
}

/** Accès à l'état des notifications push. */
export function usePushStatus(): PushContextValue {
  const ctx = useContext(PushContext);
  if (!ctx) {
    throw new Error('usePushStatus must be used within PushNotificationsProvider');
  }
  return ctx;
}
