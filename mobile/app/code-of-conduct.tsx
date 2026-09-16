import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { FullscreenImageModal } from '@/src/components/FullscreenImageModal';
import { PageHeader } from '@/src/components/PageHeader';
import { PosterPager, type PosterPagerHandle } from '@/src/components/PosterPager';
import { useLocale } from '@/src/i18n/LocaleContext';
import { CODE_OF_CONDUCT_SLIDES } from '@/src/lib/code-of-conduct';

/**
 * Code de conduite — carrousel horizontal (swipe gauche/droite) + lightbox.
 */
export default function CodeOfConductScreen() {
  const { t } = useLocale();
  const pagerRef = useRef<PosterPagerHandle>(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const current = CODE_OF_CONDUCT_SLIDES[index];
  const total = CODE_OF_CONDUCT_SLIDES.length;

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} nestedScrollEnabled>
        <BackButton fallbackHref="/(tabs)/more" />
        <PageHeader
          eyebrow={t('code.eyebrow')}
          title={t('code.title')}
          subtitle={t('code.intro')}
        />

        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            {index + 1} / {total}
          </Text>
          <Text style={styles.version}>{t('code.version')}</Text>
        </View>

        <PosterPager
          ref={pagerRef}
          slides={CODE_OF_CONDUCT_SLIDES}
          index={index}
          onIndexChange={setIndex}
          onPressSlide={() => setLightboxOpen(true)}
          enlargeLabel={t('common.tapToEnlarge')}
          prevLabel={t('common.prevSlide')}
          nextLabel={t('common.nextSlide')}
        />

        <Text style={styles.slideTitle}>{current?.title}</Text>
        <Text style={styles.swipeHint}>{t('common.swipeHint')}</Text>

        <View style={styles.dotsWrap}>
          {CODE_OF_CONDUCT_SLIDES.map((slide, i) => (
            <Pressable
              key={slide.id}
              onPress={() => pagerRef.current?.goTo(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: i === index }}
              accessibilityLabel={slide.title}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      </ScrollView>

      <FullscreenImageModal
        visible={lightboxOpen}
        source={current?.image ?? null}
        label={current?.title}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  screenContent: {
    paddingBottom: 120,
    alignItems: 'stretch',
    width: '100%',
  },
  counterRow: {
    paddingHorizontal: space.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.gap,
    width: '100%',
  },
  counter: { ...type.meta, color: theme.gold, fontSize: 12 },
  version: { ...type.meta, color: theme.muted, fontSize: 10 },
  slideTitle: {
    marginTop: space.card,
    paddingHorizontal: space.card,
    textAlign: 'center',
    ...type.title,
    fontSize: 16,
    color: theme.foreground,
    width: '100%',
  },
  swipeHint: {
    marginTop: 6,
    textAlign: 'center',
    ...type.meta,
    fontSize: 11,
    color: theme.muted,
    width: '100%',
  },
  dotsWrap: {
    width: '100%',
    paddingHorizontal: space.card,
    paddingTop: space.card,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotActive: {
    backgroundColor: theme.gold,
    width: 18,
  },
});
