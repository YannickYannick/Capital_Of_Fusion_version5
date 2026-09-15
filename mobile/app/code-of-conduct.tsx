import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { FullscreenImageModal } from '@/src/components/FullscreenImageModal';
import { PageHeader } from '@/src/components/PageHeader';
import { useLocale } from '@/src/i18n/LocaleContext';
import { CODE_OF_CONDUCT_SLIDES } from '@/src/lib/code-of-conduct';

/**
 * Code de conduite — carrousel horizontal (swipe gauche/droite) + lightbox.
 */
export default function CodeOfConductScreen() {
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const slideWidth = width;
  const current = CODE_OF_CONDUCT_SLIDES[index];
  const total = CODE_OF_CONDUCT_SLIDES.length;

  /**
   * Met à jour l’index après un snap horizontal.
   */
  const onPagerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (next >= 0 && next < total) setIndex(next);
  };

  /**
   * Saute à une slide (dots / flèches).
   */
  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    setIndex(clamped);
    pagerRef.current?.scrollTo({ x: clamped * slideWidth, animated: true });
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
      >
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

        <View style={styles.pagerWrap}>
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPagerScrollEnd}
            decelerationRate="fast"
            style={{ width: slideWidth }}
          >
            {CODE_OF_CONDUCT_SLIDES.map((slide) => (
              <Pressable
                key={slide.id}
                onPress={() => setLightboxOpen(true)}
                style={{ width: slideWidth }}
                accessibilityRole="imagebutton"
                accessibilityLabel={`${slide.title}. ${t('common.tapToEnlarge')}`}
              >
                <Image
                  source={slide.image}
                  style={[styles.poster, { width: slideWidth - space.card * 2 }]}
                  contentFit="contain"
                />
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.navRow}>
            <Pressable
              onPress={() => goTo(index - 1)}
              disabled={index === 0}
              style={({ pressed }) => [
                styles.navBtn,
                index === 0 && styles.navBtnDisabled,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('common.prevSlide')}
            >
              <ChevronLeft size={22} color={theme.foreground} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => goTo(index + 1)}
              disabled={index === total - 1}
              style={({ pressed }) => [
                styles.navBtn,
                index === total - 1 && styles.navBtnDisabled,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('common.nextSlide')}
            >
              <ChevronRight size={22} color={theme.foreground} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.slideTitle}>{current?.title}</Text>
        <Text style={styles.swipeHint}>{t('common.swipeHint')}</Text>

        <View style={styles.dotsWrap}>
          {CODE_OF_CONDUCT_SLIDES.map((slide, i) => (
            <Pressable
              key={slide.id}
              onPress={() => goTo(i)}
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
  pagerWrap: { position: 'relative', width: '100%' },
  poster: {
    alignSelf: 'center',
    height: 480,
    borderRadius: radius.card,
  },
  navRow: {
    position: 'absolute',
    top: '42%',
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 14, 39, 0.72)',
  },
  navBtnDisabled: { opacity: 0.25 },
  pressed: { opacity: 0.7 },
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
