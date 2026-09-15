import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { ArtistRow } from '@/src/components/ArtistRow';
import { PageHeader } from '@/src/components/PageHeader';
import { Chip } from '@/src/components/ui/Chip';
import { useArtists } from '@/src/hooks/useArtists';
import { useLocale } from '@/src/i18n/LocaleContext';
import { sortArtistsLikeWeb } from '@/src/lib/api/artists';
import { getApiBaseUrl } from '@/src/lib/api';

type LineupFilter = 'all' | 'team' | 'guests';

/** Liste artistes — tri comme la page web /artistes + filtres Team / Guests. */
export default function LineupScreen() {
  const { t } = useLocale();
  const { artists, loading, error } = useArtists();
  const [filter, setFilter] = useState<LineupFilter>('all');
  const sorted = useMemo(() => sortArtistsLikeWeb(artists), [artists]);

  const filtered = useMemo(() => {
    if (filter === 'team') return sorted.filter((a) => a.is_staff_member);
    if (filter === 'guests') return sorted.filter((a) => !a.is_staff_member);
    return sorted;
  }, [sorted, filter]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHeader eyebrow={t('lineup.eyebrow')} title={t('lineup.title')} compact />

      {!loading && !error && sorted.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label={t('lineup.filterAll')}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
            variant="day"
          />
          <Chip
            label={t('lineup.filterTeam')}
            active={filter === 'team'}
            onPress={() => setFilter('team')}
            variant="day"
          />
          <Chip
            label={t('lineup.filterGuests')}
            active={filter === 'guests'}
            onPress={() => setFilter('guests')}
            variant="stage"
          />
        </ScrollView>
      )}

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

      {!loading && !error && filtered.length === 0 && (
        <Text style={styles.error}>{t('lineup.empty')}</Text>
      )}

      {!loading && !error && filtered.length > 0 && (
        <View style={styles.list}>
          {filtered.map((artist, index) => (
            <ArtistRow key={String(artist.id)} artist={artist} rank={index + 1} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  chips: { paddingHorizontal: space.card, gap: 8, paddingBottom: space.card },
  list: { paddingHorizontal: space.card, gap: space.gap },
  center: { paddingVertical: 48, alignItems: 'center' },
  error: { paddingHorizontal: space.card, ...type.body, color: theme.muted },
});
