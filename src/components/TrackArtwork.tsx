import { useState } from 'react';
import { Disc3 } from 'lucide-react';

interface TrackArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackBg?: string;
}

export function TrackArtwork({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackBg = 'from-slate-800 to-slate-950',
}: TrackArtworkProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${fallbackBg} text-white/60 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Disc3 className="w-1/3 h-1/3 opacity-70" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}
