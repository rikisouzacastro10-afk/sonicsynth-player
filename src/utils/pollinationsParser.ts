import { isHtmlResponseText } from './safeJson.ts';

export interface PollinationsTrackItem {
  title: string;
  artist: string;
}

export interface PollinationsPlaylistResult {
  title: string;
  description: string;
  tracks: PollinationsTrackItem[];
}

function cleanDecorations(value: string): string {
  return value
    .replace(/\*\*/g, '')
    .replace(/^\*+|\*+$/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-*•]+\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^[“"'`]+|[”"'`]+$/g, '')
    .replace(/^\*+|\*+$/g, '')
    .trim();
}

function cleanTitleLine(line: string): string {
  const stripped = cleanDecorations(
    line.replace(/^(?:t[ií]tulo|playlist|nome)\s*:\s*/i, '')
  );
  return cleanDecorations(stripped);
}

function parseTrackLine(line: string): PollinationsTrackItem | null {
  const cleaned = line
    .replace(/\*\*/g, '')
    .replace(/^\s*(?:\d+[.)]|[-*•])\s+/, '')
    .trim();

  if (!cleaned || /^[-=_*]{3,}$/.test(cleaned)) {
    return null;
  }

  // Prefer explicit spaced dash separator: "Artist - Song", "Artist – Song", "Artist — Song"
  const spacedMatch = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (spacedMatch) {
    const artist = cleanDecorations(spacedMatch[1]);
    const title = cleanDecorations(spacedMatch[2]);
    if (artist && title) {
      return { artist, title };
    }
  }

  // Fallback for tight hyphen "Artist-Song" only if unambiguous
  const tightIdx = cleaned.indexOf('-');
  if (tightIdx > 1 && tightIdx < cleaned.length - 2) {
    const artist = cleanDecorations(cleaned.slice(0, tightIdx));
    const title = cleanDecorations(cleaned.slice(tightIdx + 1));
    if (artist && title) {
      return { artist, title };
    }
  }

  return null;
}

export function parsePollinationsPlaylistText(
  rawText: string,
  userPrompt: string,
  maxTracks: number
): PollinationsPlaylistResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('A API Pollinations retornou uma resposta vazia.');
  }

  if (isHtmlResponseText(trimmed)) {
    throw new Error('A API Pollinations retornou HTML inesperado em vez de texto.');
  }

  if (/free limit reached|enter\.pollinations\.ai/i.test(trimmed)) {
    throw new Error(
      'Limite temporário da API gratuita Pollinations atingido. Aguarde alguns segundos e tente novamente.'
    );
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^```/.test(l));

  if (lines.length === 0) {
    throw new Error('Nenhuma linha válida retornada pela IA.');
  }

  const firstLineAsTrack = parseTrackLine(lines[0]);
  const looksLikeFirstLineIsTitle =
    !firstLineAsTrack ||
    /^(?:t[ií]tulo|playlist|nome)\s*:/i.test(lines[0]) ||
    /^\*\*.+\*\*$/.test(lines[0]) ||
    /^#+\s+/.test(lines[0]);

  let title = `Playlist: ${userPrompt.trim().slice(0, 48)}`;
  let trackLines = lines;

  if (looksLikeFirstLineIsTitle && lines.length > 1) {
    const candidateTitle = cleanTitleLine(lines[0]);
    if (candidateTitle) {
      title = candidateTitle;
    }
    trackLines = lines.slice(1);
  }

  const tracks: PollinationsTrackItem[] = [];
  for (const line of trackLines) {
    const parsed = parseTrackLine(line);
    if (parsed) {
      tracks.push(parsed);
      if (tracks.length >= maxTracks) break;
    }
  }

  if (tracks.length === 0) {
    throw new Error(
      'Não foi possível identificar faixas no formato "Artista - Nome da Música". Tente novamente.'
    );
  }

  return {
    title,
    description: `Playlist gerada por IA (Pollinations) para: "${userPrompt.trim()}"`,
    tracks,
  };
}
