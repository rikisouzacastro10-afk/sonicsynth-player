import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { UIId } from '../types/music';

/**
 * Lazy-loaded registry of all 45 UIs.
 * Only the currently selected UI is ever loaded and mounted in the DOM.
 */
export const UI_COMPONENTS: Record<UIId, LazyExoticComponent<ComponentType>> = {
  // 8 iPod Click Wheel OS UIs (6 classic/custom + 2 kawaii)
  'ipod-classic': lazy(() => import('./IpodClassicUI')),
  'ipod-nano-chroma': lazy(() => import('./IpodNanoChromaUI')),
  'ipod-mini-eink': lazy(() => import('./IpodMiniEinkUI')),
  'ipod-transparent-atomic': lazy(() => import('./IpodAtomicClearUI')),
  'ipod-cyber-u2-stealth': lazy(() => import('./IpodCyberStealthUI')),
  'ipod-gold-atelier': lazy(() => import('./IpodGoldAtelierUI')),
  'ipod-kawaii-strawberry': lazy(() => import('./IpodKawaiiStrawberryUI')),
  'ipod-kawaii-cloud-dream': lazy(() => import('./IpodKawaiiCloudUI')),

  // 20 Retro Animated UIs (18 classic/studio + 2 kawaii)
  'retro-walkman-cassette': lazy(() => import('./RetroWalkmanUI')),
  'retro-winamp-rack': lazy(() => import('./RetroWinampRackUI')),
  'retro-vinyl-turntable': lazy(() => import('./RetroVinylTurntableUI')),
  'retro-vfd-crt': lazy(() => import('./RetroVfdCrtUI')),
  'retro-boombox-ghettoblaster': lazy(() => import('./RetroBoomboxUI')),
  'retro-minidisc-y2k': lazy(() => import('./RetroMiniDiscUI')),
  'retro-arcade-jukebox': lazy(() => import('./RetroJukeboxUI')),
  'retro-reel-to-reel': lazy(() => import('./RetroReelToReelUI')),
  'retro-kawaii-tamagotchi': lazy(() => import('./RetroKawaiiTamagotchiUI')),
  'retro-kawaii-bento-radio': lazy(() => import('./RetroKawaiiRadioUI')),
  'retro-tps-l2-1979': lazy(() => import('./RetroTpsL21979UI')),
  'retro-winamp-classic-291': lazy(() => import('./RetroWinampClassic291UI')),
  'retro-minidisc-mz-r50': lazy(() => import('./RetroMiniDiscMzR50UI')),
  'retro-tv-crt-trinitron-vhs': lazy(() => import('./RetroTvCrtVhsUI')),
  'retro-dualscreen-3ds-sp': lazy(() => import('./RetroDualScreen3dsUI')),
  'retro-synth-op1-studio': lazy(() => import('./RetroSynthOp1UI')),
  'retro-cyberdeck-dos-92': lazy(() => import('./RetroCyberdeckDosUI')),
  'retro-flipclock-hi-fi-77': lazy(() => import('./RetroFlipClock77UI')),
  'retro-oscilloscope-tektronix-74': lazy(() => import('./RetroOscilloscope74UI')),
  'retro-pager-beeper-95': lazy(() => import('./RetroPagerBeeper95UI')),

  // 17 Modern Creative UIs (9 original + 8 brand new)
  'modern-simpmusic-flow': lazy(() => import('./ModernSimpMusicUI')),
  'modern-editorial-broadsheet': lazy(() => import('./ModernEditorialUI')),
  'modern-bento-studio': lazy(() => import('./ModernBentoStudioUI')),
  'modern-spatial-vinyl-shelf': lazy(() => import('./ModernCoverFlowUI')),
  'modern-brutalist-zine': lazy(() => import('./ModernBrutalistZineUI')),
  'modern-karaoke-stage': lazy(() => import('./ModernKaraokeStageUI')),
  'modern-car-hud': lazy(() => import('./ModernCarHudUI')),
  'modern-zen-minimal': lazy(() => import('./ModernZenMinimalUI')),
  'modern-cyber-sampler': lazy(() => import('./ModernCyberSamplerUI')),
  'modern-vinyl-liner': lazy(() => import('./ModernVinylLinerUI')),
  'modern-spatial-glass': lazy(() => import('./ModernSpatialGlassUI')),
  'modern-waveform-timeline': lazy(() => import('./ModernWaveformTimelineUI')),
  'modern-fm-console': lazy(() => import('./ModernFmConsoleUI')),
  'modern-kinetic-poster': lazy(() => import('./ModernKineticPosterUI')),
  'modern-ambient-cinema': lazy(() => import('./ModernAmbientCinemaUI')),
  'modern-tactile-sculpted': lazy(() => import('./ModernTactileSculptedUI')),
  'modern-nordic-catalog': lazy(() => import('./ModernNordicCatalogUI')),
};
