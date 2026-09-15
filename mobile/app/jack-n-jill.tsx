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
import { JACK_N_JILL, images } from '@/src/lib/festival-data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabId = 'infos' | 'juges';
type LightboxState = { source: ImageSource; label: string } | null;

/** Panel id festival-data → clé titre i18n. */
const PANEL_TITLE_KEYS: Record<string, string> = {
  saturday: 'jack.panelSaturday',
  'sunday-rounds': 'jack.panelSundayRounds',
  'sunday-final': 'jack.panelSundayFinal',
};

/**
 * Page Jack N Jill — onglets Infos / Juges ; affiches repliées par défaut.
 */
export default function JackNJillScreen() {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>('infos');
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [openPosterId, setOpenPosterId] = useState<string | null>(null);

  const togglePoster = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenPosterId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
        <BackButton fallbackHref="/(tabs)/more" />

        <PageHeader
          eyebrow={t('jack.eyebrow')}
          title={t('jack.title')}
          subtitle={t('jack.intro')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Chip
            label={t('jack.tabInfos')}
            active={tab === 'infos'}
            onPress={() => setTab('infos')}
            variant="day"
          />
          <Chip
            label={t('jack.tabJudges')}
            active={tab === 'juges'}
            onPress={() => setTab('juges')}
            variant="day"
          />
        </ScrollView>

        {tab === 'infos' ? (
          <View style={styles.list}>
            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('jack.saturdayTitle')}</Text>
              <Text style={styles.body}>{t('jack.saturdayBody')}</Text>
              <CollapsiblePoster
                id="saturday"
                open={openPosterId === 'saturday'}
                onToggle={() => togglePoster('saturday')}
                source={images.jackNJillSaturday}
                label={t('jack.saturdayPoster')}
                onOpenFullscreen={() =>
                  setLightbox({
                    source: images.jackNJillSaturday,
                    label: t('jack.saturdayPoster'),
                  })
                }
              />
            </SurfaceCard>

            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('jack.sundayTitle')}</Text>
              <Text style={styles.body}>{t('jack.sundayBody')}</Text>
              <CollapsiblePoster
                id="sunday"
                open={openPosterId === 'sunday'}
                onToggle={() => togglePoster('sunday')}
                source={images.jackNJillSunday}
                label={t('jack.sundayPoster')}
                onOpenFullscreen={() =>
                  setLightbox({
                    source: images.jackNJillSunday,
                    label: t('jack.sundayPoster'),
                  })
                }
              />
            </SurfaceCard>

            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{t('jack.registrationTitle')}</Text>
              <Text style={styles.body}>{t('jack.registrationHint')}</Text>
              <CtaRow
                label={t('jack.ctaAmateur')}
                onPress={() => Linking.openURL(JACK_N_JILL.registrationAmateur)}
              />
              <View style={styles.ctaSpacer} />
              <CtaRow
                label={t('jack.ctaPro')}
                onPress={() => Linking.openURL(JACK_N_JILL.registrationPro)}
              />
            </SurfaceCard>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.judgesIntro}>{t('jack.judgesIntro')}</Text>
            {JACK_N_JILL.judgesPanels.map((panel) => {
              const source = images[panel.imageKey];
              const panelTitle = t(PANEL_TITLE_KEYS[panel.id] ?? panel.title);
              return (
                <SurfaceCard key={panel.id} style={styles.card}>
                  <Text style={styles.sectionTitle}>{panelTitle}</Text>
                  <View style={styles.judgeList}>
                    {panel.judges.map((name) => (
                      <Text key={name} style={styles.judgeName}>
                        {name}
                      </Text>
                    ))}
                  </View>
                  <CollapsiblePoster
                    id={panel.id}
                    open={openPosterId === panel.id}
                    onToggle={() => togglePoster(panel.id)}
                    source={source}
                    label={panelTitle}
                    onOpenFullscreen={() => setLightbox({ source, label: panelTitle })}
                  />
                </SurfaceCard>
              );
            })}
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
  id: string;
  open: boolean;
  onToggle: () => void;
  source: ImageSource;
  label: string;
  onOpenFullscreen: () => void;
};

/**
 * Affiche repliée par défaut — toggle « Voir l’affiche », puis plein écran au 2e clic.
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
  judgesIntro: { ...type.body, color: theme.muted, marginBottom: 4 },
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
  judgeList: { gap: 4, marginTop: 4 },
  judgeName: { ...type.bodyMedium, color: theme.gold },
  ctaSpacer: { height: 8 },
});
