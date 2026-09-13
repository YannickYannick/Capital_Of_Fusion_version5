import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { artistDisplayName, artistSubtitle } from '@/src/lib/api/artists';
import { artistLinkRows } from '@/src/lib/profileLinks';
import { CtaRow } from '@/src/components/ui/CtaRow';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useArtist } from '@/src/hooks/useArtist';

export default function ArtistDetailScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const resolvedUsername = typeof username === 'string' ? username : undefined;
  const { artist, loading, error } = useArtist(resolvedUsername);

  const name = artist ? artistDisplayName(artist) : '';
  const subtitle = artist ? artistSubtitle(artist) : '';
  const links = artist ? artistLinkRows(artist.external_links) : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Retour</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.gold} size="large" />
        </View>
      )}

      {error && !loading && (
        <Text style={styles.error}>{error}</Text>
      )}

      {artist && !loading && (
        <>
          <View style={styles.heroWrap}>
            {artist.cover_image ? (
              <Image source={{ uri: artist.cover_image }} style={styles.heroImage} contentFit="cover" />
            ) : artist.profile_picture ? (
              <Image source={{ uri: artist.profile_picture }} style={styles.heroImage} contentFit="cover" />
            ) : (
              <View style={styles.heroFallback}>
                <Text style={styles.heroInitial}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <LinearGradient colors={['transparent', theme.background]} style={StyleSheet.absoluteFill} />
            {artist.profile_picture && artist.cover_image ? (
              <Image source={{ uri: artist.profile_picture }} style={styles.avatarOverlay} contentFit="cover" />
            ) : null}
          </View>

          <View style={styles.header}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>{subtitle}</Text>
            {artist.is_staff_member ? (
              <Text style={styles.badge}>Membre Team CoF</Text>
            ) : null}
          </View>

          {artist.bio ? (
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.bio}>{artist.bio.trim()}</Text>
            </GlassCard>
          ) : null}

          {artist.linked_partner_structures && artist.linked_partner_structures.length > 0 ? (
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Structures partenaires</Text>
              {artist.linked_partner_structures.map((s) => (
                <Text key={s.slug} style={styles.partner}>
                  {s.name}
                </Text>
              ))}
            </GlassCard>
          ) : null}

          {links.length > 0 ? (
            <GlassCard style={styles.linksCard}>
              <Text style={styles.sectionTitle}>Liens</Text>
              {links.map((link) => (
                <CtaRow key={link.key} label={link.label} onPress={() => Linking.openURL(link.url)} />
              ))}
            </GlassCard>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  topBar: { paddingHorizontal: space.card, paddingTop: 12, zIndex: 2 },
  back: { ...type.meta, color: theme.gold, textTransform: 'none', letterSpacing: 0 },
  center: { paddingVertical: 48, alignItems: 'center' },
  error: { paddingHorizontal: space.card, ...type.body, color: theme.muted },
  heroWrap: { height: 200, position: 'relative', marginTop: 4 },
  heroImage: { width: '100%', height: '100%' },
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
