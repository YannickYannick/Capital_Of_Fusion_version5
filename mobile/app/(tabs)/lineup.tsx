import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { ArtistRow } from '@/src/components/ArtistRow';
import { PageHeader } from '@/src/components/PageHeader';
import { useArtists } from '@/src/hooks/useArtists';
import { sortArtistsLikeWeb } from '@/src/lib/api/artists';
import { getApiBaseUrl } from '@/src/lib/api';

/** Liste artistes — tri comme la page web /artistes. */
export default function LineupScreen() {
  const { artists, loading, error } = useArtists();
  const sorted = useMemo(() => sortArtistsLikeWeb(artists), [artists]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow="Capital of Fusion" title="Artistes" compact />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.gold} size="large" />
        </View>
      )}

      {error && (
        <Text style={styles.error}>
          {error}
          {'\n\n'}API : {getApiBaseUrl()}
        </Text>
      )}

      {!loading && !error && sorted.length === 0 && (
        <Text style={styles.error}>Aucun artiste trouvé.</Text>
      )}

      {!loading && !error && sorted.length > 0 && (
        <View style={styles.list}>
          {sorted.map((artist, index) => (
            <ArtistRow key={String(artist.id)} artist={artist} rank={index + 1} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  list: { paddingHorizontal: space.card, gap: space.gap },
  center: { paddingVertical: 48, alignItems: 'center' },
  error: { paddingHorizontal: space.card, ...type.body, color: theme.muted },
});
