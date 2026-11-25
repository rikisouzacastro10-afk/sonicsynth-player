export interface ArtworkColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

const FALLBACK_PALETTES: ArtworkColorPalette[] = [
  { primary: '#6366f1', secondary: '#ec4899', tertiary: '#06b6d4' },
  { primary: '#f97316', secondary: '#eab308', tertiary: '#ef4444' },
  { primary: '#10b981', secondary: '#0ea5e9', tertiary: '#8b5cf6' },
  { primary: '#e11d48', secondary: '#f59e0b', tertiary: '#7c3aed' },
  { primary: '#06b6d4', secondary: '#3b82f6', tertiary: '#14b8a6' },
  { primary: '#d97706', secondary: '#b45309', tertiary: '#f43f5e' },
];

export function getSeededArtworkPalette(seedKey = ''): ArtworkColorPalette {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Extracts 3 vibrant dominant colors from artwork URL using a hidden <canvas>.
 * Falls back cleanly to a deterministic track-seeded palette when CORS blocks readback.
 */
export async function extractDominantColorsFromArtwork(
  artworkUrl: string | undefined,
  seedKey: string
): Promise<ArtworkColorPalette> {
  const fallback = getSeededArtworkPalette(seedKey);
  if (!artworkUrl || typeof document === 'undefined') return fallback;

  return await new Promise<ArtworkColorPalette>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    const timer = window.setTimeout(() => resolve(fallback), 2500);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallback);
          return;
        }
        ctx.drawImage(img, 0, 0, 24, 24);
        const data = ctx.getImageData(0, 0, 24, 24).data;

        const buckets: Array<{ r: number; g: number; b: number; sat: number }> = [];
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (max + min) / 2;
          if (lum < 25 || lum > 235) continue;
          const sat = max === 0 ? 0 : (max - min) / max;
          buckets.push({ r, g, b, sat });
        }

        if (buckets.length < 3) {
          resolve(fallback);
          return;
        }

        buckets.sort((a, b) => b.sat - a.sat);
        const c1 = buckets[0];
        const c2 = buckets[Math.floor(buckets.length * 0.35)] || c1;
        const c3 = buckets[Math.floor(buckets.length * 0.7)] || c2;

        resolve({
          primary: rgbToHex(c1.r, c1.g, c1.b),
          secondary: rgbToHex(c2.r, c2.g, c2.b),
          tertiary: rgbToHex(c3.r, c3.g, c3.b),
        });
      } catch {
        resolve(fallback);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(fallback);
    };

    img.src = artworkUrl;
  });
}
