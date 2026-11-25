/**
 * Pure parsing & formatting utilities for YouTube Data API v3 and YouTube Music InnerTube responses.
 */

export function parseIsoDuration(iso: string | undefined | null): number {
  if (!iso || typeof iso !== 'string') return 0;
  const match = iso.trim().match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const total = hours * 3600 + minutes * 60 + seconds;
  return Number.isFinite(total) ? total : 0;
}

export function parseDurationText(text: string | undefined | null): number {
  if (!text || typeof text !== 'string') return 0;
  const parts = text
    .trim()
    .split(':')
    .map((p) => Number(p.trim()));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function parseViewsText(text: string | undefined | null): number | undefined {
  if (!text || typeof text !== 'string') return undefined;
  const lower = text.toLowerCase().replace(/\u00a0/g, ' ').trim();
  // Match examples: "3,7 bi", "886 mi", "450 mil", "1.2B", "45M", "120K", "12,345 views"
  const multMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(bi|b|mi|m|mil|k)\b/i);
  if (multMatch) {
    const num = Number(multMatch[1].replace(',', '.'));
    if (!Number.isFinite(num)) return undefined;
    const unit = multMatch[2].toLowerCase();
    const factor =
      unit === 'bi' || unit === 'b'
        ? 1_000_000_000
        : unit === 'mi' || unit === 'm'
          ? 1_000_000
          : 1_000;
    return Math.round(num * factor);
  }

  const digitsOnly = lower.replace(/[^\d]/g, '');
  if (digitsOnly.length >= 2) {
    const num = Number(digitsOnly);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  }
  return undefined;
}

export function upgradeYtmArtwork(url: string | undefined | null, videoId?: string, size = 544): string {
  const clean = (url || '').trim();
  if (!clean) {
    return videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : '';
  }
  if (clean.includes('googleusercontent.com') || clean.includes('ggpht.com')) {
    return clean.replace(/=w\d+-h\d+[^&\s]*/i, `=w${size}-h${size}-l90-rj`);
  }
  return clean;
}
