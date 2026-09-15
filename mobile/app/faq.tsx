import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { PageHeader } from '@/src/components/PageHeader';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { faqForLocale } from '@/src/lib/faq';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * FAQ — accordéon Q/R, contenu aligné site Support / FAQ.
 */
export default function FaqScreen() {
  const { t, locale } = useLocale();
  const items = faqForLocale(locale);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <BackButton fallbackHref="/(tabs)/more" />
      <PageHeader eyebrow={t('faq.eyebrow')} title={t('faq.title')} subtitle={t('faq.subtitle')} />

      <View style={styles.list}>
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <SurfaceCard key={item.id} style={styles.card}>
              <Pressable
                onPress={() => toggle(item.id)}
                style={({ pressed }) => [styles.qRow, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <Text style={styles.question}>{item.question}</Text>
                <ChevronDown
                  size={18}
                  color={theme.gold}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
              </Pressable>
              {open ? <Text style={styles.answer}>{item.answer}</Text> : null}
            </SurfaceCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  list: { paddingHorizontal: space.card, gap: space.gap, marginTop: space.gap },
  card: { padding: space.card, gap: 10 },
  qRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pressed: { opacity: 0.85 },
  question: {
    ...type.title,
    fontSize: 15,
    color: theme.foreground,
    flex: 1,
  },
  answer: {
    ...type.body,
    color: theme.muted,
    marginTop: 4,
    lineHeight: 22,
  },
});
