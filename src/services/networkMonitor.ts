import { Network } from '@capacitor/network';

type NetworkCallback = (isOnline: boolean, connectionType: string) => void;

export function startNetworkMonitor(onStatusChange: NetworkCallback): () => void {
  let active = true;

  const emitBrowserState = () => {
    if (!active) return;
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    onStatusChange(online, online ? conn?.effectiveType || 'wifi' : 'none');
  };

  const handleOnline = () => emitBrowserState();
  const handleOffline = () => onStatusChange(false, 'none');

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    emitBrowserState();
  }

  let capHandle: { remove: () => Promise<void> } | null = null;
  Network.getStatus()
    .then((status) => {
      if (active) {
        onStatusChange(status.connected, status.connectionType);
      }
    })
    .catch(() => undefined);

  Network.addListener('networkStatusChange', (status) => {
    if (active) {
      onStatusChange(status.connected, status.connectionType);
    }
  })
    .then((handle) => {
      capHandle = handle;
    })
    .catch(() => undefined);

  return () => {
    active = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
    capHandle?.remove().catch(() => undefined);
  };
}
