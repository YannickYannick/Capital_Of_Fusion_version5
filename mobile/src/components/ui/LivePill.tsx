import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';

type LivePillProps = {
  /** Instant cible du compteur (fin du live, ou ouverture festival). */
  target: Date;
};

/**
 * Formate ms restantes → H:MM:SS ou MM:SS.
 */
function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

/**
 * Pill compteur — temps restant jusqu’à `target` (tick 1s).
 */
export function LivePill({ target }: LivePillProps) {
  const { t } = useLocale();
  const targetMs = target.getTime();
  const [label, setLabel] = useState(() => formatRemaining(targetMs - Date.now()));

  useEffect(() => {
    const tick = () => setLabel(formatRemaining(targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return (
    <View style={styles.pill} accessibilityLabel={t('home.remainingA11y', { label })}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
    backgroundColor: theme.goldSoft,
    minWidth: 64,
    alignItems: 'center',
  },
  text: {
    ...type.meta,
    color: theme.gold,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
});
