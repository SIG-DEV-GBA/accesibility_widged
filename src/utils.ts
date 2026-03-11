import type { A11yState, A11yColors, A11yLabels, A11yLanguage, A11yFeature } from './types';

/* ── Defaults ── */

export const DEFAULT_COLORS: A11yColors = {
  primary: '#A10D5E',
  accent: '#F29429',
};

export const DEFAULT_LABELS: A11yLabels = {
  title: 'Accesibilidad',
  activeCount: (n) => `${n} ajuste${n > 1 ? 's' : ''} activo${n > 1 ? 's' : ''}`,
  reset: 'Restablecer',
  close: 'Cerrar',
  fontSize: 'Texto',
  contrast: 'Alto contraste',
  bigCursor: 'Cursor grande',
  textSpacing: 'Espaciado',
  dyslexiaFont: 'Fuente legible',
  highlightLinks: 'Resaltar enlaces',
  ttsSection: 'Lector de voz',
  ttsActive: 'Activo',
  ttsReading: 'Leyendo...',
  ttsOff: 'Desactivado',
  ttsHint: 'Pulsa en cualquier texto',
  ttsHintOff: 'Haz click para activar',
  ttsStop: 'Detener lectura',
  ttsSpeed: 'Velocidad',
  langSection: 'Idioma',
  footer: 'Preferencias guardadas en tu navegador',
  trigger: 'Opciones de accesibilidad',
  reduceText: 'Reducir texto',
  increaseText: 'Aumentar texto',
};

export const ALL_FEATURES: A11yFeature[] = [
  'fontSize', 'contrast', 'bigCursor', 'textSpacing',
  'dyslexiaFont', 'highlightLinks', 'tts', 'languages',
];

export const DEFAULT_LANGUAGES: A11yLanguage[] = [
  { code: 'es', label: 'Español', flag: '/flags/es.svg' },
  { code: 'en', label: 'English', flag: '/flags/gb.svg' },
  { code: 'gl', label: 'Galego', flag: '/flags/es-ga.svg' },
  { code: 'ca', label: 'Català', flag: '/flags/es-ct.svg' },
  { code: 'eu', label: 'Euskara', flag: '/flags/es-pv.svg' },
];

export const TTS_SPEEDS = [
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
];

export const A11Y_DEFAULTS: A11yState = {
  fontSize: 0,
  contrast: false,
  bigCursor: false,
  textSpacing: false,
  dyslexiaFont: false,
  highlightLinks: false,
};

export const TTS_SELECTORS = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, figcaption, label, .wp-content > *';
export const TTS_IGNORE = 'nav, footer, header, script, style, [aria-hidden="true"], .fixed';

/* ── Color utils ── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface DerivedColors {
  primary: string;
  primaryDark: string;
  primaryDarker: string;
  primaryLight: string;
  accent: string;
  primaryRgb: string;
  accentRgb: string;
}

export function deriveColors(colors: A11yColors): DerivedColors {
  const [pr, pg, pb] = hexToRgb(colors.primary);
  const [ar, ag, ab] = hexToRgb(colors.accent);
  const [h, s, l] = rgbToHsl(pr, pg, pb);

  return {
    primary: colors.primary,
    primaryDark: hslToHex(h, s, Math.max(0, l - 12)),
    primaryDarker: hslToHex(h, s, Math.max(0, l - 25)),
    primaryLight: hslToHex(h, s, Math.min(100, l + 15)),
    accent: colors.accent,
    primaryRgb: `${pr}, ${pg}, ${pb}`,
    accentRgb: `${ar}, ${ag}, ${ab}`,
  };
}

/* ── DOM utils ── */

export function apply(s: A11yState): void {
  const r = document.documentElement;
  const base = 100 + s.fontSize * 15;
  r.style.fontSize = base === 100 ? '' : `${base}%`;
  r.classList.toggle('a11y-contrast', s.contrast);
  r.classList.toggle('a11y-big-cursor', s.bigCursor);
  r.classList.toggle('a11y-spacing', s.textSpacing);
  r.classList.toggle('a11y-dyslexia', s.dyslexiaFont);
  r.classList.toggle('a11y-highlight-links', s.highlightLinks);
}

export function switchLanguage(code: string): void {
  if (code === 'es') {
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'googtrans=; path=/; domain=.' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  } else {
    document.cookie = `googtrans=/es/${code}; path=/`;
    document.cookie = `googtrans=/es/${code}; path=/; domain=.${window.location.hostname}`;
  }
  window.location.reload();
}

export function isReadable(el: Element): boolean {
  if (el.closest(TTS_IGNORE)) return false;
  const text = el.textContent?.trim();
  return !!text && text.length > 2;
}

export function getVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.split('-')[0];
  return (
    voices.find(v => v.lang.startsWith(prefix) && v.localService) ||
    voices.find(v => v.lang.startsWith(prefix)) ||
    null
  );
}
