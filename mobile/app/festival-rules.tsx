import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { PageHeader } from '@/src/components/PageHeader';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RuleSection = {
  id: string;
  icon: string;
  titleKey: string;
  contentKey: string;
};

const SECTIONS: RuleSection[] = [
  { id: 'main-venue', icon: '🏢', titleKey: 'rules.mainVenueTitle', contentKey: 'rules.mainVenueContent' },
  { id: 'saturday', icon: '🌊', titleKey: 'rules.saturdayTitle', contentKey: 'rules.saturdayContent' },
  { id: 'hotel', icon: '🏨', titleKey: 'rules.hotelTitle', contentKey: 'rules.hotelContent' },
  { id: 'party-end', icon: '🌙', titleKey: 'rules.partyEndTitle', contentKey: 'rules.partyEndContent' },
  { id: 'staff', icon: '🛟', titleKey: 'rules.staffTitle', contentKey: 'rules.staffContent' },
];

export default function FestivalRulesScreen() {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <BackButton />
      <PageHeader eyebrow={t('rules.eyebrow')} title={t('rules.title')} compact />

      <View style={styles.pad}>
        {/* Intro */}
        <GlassCard style={styles.introCard}>
          <Text style={styles.introText}>{t('rules.intro')}</Text>
        </GlassCard>

        {/* Sections accordéon */}
        <View style={styles.accordion}>
          {SECTIONS.map((section, idx) => {
            const isOpen = openId === section.id;
            const isLast = idx === SECTIONS.length - 1;
            return (
              <View key={section.id} style={[styles.sectionBlock, !isLast && styles.sectionBorder]}>
                <Pressable
                  onPress={() => toggle(section.id)}
                  style={({ pressed }) => [styles.sectionHeader, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.sectionIcon}>{section.icon}</Text>
                  <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
                  <ChevronDown
                    size={18}
                    color={theme.muted}
                    strokeWidth={2}
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </Pressable>
                {isOpen && (
                  <View style={styles.sectionBody}>
                    <Text style={styles.sectionContent}>{t(section.contentKey)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer respect */}
        <GlassCard style={styles.footerCard}>
          <Text style={styles.footerText}>{t('rules.footer')}</Text>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  pad: { paddingHorizontal: space.card },
  introCard: {
    marginBottom: space.gap,
  },
  introText: {
    ...type.body,
    color: theme.foreground,
    lineHeight: 22,
  },
  accordion: {
    borderRadius: radius.card,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  sectionBlock: {},
  sectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    ...type.bodyMedium,
    color: theme.foreground,
  },
  pressed: { opacity: 0.85 },
  sectionBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  sectionContent: {
    ...type.body,
    color: theme.muted,
    lineHeight: 22,
  },
  footerCard: {
    marginTop: space.gap,
    borderWidth: 1,
    borderColor: theme.gold + '40',
    backgroundColor: theme.gold + '10',
  },
  footerText: {
    ...type.body,
    color: theme.gold,
    textAlign: 'center',
    lineHeight: 24,
  },
});
