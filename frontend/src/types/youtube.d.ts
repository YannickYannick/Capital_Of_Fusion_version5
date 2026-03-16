/**
 * Types globaux pour l'API YouTube IFrame.
 * Fichier unique pour éviter les déclarations dupliquées.
 */

interface YTPlayer {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setPlaybackQuality: (quality: string) => void;
  getAvailableQualityLevels: () => string[];
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type { YTPlayer };
