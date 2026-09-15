import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { LanguageFlags } from '@/src/components/LanguageFlags';
import { PageHeader } from '@/src/components/PageHeader';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { FESTIVAL } from '@/src/lib/festival-data';

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

        <Pressable onPress={() => router.push('/festival-rules')} accessibilityRole="button">
          <GlassCard style={[styles.card, styles.rulesCard]}>
            <Text style={styles.title}>{t('more.rulesTitle')}</Text>
            <Text style={styles.body}>{t('more.rulesBody')}</Text>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/passes')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{t('more.passesTitle')}</Text>
            <Text style={styles.body}>{t('more.passesBody')}</Text>
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

        <Pressable onPress={() => router.push('/faq')} accessibilityRole="button">
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{t('more.faqTitle')}</Text>
            <Text style={styles.body}>{t('more.faqBody')}</Text>
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
  rulesCard: {
    borderWidth: 1,
    borderColor: theme.gold + '50',
    backgroundColor: theme.gold + '08',
  },
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
