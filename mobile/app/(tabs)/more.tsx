import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { LanguageFlags } from '@/src/components/LanguageFlags';
import { PageHeader } from '@/src/components/PageHeader';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { FESTIVAL, images } from '@/src/lib/festival-data';

export default function MoreScreen() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow={t('more.eyebrow')} title={t('more.title')} compact />

      <View style={styles.list}>
        <GlassCard style={styles.card}>
          <LanguageFlags />
        </GlassCard>

        <Pressable onPress={() => router.push('/passes')} accessibilityRole="button">
          <GlassCard style={styles.passCard}>
            <View style={styles.passRow}>
              <Image source={images.bracelet} style={styles.passImg} contentFit="cover" />
              <View style={styles.passText}>
                <Text style={styles.passTitle}>{t('more.passesTitle')}</Text>
                <Text style={styles.passBody}>{t('more.passesBody')}</Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/shuttles')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{t('more.shuttlesTitle')}</Text>
            <Text style={styles.body}>{t('more.shuttlesBody')}</Text>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/jack-n-jill')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{t('more.jackTitle')}</Text>
            <Text style={styles.body}>{t('more.jackBody')}</Text>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/all-star-street-battle')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{t('more.battleTitle')}</Text>
            <Text style={styles.body}>{t('more.battleBody')}</Text>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/code-of-conduct')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{t('more.codeTitle')}</Text>
            <Text style={styles.body}>{t('more.codeBody')}</Text>
          </GlassCard>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        {t('more.footer', {
          name: FESTIVAL.name,
          location: FESTIVAL.location,
          edition: FESTIVAL.edition,
        })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  list: { paddingHorizontal: space.card, gap: space.gap },
  card: { padding: space.card },
  passCard: { padding: space.card },
  passRow: { flexDirection: 'row', gap: space.card, alignItems: 'center' },
  passImg: { width: 72, height: 72, borderRadius: radius.card },
  passText: { flex: 1 },
  passTitle: { ...type.title, color: theme.foreground },
  passBody: { marginTop: 4, ...type.body, fontSize: 14, color: theme.muted },
  title: { ...type.title, fontSize: 16, color: theme.foreground },
  body: { marginTop: 4, ...type.body, fontSize: 14, color: theme.muted },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    ...type.meta,
    fontSize: 10,
    color: theme.muted,
  },
});
