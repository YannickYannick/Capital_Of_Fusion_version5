import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';
import { usePushStatus } from '@/src/providers/PushNotificationsProvider';

/**
 * État des notifications push + bouton d'activation / réactivation.
 * Masqué si le navigateur ne gère pas les Web Push.
 */
export function NotificationsToggle() {
  const { t } = useLocale();
  const { status, isBusy, enable } = usePushStatus();

  if (status === 'unsupported') return null;

  const onPress = async () => {
    // Sur natif, un refus est définitif côté OS : on ouvre les réglages.
    if (status === 'denied' && Platform.OS !== 'web') {
      await Linking.openSettings();
      return;
    }
    await enable();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('more.notifsLabel')}</Text>

      {status === 'granted' ? (
        <View style={styles.statusRow}>
          <View style={styles.dotOn} />
          <Text style={styles.statusOn}>{t('more.notifsOn')}</Text>
        </View>
      ) : null}

      {status === 'prompt' ? (
        <Text style={styles.body}>{t('more.notifsOffBody')}</Text>
      ) : null}

      {status === 'denied' ? (
        <>
          <View style={styles.statusRow}>
            <View style={styles.dotOff} />
            <Text style={styles.statusOff}>{t('more.notifsBlocked')}</Text>
          </View>
          <Text style={styles.body}>{t('more.notifsBlockedHelp')}</Text>
        </>
      ) : null}

      {status !== 'granted' ? (
        <Pressable
          onPress={onPress}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityState={{ disabled: isBusy }}
          style={({ pressed }) => [styles.button, pressed && styles.pressed, isBusy && styles.pressed]}
        >
          {isBusy ? (
            <ActivityIndicator color={theme.gold} size="small" />
          ) : (
            <Text style={styles.buttonLabel}>
              {status === 'denied' ? t('more.notifsRetry') : t('more.notifsEnable')}
            </Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { ...type.meta, color: theme.gold },
  body: { ...type.body, fontSize: 13, color: theme.muted },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotOn: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.gold },
  dotOff: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.muted },
  statusOn: { ...type.body, fontSize: 14, color: theme.foreground },
  statusOff: { ...type.body, fontSize: 14, color: theme.foreground },
  button: {
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: space.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: theme.gold,
    backgroundColor: theme.goldSoft,
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { ...type.body, fontSize: 14, color: theme.gold, fontWeight: '600' },
});
