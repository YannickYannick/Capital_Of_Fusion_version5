import { MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PageHeader } from '@/src/components/PageHeader';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { FESTIVAL, MAP_POINTS, images } from '@/src/lib/festival-data';

export default function MapScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow="Sur site" title="Carte" compact />
      <View style={styles.pad}>
        <GlassCard>
          <Image
            source={images.siteMap}
            style={styles.mapImg}
            contentFit="cover"
            accessibilityLabel={`Plan du site — ${FESTIVAL.displayName}`}
          />
        </GlassCard>

        <View style={styles.list}>
          {MAP_POINTS.map((p, i) => (
            <View key={p.name} style={[styles.point, i < MAP_POINTS.length - 1 && styles.pointBorder]}>
              <MapPin size={16} color={theme.gold} strokeWidth={2} />
              <View style={styles.pointBody}>
                <Text style={styles.pointName}>{p.name}</Text>
                <Text style={styles.pointDetail}>{p.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  pad: { paddingHorizontal: space.card },
  mapImg: { width: '100%', aspectRatio: 0.85 },
  list: {
    marginTop: space.gapLg,
    borderRadius: radius.card,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pointBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  pointBody: { flex: 1 },
  pointName: { ...type.bodyMedium, color: theme.foreground },
  pointDetail: { marginTop: 2, ...type.caption, color: theme.muted },
});
