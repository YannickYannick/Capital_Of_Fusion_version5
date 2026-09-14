import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useAnnouncements } from '@/src/providers/AnnouncementsProvider';

/**
 * Fil d’annonces normales sur l’accueil (hors urgentes).
 */
export function HomeAnnouncements() {
  const router = useRouter();
  const { normal } = useAnnouncements();

  if (normal.length === 0) return null;

  const openLink = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('/')) {
      router.push(trimmed as `/passes`);
      return;
    }
    Linking.openURL(trimmed).catch(() => undefined);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Annonces</Text>
      {normal.map((item) => (
        <Pressable
          key={String(item.id)}
          onPress={item.link_url ? () => openLink(item.link_url) : undefined}
          disabled={!item.link_url}
          accessibilityRole={item.link_url ? 'button' : 'text'}
        >
          <GlassCard style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            {item.link_label ? <Text style={styles.link}>{item.link_label}</Text> : null}
          </GlassCard>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.gap },
  heading: {
    ...type.meta,
    color: theme.gold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: { padding: space.card },
  title: { ...type.title, fontSize: 16, color: theme.foreground },
  body: { marginTop: 4, ...type.body, fontSize: 14, color: theme.muted },
  link: { marginTop: 8, ...type.meta, color: theme.gold, fontSize: 12 },
});
