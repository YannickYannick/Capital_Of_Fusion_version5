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
import { useLocale } from '@/src/i18n/LocaleContext';
import { VENUE_AREAS, images, type VenueArea } from '@/src/lib/festival-data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AREAS12_TAB_ID = 'areas-1-2';
const ENTRY_TAB_ID = 'site-entry';
const TEASER_TAB_ID = 'acces-teaser';

/** Clés i18n name/detail pour une zone venue (id festival-data). */
const AREA_I18N: Record<string, { name: string; detail: string }> = {
  palmeraie: { name: 'map.palmeraieName', detail: 'map.palmeraieDetail' },
  aquaboulevard: { name: 'map.aquaboulevardName', detail: 'map.aquaboulevardDetail' },
};

/**
 * Clés i18n sous-espaces — indexés par le nom stable de festival-data.
 */
const SUB_I18N: Record<string, { name: string; detail: string }> = {
  'La Casa Room': { name: 'map.subCasa', detail: 'map.subCasaDetail' },
  'La Escuela Room': { name: 'map.subEscuela', detail: 'map.subEscuelaDetail' },
  'La Vibe Room': { name: 'map.subVibe', detail: 'map.subVibeDetail' },
  'El Patio Room': { name: 'map.subPatio', detail: 'map.subPatioDetail' },
  'Antille Beach': { name: 'map.subAntille', detail: 'map.subAntilleDetail' },
  'Mangrove Area': { name: 'map.subMangrove', detail: 'map.subMangroveDetail' },
  'Caribbean Beach': { name: 'map.subCaribbean', detail: 'map.subCaribbeanDetail' },
  'Surf Pool': { name: 'map.subSurf', detail: 'map.subSurfDetail' },
  Jonas: { name: 'map.subJonas', detail: 'map.subJonasDetail' },
};

type LightboxState = { source: ImageSource; label: string } | null;

/**
 * Carte venue — overview, toggles zones, vidéos, lightbox plein écran au clic.
 */
export default function MapScreen() {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    if (!addressCopied) return;
    const timer = setTimeout(() => setAddressCopied(false), 1800);
    return () => clearTimeout(timer);
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
    await Clipboard.setStringAsync(t('map.address'));
    setAddressCopied(true);
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 120 }}>
        <PageHeader eyebrow={t('map.eyebrow')} title={t('map.title')} compact />
        <View style={styles.pad}>
          <Text style={styles.sectionLabel}>{t('map.overview')}</Text>
          <GlassCard>
            <Pressable
              onPress={() => openImage(images.venueOverview, t('map.overviewPlan'))}
              accessibilityRole="imagebutton"
              accessibilityLabel={t('map.overviewExpandA11y')}
            >
              <Image
                source={images.venueOverview}
                style={styles.mapImg}
                contentFit="contain"
                accessibilityLabel={t('map.overviewPlan')}
              />
            </Pressable>
          </GlassCard>
          <Pressable
            onPress={copyAddress}
            accessibilityRole="button"
            accessibilityLabel={t('map.copyAddressA11y')}
            hitSlop={8}
            style={({ pressed }) => [styles.addressBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.hint, addressCopied && styles.hintCopied]}>
              {addressCopied ? t('map.addressCopied') : t('map.address')}
            </Text>
          </Pressable>

          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>{t('map.zones')}</Text>
          <View style={styles.accordion}>
            <View style={[styles.areaBlock, styles.areaBorder]}>
              <Pressable
                onPress={() => toggle(AREAS12_TAB_ID)}
                style={({ pressed }) => [styles.areaHeader, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ expanded: openId === AREAS12_TAB_ID }}
                accessibilityLabel={`${t('map.areas12Name')}. ${
                  openId === AREAS12_TAB_ID ? t('common.collapse') : t('common.seePlan')
                }`}
              >
                <MapPin size={16} color={theme.gold} strokeWidth={2} />
                <View style={styles.areaHeaderBody}>
                  <Text style={styles.areaName}>{t('map.areas12Name')}</Text>
                  <Text style={styles.areaDetail}>{t('map.areas12Detail')}</Text>
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
                    onPress={() => openImage(images.venueAreas12, t('map.areas12Plan'))}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={t('map.areas12ExpandA11y')}
                  >
                    <Image
                      source={images.venueAreas12}
                      style={styles.mapImgAreas12}
                      contentFit="contain"
                      accessibilityLabel={t('map.areas12Plan')}
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
              title={t('map.entryTitle')}
              detail={t('map.entryDetail')}
              showBorder
            >
              <AccesVenueVideo kind="site-entry" active={openId === ENTRY_TAB_ID} aspectRatio={1} />
              <Text style={styles.videoHint}>{t('map.entryHint')}</Text>
            </VideoAccordionRow>

            <VideoAccordionRow
              id={TEASER_TAB_ID}
              open={openId === TEASER_TAB_ID}
              onToggle={() => toggle(TEASER_TAB_ID)}
              title={t('map.teaserTitle')}
              detail={t('map.teaserDetail')}
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
  const { t } = useLocale();

  return (
    <View style={[styles.areaBlock, showBorder && styles.areaBorder]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.areaHeader, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${open ? t('common.collapse') : t('common.seeVideo')}`}
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
  const { t } = useLocale();
  const mapSource = images[area.mapKey];
  const areaKeys = AREA_I18N[area.id];
  const areaName = areaKeys ? t(areaKeys.name) : area.name;
  const areaDetail = areaKeys ? t(areaKeys.detail) : area.detail;

  return (
    <View style={[styles.areaBlock, showBorder && styles.areaBorder]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.areaHeader, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${areaName}. ${
          open ? t('common.collapse') : t('common.seeSubspaces')
        }`}
      >
        <MapPin size={16} color={theme.gold} strokeWidth={2} />
        <View style={styles.areaHeaderBody}>
          <Text style={styles.areaName}>{areaName}</Text>
          <Text style={styles.areaDetail}>{areaDetail}</Text>
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
          {/* Adresse spéciale samedi pour Aquaboulevard */}
          {area.id === 'aquaboulevard' && (
            <View style={styles.addressHighlight}>
              <Text style={styles.addressDay}>{t('map.aquaboulevardAddressDay')}</Text>
              <Text style={styles.addressText}>{t('map.aquaboulevardAddress')}</Text>
            </View>
          )}
          <Pressable
            onPress={() => onOpenImage(mapSource, t('map.planLabel', { name: areaName }))}
            accessibilityRole="imagebutton"
            accessibilityLabel={t('map.expandPlanA11y', { name: areaName })}
          >
            <Image
              source={mapSource}
              style={styles.zoneMapImg}
              contentFit="contain"
              accessibilityLabel={t('map.planLabel', { name: areaName })}
            />
          </Pressable>
          <View style={styles.subList}>
            {area.subAreas.map((sub, j) => {
              const subKeys = SUB_I18N[sub.name];
              const subName = subKeys ? t(subKeys.name) : sub.name;
              const subDetail = subKeys ? t(subKeys.detail) : sub.detail;
              return (
                <View
                  key={sub.name}
                  style={[styles.subRow, j < area.subAreas.length - 1 && styles.subBorder]}
                >
                  <View style={styles.subDot} />
                  <View style={styles.pointBody}>
                    <Text style={styles.pointName}>{subName}</Text>
                    <Text style={styles.pointDetail}>{subDetail}</Text>
                  </View>
                </View>
              );
            })}
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
  addressHighlight: {
    backgroundColor: theme.gold + '18',
    borderRadius: radius.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.gold + '40',
  },
  addressDay: {
    ...type.labelSm,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  addressText: {
    ...type.bodyMedium,
    color: theme.foreground,
  },
});
