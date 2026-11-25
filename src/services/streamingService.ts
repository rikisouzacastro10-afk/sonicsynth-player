import { Capacitor, CapacitorHttp } from '@capacitor/core';
import type { SponsorSegment, Track } from '../types/music';
import { parsePollinationsPlaylistText } from '../utils/pollinationsParser';
import {
  extractApiErrorMessage,
  isHtmlResponseText,
  parseSafeJsonResponse,
} from '../utils/safeJson';
import {
  isFullLengthDuration,
  rankTracksByPopularityAndMatch,
} from '../utils/searchMatch';
import {
  parseDurationText,
  parseIsoDuration,
  parseViewsText,
  upgradeYtmArtwork,
} from '../utils/youtubeFormatters';

export interface SearchResults {
  tracks: Track[];
  sourceLabel: string;
}

export interface GeneratedPlaylistPayload {
  title: string;
  description: string;
  tracks: Array<{ title: string; artist: string; album?: string }>;
}

const YT_KEY_STORAGE = 'sonicmorph_yt_api_key';

export function getSavedYouTubeApiKey(): string {
  try {
    return localStorage.getItem(YT_KEY_STORAGE)?.trim() || '';
  } catch {
    return '';
  }
}

export function getEffectiveYouTubeApiKey(): string {
  return getSavedYouTubeApiKey() || (import.meta.env.VITE_YOUTUBE_API_KEY || '').trim();
}

export function setSavedYouTubeApiKey(key: string): void {
  try {
    const clean = key.trim();
    if (clean) localStorage.setItem(YT_KEY_STORAGE, clean);
    else localStorage.removeItem(YT_KEY_STORAGE);
  } catch {
    // Ignore storage error
  }
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs = 8000,
  externalSignal?: AbortSignal,
  headers?: Record<string, string>
): Promise<T> {
  if (externalSignal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    return await parseSafeJsonResponse<T>(res, url.startsWith('/api') ? 'API local' : 'API externa');
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

async function searchYouTubeDataApiV3Client(
  query: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<Track[]> {
  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=25` +
    `&q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;

  const sData = await fetchJsonWithTimeout<{
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  }>(searchUrl, 7500, signal);

  const searchItems = sData.items || [];
  const videoIds = searchItems
    .map((it) => it.id?.videoId)
    .filter((id): id is string => Boolean(id));
  if (videoIds.length === 0) return [];

  const tracks: Track[] = [];
  try {
    const detailsUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${encodeURIComponent(videoIds.join(','))}` +
      `&key=${encodeURIComponent(apiKey)}`;

    const dData = await fetchJsonWithTimeout<{
      items?: Array<{
        id?: string;
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: {
            maxres?: { url?: string };
            high?: { url?: string };
            medium?: { url?: string };
          };
        };
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string };
      }>;
    }>(detailsUrl, 7500, signal);

    for (const item of dData.items || []) {
      if (!item.id || !item.snippet?.title) continue;
      const duration = parseIsoDuration(item.contentDetails?.duration);
      if (!isFullLengthDuration(duration)) continue;
      const views = item.statistics?.viewCount ? Number(item.statistics.viewCount) : undefined;
      const channel = item.snippet.channelTitle || 'YouTube Music';
      const thumb =
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.maxres?.url ||
        item.snippet.thumbnails?.medium?.url ||
        '';

      tracks.push({
        id: item.id,
        title: item.snippet.title,
        artist: channel.replace(/\s*-\s*Topic$/i, ''),
        channelTitle: channel,
        album: 'YouTube Music',
        duration,
        artwork: upgradeYtmArtwork(thumb, item.id, 544),
        source: 'youtube-v3',
        views: Number.isFinite(views) ? views : undefined,
        verified: /-\s*topic$|\bvevo\b|\bofficial\b|\boficial\b/i.test(channel),
      });
    }
  } catch {
    // Fallback to snippet metadata directly from /youtube/v3/search if /videos fails
  }

  if (tracks.length === 0) {
    for (const it of searchItems) {
      const vid = it.id?.videoId;
      const title = it.snippet?.title;
      if (!vid || !title) continue;
      const channel = it.snippet?.channelTitle || 'YouTube Music';
      const thumb = it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || '';
      tracks.push({
        id: vid,
        title,
        artist: channel.replace(/\s*-\s*Topic$/i, ''),
        channelTitle: channel,
        album: 'YouTube Music',
        duration: 210,
        artwork: upgradeYtmArtwork(thumb, vid, 544),
        source: 'youtube-v3',
        verified: /-\s*topic$|\bvevo\b|\bofficial\b|\boficial\b/i.test(channel),
      });
    }
  }

  return rankTracksByPopularityAndMatch(query, tracks);
}

async function fetchYouTubeDataApiV3TrendingClient(
  apiKey: string,
  signal?: AbortSignal
): Promise<Track[]> {
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics` +
    `&chart=mostPopular&videoCategoryId=10&regionCode=BR&maxResults=20&key=${encodeURIComponent(apiKey)}`;
  const dData = await fetchJsonWithTimeout<{
    items?: Array<{
      id?: string;
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
      contentDetails?: { duration?: string };
      statistics?: { viewCount?: string };
    }>;
  }>(url, 7500, signal);

  const tracks: Track[] = [];
  for (const item of dData.items || []) {
    if (!item.id || !item.snippet?.title) continue;
    const duration = parseIsoDuration(item.contentDetails?.duration);
    if (!isFullLengthDuration(duration)) continue;
    const views = item.statistics?.viewCount ? Number(item.statistics.viewCount) : undefined;
    const channel = item.snippet.channelTitle || 'YouTube Music';
    tracks.push({
      id: item.id,
      title: item.snippet.title,
      artist: channel.replace(/\s*-\s*Topic$/i, ''),
      channelTitle: channel,
      album: 'Em Alta · YouTube',
      duration,
      artwork: upgradeYtmArtwork(
        item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        item.id
      ),
      source: 'youtube-v3',
      views: Number.isFinite(views) ? views : undefined,
      verified: /-\s*topic$|\bvevo\b|\bofficial\b|\boficial\b/i.test(channel) || true,
    });
  }
  return rankTracksByPopularityAndMatch('', tracks);
}

function parseYtmNativeSections(sections: unknown[]): Track[] {
  const out: Track[] = [];
  for (const sec of sections) {
    if (!sec || typeof sec !== 'object') continue;
    const r = sec as Record<string, unknown>;
    const contents =
      (r.musicShelfRenderer as { contents?: unknown[] } | undefined)?.contents ||
      (r.musicCarouselShelfRenderer as { contents?: unknown[] } | undefined)?.contents ||
      [];
    for (const item of contents) {
      const ren = (item as { musicResponsiveListItemRenderer?: Record<string, unknown> })
        ?.musicResponsiveListItemRenderer;
      if (!ren) continue;
      const flex = (ren.flexColumns as Array<{
        musicResponsiveListItemFlexColumnRenderer?: { text?: { runs?: Array<Record<string, unknown>> } };
      }>) || [];
      const col0Runs = flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
      const col1Runs = flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
      const col2Runs = flex[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];

      const overlay = ren.overlay as
        | {
            musicItemThumbnailOverlayRenderer?: {
              content?: {
                musicPlayButtonRenderer?: {
                  playNavigationEndpoint?: { watchEndpoint?: { videoId?: string } };
                };
              };
            };
          }
        | undefined;
      const videoId =
        (ren.playlistItemData as { videoId?: string } | undefined)?.videoId ||
        overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
          ?.playNavigationEndpoint?.watchEndpoint?.videoId ||
        (col0Runs[0]?.navigationEndpoint as { watchEndpoint?: { videoId?: string } } | undefined)
          ?.watchEndpoint?.videoId ||
        '';
      const title = col0Runs.map((x) => String(x.text || '')).join('').trim();
      if (!videoId || !title) continue;

      let duration = 200;
      const artists: string[] = [];
      let album = '';
      for (const run of col1Runs) {
        const txt = String(run.text || '').trim();
        if (!txt || txt === '•' || txt === '·') continue;
        if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(txt)) {
          duration = parseDurationText(txt);
          continue;
        }
        const nav = run.navigationEndpoint as
          | {
              browseEndpoint?: {
                browseEndpointContextSupportedConfigs?: {
                  browseEndpointContextMusicConfig?: { pageType?: string };
                };
              };
            }
          | undefined;
        const pt =
          nav?.browseEndpoint?.browseEndpointContextSupportedConfigs
            ?.browseEndpointContextMusicConfig?.pageType;
        if (pt === 'MUSIC_PAGE_TYPE_ARTIST') artists.push(txt);
        else if (pt === 'MUSIC_PAGE_TYPE_ALBUM') album = txt;
        else if (!parseViewsText(txt) && artists.length === 0) artists.push(txt);
      }

      if (!isFullLengthDuration(duration)) continue;
      let views: number | undefined;
      for (const run of [...col2Runs, ...col1Runs]) {
        const v = parseViewsText(String(run.text || ''));
        if (v && (!views || v > views)) views = v;
      }

      const thumbs =
        (
          ren.thumbnail as {
            musicThumbnailRenderer?: { thumbnail?: { thumbnails?: Array<{ url?: string }> } };
          }
        )?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      const rawThumb = thumbs[thumbs.length - 1]?.url || '';

      out.push({
        id: videoId,
        title,
        artist: artists.join(', ') || 'YouTube Music',
        album: album || 'YouTube Music',
        duration,
        artwork: upgradeYtmArtwork(rawThumb, videoId),
        source: 'yt-music',
        views,
        verified: artists.length > 0,
      });
    }
  }
  return out;
}

export async function fetchTrendingMusic(): Promise<SearchResults> {
  const apiKey = getEffectiveYouTubeApiKey();

  if (apiKey) {
    try {
      const tracks = await fetchYouTubeDataApiV3TrendingClient(apiKey);
      if (tracks.length > 0) {
        return { tracks, sourceLabel: 'YouTube Data API v3 · Em Alta' };
      }
    } catch {
      // Fall back to server / native InnerTube
    }
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const resp = await CapacitorHttp.post({
        url: 'https://music.youtube.com/youtubei/v1/browse?prettyPrint=false',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://music.youtube.com',
        },
        data: {
          context: {
            client: {
              clientName: 'WEB_REMIX',
              clientVersion: '1.20240724.01.00',
              hl: 'pt',
              gl: 'BR',
            },
          },
          browseId: 'FEmusic_explore',
        },
      });
      const sections =
        resp.data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
          ?.sectionListRenderer?.contents || [];
      const tracks = parseYtmNativeSections(sections);
      if (tracks.length > 0) {
        return { tracks, sourceLabel: 'YouTube Music · Em Alta' };
      }
    } catch {
      // Fallback below
    }
  }

  try {
    const data = await fetchJsonWithTimeout<{ tracks: Track[]; instance: string }>(
      '/api/ytm/trending',
      9500,
      undefined,
      apiKey ? { 'x-youtube-api-key': apiKey } : undefined
    );
    if (data.tracks && data.tracks.length > 0) {
      return {
        tracks: data.tracks.filter((t) => isFullLengthDuration(t.duration)),
        sourceLabel: data.instance || 'YouTube Music · Em Alta',
      };
    }
  } catch {
    // Offline or unreachable
  }

  return { tracks: [], sourceLabel: 'Sem conexão com YouTube Music' };
}

export async function searchMusic(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) {
    return fetchTrendingMusic();
  }

  const apiKey = getEffectiveYouTubeApiKey();

  // 1. Direct YouTube Data API v3 when user or env configured an API Key
  if (apiKey) {
    try {
      const tracks = await searchYouTubeDataApiV3Client(q, apiKey);
      if (tracks.length > 0) {
        return { tracks, sourceLabel: 'YouTube Data API v3' };
      }
    } catch {
      // Seamlessly fall back to YouTube Music InnerTube catalog if key hits quota or fails
    }
  }

  // 2. Native Android APK direct YouTube Music catalog via CapacitorHttp (zero CORS)
  if (Capacitor.isNativePlatform()) {
    try {
      const resp = await CapacitorHttp.post({
        url: 'https://music.youtube.com/youtubei/v1/search?prettyPrint=false',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://music.youtube.com',
        },
        data: {
          context: {
            client: {
              clientName: 'WEB_REMIX',
              clientVersion: '1.20240724.01.00',
              hl: 'pt',
              gl: 'BR',
            },
          },
          query: q,
          params: 'EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D',
        },
      });
      const sections =
        resp.data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content
          ?.sectionListRenderer?.contents || [];
      const tracks = rankTracksByPopularityAndMatch(q, parseYtmNativeSections(sections));
      if (tracks.length > 0) {
        return { tracks, sourceLabel: 'YouTube Music Catalog' };
      }
    } catch {
      // Fall back to backend endpoint if available
    }
  }

  // 3. Server YouTube Music InnerTube catalog (when local Node server is available)
  try {
    const data = await fetchJsonWithTimeout<{ tracks: Track[]; instance: string }>(
      `/api/ytm/search?q=${encodeURIComponent(q)}`,
      10000,
      undefined,
      apiKey ? { 'x-youtube-api-key': apiKey } : undefined
    );
    const fullTracks = (data.tracks || []).filter((t) => isFullLengthDuration(t.duration));
    return {
      tracks: fullTracks,
      sourceLabel: data.instance || 'YouTube Music Catalog',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Catálogo YouTube Music indisponível';
    return { tracks: [], sourceLabel: msg };
  }
}

export async function searchYouTubeDirectForAi(query: string): Promise<Track[]> {
  const q = query.trim();
  if (!q) return [];

  const apiKey = getEffectiveYouTubeApiKey();

  // Direct official YouTube Data API v3 (https://www.googleapis.com/youtube/v3/search) — zero intermediate proxies
  if (apiKey) {
    return await searchYouTubeDataApiV3Client(q, apiKey);
  }

  // On native Capacitor Android without a YouTube key, use CapacitorHttp directly to YouTube Music
  if (Capacitor.isNativePlatform()) {
    const resp = await CapacitorHttp.post({
      url: 'https://music.youtube.com/youtubei/v1/search?prettyPrint=false',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://music.youtube.com',
      },
      data: {
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20240724.01.00',
            hl: 'pt',
            gl: 'BR',
          },
        },
        query: q,
        params: 'EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D',
      },
    });
    const sections =
      resp.data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content
        ?.sectionListRenderer?.contents || [];
    return rankTracksByPopularityAndMatch(q, parseYtmNativeSections(sections));
  }

  // Web dev fallback when running with Node backend (strictly rejects HTML SPA fallback)
  const data = await fetchJsonWithTimeout<{ tracks?: Track[]; error?: string }>(
    `/api/ytm/search?q=${encodeURIComponent(q)}`,
    10000
  );
  if (data.error) {
    throw new Error(data.error);
  }
  return (data.tracks || []).filter((t) => isFullLengthDuration(t.duration));
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

async function resolveNativeAudioUrlWithCapacitorHttp(videoId: string): Promise<string | null> {
  try {
    const pageResp = await CapacitorHttp.get({
      url: 'https://music.youtube.com',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });
    const html = typeof pageResp.data === 'string' ? pageResp.data : '';
    const vdMatch = html.match(/"VISITOR_DATA":"([^"]+)"/);
    const visitorData = vdMatch?.[1] || '';

    const playerResp = await CapacitorHttp.post({
      url: 'https://music.youtube.com/youtubei/v1/player?prettyPrint=false',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
        ...(visitorData ? { 'X-Goog-Visitor-Id': visitorData } : {}),
      },
      data: {
        videoId,
        context: {
          client: {
            clientName: 'ANDROID_VR',
            clientVersion: '1.60.19',
            deviceMake: 'Oculus',
            deviceModel: 'Quest 3',
            androidSdkVersion: 32,
            osName: 'Android',
            osVersion: '12L',
            hl: 'pt',
            gl: 'BR',
            visitorData,
          },
        },
      },
    });

    const adaptive = (playerResp.data?.streamingData?.adaptiveFormats || []) as Array<{
      url?: string;
      mimeType?: string;
      bitrate?: number;
    }>;
    const best = adaptive
      .filter((f) => f.url && f.mimeType?.startsWith('audio/'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
    if (best?.url) return best.url;
  } catch {
    // Fall through to Cobalt-compatible extractor via CapacitorHttp
  }

  try {
    const cobaltResp = await CapacitorHttp.post({
      url: 'https://api.cobalt.tools/',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        url: `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
        downloadMode: 'audio',
        audioFormat: 'mp3',
        isAudioOnly: true,
      },
    });
    if (cobaltResp.data?.url) return String(cobaltResp.data.url);
  } catch {
    // Ignore
  }

  return null;
}

export async function fetchTrackAudioBlob(
  track: Track,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal
): Promise<Blob> {
  onProgress?.(10);

  // On Android APK, extract & download directly via CapacitorHttp (no CORS limits)
  if (Capacitor.isNativePlatform()) {
    const directUrl = await resolveNativeAudioUrlWithCapacitorHttp(track.id);
    if (directUrl) {
      onProgress?.(45);
      const binResp = await CapacitorHttp.get({
        url: directUrl,
        responseType: 'blob',
      });
      if (binResp.status >= 200 && binResp.status < 300 && typeof binResp.data === 'string') {
        onProgress?.(100);
        return base64ToBlob(binResp.data, 'audio/mp4');
      }
    }
  }

  // Web preview / server extractor fallback
  onProgress?.(25);
  const response = await fetch(`/api/ytm/download/${encodeURIComponent(track.id)}`, { signal });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(extractApiErrorMessage(errText, response.status));
  }
  const respContentType = (response.headers.get('content-type') || '').toLowerCase();
  if (respContentType.includes('text/html')) {
    throw new Error('Download indisponível no modo estático sem servidor de extração.');
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (response.body && contentLength > 0) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.byteLength;
        onProgress?.(Math.min(98, 25 + Math.round((loaded / contentLength) * 73)));
      }
    }
    onProgress?.(100);
    return new Blob(chunks as BlobPart[], {
      type: response.headers.get('content-type') || 'audio/mp4',
    });
  }

  const blob = await response.blob();
  if (blob.size < 1024) {
    throw new Error('Arquivo de áudio inválido recebido do extrator.');
  }
  onProgress?.(100);
  return blob;
}

export async function fetchSyncedLyrics(track: Track, signal?: AbortSignal): Promise<string | null> {
  if (track.lyricsLrc) return track.lyricsLrc;

  try {
    const data = await fetchJsonWithTimeout<{ syncedLyrics?: string; plainLyrics?: string }>(
      `/api/lyrics?track=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}&duration=${Math.round(track.duration || 0)}`,
      5000,
      signal
    );
    if (data.syncedLyrics) return data.syncedLyrics;
    if (data.plainLyrics) {
      return data.plainLyrics
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .map((line, idx) => `[00:${String(Math.min(59, idx * 4)).padStart(2, '0')}.00] ${line}`)
        .join('\n');
    }
  } catch (err) {
    if (isAbortError(err)) throw err;
    if (Capacitor.isNativePlatform()) {
      try {
        const direct = await fetchJsonWithTimeout<{ syncedLyrics?: string }>(
          `https://lrclib.net/api/get?track_name=${encodeURIComponent(track.title)}&artist_name=${encodeURIComponent(track.artist)}`,
          4500,
          signal
        );
        if (direct.syncedLyrics) return direct.syncedLyrics;
      } catch {
        // Ignore
      }
    }
  }

  return null;
}

export async function fetchSponsorSegments(
  track: Track,
  signal?: AbortSignal
): Promise<SponsorSegment[]> {
  if (track.sponsorSegments && track.sponsorSegments.length > 0) {
    return track.sponsorSegments;
  }
  if (!track.id || track.source === 'offline') {
    return [];
  }

  try {
    const data = await fetchJsonWithTimeout<{ segments?: SponsorSegment[] }>(
      `/api/sponsorblock/${encodeURIComponent(track.id)}`,
      3500,
      signal
    );
    return data.segments || [];
  } catch {
    return [];
  }
}

export async function generateAiPlaylist(
  prompt: string,
  trackCount: number
): Promise<GeneratedPlaylistPayload> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error('Descreva o estilo, clima ou artistas da playlist.');
  }

  const aiPrompt =
    `Crie uma playlist musical com exatamente ${trackCount} músicas reais para: "${cleanPrompt}". ` +
    `Responda exclusivamente em texto puro seguindo estas regras:\n` +
    `- Na primeira linha, escreva apenas um título criativo para a playlist em português.\n` +
    `- Nas linhas seguintes, liste exatamente ${trackCount} músicas reais no formato exato: Artista - Nome da Música\n` +
    `- Não adicione numeração, explicações, introduções nem marcações extras.`;

  const payloadBody = {
    messages: [{ role: 'user', content: aiPrompt }],
    seed: Math.floor(Math.random() * 100000),
  };

  let rawText = '';

  // 1. Native Android APK: CapacitorHttp bypasses browser Origin header directly to Pollinations
  if (Capacitor.isNativePlatform()) {
    const nativeRes = await CapacitorHttp.post({
      url: 'https://text.pollinations.ai/',
      headers: { 'Content-Type': 'application/json' },
      data: payloadBody,
    });
    const textBody =
      typeof nativeRes.data === 'string' ? nativeRes.data : JSON.stringify(nativeRes.data ?? '');
    if (nativeRes.status < 200 || nativeRes.status >= 300) {
      throw new Error(extractApiErrorMessage(textBody, nativeRes.status));
    }
    rawText = textBody;
  } else {
    // 2. Web browser: call Pollinations directly first; if Cloudflare Turnstile rejects browser Origin (403), use web preview relay
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadBody),
    });

    const directText = await res.text();
    if (res.ok) {
      rawText = directText;
    } else if (res.status === 403 && /turnstile/i.test(directText)) {
      const relayRes = await fetch('/api/pollinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody),
      });
      const relayText = await relayRes.text();
      if (isHtmlResponseText(relayText)) {
        throw new Error(extractApiErrorMessage(directText, res.status));
      }
      if (!relayRes.ok) {
        throw new Error(extractApiErrorMessage(relayText, relayRes.status));
      }
      rawText = relayText;
    } else {
      throw new Error(extractApiErrorMessage(directText, res.status));
    }
  }

  const parsed = parsePollinationsPlaylistText(rawText, cleanPrompt, trackCount);
  return {
    title: parsed.title,
    description: parsed.description,
    tracks: parsed.tracks,
  };
}
