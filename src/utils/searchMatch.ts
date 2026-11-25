/**
 * Pure matching, normalization, strict unofficial-video filtering, popularity ranking,
 * and full-length validation utilities for real music search & AI playlist curation.
 */

const NOISE_PHRASES = [
  /\((?:official\s*)?(?:music\s*)?(?:video|audio|lyric\s*video|lyrics|visualizer|hd|4k|hq|explicit|remastered(?:\s*\d{4})?|ao\s*vivo|live|clipe\s*oficial|video\s*oficial)\)/gi,
  /\[(?:official\s*)?(?:music\s*)?(?:video|audio|lyric\s*video|lyrics|visualizer|hd|4k|hq|explicit|remastered(?:\s*\d{4})?|ao\s*vivo|live|clipe\s*oficial|video\s*oficial)\]/gi,
  /\b(?:official\s*(?:music\s*)?video|official\s*audio|lyric\s*video|lyrics|visualizer|clipe\s*oficial|video\s*oficial)\b/gi,
  /\b(?:feat\.?|ft\.?|featuring)\b/gi,
  /\s+-\s*topic\b/gi,
];

interface UnofficialPatternRule {
  keyword: string;
  regex: RegExp;
}

const UNOFFICIAL_RULES: UnofficialPatternRule[] = [
  { keyword: 'legendado', regex: /\blegendad[oa]s?\b/i },
  { keyword: 'traducao', regex: /\btraduc(?:ao|oes)\b/i },
  { keyword: 'traduzido', regex: /\btraduzid[oa]s?\b/i },
  { keyword: 'lyric video', regex: /\blyric\s*videos?\b/i },
  { keyword: 'lyrics', regex: /\blyrics?\b/i },
  { keyword: 'cover', regex: /\bcovers?\b/i },
  { keyword: 'karaoke', regex: /\bkaraoke\b/i },
  { keyword: 'nightcore', regex: /\bnightcore\b/i },
  { keyword: 'slowed', regex: /\bslowed\b/i },
  { keyword: 'sped up', regex: /\bsped\s*-?\s*up\b/i },
  { keyword: 'reverb', regex: /\breverb\b/i },
  { keyword: '8d', regex: /(?:^|[\s([\-_/])8d(?:$|[\s)\]\-_/])/i },
  { keyword: 'fan made', regex: /\bfan\s*-?\s*made\b/i },
  { keyword: 'parodia', regex: /\bparodias?\b/i },
  { keyword: 'react', regex: /\breact(?:s|ing|ion)?\b/i },
  { keyword: 'remix', regex: /\bremix(?:es|ed)?\b/i },
  // Extra fan/derivative markers
  { keyword: 'instrumental', regex: /\binstrumental\b/i },
  { keyword: 'tribute', regex: /\btribute\b/i },
  { keyword: 'ringtone', regex: /\bringtone\b/i },
  { keyword: 'lullaby', regex: /\blullaby\b/i },
  { keyword: 'piano version', regex: /\bpiano\s*version\b/i },
  { keyword: 'tutorial', regex: /\btutorial\b/i },
  { keyword: 'backing track', regex: /\bbacking\s*track\b/i },
  { keyword: 'vocal version', regex: /\bvocal\s*version\b/i },
  { keyword: 'subtitulado', regex: /\bsubtitulad[oa]s?\b/i },
];

export function stripDiacritics(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeSearchText(input: string): string {
  let text = stripDiacritics(input || '').toLowerCase();
  for (const rx of NOISE_PHRASES) {
    text = text.replace(rx, ' ');
  }
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeSearchText(input: string): string[] {
  const norm = normalizeSearchText(input);
  if (!norm) return [];
  return Array.from(new Set(norm.split(' ').filter((t) => t.length >= 2)));
}

/**
 * Rejects short 30s previews or multi-hour mixes/streams.
 * Genuine full tracks typically range between 45s and 20m (1200s).
 */
export function isFullLengthDuration(durationSec: number | undefined | null): boolean {
  if (typeof durationSec !== 'number' || !Number.isFinite(durationSec)) return false;
  return durationSec >= 45 && durationSec <= 1200;
}

export interface MatchCandidate {
  title: string;
  artist: string;
  duration: number;
  source?: string;
  views?: number;
  verified?: boolean;
  channelTitle?: string;
}

/**
 * Detects fan uploads, lyric/subtitle videos, covers, karaoke, slowed/reverb,
 * nightcore, 8D, parodies, reactions, and remixes in either title or channel/artist name,
 * unless the user explicitly requested that term in their search query.
 */
export function isUnofficialTrack(query: string, candidate: Pick<MatchCandidate, 'title' | 'artist' | 'channelTitle'>): boolean {
  const queryNorm = stripDiacritics(query || '').toLowerCase();
  const titleAndChannel = stripDiacritics(
    `${candidate.title || ''} ${candidate.channelTitle || ''} ${candidate.artist || ''}`
  ).toLowerCase();

  for (const rule of UNOFFICIAL_RULES) {
    if (rule.regex.test(titleAndChannel) && !rule.regex.test(queryNorm)) {
      return true;
    }
  }
  return false;
}

export function isOfficialArtistChannel(candidate: Pick<MatchCandidate, 'artist' | 'channelTitle' | 'verified'>): boolean {
  const rawChannel = stripDiacritics(candidate.channelTitle || candidate.artist || '').toLowerCase();
  if (candidate.verified) return true;
  if (/\s*-\s*topic$/.test(rawChannel)) return true;
  if (/\bvevo\b/.test(rawChannel)) return true;
  if (/\bofficial\b|\boficial\b/.test(rawChannel)) return true;
  return false;
}

export function scoreTrackMatch(
  query: string,
  candidate: MatchCandidate,
  targetDurationSec?: number
): number {
  if (!isFullLengthDuration(candidate.duration)) {
    return -200;
  }

  const queryTokens = tokenizeSearchText(query);
  const normTitle = normalizeSearchText(candidate.title);
  const normArtist = normalizeSearchText(candidate.artist);
  const normChannel = normalizeSearchText(candidate.channelTitle || candidate.artist);
  const combinedNorm = `${normTitle} ${normArtist} ${normChannel}`.trim();
  const combinedTokens = new Set(tokenizeSearchText(combinedNorm));

  let score = 0;

  if (queryTokens.length > 0) {
    let matched = 0;
    let channelMatched = 0;
    const channelTokens = new Set(tokenizeSearchText(normChannel));

    for (const tok of queryTokens) {
      if (combinedTokens.has(tok) || combinedNorm.includes(tok)) {
        matched++;
      }
      if (channelTokens.has(tok) || normChannel.includes(tok)) {
        channelMatched++;
      }
    }

    const overlapRatio = matched / queryTokens.length;
    score += overlapRatio * 55;

    // Order-independent exact/full-token correspondence boost
    const normQuery = normalizeSearchText(query);
    const titleTokens = new Set(tokenizeSearchText(normTitle));
    const allTitleTokensInQuery =
      titleTokens.size > 0 && Array.from(titleTokens).every((t) => queryTokens.includes(t));

    if (normTitle && normQuery === normTitle) {
      score += 30;
    } else if (overlapRatio === 1 && allTitleTokensInQuery) {
      score += 24;
    } else if (normTitle && (normQuery.includes(normTitle) || normTitle.includes(normQuery))) {
      score += 20;
    } else if (overlapRatio === 1) {
      score += 18;
    } else if (normQuery && combinedNorm.includes(normQuery)) {
      score += 16;
    }

    // Channel belongs directly to the searched artist
    if (channelMatched > 0 && normChannel && !isUnofficialTrack(query, candidate)) {
      score += Math.min(28, channelMatched * 14);
    }
  }

  // Strong popularity boost based on YouTube statistics.viewCount
  // (1k=36, 100k=60, 1M=72, 10M=84, 100M=96, 1B=108)
  if (typeof candidate.views === 'number' && candidate.views > 0) {
    score += Math.min(120, Math.log10(candidate.views + 1) * 12);
  }

  // Official artist channel priority (- Topic, VEVO, verified artist)
  const rawChannelLower = stripDiacritics(candidate.channelTitle || candidate.artist || '').toLowerCase();
  const rawTitleLower = stripDiacritics(candidate.title || '').toLowerCase();

  if (/\s*-\s*topic$/.test(rawChannelLower) || /\bvevo\b/.test(rawChannelLower)) {
    score += 48;
  } else if (candidate.verified || /\bofficial\b|\boficial\b/.test(rawChannelLower)) {
    score += 42;
  }

  if (
    rawTitleLower.includes('official audio') ||
    rawTitleLower.includes('audio oficial') ||
    rawTitleLower.includes('official music video') ||
    rawTitleLower.includes('clipe oficial')
  ) {
    score += 14;
  }

  // Standard full-track duration window (90s - 480s)
  if (candidate.duration >= 90 && candidate.duration <= 480) {
    score += 8;
  }

  // Duration closeness bonus if expected duration is known
  if (targetDurationSec && targetDurationSec >= 45) {
    const diff = Math.abs(candidate.duration - targetDurationSec);
    if (diff <= 6) score += 16;
    else if (diff <= 15) score += 8;
    else if (diff > 90) score -= 12;
  }

  // Severe penalty for unofficial fan/lyric/cover/remix videos
  if (isUnofficialTrack(query, candidate)) {
    score -= 250;
  }

  return score;
}

export function rankTracksByPopularityAndMatch<T extends MatchCandidate>(
  query: string,
  candidates: T[],
  targetDurationSec?: number
): T[] {
  const fullLength = candidates.filter((t) => isFullLengthDuration(t.duration));
  const cleanOfficial = fullLength.filter((t) => !isUnofficialTrack(query, t));

  // Strictly discard unofficial fan/lyric/cover/remix results whenever any clean official result exists
  const pool = cleanOfficial.length > 0 ? cleanOfficial : fullLength;

  return [...pool]
    .map((track) => ({
      track,
      score: scoreTrackMatch(query, track, targetDurationSec),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.track);
}

export function selectBestFullTrack<T extends MatchCandidate>(
  query: string,
  candidates: T[],
  targetDurationSec?: number
): T | null {
  const ranked = rankTracksByPopularityAndMatch(query, candidates, targetDurationSec);
  if (ranked.length === 0) return null;
  const topScore = scoreTrackMatch(query, ranked[0], targetDurationSec);
  return topScore >= 15 ? ranked[0] : null;
}
