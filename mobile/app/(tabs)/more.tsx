import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { LanguageFlags } from '@/src/components/LanguageFlags';
import { NotificationsToggle } from '@/src/components/NotificationsToggle';
import { PageHeader } from '@/src/components/PageHeader';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { FESTIVAL } from '@/src/lib/festival-data';

/**
 * Groupe de cartes Infos avec un titre de section.
 */
function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

/**
 * Menu Infos — sections App / Sur place / Compétitions / Règles / Aide.
 */
export default function MoreScreen() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow={t('more.eyebrow')} title={t('more.title')} compact />

      <View style={styles.list}>
        <InfoSection title={t('more.sectionApp')}>
          <GlassCard style={styles.card}>
            <LanguageFlags />
          </GlassCard>
          <GlassCard style={styles.card}>
            <NotificationsToggle />
          </GlassCard>
        </InfoSection>

        <InfoSection title={t('more.sectionOnSite')}>
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
          <Pressable onPress={() => router.push('/hotel-socials')} accessibilityRole="button">
            <GlassCard style={styles.card}>
              <Text style={styles.title}>{t('more.hotelSocialsTitle')}</Text>
              <Text style={styles.body}>{t('more.hotelSocialsBody')}</Text>
            </GlassCard>
          </Pressable>
        </InfoSection>

        <InfoSection title={t('more.sectionCompetitions')}>
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
        </InfoSection>

        <InfoSection title={t('more.sectionRules')}>
          <Pressable onPress={() => router.push('/festival-rules')} accessibilityRole="button">
            <GlassCard style={[styles.card, styles.rulesCard]}>
              <Text style={styles.title}>{t('more.rulesTitle')}</Text>
              <Text style={styles.body}>{t('more.rulesBody')}</Text>
            </GlassCard>
          </Pressable>
          <Pressable onPress={() => router.push('/code-of-conduct')} accessibilityRole="button">
            <GlassCard style={styles.card}>
              <Text style={styles.title}>{t('more.codeTitle')}</Text>
              <Text style={styles.body}>{t('more.codeBody')}</Text>
            </GlassCard>
          </Pressable>
        </InfoSection>

        <InfoSection title={t('more.sectionHelp')}>
          <Pressable onPress={() => router.push('/faq')} accessibilityRole="button">
            <GlassCard style={styles.card}>
              <Text style={styles.title}>{t('more.faqTitle')}</Text>
              <Text style={styles.body}>{t('more.faqBody')}</Text>
            </GlassCard>
          </Pressable>
        </InfoSection>
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
  list: { paddingHorizontal: space.card, gap: space.gapLg },
  section: { gap: space.gap },
  heading: {
    ...type.meta,
    color: theme.gold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
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
