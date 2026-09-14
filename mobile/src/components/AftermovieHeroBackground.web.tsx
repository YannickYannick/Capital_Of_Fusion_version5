import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCachedAftermovieUri } from '@/src/hooks/useCachedAftermovieUri';

type AftermovieHeroBackgroundProps = {
  height: number;
};

/**
 * Web / PWA — <video> HTML avec object-fit:cover (expo-video mal cadré sur web).
 */
export function AftermovieHeroBackground({ height }: AftermovieHeroBackgroundProps) {
  const uri = useCachedAftermovieUri();
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !uri) return;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    void el.play().catch(() => undefined);
  }, [uri]);

  if (!uri) {
    return <View style={[styles.wrap, { height, backgroundColor: '#000' }]} />;
  }

  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      {/* @ts-expect-error — élément DOM web */}
      <video
        ref={ref}
        src={uri}
        muted
        loop
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
          border: 'none',
          outline: 'none',
          backgroundColor: '#000',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});
