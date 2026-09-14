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
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

/** Native — aftermovie en cover (même cadrage que l’APK). */
export function AftermovieHeroBackground({ height }: AftermovieHeroBackgroundProps) {
  const uri = useCachedAftermovieUri();

  if (!uri) {
    return <View style={[styles.wrap, { height, backgroundColor: '#000' }]} />;
  }

  return <AftermovieVideo key={uri} uri={uri} height={height} />;
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
