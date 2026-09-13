import { ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { artistDisplayName, artistSubtitle } from '@/src/lib/api/artists';
import type { ArtistApi } from '@/src/types/api';

type ArtistRowProps = {
  artist: ArtistApi;
};

export function ArtistRow({ artist }: ArtistRowProps) {
  const router = useRouter();
  const name = artistDisplayName(artist);
  const subtitle = artistSubtitle(artist);
  const initial = name.charAt(0).toUpperCase();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/artist/${artist.username}`)}
      accessibilityRole="button"
      accessibilityLabel={`Voir le profil de ${name}`}
    >
      {artist.profile_picture ? (
        <Image source={{ uri: artist.profile_picture }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={theme.muted} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.surface,
    borderRadius: radius.card,
  },
  avatar: { width: 56, height: 56, borderRadius: radius.card },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    backgroundColor: theme.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { ...type.title, color: theme.gold },
  body: { flex: 1, minWidth: 0 },
  name: { ...type.title, fontSize: 16, color: theme.foreground },
  meta: { marginTop: 2, ...type.caption, color: theme.gold },
});
