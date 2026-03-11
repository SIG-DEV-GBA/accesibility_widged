export type A11yFeature =
  | 'fontSize'
  | 'contrast'
  | 'bigCursor'
  | 'textSpacing'
  | 'dyslexiaFont'
  | 'highlightLinks'
  | 'tts'
  | 'languages';

export interface A11yColors {
  primary: string;
  accent: string;
}

export interface A11yLanguage {
  code: string;
  label: string;
  flag: string;
}

export interface A11yLabels {
  title: string;
  activeCount: (n: number) => string;
  reset: string;
  close: string;
  fontSize: string;
  contrast: string;
  bigCursor: string;
  textSpacing: string;
  dyslexiaFont: string;
  highlightLinks: string;
  ttsSection: string;
  ttsActive: string;
  ttsReading: string;
  ttsOff: string;
  ttsHint: string;
  ttsHintOff: string;
  ttsStop: string;
  ttsSpeed: string;
  langSection: string;
  footer: string;
  trigger: string;
  reduceText: string;
  increaseText: string;
}

export interface A11yState {
  fontSize: number;
  contrast: boolean;
  bigCursor: boolean;
  textSpacing: boolean;
  dyslexiaFont: boolean;
  highlightLinks: boolean;
}

export interface A11yWidgetProps {
  colors?: Partial<A11yColors>;
  position?: 'bottom-left' | 'bottom-right';
  features?: A11yFeature[];
  languages?: A11yLanguage[];
  ttsLang?: string;
  labels?: Partial<A11yLabels>;
  storageKey?: string;
  zIndex?: number;
}
