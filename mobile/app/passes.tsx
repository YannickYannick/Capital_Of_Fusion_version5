import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Image, type ImageSource } from 'expo-image';
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
import {
  FESTIVAL_PASSES,
  PASS_INTRO,
  PASS_WARNING,
  passImages,
} from '@/src/lib/passes';

type PassSlide = {
  id: string;
  title: string;
  image: ImageSource;
};

/**
 * Passes — même format que Code de conduite : carrousel horizontal + lightbox.
 */
export default function PassesScreen() {
  const { width } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const slides = useMemo<PassSlide[]>(
    () => [
      {
        id: 'intro',
        title: 'Quel accès avec mon pass ?',
        image: passImages.intro,
      },
      ...FESTIVAL_PASSES.map((pass) => ({
        id: pass.id,
        title: pass.title,
        image: passImages[pass.imageKey],
      })),
    ],
    [],
  );

  const slideWidth = width;
  const current = slides[index];
  const total = slides.length;

  const onPagerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (next >= 0 && next < total) setIndex(next);
  };

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
        <PageHeader eyebrow="Billetterie" title="Passes" subtitle={PASS_INTRO} />

        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            {index + 1} / {total}
          </Text>
          <Text style={styles.version}>PBVF 2026</Text>
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
            {slides.map((slide) => (
              <Pressable
                key={slide.id}
                onPress={() => setLightboxOpen(true)}
                style={{ width: slideWidth }}
                accessibilityRole="imagebutton"
                accessibilityLabel={`${slide.title}. Agrandir`}
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
              accessibilityLabel="Slide précédente"
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
              accessibilityLabel="Slide suivante"
            >
              <ChevronRight size={22} color={theme.foreground} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.slideTitle}>{current?.title}</Text>
        <Text style={styles.swipeHint}>Glisse à gauche ou à droite · tap pour agrandir</Text>
        <Text style={styles.warning}>{PASS_WARNING}</Text>

        <View style={styles.dotsWrap}>
          {slides.map((slide, i) => (
            <Pressable
              key={slide.id}
              onPress={() => goTo(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: i === index }}
              accessibilityLabel={`Aller à ${slide.title}`}
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
  warning: {
    marginTop: 10,
    paddingHorizontal: space.card,
    textAlign: 'center',
    ...type.body,
    fontSize: 13,
    color: theme.gold,
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
