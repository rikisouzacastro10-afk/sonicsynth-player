import 'dotenv/config';
import express from 'express';
import path from 'path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'url';
import {
  isFullLengthDuration,
  normalizeSearchText,
  rankTracksByPopularityAndMatch,
} from './src/utils/searchMatch';
import {
  parseDurationText,
  parseIsoDuration,
  parseViewsText,
  upgradeYtmArtwork,
} from './src/utils/youtubeFormatters';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const YTM_CONTEXT = {
  client: {
    clientName: 'WEB_REMIX',
    clientVersion: '1.20240724.01.00',
    hl: 'pt',
    gl: 'BR',
  },
};

const YTM_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Origin: 'https://music.youtube.com',
  Referer: 'https://music.youtube.com/',
};

export interface NormalizedTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  source: 'yt-music' | 'youtube-v3';
  genre?: string;
  views?: number;
  verified?: boolean;
  channelTitle?: string;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 6000, signal: externalSignal, ...init } = options;
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
}

interface YtmRun {
  text?: string;
  navigationEndpoint?: {
    watchEndpoint?: {
      videoId?: string;
      watchEndpointMusicSupportedConfigs?: {
        watchEndpointMusicConfig?: { musicVideoType?: string };
      };
    };
    browseEndpoint?: {
      browseEndpointContextSupportedConfigs?: {
        browseEndpointContextMusicConfig?: { pageType?: string };
      };
    };
  };
}

interface YtmResponsiveItem {
  playlistItemData?: { videoId?: string };
  thumbnail?: {
    musicThumbnailRenderer?: {
      thumbnail?: { thumbnails?: Array<{ url?: string; width?: number }> };
    };
  };
  overlay?: {
    musicItemThumbnailOverlayRenderer?: {
      content?: {
        musicPlayButtonRenderer?: {
          playNavigationEndpoint?: {
            watchEndpoint?: {
              videoId?: string;
              watchEndpointMusicSupportedConfigs?: {
                watchEndpointMusicConfig?: { musicVideoType?: string };
              };
            };
          };
        };
      };
    };
  };
  flexColumns?: Array<{
    musicResponsiveListItemFlexColumnRenderer?: {
      text?: { runs?: YtmRun[] };
    };
  }>;
}

function parseYtmResponsiveItem(item: YtmResponsiveItem): NormalizedTrack | null {
  const col0Runs = item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
  const col1Runs = item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
  const col2Runs = item.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];

  const watchEndpoint =
    item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
      ?.playNavigationEndpoint?.watchEndpoint ||
    col0Runs.find((r) => r.navigationEndpoint?.watchEndpoint?.videoId)?.navigationEndpoint
      ?.watchEndpoint;

  const videoId = item.playlistItemData?.videoId || watchEndpoint?.videoId || '';
  if (!videoId || videoId.length < 6) return null;

  const title = col0Runs
    .map((r) => r.text || '')
    .join('')
    .trim();
  if (!title) return null;

  const artists: string[] = [];
  let album = '';
  let duration = 0;

  for (const run of col1Runs) {
    const text = (run.text || '').trim();
    if (!text || text === '•' || text === '·' || text === '&' || text === ',') continue;
    const lower = text.toLowerCase();
    if (lower === 'música' || lower === 'song' || lower === 'vídeo' || lower === 'video') continue;

    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(text)) {
      duration = parseDurationText(text);
      continue;
    }

    const pageType =
      run.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
        ?.browseEndpointContextMusicConfig?.pageType;
    if (pageType === 'MUSIC_PAGE_TYPE_ARTIST') {
      artists.push(text);
    } else if (pageType === 'MUSIC_PAGE_TYPE_ALBUM') {
      album = text;
    } else {
      const maybeViews = parseViewsText(text);
      if (!maybeViews && artists.length === 0) {
        artists.push(text);
      }
    }
  }

  let views: number | undefined;
  for (const run of [...col2Runs, ...col1Runs]) {
    const v = parseViewsText(run.text);
    if (v && (!views || v > views)) {
      views = v;
    }
  }

  // Fallback duration for chart items that omit explicit mm:ss
  if (duration === 0) {
    duration = 200;
  }

  if (!isFullLengthDuration(duration)) return null;

  const thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const bestThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
  const musicVideoType =
    watchEndpoint?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType;

  return {
    id: videoId,
    title,
    artist: artists.join(', ') || 'YouTube Music',
    album: album || 'YouTube Music',
    duration,
    artwork: upgradeYtmArtwork(bestThumb, videoId, 544),
    source: 'yt-music',
    views,
    verified:
      musicVideoType === 'MUSIC_VIDEO_TYPE_ATV' ||
      musicVideoType === 'MUSIC_VIDEO_TYPE_OMV' ||
      artists.length > 0,
  };
}

function extractResponsiveItemsFromSections(sections: unknown[]): NormalizedTrack[] {
  const tracks: NormalizedTrack[] = [];
  for (const sec of sections) {
    if (!sec || typeof sec !== 'object') continue;
    const record = sec as Record<string, unknown>;
    const shelfContents =
      (record.musicShelfRenderer as { contents?: unknown[] } | undefined)?.contents ||
      (record.musicCarouselShelfRenderer as { contents?: unknown[] } | undefined)?.contents ||
      (record.musicPlaylistShelfRenderer as { contents?: unknown[] } | undefined)?.contents ||
      [];

    for (const entry of shelfContents) {
      if (!entry || typeof entry !== 'object') continue;
      const renderer = (entry as { musicResponsiveListItemRenderer?: YtmResponsiveItem })
        .musicResponsiveListItemRenderer;
      if (!renderer) continue;
      const parsed = parseYtmResponsiveItem(renderer);
      if (parsed) tracks.push(parsed);
    }
  }
  return tracks;
}

async function searchYouTubeDataApiV3(
  query: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<NormalizedTrack[]> {
  if (!apiKey) return [];
  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=25` +
    `&q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;

  const sRes = await fetchWithTimeout(searchUrl, { timeoutMs: 6500, signal });
  if (!sRes.ok) {
    throw new Error(`YouTube Data API v3 ${sRes.status}`);
  }
  const sData = (await sRes.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  };

  const videoIds = (sData.items || [])
    .map((it) => it.id?.videoId)
    .filter((id): id is string => Boolean(id));
  if (videoIds.length === 0) return [];

  const detailsUrl =
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${encodeURIComponent(videoIds.join(','))}` +
    `&key=${encodeURIComponent(apiKey)}`;
  const dRes = await fetchWithTimeout(detailsUrl, { timeoutMs: 6500, signal });
  if (!dRes.ok) {
    throw new Error(`YouTube Videos API ${dRes.status}`);
  }
  const dData = (await dRes.json()) as {
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
  };

  const tracks: NormalizedTrack[] = [];
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

  return rankTracksByPopularityAndMatch(query, tracks);
}

async function fetchYouTubeApiV3Trending(
  apiKey: string,
  signal?: AbortSignal
): Promise<NormalizedTrack[]> {
  if (!apiKey) return [];
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics` +
    `&chart=mostPopular&videoCategoryId=10&regionCode=BR&maxResults=20&key=${encodeURIComponent(apiKey)}`;
  const r = await fetchWithTimeout(url, { timeoutMs: 6500, signal });
  if (!r.ok) return [];
  const data = (await r.json()) as {
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
  };
  const tracks: NormalizedTrack[] = [];
  for (const item of data.items || []) {
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

async function searchYouTubeMusicInnerTube(
  query: string,
  signal?: AbortSignal
): Promise<NormalizedTrack[]> {
  // Query YouTube Music Songs shelf (params = EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D) + general shelf in parallel
  const songReq = fetchWithTimeout('https://music.youtube.com/youtubei/v1/search?prettyPrint=false', {
    method: 'POST',
    headers: YTM_HEADERS,
    timeoutMs: 6500,
    signal,
    body: JSON.stringify({
      context: YTM_CONTEXT,
      query,
      params: 'EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D',
    }),
  });

  const allReq = fetchWithTimeout('https://music.youtube.com/youtubei/v1/search?prettyPrint=false', {
    method: 'POST',
    headers: YTM_HEADERS,
    timeoutMs: 6500,
    signal,
    body: JSON.stringify({
      context: YTM_CONTEXT,
      query,
    }),
  });

  const [songSettled, allSettled] = await Promise.allSettled([songReq, allReq]);
  const rawTracks: NormalizedTrack[] = [];

  for (const res of [songSettled, allSettled]) {
    if (res.status !== 'fulfilled' || !res.value.ok) continue;
    const json = (await res.value.json()) as {
      contents?: {
        tabbedSearchResultsRenderer?: {
          tabs?: Array<{
            tabRenderer?: {
              content?: { sectionListRenderer?: { contents?: unknown[] } };
            };
          }>;
        };
      };
    };
    const sections =
      json.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content
        ?.sectionListRenderer?.contents || [];
    rawTracks.push(...extractResponsiveItemsFromSections(sections));
  }

  // Deduplicate by videoId keeping the richer entry (more views / explicit album)
  const byId = new Map<string, NormalizedTrack>();
  for (const t of rawTracks) {
    const prev = byId.get(t.id);
    if (!prev || ((!prev.views || (t.views && t.views > prev.views)) && t.views)) {
      byId.set(t.id, t);
    }
  }

  return rankTracksByPopularityAndMatch(query, Array.from(byId.values()));
}

async function fetchYouTubeSuggestSeed(query: string, signal?: AbortSignal): Promise<string[]> {
  try {
    const r = await fetchWithTimeout(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`,
      { timeoutMs: 2500, signal }
    );
    if (!r.ok) return [];
    const data = (await r.json()) as [string, string[]];
    return Array.isArray(data?.[1]) ? data[1].slice(0, 4) : [];
  } catch {
    return [];
  }
}

async function fetchYouTubeMusicTrending(signal?: AbortSignal): Promise<NormalizedTrack[]> {
  const tracks: NormalizedTrack[] = [];

  const [exploreSettled, chartsPlaylistSettled] = await Promise.allSettled([
    fetchWithTimeout('https://music.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method: 'POST',
      headers: YTM_HEADERS,
      timeoutMs: 6500,
      signal,
      body: JSON.stringify({
        context: YTM_CONTEXT,
        browseId: 'FEmusic_explore',
      }),
    }),
    fetchWithTimeout('https://music.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method: 'POST',
      headers: YTM_HEADERS,
      timeoutMs: 6500,
      signal,
      body: JSON.stringify({
        context: YTM_CONTEXT,
        browseId: 'VLPL4fGSI1pDJn4yCNzulPkUbxgr4pl0gmI',
      }),
    }),
  ]);

  if (exploreSettled.status === 'fulfilled' && exploreSettled.value.ok) {
    const json = (await exploreSettled.value.json()) as {
      contents?: {
        singleColumnBrowseResultsRenderer?: {
          tabs?: Array<{
            tabRenderer?: { content?: { sectionListRenderer?: { contents?: unknown[] } } };
          }>;
        };
      };
    };
    const sections =
      json.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
        ?.sectionListRenderer?.contents || [];
    tracks.push(...extractResponsiveItemsFromSections(sections));
  }

  if (chartsPlaylistSettled.status === 'fulfilled' && chartsPlaylistSettled.value.ok) {
    const json = (await chartsPlaylistSettled.value.json()) as {
      contents?: {
        twoColumnBrowseResultsRenderer?: {
          secondaryContents?: { sectionListRenderer?: { contents?: unknown[] } };
        };
        singleColumnBrowseResultsRenderer?: {
          tabs?: Array<{
            tabRenderer?: { content?: { sectionListRenderer?: { contents?: unknown[] } } };
          }>;
        };
      };
    };
    const sections =
      json.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer
        ?.contents ||
      json.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
        ?.sectionListRenderer?.contents ||
      [];
    tracks.push(...extractResponsiveItemsFromSections(sections));
  }

  if (tracks.length < 8) {
    const seeded = await searchYouTubeMusicInnerTube('top hits official audio', signal);
    tracks.push(...seeded);
  }

  const deduped = new Map<string, NormalizedTrack>();
  for (const t of tracks) {
    if (!deduped.has(t.id)) {
      deduped.set(t.id, t);
    }
  }
  return Array.from(deduped.values()).slice(0, 30);
}

let cachedVisitorData: { value: string; expiresAt: number } | null = null;

async function getYtmVisitorData(signal?: AbortSignal): Promise<string> {
  if (cachedVisitorData && cachedVisitorData.expiresAt > Date.now()) {
    return cachedVisitorData.value;
  }
  try {
    const r = await fetchWithTimeout('https://music.youtube.com', {
      headers: { 'User-Agent': YTM_HEADERS['User-Agent'] },
      timeoutMs: 4000,
      signal,
    });
    const html = await r.text();
    const match = html.match(/"VISITOR_DATA":"([^"]+)"/);
    if (match?.[1]) {
      cachedVisitorData = { value: match[1], expiresAt: Date.now() + 30 * 60_000 };
      return match[1];
    }
  } catch {
    // Ignore visitorData failure
  }
  return '';
}

async function resolveDownloadableAudioUrl(
  videoId: string,
  signal?: AbortSignal
): Promise<string | null> {
  const visitorData = await getYtmVisitorData(signal);

  // 1. Try direct YouTube Music InnerTube player clients (works cleanly on non-blocked networks)
  const clients = [
    {
      ua: 'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
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
    {
      ua: 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)',
      client: {
        clientName: 'IOS',
        clientVersion: '19.29.1',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        hl: 'pt',
        gl: 'BR',
        visitorData,
      },
    },
  ];

  for (const entry of clients) {
    if (signal?.aborted) return null;
    try {
      const r = await fetchWithTimeout('https://music.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        timeoutMs: 4500,
        signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': entry.ua,
          ...(visitorData ? { 'X-Goog-Visitor-Id': visitorData } : {}),
        },
        body: JSON.stringify({
          videoId,
          context: { client: entry.client },
        }),
      });
      if (!r.ok) continue;
      const data = (await r.json()) as {
        streamingData?: {
          adaptiveFormats?: Array<{ url?: string; mimeType?: string; bitrate?: number }>;
        };
      };
      const best = (data.streamingData?.adaptiveFormats || [])
        .filter((f) => f.url && f.mimeType?.startsWith('audio/'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      if (best?.url) return best.url;
    } catch {
      // Try next client
    }
  }

  // 2. Fallback to Cobalt-compatible audio extractor
  const cobaltEndpoints = ['https://api.cobalt.tools/', 'https://co.wuk.sh/api/json'];
  for (const endpoint of cobaltEndpoints) {
    if (signal?.aborted) return null;
    try {
      const r = await fetchWithTimeout(endpoint, {
        method: 'POST',
        timeoutMs: 4500,
        signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
          downloadMode: 'audio',
          audioFormat: 'mp3',
          isAudioOnly: true,
        }),
      });
      if (!r.ok) continue;
      const data = (await r.json()) as { url?: string };
      if (data.url && data.url.startsWith('https://')) {
        return data.url;
      }
    } catch {
      // Try next extractor
    }
  }

  return null;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Pollinations Free Text AI Relay (web preview fallback without browser Origin header)
  app.post('/api/pollinations', async (req, res) => {
    try {
      const upstream = await fetchWithTimeout('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body || {}),
        timeoutMs: 25000,
      });
      const text = await upstream.text();
      res.status(upstream.status).type('text/plain; charset=utf-8').send(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar Pollinations AI.';
      res.status(502).send(msg);
    }
  });

  // 2. YouTube Music Live Trending Charts
  app.get('/api/ytm/trending', async (req, res) => {
    const reqController = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) reqController.abort();
    });

    const apiKey = String(req.headers['x-youtube-api-key'] || process.env.YOUTUBE_API_KEY || '').trim();
    let tracks: NormalizedTrack[] = [];
    let sourceLabel = 'YouTube Music Charts';

    if (apiKey) {
      try {
        tracks = await fetchYouTubeApiV3Trending(apiKey, reqController.signal);
        if (tracks.length > 0) sourceLabel = 'YouTube Data API v3 · Em Alta';
      } catch {
        tracks = [];
      }
    }

    if (tracks.length === 0 && !reqController.signal.aborted) {
      tracks = await fetchYouTubeMusicTrending(reqController.signal);
      sourceLabel = 'YouTube Music · Em Alta';
    }

    if (!reqController.signal.aborted) {
      res.json({ tracks, instance: sourceLabel });
    }
  });

  // 3. YouTube Data API v3 Search + YouTube Music InnerTube Fallback
  app.get('/api/ytm/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) {
      res.json({ tracks: [], instance: 'none' });
      return;
    }

    const reqController = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) reqController.abort();
    });

    const apiKey = String(req.headers['x-youtube-api-key'] || process.env.YOUTUBE_API_KEY || '').trim();
    let tracks: NormalizedTrack[] = [];
    let sourceLabel = 'YouTube Music';

    if (apiKey) {
      try {
        tracks = await searchYouTubeDataApiV3(q, apiKey, reqController.signal);
        if (tracks.length > 0) sourceLabel = 'YouTube Data API v3';
      } catch {
        tracks = [];
      }
    }

    if (tracks.length === 0 && !reqController.signal.aborted) {
      tracks = await searchYouTubeMusicInnerTube(q, reqController.signal);
      if (tracks.length === 0 && !reqController.signal.aborted) {
        const suggestions = await fetchYouTubeSuggestSeed(q, reqController.signal);
        if (suggestions[0]) {
          tracks = await searchYouTubeMusicInnerTube(suggestions[0], reqController.signal);
        }
      }
      sourceLabel = 'YouTube Music Catalog';
    }

    // Deduplicate normalized title+artist while preserving highest-ranked official result first
    const merged: NormalizedTrack[] = [];
    const seen = new Set<string>();
    for (const t of tracks) {
      const key = `${normalizeSearchText(t.title).slice(0, 28)}-${normalizeSearchText(t.artist).slice(0, 18)}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(t);
      }
    }

    if (!reqController.signal.aborted) {
      res.json({
        tracks: merged.slice(0, 20),
        instance: sourceLabel,
      });
    }
  });

  // 4. Offline Cache Audio Downloader (Android uses CapacitorHttp directly; Web uses server extractor)
  app.get('/api/ytm/download/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId || videoId.length < 6) {
      res.status(400).json({ error: 'videoId inválido' });
      return;
    }

    const controller = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) controller.abort();
    });

    const audioUrl = await resolveDownloadableAudioUrl(videoId, controller.signal);
    if (!audioUrl) {
      if (!controller.signal.aborted) {
        res.status(502).json({
          error:
            'Extração direta bloqueada neste servidor. Use o APK Android (CapacitorHttp) ou tente outra faixa.',
        });
      }
      return;
    }

    try {
      const upstream = await fetchWithTimeout(audioUrl, {
        timeoutMs: 45000,
        signal: controller.signal,
        headers: { 'User-Agent': YTM_HEADERS['User-Agent'] },
      });
      if (!upstream.ok && upstream.status !== 206) {
        res.status(upstream.status).send('Upstream audio download error');
        return;
      }

      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mp4');
      const len = upstream.headers.get('content-length');
      if (len) res.setHeader('Content-Length', len);

      if (upstream.body) {
        const nodeStream = Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]);
        nodeStream.on('error', () => {
          if (!res.headersSent) res.status(502);
          res.end();
        });
        res.on('close', () => {
          if (!res.writableEnded) nodeStream.destroy();
        });
        nodeStream.pipe(res);
      } else {
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.send(buf);
      }
    } catch {
      if (!res.headersSent && !controller.signal.aborted) {
        res.status(502).json({ error: 'Falha ao transferir áudio offline.' });
      }
    }
  });

  // 5. SponsorBlock API Proxy
  app.get('/api/sponsorblock/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    const categories = encodeURIComponent(
      JSON.stringify(['sponsor', 'selfpromo', 'interaction', 'intro', 'outro', 'music_offtopic'])
    );
    try {
      const r = await fetchWithTimeout(
        `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${categories}`,
        { timeoutMs: 3500 }
      );
      if (!r.ok) {
        res.json({ segments: [] });
        return;
      }
      const segments = await r.json();
      res.json({ segments: Array.isArray(segments) ? segments : [] });
    } catch {
      res.json({ segments: [] });
    }
  });

  // 6. LRCLIB Synced Lyrics Proxy
  app.get('/api/lyrics', async (req, res) => {
    const track = String(req.query.track || '').trim();
    const artist = String(req.query.artist || '').trim();
    const duration = Number(req.query.duration || 0);

    if (!track) {
      res.json({});
      return;
    }

    try {
      const params = new URLSearchParams({
        track_name: track,
        artist_name: artist,
      });
      if (duration > 0) params.set('duration', String(duration));

      const r = await fetchWithTimeout(`https://lrclib.net/api/get?${params.toString()}`, {
        timeoutMs: 4000,
      });
      if (r.ok) {
        const data = await r.json();
        res.json(data);
        return;
      }
    } catch {
      // Fall through to search endpoint
    }

    try {
      const r = await fetchWithTimeout(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${track} ${artist}`)}`,
        { timeoutMs: 4000 }
      );
      if (r.ok) {
        const list = (await r.json()) as Array<Record<string, unknown>>;
        res.json(list[0] || {});
        return;
      }
    } catch {
      // Ignore
    }

    res.json({});
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SonicMorph YouTube Music server running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
