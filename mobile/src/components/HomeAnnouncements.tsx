import { useState } from 'react';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import {
  Linking,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { images } from '@/src/lib/festival-data';
import {
  type FestivalAnnouncement,
} from '@/src/lib/announcements';
import { useAnnouncements } from '@/src/providers/AnnouncementsProvider';

const APP_SHARE_URL = 'https://app.capitaloffusion.com';

/**
 * True si l’annonce est le partage app (QR + URL).
 */
function isShareAnnouncement(item: FestivalAnnouncement): boolean {
  if (item.id === 'seed-share-app') return true;
  if (item.image_url?.includes('app-share-qr')) return true;
  const url = (item.link_url || '').trim().toLowerCase();
  return url.startsWith(APP_SHARE_URL);
}

/**
 * Source image : asset local ou URL absolue.
 */
function resolveShareImage(imageUrl?: string) {
  if (!imageUrl || imageUrl === 'local:app-share-qr' || imageUrl.includes('app-share-qr')) {
    return images.appShareQr;
  }
  return { uri: imageUrl };
}

/**
 * Fil d’annonces normales sur l’accueil (hors urgentes).
 * La première peut être un partage QR + URL.
 */
export function HomeAnnouncements() {
  const router = useRouter();
  const { t } = useLocale();
  const { normal } = useAnnouncements();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyUrl = async (item: FestivalAnnouncement) => {
    const url = (item.link_url || APP_SHARE_URL).trim();
    if (!url) return;
    await Clipboard.setStringAsync(url);
    setCopiedId(String(item.id));
    setTimeout(() => setCopiedId((cur) => (cur === String(item.id) ? null : cur)), 2000);
  };

  const shareUrl = async (item: FestivalAnnouncement) => {
    const url = (item.link_url || APP_SHARE_URL).trim();
    if (!url) return;
    try {
      await Share.share({ message: url, url });
    } catch {
      await copyUrl(item);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{t('home.announcements')}</Text>
      {normal.map((item) => {
        const share = isShareAnnouncement(item);
        if (share) {
          const url = (item.link_url || APP_SHARE_URL).trim();
          const copied = copiedId === String(item.id);
          return (
            <GlassCard key={String(item.id)} style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <View style={styles.qrWrap}>
                <Image
                  source={resolveShareImage(item.image_url)}
                  style={styles.qr}
                  contentFit="contain"
                  accessibilityLabel={t('home.shareQrA11y')}
                />
              </View>
              <Pressable
                onPress={() => copyUrl(item)}
                accessibilityRole="button"
                accessibilityLabel={t('home.shareCopy')}
              >
                <Text style={styles.url} selectable>
                  {url}
                </Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => copyUrl(item)}
                  style={styles.actionBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.actionText}>
                    {copied ? t('home.shareCopied') : t('home.shareCopy')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => shareUrl(item)}
                  style={styles.actionBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.actionText}>{t('home.shareNative')}</Text>
                </Pressable>
              </View>
            </GlassCard>
          );
        }

        return (
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
        );
      })}
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
  qrWrap: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.card,
    padding: 10,
  },
  qr: { width: 168, height: 168 },
  url: {
    marginTop: 12,
    ...type.meta,
    color: theme.gold,
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.chip,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.surface2,
  },
  actionText: { ...type.meta, color: theme.foreground, fontSize: 12 },
});
