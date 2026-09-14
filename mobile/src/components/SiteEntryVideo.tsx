import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { radius } from '@/constants/theme';
import { getAccesVenueVideoUri, type AccesVenueVideoKind } from '@/src/lib/siteEntryVideo';

type AccesVenueVideoProps = {
  kind: AccesVenueVideoKind;
  /** Lecture auto quand l’accordéon s’ouvre. */
  active?: boolean;
  /** Ratio largeur/hauteur (1 = carré plan d’entrée ; ~0.56 = teaser portrait). */
  aspectRatio?: number;
};

/**
 * Lecteur vidéo Accès & Venue (natif) — contrôles natifs, contain.
 */
export function AccesVenueVideo({ kind, active = true, aspectRatio = 1 }: AccesVenueVideoProps) {
  const uri = getAccesVenueVideoUri(kind);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);

  return (
    <View style={[styles.wrap, { aspectRatio }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
        allowsPictureInPicture={false}
      />
    </View>
  );
}

/** Alias plan d’entrée (rétrocompat). */
export function SiteEntryVideo({ active = true }: { active?: boolean }) {
  return <AccesVenueVideo kind="site-entry" active={active} aspectRatio={1} />;
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
