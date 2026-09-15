import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { artistDisplayName, artistSubtitle } from '@/src/lib/api/artists';
import { artistLinkRows } from '@/src/lib/profileLinks';
import { BackButton } from '@/src/components/BackButton';
import { CtaRow } from '@/src/components/ui/CtaRow';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useArtist } from '@/src/hooks/useArtist';
import { useLocale } from '@/src/i18n/LocaleContext';
import { PRODUCTION_API_URL } from '@/src/lib/api';
import { fixMojibake } from '@/src/lib/textEncoding';

/** Pré-génère les fiches artistes pour l'export PWA (static). */
export async function generateStaticParams(): Promise<{ username: string }[]> {
  try {
    const res = await fetch(`${PRODUCTION_API_URL}/api/users/artists/`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const artists = (await res.json()) as { username?: string }[];
    return artists
      .map((a) => a.username)
      .filter((u): u is string => Boolean(u))
      .map((username) => ({ username }));
  } catch {
    return [];
  }
}

export default function ArtistDetailScreen() {
  const { t, locale } = useLocale();
  const { username } = useLocalSearchParams<{ username: string }>();
  const resolvedUsername = typeof username === 'string' ? username : undefined;
  const { artist, loading, error } = useArtist(resolvedUsername);

  const name = artist ? artistDisplayName(artist) : '';
  const subtitle = artist ? artistSubtitle(artist) : '';
  const links = artist ? artistLinkRows(artist.external_links) : [];
  const heroUri = artist?.cover_image || artist?.profile_picture || null;

  /**
   * Bio selon locale (fallback FR).
   */
  const localizedBio = (() => {
    if (!artist) return '';
    if (locale === 'en' && artist.bio_en?.trim()) return artist.bio_en;
    if (locale === 'es' && artist.bio_es?.trim()) return artist.bio_es;
    return artist.bio ?? '';
  })();

  return (
    <View style={styles.screen}>
      <View style={styles.backLayer} pointerEvents="box-none">
        <BackButton floating fallbackHref="/(tabs)/lineup" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={theme.gold} size="large" />
          </View>
        )}

        {error && !loading && <Text style={styles.error}>{error}</Text>}

        {!loading && !error && !artist && (
          <Text style={styles.error}>{t('artist.notFound')}</Text>
        )}

        {artist && !loading && (
          <>
            <View style={styles.heroWrap}>
              {heroUri ? (
                <Image
                  source={{ uri: heroUri }}
                  style={styles.heroImage}
                  contentFit="cover"
                  contentPosition="center"
                />
              ) : (
                <View style={styles.heroFallback}>
                  <Text style={styles.heroInitial}>{name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              {/* Dégradé limité au bas — le haut de la photo reste lisible. */}
              <LinearGradient
                colors={['transparent', theme.background]}
                style={styles.heroFade}
                pointerEvents="none"
              />
              {artist.profile_picture && artist.cover_image ? (
                <Image
                  source={{ uri: artist.profile_picture }}
                  style={styles.avatarOverlay}
                  contentFit="cover"
                  contentPosition="center"
                />
              ) : null}
            </View>

            <View style={styles.header}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.meta}>{subtitle}</Text>
              {artist.is_staff_member ? (
                <Text style={styles.badge}>{t('artist.staffBadge')}</Text>
              ) : null}
            </View>

            {localizedBio ? (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>{t('artist.about')}</Text>
                <Text style={styles.bio}>{fixMojibake(localizedBio).trim()}</Text>
              </GlassCard>
            ) : null}

            {artist.linked_partner_structures && artist.linked_partner_structures.length > 0 ? (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>{t('artist.partners')}</Text>
                {artist.linked_partner_structures.map((s) => (
                  <Text key={s.slug} style={styles.partner}>
                    {s.name}
                  </Text>
                ))}
              </GlassCard>
            ) : null}

            {links.length > 0 ? (
              <GlassCard style={styles.linksCard}>
                <Text style={styles.sectionTitle}>{t('artist.links')}</Text>
                {links.map((link) => (
                  <CtaRow key={link.key} label={link.label} onPress={() => Linking.openURL(link.url)} />
                ))}
              </GlassCard>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  backLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  center: { paddingVertical: 120, alignItems: 'center' },
  error: { paddingHorizontal: space.card, paddingTop: 100, ...type.body, color: theme.muted },
  heroWrap: { height: 380, position: 'relative', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '32%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitial: { fontFamily: fonts.display, fontSize: 48, color: theme.gold },
  avatarOverlay: {
    position: 'absolute',
    left: space.screen,
    bottom: -28,
    width: 72,
    height: 72,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: theme.background,
  },
  header: {
    paddingHorizontal: space.screen,
    paddingTop: 36,
    paddingBottom: space.gap,
  },
  name: { ...type.display, color: theme.foreground },
  meta: { marginTop: 4, ...type.caption, color: theme.gold },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    ...type.meta,
    color: theme.foreground,
    backgroundColor: theme.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.chip,
    overflow: 'hidden',
  },
  section: {
    marginHorizontal: space.card,
    marginBottom: space.gap,
    padding: space.card,
    gap: 8,
  },
  linksCard: {
    marginHorizontal: space.card,
    marginBottom: space.gap,
    paddingTop: space.card,
    overflow: 'hidden',
  },
  sectionTitle: { ...type.title, color: theme.foreground },
  bio: { ...type.body, color: theme.textSoft },
  partner: { ...type.body, color: theme.muted },
});
