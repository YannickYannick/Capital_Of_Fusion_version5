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
import { JACK_N_JILL, images } from '@/src/lib/festival-data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabId = 'infos' | 'juges';
type LightboxState = { source: ImageSource; label: string } | null;

/**
 * Page Jack N Jill — onglets Infos / Juges ; affiches repliées par défaut.
 */
export default function JackNJillScreen() {
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

        <PageHeader eyebrow="Compétition" title="Jack N Jill Vibe" subtitle={JACK_N_JILL.intro} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Chip label="Infos" active={tab === 'infos'} onPress={() => setTab('infos')} variant="day" />
          <Chip label="Juges" active={tab === 'juges'} onPress={() => setTab('juges')} variant="day" />
        </ScrollView>

        {tab === 'infos' ? (
          <View style={styles.list}>
            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{JACK_N_JILL.saturdayTitle}</Text>
              <Text style={styles.body}>{JACK_N_JILL.saturdayBody}</Text>
              <CollapsiblePoster
                id="saturday"
                open={openPosterId === 'saturday'}
                onToggle={() => togglePoster('saturday')}
                source={images.jackNJillSaturday}
                label={JACK_N_JILL.saturdayPosterLabel}
                onOpenFullscreen={() =>
                  setLightbox({
                    source: images.jackNJillSaturday,
                    label: JACK_N_JILL.saturdayPosterLabel,
                  })
                }
              />
            </SurfaceCard>

            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>{JACK_N_JILL.sundayTitle}</Text>
              <Text style={styles.body}>{JACK_N_JILL.sundayBody}</Text>
              <CollapsiblePoster
                id="sunday"
                open={openPosterId === 'sunday'}
                onToggle={() => togglePoster('sunday')}
                source={images.jackNJillSunday}
                label={JACK_N_JILL.sundayPosterLabel}
                onOpenFullscreen={() =>
                  setLightbox({
                    source: images.jackNJillSunday,
                    label: JACK_N_JILL.sundayPosterLabel,
                  })
                }
              />
            </SurfaceCard>

            <SurfaceCard style={styles.card}>
              <Text style={styles.sectionTitle}>Inscriptions</Text>
              <Text style={styles.body}>{JACK_N_JILL.registrationHint}</Text>
              <CtaRow
                label="Catégorie amateur"
                onPress={() => Linking.openURL(JACK_N_JILL.registrationAmateur)}
              />
              <View style={styles.ctaSpacer} />
              <CtaRow
                label="Catégorie professionnelle"
                onPress={() => Linking.openURL(JACK_N_JILL.registrationPro)}
              />
            </SurfaceCard>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.judgesIntro}>{JACK_N_JILL.judgesIntro}</Text>
            {JACK_N_JILL.judgesPanels.map((panel) => {
              const source = images[panel.imageKey];
              return (
                <SurfaceCard key={panel.id} style={styles.card}>
                  <Text style={styles.sectionTitle}>{panel.title}</Text>
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
                    label={panel.title}
                    onOpenFullscreen={() => setLightbox({ source, label: panel.title })}
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
  return (
    <View style={styles.posterBlock}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.posterToggle, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? 'Masquer l’affiche' : 'Voir l’affiche'}
      >
        <Text style={styles.posterToggleLabel}>{open ? 'Masquer l’affiche' : 'Voir l’affiche'}</Text>
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
          accessibilityLabel={`Agrandir — ${label}`}
        >
          <Image source={source} style={styles.poster} contentFit="contain" accessibilityLabel={label} />
          <Text style={styles.posterHint}>Appuyer pour agrandir</Text>
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
