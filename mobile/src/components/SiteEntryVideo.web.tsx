import { useEffect, useRef } from 'react';
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
 * Lecteur vidéo Accès & Venue (web/PWA) — <video> HTML avec contrôles.
 */
export function AccesVenueVideo({ kind, active = true, aspectRatio = 1 }: AccesVenueVideoProps) {
  const uri = getAccesVenueVideoUri(kind);
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [active, uri]);

  return (
    <View style={[styles.wrap, { aspectRatio }]}>
      {/* @ts-expect-error — élément DOM web */}
      <video
        key={uri}
        ref={ref}
        src={uri}
        controls
        playsInline
        preload="metadata"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          backgroundColor: '#000',
        }}
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
});
