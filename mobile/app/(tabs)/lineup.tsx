import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { ArtistRow } from '@/src/components/ArtistRow';
import { PageHeader } from '@/src/components/PageHeader';
import { useArtists } from '@/src/hooks/useArtists';
import { getApiBaseUrl } from '@/src/lib/api';
export default function LineupScreen() {
  const { artists, loading, error } = useArtists();

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
          {'\n'}Redémarre Metro après changement de .env (Ctrl+C puis npm run start:go).
        </Text>
      )}
      {!loading && !error && artists.length === 0 && (
        <Text style={styles.error}>Aucun artiste trouvé.</Text>
      )}

      {!loading && !error && artists.length > 0 && (
        <View style={styles.list}>
          {artists.map((artist) => (
            <ArtistRow key={String(artist.id)} artist={artist} />
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
