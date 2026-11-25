import type { SponsorSegment } from '../types/music';

/**
 * Checks whether the current playback position falls inside an unskipped SponsorBlock segment.
 * Adds a small 0.15s boundary tolerance so segments right near the end don't re-trigger.
 */
export function findActiveSponsorSegment(
  currentTime: number,
  segments: SponsorSegment[],
  alreadySkippedIds: ReadonlySet<string>
): SponsorSegment | null {
  for (const seg of segments) {
    if (alreadySkippedIds.has(seg.UUID)) continue;
    const [start, end] = seg.segment;
    if (end <= start) continue;
    if (currentTime >= start && currentTime < end - 0.15) {
      return seg;
    }
  }
  return null;
}

export function formatSponsorCategory(category: string): string {
  const labels: Record<string, string> = {
    sponsor: 'Patrocínio',
    selfpromo: 'Autopromoção',
    interaction: 'Pedido de inscrição/like',
    intro: 'Introdução não musical',
    outro: 'Encerramento',
    music_offtopic: 'Trecho não musical',
    preview: 'Prévia',
  };
  return labels[category] || category;
}
