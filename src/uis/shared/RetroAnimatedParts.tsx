import { Heart, Music, Sparkles, Star } from 'lucide-react';
import { TrackArtwork } from '../../components/TrackArtwork';

interface EqProps {
  isPlaying: boolean;
  bars?: number;
  barClass?: string;
  heightClass?: string;
}

export function AnimatedEqBars({
  isPlaying,
  bars = 12,
  barClass = 'bg-emerald-400',
  heightClass = 'h-12',
}: EqProps) {
  return (
    <div className={`flex items-end gap-1 ${heightClass}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, idx) => {
        const delay = `${((idx * 137) % 700) / 1000}s`;
        const duration = `${0.52 + ((idx * 53) % 45) / 100}s`;
        return (
          <div
            key={idx}
            className={`flex-1 rounded-t-sm anim-eq-bar ${barClass} ${!isPlaying ? 'anim-paused' : ''}`}
            style={{
              height: '100%',
              animationDelay: delay,
              animationDuration: duration,
              transform: isPlaying ? undefined : 'scaleY(0.18)',
            }}
          />
        );
      })}
    </div>
  );
}

export function ArtworkAura({
  isPlaying,
  gradientClass = 'from-indigo-500/45 via-sky-400/25 to-violet-500/45',
  roundedClass = 'rounded-3xl',
}: {
  isPlaying: boolean;
  gradientClass?: string;
  roundedClass?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-2.5 bg-gradient-to-tr ${gradientClass} blur-xl ${roundedClass} anim-aura-pulse ${
        !isPlaying ? 'anim-paused opacity-20' : ''
      }`}
    />
  );
}

export function LedPeakMeter({
  isPlaying,
  label = 'OUT',
  segments = 12,
  isDark = true,
}: {
  isPlaying: boolean;
  label?: string;
  segments?: number;
  isDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="text-[9px] font-mono-tech font-bold opacity-65 w-6 shrink-0">{label}</span>
      <div className="flex-1 grid grid-cols-12 gap-0.5 h-2">
        {Array.from({ length: segments }).map((_, i) => {
          const isHot = i >= segments - 2;
          const isMid = i >= segments - 5 && !isHot;
          const color = isHot ? 'bg-rose-500' : isMid ? 'bg-amber-400' : 'bg-emerald-500';
          const delay = `${((i * 89) % 480) / 1000}s`;
          return (
            <div
              key={i}
              className={`rounded-[2px] ${isDark ? 'bg-white/10' : 'bg-black/10'} overflow-hidden`}
            >
              <div
                className={`w-full h-full ${color} anim-twinkle ${!isPlaying ? 'anim-paused opacity-20' : ''}`}
                style={{ animationDelay: delay, animationDuration: `${0.48 + (i % 4) * 0.14}s` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CassetteReel({ isPlaying, light = false }: { isPlaying: boolean; light?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`w-14 h-14 anim-spin-reel ${!isPlaying ? 'anim-paused' : ''}`}
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        fill={light ? '#e4e4e7' : '#18181b'}
        stroke="#52525b"
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="32" cy="32" r="10" fill={light ? '#27272a' : '#e4e4e7'} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <rect
          key={deg}
          x="30.5"
          y="19"
          width="3"
          height="6"
          rx="1"
          fill={light ? '#27272a' : '#f4f4f5'}
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </svg>
  );
}

export function StudioMetalReel({ isPlaying, sizeClass = 'w-44 h-44' }: { isPlaying: boolean; sizeClass?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`${sizeClass} anim-spin-reel ${!isPlaying ? 'anim-paused' : ''}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="aluReel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e4e4e7" />
          <stop offset="65%" stopColor="#a1a1aa" />
          <stop offset="100%" stopColor="#52525b" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="57" fill="url(#aluReel)" stroke="#27272a" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="40" fill="#18181b" opacity="0.22" />
      {[0, 120, 240].map((deg) => (
        <path
          key={deg}
          d="M 48 16 L 72 16 L 66 44 L 54 44 Z"
          fill="#18181b"
          opacity="0.82"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="14" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
      <circle cx="60" cy="60" r="5" fill="#18181b" />
    </svg>
  );
}

export function AnalogVuMeter({
  isPlaying,
  label = 'VU',
  altNeedle = false,
}: {
  isPlaying: boolean;
  label?: string;
  altNeedle?: boolean;
}) {
  return (
    <div
      className={`relative w-full h-24 rounded-lg border-2 border-zinc-800 overflow-hidden shadow-inner flex flex-col justify-between px-2.5 py-2 text-zinc-900 transition-colors ${
        isPlaying ? 'bg-gradient-to-b from-[#FFF3C4] to-[#F6DF98]' : 'bg-[#EAE0BE]'
      }`}
    >
      <div className="flex items-center justify-between text-[8px] leading-none font-mono-tech font-bold shrink-0 tracking-tight">
        <span>-20</span>
        <span>-10</span>
        <span className="text-red-600">0</span>
        <span className="text-red-600">+3dB</span>
      </div>
      <div className="relative flex-1 flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 100 32" className="absolute inset-x-1 bottom-1 w-[calc(100%-8px)] h-8 opacity-35" aria-hidden="true">
          <path d="M 8 30 A 44 44 0 0 1 92 30" fill="none" stroke="#18181b" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 70 11 A 44 44 0 0 1 92 30" fill="none" stroke="#dc2626" strokeWidth="2" />
        </svg>
        <div
          className={`w-0.5 h-11 bg-zinc-950 rounded-full ${
            altNeedle ? 'anim-vu-needle-alt' : 'anim-vu-needle'
          } ${!isPlaying ? 'anim-paused' : ''}`}
          style={{ transform: isPlaying ? undefined : 'rotate(-34deg)' }}
        />
        <div className="absolute bottom-0 w-5 h-2.5 rounded-t-full bg-zinc-900" />
      </div>
      <div className="text-center text-[10px] font-mono-tech font-bold leading-none pt-1 border-t border-zinc-800/15 shrink-0 flex items-center justify-between">
        <span className="opacity-60">dB</span>
        <span>{label}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-600' : 'bg-zinc-400'}`} />
      </div>
    </div>
  );
}

export function VinylPlatterWithGrooves({
  isPlaying,
  artwork,
  title,
  sizeClass = 'w-64 h-64 sm:w-76 sm:h-76',
  labelRingClass = 'border-amber-400/75',
}: {
  isPlaying: boolean;
  artwork?: string;
  title?: string;
  sizeClass?: string;
  labelRingClass?: string;
}) {
  return (
    <div className={`relative ${sizeClass} rounded-full bg-zinc-950 border-8 border-zinc-700/80 shadow-2xl flex items-center justify-center`}>
      {/* Strobe Edge Dots */}
      <div
        className={`absolute inset-1 rounded-full border-2 border-dotted border-zinc-400/35 anim-spin-gear ${
          !isPlaying ? 'anim-paused' : ''
        }`}
        aria-hidden="true"
      />
      <div
        className={`w-[92%] h-[92%] rounded-full bg-[radial-gradient(circle,#1c1c20_24%,#09090b_25%,#18181b_39%,#09090b_40%,#1a1a1f_56%,#09090b_57%,#18181b_75%,#09090b_76%)] flex items-center justify-center relative anim-spin-vinyl ${
          !isPlaying ? 'anim-paused' : ''
        }`}
      >
        {/* Subtle vinyl specular sheen */}
        <div
          className="absolute inset-0 rounded-full bg-[conic-gradient(from_35deg,transparent_0deg,rgba(255,255,255,0.08)_28deg,transparent_60deg,transparent_180deg,rgba(255,255,255,0.06)_212deg,transparent_245deg)] pointer-events-none"
          aria-hidden="true"
        />
        <div className={`w-[38%] h-[38%] rounded-full overflow-hidden border-4 ${labelRingClass} relative shadow-lg`}>
          <TrackArtwork src={artwork} alt={title || 'Vinil'} />
          <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-zinc-200 border border-zinc-900" />
        </div>
      </div>
    </div>
  );
}

export function FloatingKawaiiDecor({
  isPlaying,
  accentClass = 'text-pink-400',
}: {
  isPlaying: boolean;
  accentClass?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${accentClass}`} aria-hidden="true">
      <Star
        className={`w-3.5 h-3.5 fill-current anim-twinkle ${!isPlaying ? 'anim-paused' : ''}`}
      />
      <Music
        className={`w-3.5 h-3.5 anim-note-float ${!isPlaying ? 'anim-paused' : ''}`}
        style={{ animationDelay: '0.25s' }}
      />
      <Heart
        className={`w-3.5 h-3.5 fill-current anim-twinkle ${!isPlaying ? 'anim-paused' : ''}`}
        style={{ animationDelay: '0.55s' }}
      />
      <Sparkles
        className={`w-3.5 h-3.5 anim-note-float ${!isPlaying ? 'anim-paused' : ''}`}
        style={{ animationDelay: '0.85s' }}
      />
    </div>
  );
}

export function KawaiiBuddySvg({ isPlaying, variant = 'bunny' }: { isPlaying: boolean; variant?: 'bunny' | 'cat' }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={`w-16 h-16 anim-kawaii-hop ${!isPlaying ? 'anim-paused' : ''}`}
      aria-hidden="true"
    >
      {variant === 'bunny' ? (
        <>
          <ellipse cx="28" cy="18" rx="7" ry="15" fill="#FFF" stroke="#F472B6" strokeWidth="2.5" />
          <ellipse cx="52" cy="18" rx="7" ry="15" fill="#FFF" stroke="#F472B6" strokeWidth="2.5" />
          <ellipse cx="28" cy="19" rx="3.5" ry="9" fill="#FBCFE8" />
          <ellipse cx="52" cy="19" rx="3.5" ry="9" fill="#FBCFE8" />
        </>
      ) : (
        <>
          <polygon points="18,32 24,10 38,24" fill="#FFF" stroke="#EC4899" strokeWidth="2.5" />
          <polygon points="62,32 56,10 42,24" fill="#FFF" stroke="#EC4899" strokeWidth="2.5" />
        </>
      )}
      <circle cx="40" cy="46" r="24" fill="#FFF" stroke="#F472B6" strokeWidth="2.5" />
      <ellipse cx="26" cy="49" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.75" />
      <ellipse cx="54" cy="49" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.75" />
      <circle cx="31" cy="43" r="2.6" fill="#3F3F46" />
      <circle cx="49" cy="43" r="2.6" fill="#3F3F46" />
      <path d="M 36 51 Q 40 55 44 51" fill="none" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
