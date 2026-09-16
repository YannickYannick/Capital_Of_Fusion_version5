import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Image, type ImageSource } from 'expo-image';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { radius, space, theme } from '@/constants/theme';

export type PosterSlide = {
  id: string;
  title: string;
  image: ImageSource;
};

export type PosterPagerHandle = {
  goTo: (index: number) => void;
};

type Props = {
  slides: PosterSlide[];
  index: number;
  onIndexChange: (index: number) => void;
  onPressSlide: () => void;
  enlargeLabel: string;
  prevLabel: string;
  nextLabel: string;
};

/**
 * Carrousel d’affiches. Index mis à jour via onScroll (web/PWA n’envoie
 * souvent pas onMomentumScrollEnd, d’où compteur et dots figés à 1/N).
 */
export const PosterPager = forwardRef<PosterPagerHandle, Props>(function PosterPager(
  { slides, index, onIndexChange, onPressSlide, enlargeLabel, prevLabel, nextLabel },
  ref,
) {
  const { width } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const dragged = useRef(false);
  const slideWidth = width;
  const total = slides.length;

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    onIndexChange(clamped);
    pagerRef.current?.scrollTo({ x: clamped * slideWidth, animated: true });
  };

  useImperativeHandle(ref, () => ({ goTo }), [total, slideWidth]);

  const syncIndex = (offsetX: number) => {
    if (slideWidth <= 0) return;
    const next = Math.round(offsetX / slideWidth);
    if (next >= 0 && next < total) onIndexChange(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncIndex(e.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.pagerWrap}>
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        directionalLockEnabled
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={slideWidth}
        snapToAlignment="start"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onScroll}
        onScrollBeginDrag={() => {
          dragged.current = false;
        }}
        onScrollEndDrag={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          if (Math.abs(x - index * slideWidth) > 8) dragged.current = true;
          syncIndex(x);
        }}
        style={[
          { width: slideWidth },
          Platform.OS === 'web' ? ({ touchAction: 'pan-x' } as const) : null,
        ]}
      >
        {slides.map((slide) => (
          <Pressable
            key={slide.id}
            onPress={() => {
              if (dragged.current) return;
              onPressSlide();
            }}
            delayPressIn={Platform.OS === 'web' ? 120 : 0}
            style={{ width: slideWidth }}
            accessibilityRole="imagebutton"
            accessibilityLabel={`${slide.title}. ${enlargeLabel}`}
          >
            <Image
              source={slide.image}
              style={[styles.poster, { width: slideWidth - space.card * 2 }]}
              contentFit="contain"
              pointerEvents="none"
            />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.navRow} pointerEvents="box-none">
        <Pressable
          onPress={() => goTo(index - 1)}
          disabled={index === 0}
          style={({ pressed }) => [
            styles.navBtn,
            index === 0 && styles.navBtnDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={prevLabel}
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
          accessibilityLabel={nextLabel}
        >
          <ChevronRight size={22} color={theme.foreground} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  pagerWrap: { position: 'relative', width: '100%', overflow: 'hidden' },
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
});
