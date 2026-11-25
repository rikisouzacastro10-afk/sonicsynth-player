import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import type { OfflineTrackRecord, Playlist, Track } from '../types/music';
import { sanitizeFilename } from '../utils/formatters';

const DB_NAME = 'SonicMorphOfflineDB';
const DB_VERSION = 1;
const STORE_AUDIO = 'audioBlobs';
const STORE_TRACKS = 'offlineTracks';
const STORE_PLAYLISTS = 'savedPlaylists';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function idbPut<T>(storeName: string, value: T, key?: IDBValidKey): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        if (key !== undefined) store.put(value, key);
        else store.put(value);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbGet<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result as T | undefined);
        req.onerror = () => reject(req.error);
      })
  );
}

function idbGetAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as T[]) || []);
        req.onerror = () => reject(req.error);
      })
  );
}

function idbDelete(storeName: string, key: IDBValidKey): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbClear(storeName: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function saveOfflineTrack(
  track: Track,
  audioBlob: Blob,
  lyricsLrc?: string
): Promise<OfflineTrackRecord> {
  await idbPut(STORE_AUDIO, audioBlob, track.id);

  let hasNativeFile = false;
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(audioBlob);
      const filename = `sonicmorph/${sanitizeFilename(track.id)}.audio`;
      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Data,
        recursive: true,
      });
      hasNativeFile = true;
    } catch {
      // IndexedDB remains active as primary resilient store
    }
  }

  const record: OfflineTrackRecord = {
    id: track.id,
    track: { ...track, lyricsLrc: lyricsLrc ?? track.lyricsLrc },
    sizeBytes: audioBlob.size,
    downloadedAt: Date.now(),
    lyricsLrc: lyricsLrc ?? track.lyricsLrc,
    hasNativeFile,
  };

  await idbPut(STORE_TRACKS, record);
  return record;
}

export async function getOfflineAudioBlob(trackId: string): Promise<Blob | null> {
  try {
    const blob = await idbGet<Blob>(STORE_AUDIO, trackId);
    if (blob instanceof Blob) return blob;
    return null;
  } catch {
    return null;
  }
}

export async function getOfflineTrackRecord(trackId: string): Promise<OfflineTrackRecord | null> {
  try {
    const record = await idbGet<OfflineTrackRecord>(STORE_TRACKS, trackId);
    return record ?? null;
  } catch {
    return null;
  }
}

export async function listOfflineTracks(): Promise<OfflineTrackRecord[]> {
  try {
    const items = await idbGetAll<OfflineTrackRecord>(STORE_TRACKS);
    return items.sort((a, b) => b.downloadedAt - a.downloadedAt);
  } catch {
    return [];
  }
}

export async function deleteOfflineTrack(trackId: string): Promise<void> {
  await Promise.all([
    idbDelete(STORE_AUDIO, trackId).catch(() => undefined),
    idbDelete(STORE_TRACKS, trackId).catch(() => undefined),
  ]);

  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.deleteFile({
        path: `sonicmorph/${sanitizeFilename(trackId)}.audio`,
        directory: Directory.Data,
      });
    } catch {
      // Ignore if not present natively
    }
  }
}

export async function clearAllOfflineStorage(): Promise<void> {
  await Promise.all([
    idbClear(STORE_AUDIO).catch(() => undefined),
    idbClear(STORE_TRACKS).catch(() => undefined),
  ]);

  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.rmdir({
        path: 'sonicmorph',
        directory: Directory.Data,
        recursive: true,
      });
    } catch {
      // Ignore native dir cleanup error
    }
  }
}

export async function savePlaylistToStorage(playlist: Playlist): Promise<void> {
  await idbPut(STORE_PLAYLISTS, playlist).catch(() => undefined);
}

export async function listSavedPlaylists(): Promise<Playlist[]> {
  try {
    const items = await idbGetAll<Playlist>(STORE_PLAYLISTS);
    return items.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function deleteSavedPlaylist(playlistId: string): Promise<void> {
  await idbDelete(STORE_PLAYLISTS, playlistId).catch(() => undefined);
}

export async function getStorageMetrics(): Promise<{
  tracksCount: number;
  usedBytes: number;
  quotaBytes: number | null;
}> {
  const records = await listOfflineTracks();
  const usedBytes = records.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);

  let quotaBytes: number | null = null;
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      quotaBytes = est.quota ?? null;
    } catch {
      quotaBytes = null;
    }
  }

  return {
    tracksCount: records.length,
    usedBytes,
    quotaBytes,
  };
}
