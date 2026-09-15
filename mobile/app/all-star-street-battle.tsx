import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { Image, type ImageSource } from 'expo-image';
import {
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { BackButton } from '@/src/components/BackButton';
import { FullscreenImageModal } from '@/src/components/FullscreenImageModal';
import { PageHeader } from '@/src/components/PageHeader';
import { Chip } from '@/src/components/ui/Chip';
import { CtaRow } from '@/src/components/ui/CtaRow';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { useLocale } from '@/src/i18n/LocaleContext';
import { ALL_STAR_STREET_BATTLE, images } from '@/src/lib/festival-data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabId = 'infos' | 'reglement';
type LightboxState = { source: ImageSource; label: string } | null;

/**
 * Page All Star Street Bachata Battle — Infos / Règlement + affiche + inscriptions.
 * Alignée sur la fiche web /organisation/noeuds/all-star-street-bachata-battle.
 */
export default function AllStarStreetBattleScreen() {
  const { t, tList } = useLocale();
  const [tab, setTab] = useState<TabId>('infos');
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [posterOpen, setPosterOpen] = useState(false);

  const formatBullets = tList('battle.formatBullets');
  const rulesBullets = tList('battle.rulesBullets');

  const togglePoster = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosterOpen((prev) => !prev);
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
        <BackButton fallbackHref="/(tabs)/more" />

        <PageHeader
          eyebrow={t('battle.eyebrow')}
          title={t('battle.title')}
          subtitle={t('battle.intro')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Chip
            label={t('battle.tabInfos')}
            active={tab === 'infos'}
            onPress={() => setTab('infos')}
            variant="day"
          />
          <Chip
            label={t('battle.tabRules')}
            active={tab === 'reglement'}
            onPress={() => setTab('reglement')}
            variant="day"
          />
        </ScrollView>

        {tab === 'infos' ? (
          <View style={styles.list}>
            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('battle.overviewTitle')}</Text>
              <Text style={styles.body}>{t('battle.overviewBody')}</Text>
              <CollapsiblePoster
                open={posterOpen}
                onToggle={togglePoster}
                source={images.streetBachataBattle}
                label={t('battle.posterLabel')}
                onOpenFullscreen={() =>
                  setLightbox({
                    source: images.streetBachataBattle,
                    label: t('battle.posterLabel'),
                  })
                }
              />
            </SurfaceCard>

            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('battle.formatTitle')}</Text>
              {formatBullets.map((line) => (
                <Text key={line} style={styles.bullet}>
                  • {line}
                </Text>
              ))}
            </SurfaceCard>

            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('battle.registrationTitle')}</Text>
              <Text style={styles.body}>{t('battle.registrationHint')}</Text>
              <CtaRow
                label={t('battle.ctaPrimary')}
                onPress={() => Linking.openURL(ALL_STAR_STREET_BATTLE.registrationPrimary)}
              />
              <View style={styles.ctaSpacer} />
              <CtaRow
                label={t('battle.ctaSecondary')}
                onPress={() => Linking.openURL(ALL_STAR_STREET_BATTLE.registrationSecondary)}
              />
            </SurfaceCard>
          </View>
        ) : (
          <View style={styles.list}>
            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('battle.rulesTitle')}</Text>
              {rulesBullets.map((line) => (
                <Text key={line} style={styles.bullet}>
                  • {line}
                </Text>
              ))}
            </SurfaceCard>
          </View>
        )}
      </ScrollView>

      <FullscreenImageModal
        visible={lightbox != null}
        source={lightbox?.source ?? null}
        label={lightbox?.label}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}

type CollapsiblePosterProps = {
  open: boolean;
  onToggle: () => void;
  source: ImageSource;
  label: string;
  onOpenFullscreen: () => void;
};

/**
 * Affiche repliée par défaut — toggle puis plein écran.
 */
function CollapsiblePoster({
  open,
  onToggle,
  source,
  label,
  onOpenFullscreen,
}: CollapsiblePosterProps) {
  const { t } = useLocale();
  const toggleLabel = open ? t('common.hidePoster') : t('common.seePoster');

  return (
    <View style={styles.posterBlock}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.posterToggle, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={toggleLabel}
      >
        <Text style={styles.posterToggleLabel}>{toggleLabel}</Text>
        <ChevronDown
          size={18}
          color={theme.gold}
          strokeWidth={2}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      {open ? (
        <Pressable
          onPress={onOpenFullscreen}
          accessibilityRole="imagebutton"
          accessibilityLabel={`${t('common.tapToEnlarge')} — ${label}`}
        >
          <Image source={source} style={styles.poster} contentFit="contain" accessibilityLabel={label} />
          <Text style={styles.posterHint}>{t('common.tapToEnlarge')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  tabs: { paddingHorizontal: space.card, gap: 8, paddingBottom: space.gap },
  list: { paddingHorizontal: space.card, gap: space.gap, marginTop: space.gap },
  card: { padding: space.card, gap: 10 },
  sectionTitle: { ...type.title, color: theme.foreground },
  body: { ...type.body, color: theme.muted },
  bullet: { ...type.body, color: theme.muted, marginTop: 2 },
  posterBlock: { gap: 8, marginTop: 4 },
  posterToggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.chip,
    backgroundColor: theme.goldSoft,
    borderWidth: 1,
    borderColor: theme.goldBorder,
  },
  posterToggleLabel: { ...type.meta, color: theme.gold, fontWeight: '700' },
  pressed: { opacity: 0.85 },
  poster: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 12,
    backgroundColor: theme.surface,
  },
  posterHint: {
    marginTop: 6,
    ...type.caption,
    color: theme.muted,
    textAlign: 'center',
  },
  ctaSpacer: { height: 8 },
});
