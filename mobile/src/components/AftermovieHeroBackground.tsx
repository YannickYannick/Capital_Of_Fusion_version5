import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { useCachedAftermovieUri } from '@/src/hooks/useCachedAftermovieUri';

type AftermovieHeroBackgroundProps = {
  height: number;
};

function AftermovieVideo({ uri, height }: { uri: string; height: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    player.play();
  }, [player]);

  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

/**
 * Hero vidéo — aftermovie Vibe, cache fichier 7 j (expo-file-system).
 */
export function AftermovieHeroBackground({ height }: AftermovieHeroBackgroundProps) {
  const uri = useCachedAftermovieUri();

  if (!uri) {
    return <View style={[styles.wrap, { height, backgroundColor: '#000' }]} />;
  }

  return <AftermovieVideo key={uri} uri={uri} height={height} />;
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: '#000' },
});
