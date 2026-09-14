import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Play } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Image, type ImageSource } from 'expo-image';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';

import { radius, space, theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { FullscreenImageModal } from '@/src/components/FullscreenImageModal';
import { PageHeader } from '@/src/components/PageHeader';
import { AccesVenueVideo } from '@/src/components/SiteEntryVideo';
import { GlassCard } from '@/src/components/ui/SurfaceCard';
import { FESTIVAL, VENUE_AREAS, images, type VenueArea } from '@/src/lib/festival-data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AREAS12_TAB_ID = 'areas-1-2';
const ENTRY_TAB_ID = 'site-entry';
const TEASER_TAB_ID = 'acces-teaser';

/** Adresse venue officielle — copie presse-papiers au clic. */
const VENUE_ADDRESS = '18–19 rue du Colonel Pierre Avia, 75015 Paris';

type LightboxState = { source: ImageSource; label: string } | null;

/**
 * Carte venue — overview, toggles zones, vidéos, lightbox plein écran au clic.
 */
export default function MapScreen() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    if (!addressCopied) return;
    const t = setTimeout(() => setAddressCopied(false), 1800);
    return () => clearTimeout(t);
  }, [addressCopied]);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  const openImage = (source: ImageSource, label: string) => {
    setLightbox({ source, label });
  };

  /**
   * Copie l’adresse venue dans le presse-papiers.
   */
  const copyAddress = async () => {
    await Clipboard.setStringAsync(VENUE_ADDRESS);
    setAddressCopied(true);
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHeader eyebrow="Sur site" title="Carte" compact />
        <View style={styles.pad}>
          <Text style={styles.sectionLabel}>Vue d’ensemble</Text>
          <GlassCard>
            <Pressable
              onPress={() =>
                openImage(images.venueOverview, `Plan d'ensemble — ${FESTIVAL.displayName}`)
              }
              accessibilityRole="imagebutton"
              accessibilityLabel="Agrandir le plan d'ensemble"
            >
              <Image
                source={images.venueOverview}
                style={styles.mapImg}
                contentFit="contain"
                accessibilityLabel={`Plan d'ensemble — ${FESTIVAL.displayName}`}
              />
            </Pressable>
          </GlassCard>
          <Pressable
            onPress={copyAddress}
            accessibilityRole="button"
            accessibilityLabel="Copier l’adresse"
            hitSlop={8}
            style={({ pressed }) => [styles.addressBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.hint, addressCopied && styles.hintCopied]}>
              {addressCopied ? 'Adresse copiée' : VENUE_ADDRESS}
            </Text>
          </Pressable>

          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Zones & salles</Text>
          <View style={styles.accordion}>
            <View style={[styles.areaBlock, styles.areaBorder]}>
              <Pressable
                onPress={() => toggle(AREAS12_TAB_ID)}
                style={({ pressed }) => [styles.areaHeader, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ expanded: openId === AREAS12_TAB_ID }}
                accessibilityLabel={`Zones 1 et 2. ${openId === AREAS12_TAB_ID ? 'Réduire' : 'Voir le plan'}`}
              >
                <MapPin size={16} color={theme.gold} strokeWidth={2} />
                <View style={styles.areaHeaderBody}>
                  <Text style={styles.areaName}>Zones 1 & 2</Text>
                  <Text style={styles.areaDetail}>La Palmeraie & Aquaboulevard — plan combiné</Text>
                </View>
                <ChevronDown
                  size={18}
                  color={theme.muted}
                  strokeWidth={2}
                  style={{
                    transform: [{ rotate: openId === AREAS12_TAB_ID ? '180deg' : '0deg' }],
                  }}
                />
              </Pressable>
              {openId === AREAS12_TAB_ID ? (
                <View style={[styles.areaBody, styles.areaBorder]}>
                  <Pressable
                    onPress={() =>
                      openImage(
                        images.venueAreas12,
                        'Plan Zones 1 et 2 — La Palmeraie et Aquaboulevard',
                      )
                    }
                    accessibilityRole="imagebutton"
                    accessibilityLabel="Agrandir le plan Zones 1 et 2"
                  >
                    <Image
                      source={images.venueAreas12}
                      style={styles.mapImgAreas12}
                      contentFit="contain"
                      accessibilityLabel="Plan Zones 1 et 2 — La Palmeraie et Aquaboulevard"
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>

            {VENUE_AREAS.map((area) => (
              <VenueAreaRow
                key={area.id}
                area={area}
                open={openId === area.id}
                onToggle={() => toggle(area.id)}
                onOpenImage={openImage}
                showBorder
              />
            ))}

            <VideoAccordionRow
              id={ENTRY_TAB_ID}
              open={openId === ENTRY_TAB_ID}
              onToggle={() => toggle(ENTRY_TAB_ID)}
              title="Plan d’entrée"
              detail="Vidéo — comment entrer sur le site"
              showBorder
            >
              <AccesVenueVideo kind="site-entry" active={openId === ENTRY_TAB_ID} aspectRatio={1} />
              <Text style={styles.videoHint}>
                Les zones n’ouvrent pas toutes aux mêmes horaires — suis la signalétique sur place.
              </Text>
            </VideoAccordionRow>

            <VideoAccordionRow
              id={TEASER_TAB_ID}
              open={openId === TEASER_TAB_ID}
              onToggle={() => toggle(TEASER_TAB_ID)}
              title="Accès & Venue"
              detail="Vidéo teaser — page Accès & Venue"
              showBorder={false}
            >
              <AccesVenueVideo
                kind="teaser"
                active={openId === TEASER_TAB_ID}
                aspectRatio={9 / 16}
              />
            </VideoAccordionRow>
          </View>
        </View>
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

type VideoAccordionRowProps = {
  id: string;
  open: boolean;
  onToggle: () => void;
  title: string;
  detail: string;
  showBorder: boolean;
  children: React.ReactNode;
};

/**
 * Accordéon vidéo — en-tête + contenu lecteur.
 */
function VideoAccordionRow({
  open,
  onToggle,
  title,
  detail,
  showBorder,
  children,
}: VideoAccordionRowProps) {
  return (
    <View style={[styles.areaBlock, showBorder && styles.areaBorder]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.areaHeader, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${open ? 'Réduire' : 'Voir la vidéo'}`}
      >
        <Play size={16} color={theme.gold} strokeWidth={2} />
        <View style={styles.areaHeaderBody}>
          <Text style={styles.areaName}>{title}</Text>
          <Text style={styles.areaDetail}>{detail}</Text>
        </View>
        <ChevronDown
          size={18}
          color={theme.muted}
          strokeWidth={2}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? <View style={styles.areaBody}>{children}</View> : null}
    </View>
  );
}

type VenueAreaRowProps = {
  area: VenueArea;
  open: boolean;
  onToggle: () => void;
  onOpenImage: (source: ImageSource, label: string) => void;
  showBorder: boolean;
};

/**
 * Ligne accordéon : en-tête zone + plan + liste des sous-areas si ouvert.
 */
function VenueAreaRow({ area, open, onToggle, onOpenImage, showBorder }: VenueAreaRowProps) {
  const mapSource = images[area.mapKey];

  return (
    <View style={[styles.areaBlock, showBorder && styles.areaBorder]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.areaHeader, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${area.name}. ${open ? 'Réduire' : 'Voir les sous-espaces'}`}
      >
        <MapPin size={16} color={theme.gold} strokeWidth={2} />
        <View style={styles.areaHeaderBody}>
          <Text style={styles.areaName}>{area.name}</Text>
          <Text style={styles.areaDetail}>{area.detail}</Text>
        </View>
        <ChevronDown
          size={18}
          color={theme.muted}
          strokeWidth={2}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      {open ? (
        <View style={[styles.areaBody, showBorder && styles.areaBorder]}>
          <Pressable
            onPress={() => onOpenImage(mapSource, `Plan — ${area.name}`)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Agrandir le plan ${area.name}`}
          >
            <Image
              source={mapSource}
              style={styles.zoneMapImg}
              contentFit="contain"
              accessibilityLabel={`Plan — ${area.name}`}
            />
          </Pressable>
          <View style={styles.subList}>
            {area.subAreas.map((sub, j) => (
              <View
                key={sub.name}
                style={[styles.subRow, j < area.subAreas.length - 1 && styles.subBorder]}
              >
                <View style={styles.subDot} />
                <View style={styles.pointBody}>
                  <Text style={styles.pointName}>{sub.name}</Text>
                  <Text style={styles.pointDetail}>{sub.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  pad: { paddingHorizontal: space.card },
  sectionLabel: {
    ...type.meta,
    color: theme.gold,
    marginBottom: 10,
  },
  sectionSpaced: { marginTop: space.gapLg },
  hint: {
    marginTop: 8,
    ...type.caption,
    color: theme.muted,
  },
  hintCopied: {
    color: theme.gold,
  },
  addressBtn: {
    alignSelf: 'flex-start',
  },
  mapImg: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: theme.surface2,
  },
  mapImgAreas12: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: radius.card,
    backgroundColor: theme.surface2,
  },
  accordion: {
    borderRadius: radius.card,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  areaBlock: {},
  areaBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  areaHeaderBody: { flex: 1 },
  areaName: { ...type.bodyMedium, color: theme.foreground },
  areaDetail: { marginTop: 2, ...type.caption, color: theme.muted },
  pressed: { opacity: 0.85 },
  areaBody: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 12,
  },
  zoneMapImg: {
    width: '100%',
    aspectRatio: 1.25,
    borderRadius: radius.card,
    backgroundColor: theme.surface2,
  },
  subList: {
    borderRadius: radius.card,
    backgroundColor: theme.surface2,
    overflow: 'hidden',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  subBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.gold,
  },
  pointBody: { flex: 1 },
  pointName: { ...type.bodyMedium, color: theme.foreground },
  pointDetail: { marginTop: 2, ...type.caption, color: theme.muted },
  videoHint: { ...type.caption, color: theme.muted },
});
