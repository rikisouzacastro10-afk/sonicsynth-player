export type UIId =
  // 8 iPod Click Wheel OS UIs (6 classic/custom + 2 kawaii iPod)
  | 'ipod-classic'
  | 'ipod-nano-chroma'
  | 'ipod-mini-eink'
  | 'ipod-transparent-atomic'
  | 'ipod-cyber-u2-stealth'
  | 'ipod-gold-atelier'
  | 'ipod-kawaii-strawberry'
  | 'ipod-kawaii-cloud-dream'
  // 20 Retro Animated UIs (8 classic/studio + 2 kawaii + 10 hyper-detailed retro devices)
  | 'retro-walkman-cassette'
  | 'retro-winamp-rack'
  | 'retro-vinyl-turntable'
  | 'retro-vfd-crt'
  | 'retro-boombox-ghettoblaster'
  | 'retro-minidisc-y2k'
  | 'retro-arcade-jukebox'
  | 'retro-reel-to-reel'
  | 'retro-kawaii-tamagotchi'
  | 'retro-kawaii-bento-radio'
  | 'retro-tps-l2-1979'
  | 'retro-winamp-classic-291'
  | 'retro-minidisc-mz-r50'
  | 'retro-tv-crt-trinitron-vhs'
  | 'retro-dualscreen-3ds-sp'
  | 'retro-synth-op1-studio'
  | 'retro-cyberdeck-dos-92'
  | 'retro-flipclock-hi-fi-77'
  | 'retro-oscilloscope-tektronix-74'
  | 'retro-pager-beeper-95'
  // 17 Modern Creative UIs (9 existing + 8 brand new)
  | 'modern-simpmusic-flow'
  | 'modern-editorial-broadsheet'
  | 'modern-bento-studio'
  | 'modern-spatial-vinyl-shelf'
  | 'modern-brutalist-zine'
  | 'modern-karaoke-stage'
  | 'modern-car-hud'
  | 'modern-zen-minimal'
  | 'modern-cyber-sampler'
  | 'modern-vinyl-liner'
  | 'modern-spatial-glass'
  | 'modern-waveform-timeline'
  | 'modern-fm-console'
  | 'modern-kinetic-poster'
  | 'modern-ambient-cinema'
  | 'modern-tactile-sculpted'
  | 'modern-nordic-catalog';

export type UICategory = 'ipod' | 'retro' | 'modern';
export type ThemeMode = 'dark' | 'light';

export interface UIThemeMeta {
  id: UIId;
  name: string;
  category: UICategory;
  isKawaii?: boolean;
  tagline: string;
  layoutStyle: string;
  accentHex: string;
  bgHex: string;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface SponsorSegment {
  UUID: string;
  segment: [number, number]; // [start, end] in seconds
  category: string;
  actionType?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  artwork: string;
  source: 'yt-music' | 'youtube-v3' | 'offline';
  streamUrl?: string;
  lyricsLrc?: string;
  sponsorSegments?: SponsorSegment[];
  genre?: string;
  views?: number;
  verified?: boolean;
  channelTitle?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
  createdAt: number;
  isAiGenerated?: boolean;
  coverArt?: string;
}

export type DownloadStatus = 'queued' | 'downloading' | 'downloaded' | 'paused_offline' | 'error';

export interface DownloadTask {
  trackId: string;
  track: Track;
  status: DownloadStatus;
  progress: number; // 0 to 100
  sizeBytes?: number;
  error?: string;
}

export interface OfflineTrackRecord {
  id: string;
  track: Track;
  sizeBytes: number;
  downloadedAt: number;
  lyricsLrc?: string;
  hasNativeFile?: boolean;
}

export type AppSection = 'home' | 'search' | 'library' | 'ai' | 'settings';

export type RepeatMode = 'off' | 'all' | 'one';

export interface HistoryEntry {
  track: Track;
  playedAt: number;
  playCount: number;
}

export interface ArtistSummary {
  name: string;
  artwork: string;
  playCount: number;
  tracks: Track[];
}

export const UI_CATALOG: UIThemeMeta[] = [
  // 8 iPod Click Wheel OS UIs
  {
    id: 'ipod-classic',
    name: 'iPod Classic OS',
    category: 'ipod',
    tagline: 'Split-screen LCD + roda tátil metálica',
    layoutStyle: 'Chassis 6ª Geração com Cover Preview e controle de volume na roda',
    accentHex: '#2563EB',
    bgHex: '#E5E7EB',
  },
  {
    id: 'ipod-nano-chroma',
    name: 'Nano Chromatic OS',
    category: 'ipod',
    tagline: 'Alumínio anodizado vertical & OLED vívido',
    layoutStyle: 'Corpo esguio com visualizador OLED ao vivo e Click Wheel compacta',
    accentHex: '#F97316',
    bgHex: '#18181B',
  },
  {
    id: 'ipod-mini-eink',
    name: 'E-Ink PaperPod',
    category: 'ipod',
    tagline: 'Tela E-Ink fosca de alto contraste editorial',
    layoutStyle: 'Papel digital monocromático serifado com roda mecânica',
    accentHex: '#111827',
    bgHex: '#EAE7DF',
  },
  {
    id: 'ipod-transparent-atomic',
    name: 'Atomic Clear Pod',
    category: 'ipod',
    tagline: 'Policarbonato translúcido 2000s & LED âmbar',
    layoutStyle: 'Chassi transparente com PCB visível e LCD âmbar retroiluminado',
    accentHex: '#F59E0B',
    bgHex: '#141A24',
  },
  {
    id: 'ipod-cyber-u2-stealth',
    name: 'Stealth Carbon iPod',
    category: 'ipod',
    tagline: 'Fibra de carbono fosca e Click Wheel carmesim',
    layoutStyle: 'Edição especial escura com HUD tático, espectro e modo volume na roda',
    accentHex: '#DC2626',
    bgHex: '#0A0A0D',
  },
  {
    id: 'ipod-gold-atelier',
    name: 'Atelier Brass iPod',
    category: 'ipod',
    tagline: 'Latão escovado 24K, nogueira e OS editorial',
    layoutStyle: 'Chassi dourado com moldura em madeira e roda gravada de precisão',
    accentHex: '#D97706',
    bgHex: '#241B14',
  },
  {
    id: 'ipod-kawaii-strawberry',
    name: 'Ichigo Milk Pod',
    category: 'ipod',
    isKawaii: true,
    tagline: 'iPod rosa morango com orelhinhas & estrelas',
    layoutStyle: 'Chassi pastel doce, mascotinho na barra e Click Wheel de marshmallow',
    accentHex: '#EC4899',
    bgHex: '#FCE7F3',
  },
  {
    id: 'ipod-kawaii-cloud-dream',
    name: 'Cloud Dream Pod',
    category: 'ipod',
    isKawaii: true,
    tagline: 'Céu pastel com nuvens flutuantes e lua',
    layoutStyle: 'iPod azul bebê com animação de nuvens fofinhas e botão estrela',
    accentHex: '#38BDF8',
    bgHex: '#E0F2FE',
  },

  // 10 Retro Animated UIs
  {
    id: 'retro-walkman-cassette',
    name: 'Walkman Cassette Deck',
    category: 'retro',
    tagline: 'Fita K7 giratória, VU e teclas mecânicas',
    layoutStyle: 'Janela de cassete transparente com carretéis e medidor analógico',
    accentHex: '#EA580C',
    bgHex: '#1F2937',
  },
  {
    id: 'retro-winamp-rack',
    name: 'Hi-Fi Winamp Rack',
    category: 'retro',
    tagline: 'Rack modular 90s com analisador de espectro',
    layoutStyle: 'Módulos empilhados de deck, equalizador animado e playlist dock',
    accentHex: '#22C55E',
    bgHex: '#181C24',
  },
  {
    id: 'retro-vinyl-turntable',
    name: 'Toca-Discos Hi-Fi',
    category: 'retro',
    tagline: 'Vinil em rotação com braço e estrobo',
    layoutStyle: 'Prato estroboscópico em nogueira com agulha articulada sobre o LP',
    accentHex: '#D97706',
    bgHex: '#1C1612',
  },
  {
    id: 'retro-vfd-crt',
    name: 'Terminal VFD / CRT 80s',
    category: 'retro',
    tagline: 'Display fluorescente a vácuo com scanlines',
    layoutStyle: 'Grade CRT fosforescente ciano-esmeralda com barras VFD fluidas',
    accentHex: '#10B981',
    bgHex: '#050B0A',
  },
  {
    id: 'retro-boombox-ghettoblaster',
    name: 'Street Boombox 84',
    category: 'retro',
    tagline: 'Alto-falantes pulsantes e chaves cromadas',
    layoutStyle: 'Boombox estéreo com cones animados, VU dual e alça metálica',
    accentHex: '#EF4444',
    bgHex: '#1E1B18',
  },
  {
    id: 'retro-minidisc-y2k',
    name: 'NetMD Y2K Deck',
    category: 'retro',
    tagline: 'Estética metálica 2001 com disco ótico',
    layoutStyle: 'Leitor MiniDisc azul cobalto com janela giratória e letreiro dot-matrix',
    accentHex: '#38BDF8',
    bgHex: '#0F172A',
  },
  {
    id: 'retro-arcade-jukebox',
    name: 'Diner Jukebox 58',
    category: 'retro',
    tagline: 'Tubos neon animados, cromo e seletor vinil',
    layoutStyle: 'Jukebox americana clássica com arcos pulsantes e teclas de seleção',
    accentHex: '#F43F5E',
    bgHex: '#1E1018',
  },
  {
    id: 'retro-reel-to-reel',
    name: 'Studio Reel-to-Reel',
    category: 'retro',
    tagline: 'Gravador de rolo 10.5" com ponteiros VU',
    layoutStyle: 'Bobinas metálicas gigantes em rotação e medidores analógicos duplos',
    accentHex: '#F59E0B',
    bgHex: '#1A1817',
  },
  {
    id: 'retro-kawaii-tamagotchi',
    name: 'Tamagotchi Pocket',
    category: 'retro',
    isKawaii: true,
    tagline: 'Console pixel fofinho com bichinho dançando',
    layoutStyle: 'Game-pocket morango pastel com pet animado reagindo à música',
    accentHex: '#F472B6',
    bgHex: '#FFD6E0',
  },
  {
    id: 'retro-kawaii-bento-radio',
    name: 'Matcha Cozy Radio',
    category: 'retro',
    isKawaii: true,
    tagline: 'Rádio retrô matcha & creme com pingente fofo',
    layoutStyle: 'Cassete cottagecore com carretéis de laço e notas flutuantes',
    accentHex: '#65A30D',
    bgHex: '#EFEAD8',
  },
  // +10 Hyper-Detailed Retro Devices
  {
    id: 'retro-tps-l2-1979',
    name: 'Walkman TPS-L2 (1979)',
    category: 'retro',
    tagline: 'Clássico azul metálico 1979, botão Hotline laranja e K7',
    layoutStyle: 'Alumínio escovado, parafusos expostos, LED BATT vermelho e fita girando',
    accentHex: '#F97316',
    bgHex: '#1D4E89',
  },
  {
    id: 'retro-winamp-classic-291',
    name: 'Winamp Classic 2.91',
    category: 'retro',
    tagline: 'Janelas chanfradas 1998, letreiro verde-limão e barras Z-X-C-V-B',
    layoutStyle: 'Deck modular pixelado, analisador de espectro verde e playlist editor',
    accentHex: '#84CC16',
    bgHex: '#1C1E26',
  },
  {
    id: 'retro-minidisc-mz-r50',
    name: 'MiniDisc MZ-R50 (90s)',
    category: 'retro',
    tagline: 'Corpo magnésio 1997, cartucho lateral e Jog Dial serrilhado',
    layoutStyle: 'Slot ótico translúcido, LCD dot-matrix azul/âmbar e disco giratório',
    accentHex: '#F59E0B',
    bgHex: '#1E293B',
  },
  {
    id: 'retro-tv-crt-trinitron-vhs',
    name: 'TV CRT Trinitron & VHS',
    category: 'retro',
    tagline: 'Tubo curvo com scanlines, OSD verde PLAY ▶ e dial rotativo',
    layoutStyle: 'Gabinete madeira/grafite anos 80/90, contador de fita VHS e knobs',
    accentHex: '#22C55E',
    bgHex: '#1F1B18',
  },
  {
    id: 'retro-dualscreen-3ds-sp',
    name: 'Dual-Screen Retro 3DS',
    category: 'retro',
    tagline: 'Concha articulada com tela dupla, D-Pad e menu HOME tátil',
    layoutStyle: 'Tela superior widescreen com capa/letras e inferior com grade + botões ABXY',
    accentHex: '#EF4444',
    bgHex: '#1E1B2E',
  },
  {
    id: 'retro-synth-op1-studio',
    name: 'Sintetizador OP-1 Studio',
    category: 'retro',
    tagline: 'Alumínio fosco, 4 encoders coloridos e tela OLED vetorial',
    layoutStyle: 'Knobs azul/verde/laranja/branco animados, forma de onda OLED e teclado chiclet',
    accentHex: '#FB923C',
    bgHex: '#E5E7EB',
  },
  {
    id: 'retro-cyberdeck-dos-92',
    name: 'Cyberdeck Tracker DOS-92',
    category: 'retro',
    tagline: 'Tracker MS-DOS 1992 em fósforo âmbar e drive de disquete 3.5"',
    layoutStyle: 'Padrões HEX rolando no beat, LED do drive piscando e teclas mecânicas',
    accentHex: '#F59E0B',
    bgHex: '#14110B',
  },
  {
    id: 'retro-flipclock-hi-fi-77',
    name: 'Flip Clock Hi-Fi 77',
    category: 'retro',
    tagline: 'Relógio flip mecânico 1977, escala cálida e botões de baquelite',
    layoutStyle: 'Cartões numéricos split-flap, janela âmbar iluminada e ajuste analógico',
    accentHex: '#EA580C',
    bgHex: '#241913',
  },
  {
    id: 'retro-oscilloscope-tektronix-74',
    name: 'Osciloscópio Lab CRT 74',
    category: 'retro',
    tagline: 'Grade vetorial de laboratório com feixe Lissajous e atenuação',
    layoutStyle: 'Tubo fosforescente azul-esverdeado, dials de ganho e chaves metálicas',
    accentHex: '#2DD4BF',
    bgHex: '#0B1618',
  },
  {
    id: 'retro-pager-beeper-95',
    name: 'Pager & Matrix Pocket 95',
    category: 'retro',
    tagline: 'Beeper translúcido fumê anos 90 com LCD verde-oliva retroiluminado',
    layoutStyle: 'Matriz de pixels nítida, clipe lateral, alertas LED e botões emborrachados',
    accentHex: '#A3E635',
    bgHex: '#181C18',
  },

  // 17 Modern Creative UIs (9 original + 8 brand new)
  {
    id: 'modern-simpmusic-flow',
    name: 'SimpMusic Velvet',
    category: 'modern',
    tagline: 'Streaming fluido com atmosfera dinâmica',
    layoutStyle: 'Navegação limpa, capa imersiva, trending real e painel lateral',
    accentHex: '#6366F1',
    bgHex: '#0B0D14',
  },
  {
    id: 'modern-editorial-broadsheet',
    name: 'Editorial Broadsheet',
    category: 'modern',
    tagline: 'Jornal musical suíço com tipografia Fraunces',
    layoutStyle: 'Colunas assimétricas, filetes 1px e índice editorial numerado',
    accentHex: '#B91C1C',
    bgHex: '#F9F7F2',
  },
  {
    id: 'modern-bento-studio',
    name: 'Bento Modular Studio',
    category: 'modern',
    tagline: 'Mosaico responsivo de módulos independentes',
    layoutStyle: 'Grid Bento com blocos dedicados para capa, letras, espectro e fila',
    accentHex: '#0EA5E9',
    bgHex: '#0F1115',
  },
  {
    id: 'modern-spatial-vinyl-shelf',
    name: 'Cover Flow 3D Shelf',
    category: 'modern',
    tagline: 'Estante em perspectiva CSS 3D interativa',
    layoutStyle: 'Carrossel espacial com rotação 3D GPU e palco inferior fixo',
    accentHex: '#F43F5E',
    bgHex: '#121016',
  },
  {
    id: 'modern-brutalist-zine',
    name: 'Neo-Brutalist Zine',
    category: 'modern',
    tagline: 'Contraste extremo, bordas secas e blocos sólidos',
    layoutStyle: 'Cartaz tipográfico com cantos retos, grade dura e botões gigantes',
    accentHex: '#FF4D00',
    bgHex: '#F3EFE6',
  },
  {
    id: 'modern-karaoke-stage',
    name: 'Palco Karaokê Live',
    category: 'modern',
    tagline: 'Letras sincronizadas em destaque máximo',
    layoutStyle: 'Tela de letras ocupando 70% do foco com barra compacta inferior',
    accentHex: '#14B8A6',
    bgHex: '#091114',
  },
  {
    id: 'modern-car-hud',
    name: 'Modo Direção HUD',
    category: 'modern',
    tagline: 'Alvos gigantes ≥64px para uso no carro',
    layoutStyle: 'Painel dividido horizontal de alto contraste e leitura instantânea',
    accentHex: '#3B82F6',
    bgHex: '#07090D',
  },
  {
    id: 'modern-zen-minimal',
    name: 'Braun / Rams Minimal',
    category: 'modern',
    tagline: 'Silêncio visual, alabastro e laranja sinal',
    layoutStyle: 'Inspiração industrial alemã com mostrador circular e respiro generoso',
    accentHex: '#E85D04',
    bgHex: '#F4F3EF',
  },
  {
    id: 'modern-cyber-sampler',
    name: 'OP-Sampler Grid',
    category: 'modern',
    tagline: 'Hardware tátil com teclas de sampler',
    layoutStyle: 'Grade pontilhada com teclas coloridas e sequenciador',
    accentHex: '#FB7185',
    bgHex: '#E4E4E7',
  },
  // +8 Brand-New Modern Creative UIs
  {
    id: 'modern-vinyl-liner',
    name: 'Album Liner Gallery',
    category: 'modern',
    tagline: 'Encarte de galeria com disco espiando a capa',
    layoutStyle: 'Folha dupla de catálogo de selo fonográfico e ficha técnica do álbum',
    accentHex: '#7C3AED',
    bgHex: '#FAF8F5',
  },
  {
    id: 'modern-spatial-glass',
    name: 'Spatial Horizon OS',
    category: 'modern',
    tagline: 'Camadas espaciais translúcidas e doca flutuante',
    layoutStyle: 'Palco aerodinâmico em suspensão com controles inferiores em doca',
    accentHex: '#06B6D4',
    bgHex: '#0B1220',
  },
  {
    id: 'modern-waveform-timeline',
    name: 'DAW Waveform Studio',
    category: 'modern',
    tagline: 'Linha do tempo multipista com barras de batida',
    layoutStyle: 'Mesa horizontal de masterização com régua temporal e fila lateral',
    accentHex: '#10B981',
    bgHex: '#101414',
  },
  {
    id: 'modern-fm-console',
    name: 'Arquitetura FM Console',
    category: 'modern',
    tagline: 'Sintonizador de precisão com régua de frequência',
    layoutStyle: 'Console de rádio contemporâneo com dial horizontal animado',
    accentHex: '#EA580C',
    bgHex: '#F2EFEA',
  },
  {
    id: 'modern-kinetic-poster',
    name: 'Swiss Kinetic Poster',
    category: 'modern',
    tagline: 'Cartaz suíço com eixo inclinado e blocos vivos',
    layoutStyle: 'Composição assimétrica em ângulo com tipografia monumental',
    accentHex: '#E11D48',
    bgHex: '#F5F5F4',
  },
  {
    id: 'modern-ambient-cinema',
    name: 'Cinema Letterbox 21:9',
    category: 'modern',
    tagline: 'Projeção panorâmica com legendas sincronizadas',
    layoutStyle: 'Faixas widescreen cinematográficas e rolo horizontal de faixas',
    accentHex: '#F59E0B',
    bgHex: '#09090B',
  },
  {
    id: 'modern-tactile-sculpted',
    name: 'Alabaster Sculpt Deck',
    category: 'modern',
    tagline: 'Superfícies esculpidas com anel tátil contínuo',
    layoutStyle: 'Hardware minimalista suave com mostrador circular centralizado',
    accentHex: '#4F46E5',
    bgHex: '#EBEEF5',
  },
  {
    id: 'modern-nordic-catalog',
    name: 'Nordic Archive Index',
    category: 'modern',
    tagline: 'Tabela arquitetônica escandinava e vitrine limpa',
    layoutStyle: 'Coluna tabular de acervo à esquerda e obra em destaque à direita',
    accentHex: '#0F766E',
    bgHex: '#F7F8F7',
  },
];
