import { useEffect, useState } from 'react';
import type { Track } from '../types/music';
import {
  extractDominantColorsFromArtwork,
  getSeededArtworkPalette,
  type ArtworkColorPalette,
} from '../utils/artworkColors';

export function useArtworkPalette(track: Track | null | undefined, enabled = true): ArtworkColorPalette {
  const seed = track?.id || track?.title || 'default';
  const [palette, setPalette] = useState<ArtworkColorPalette>(() => getSeededArtworkPalette(seed));

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setPalette(getSeededArtworkPalette(seed));
    void extractDominantColorsFromArtwork(track?.artwork, seed).then((pal) => {
      if (!cancelled) setPalette(pal);
    });
    return () => {
      cancelled = true;
    };
  }, [seed, track?.artwork, enabled]);

  return palette;
}
