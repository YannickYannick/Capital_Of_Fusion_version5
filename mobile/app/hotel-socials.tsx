import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { FullscreenImageModal } from '@/src/components/FullscreenImageModal';
import { PageHeader } from '@/src/components/PageHeader';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { HOTEL_DAY_SOCIALS, images } from '@/src/lib/festival-data';

/**
 * Horaires Hotel Day Socials — affiche + liste par jour.
 */
export default function HotelSocialsScreen() {
  const { t, dayLabel } = useLocale();
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
        <BackButton fallbackHref="/(tabs)/more" />
        <PageHeader eyebrow={t('hotelSocials.eyebrow')} title={t('hotelSocials.title')} compact />

        <View style={styles.pad}>
          <Text style={styles.intro}>{t('hotelSocials.intro')}</Text>
          <Text style={styles.address}>{t('hotelSocials.address')}</Text>

          <Pressable
            onPress={() => setLightbox(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel={t('hotelSocials.posterA11y')}
            style={styles.posterWrap}
          >
            <Image
              source={images.hotelDaySocials}
              style={styles.poster}
              contentFit="contain"
              accessibilityLabel={t('hotelSocials.posterA11y')}
            />
          </Pressable>

          <SurfaceCard style={styles.listCard}>
            {HOTEL_DAY_SOCIALS.map((row, i) => {
              const day = dayLabel({ id: row.dayId, label: row.dayId, date: '' });
              return (
                <View
                  key={row.dayId}
                  style={[styles.row, i < HOTEL_DAY_SOCIALS.length - 1 && styles.rowBorder]}
                >
                  <Text style={styles.day}>{day.label}</Text>
                  <Text style={styles.hours}>
                    {row.start} – {row.end}
                  </Text>
                </View>
              );
            })}
          </SurfaceCard>
        </View>
      </ScrollView>

      <FullscreenImageModal
        visible={lightbox}
        source={images.hotelDaySocials}
        label={t('hotelSocials.posterA11y')}
        onClose={() => setLightbox(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  pad: { paddingHorizontal: space.card, gap: 12 },
  intro: { ...type.body, color: theme.textSoft, fontSize: 14, lineHeight: 20 },
  address: { ...type.caption, color: theme.muted },
  posterWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  poster: { width: '100%', aspectRatio: 1, backgroundColor: theme.surface2 },
  listCard: { paddingVertical: 4, paddingHorizontal: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },
  day: { ...type.bodyMedium, color: theme.foreground },
  hours: { ...type.body, color: theme.gold, fontSize: 14 },
});
