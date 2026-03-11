import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Accessibility, X, Plus, Minus, Type, Contrast, MousePointer,
  Space, RotateCcw, Eye, Sparkles, Globe, Check, Volume2, Square,
} from 'lucide-react';
import type { A11yWidgetProps, A11yState, A11yFeature } from './types';
import {
  DEFAULT_COLORS, DEFAULT_LABELS, ALL_FEATURES, DEFAULT_LANGUAGES,
  TTS_SPEEDS, A11Y_DEFAULTS, TTS_SELECTORS, TTS_IGNORE,
  apply, switchLanguage, isReadable, getVoice, deriveColors,
} from './utils';
// @ts-ignore — tsup loads .css as text string
import cssText from './styles.css';

const STYLE_ID = 'fpvsi-a11y-styles';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = cssText;
  document.head.appendChild(style);
}

export function AccessibilityWidget({
  colors: colorsProp,
  position = 'bottom-left',
  features = ALL_FEATURES,
  languages = DEFAULT_LANGUAGES,
  ttsLang = 'es-ES',
  labels: labelsProp,
  storageKey = 'a11y-prefs',
  zIndex = 9998,
}: A11yWidgetProps) {
  const colors = { ...DEFAULT_COLORS, ...colorsProp };
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const derived = deriveColors(colors);
  const hasFeature = (f: A11yFeature) => features.includes(f);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(A11Y_DEFAULTS);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('es');
  const [ttsActive, setTtsActive] = useState(false);
  const [ttsReading, setTtsReading] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [ttsSupported, setTtsSupported] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const readingElRef = useRef<Element | null>(null);
  const hoveredElRef = useRef<Element | null>(null);

  /* ── Inject CSS + set CSS vars ── */
  useEffect(() => {
    injectStyles();
    const r = document.documentElement;
    r.style.setProperty('--a11y-primary', derived.primary);
    r.style.setProperty('--a11y-primary-dark', derived.primaryDark);
    r.style.setProperty('--a11y-primary-darker', derived.primaryDarker);
    r.style.setProperty('--a11y-primary-light', derived.primaryLight);
    r.style.setProperty('--a11y-accent', derived.accent);
    r.style.setProperty('--a11y-primary-rgb', derived.primaryRgb);
    r.style.setProperty('--a11y-accent-rgb', derived.accentRgb);
  }, [derived.primary, derived.primaryDark, derived.primaryDarker, derived.primaryLight, derived.accent, derived.primaryRgb, derived.accentRgb]);

  /* ── Load saved state ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
        apply(parsed);
      }
    } catch { /* ignored */ }
    const match = document.cookie.match(/googtrans=\/es\/(\w+)/);
    if (match?.[1]) setLang(match[1]);
    setTtsSupported('speechSynthesis' in window);
    setMounted(true);
  }, [storageKey]);

  /* ── Persist + apply ── */
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
    apply(state);
  }, [state, mounted, storageKey]);

  /* ── Outside click / Esc ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  /* ── TTS helpers ── */
  const clearReadingHighlight = useCallback(() => {
    if (readingElRef.current) {
      readingElRef.current.classList.remove('a11y-tts-reading');
      readingElRef.current = null;
    }
  }, []);

  const clearHoverHighlight = useCallback(() => {
    if (hoveredElRef.current) {
      hoveredElRef.current.classList.remove('a11y-tts-hover');
      hoveredElRef.current = null;
    }
  }, []);

  const speakElement = useCallback((el: Element) => {
    const synth = window.speechSynthesis;
    const text = el.textContent?.trim();
    if (!text) return;

    synth.cancel();
    clearReadingHighlight();

    el.classList.add('a11y-tts-reading');
    readingElRef.current = el;
    setTtsReading(true);

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = ttsLang;
    utter.rate = ttsSpeed;
    const voice = getVoice(ttsLang);
    if (voice) utter.voice = voice;

    utter.onend = () => {
      el.classList.remove('a11y-tts-reading');
      readingElRef.current = null;
      setTtsReading(false);
    };
    utter.onerror = () => {
      el.classList.remove('a11y-tts-reading');
      readingElRef.current = null;
      setTtsReading(false);
    };

    synth.speak(utter);
  }, [ttsSpeed, ttsLang, clearReadingHighlight]);

  /* ── TTS mode listeners ── */
  useEffect(() => {
    if (!ttsActive || !ttsSupported) return;
    document.documentElement.classList.add('a11y-tts-mode');

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.(TTS_SELECTORS);
      if (!target || !isReadable(target) || target === hoveredElRef.current) return;
      clearHoverHighlight();
      target.classList.add('a11y-tts-hover');
      hoveredElRef.current = target;
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.(TTS_SELECTORS);
      if (target && target === hoveredElRef.current) {
        clearHoverHighlight();
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.(TTS_SELECTORS);
      if (!target || !isReadable(target)) return;
      if (target.closest('.fixed')) return;
      e.preventDefault();
      e.stopPropagation();
      speakElement(target);
    };

    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('mouseout', onMouseOut, true);
      document.removeEventListener('click', onClick, true);
      document.documentElement.classList.remove('a11y-tts-mode');
      clearHoverHighlight();
      clearReadingHighlight();
      window.speechSynthesis.cancel();
      setTtsReading(false);
    };
  }, [ttsActive, ttsSupported, speakElement, clearHoverHighlight, clearReadingHighlight]);

  const toggleTts = useCallback(() => {
    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsReading(false);
    }
    setTtsActive(p => !p);
  }, [ttsActive]);

  const ttsStop = useCallback(() => {
    window.speechSynthesis.cancel();
    clearReadingHighlight();
    setTtsReading(false);
  }, [clearReadingHighlight]);

  const changeFontSize = useCallback((d: number) => {
    setState(p => ({ ...p, fontSize: Math.max(-2, Math.min(4, p.fontSize + d)) }));
  }, []);

  const toggle = useCallback((k: keyof Omit<A11yState, 'fontSize'>) => {
    setState(p => ({ ...p, [k]: !p[k] }));
  }, []);

  const reset = useCallback(() => setState(A11Y_DEFAULTS), []);

  const dirty = JSON.stringify(state) !== JSON.stringify(A11Y_DEFAULTS);
  const activeCount = [state.contrast, state.bigCursor, state.textSpacing, state.dyslexiaFont, state.highlightLinks].filter(Boolean).length + (state.fontSize !== 0 ? 1 : 0);

  const opts: { key: keyof Omit<A11yState, 'fontSize'>; icon: typeof Contrast; label: string }[] = [];
  if (hasFeature('contrast')) opts.push({ key: 'contrast', icon: Contrast, label: labels.contrast });
  if (hasFeature('bigCursor')) opts.push({ key: 'bigCursor', icon: MousePointer, label: labels.bigCursor });
  if (hasFeature('textSpacing')) opts.push({ key: 'textSpacing', icon: Space, label: labels.textSpacing });
  if (hasFeature('dyslexiaFont')) opts.push({ key: 'dyslexiaFont', icon: Sparkles, label: labels.dyslexiaFont });
  if (hasFeature('highlightLinks')) opts.push({ key: 'highlightLinks', icon: Eye, label: labels.highlightLinks });

  if (!mounted) return null;

  const posClass = position === 'bottom-right' ? 'fpvsi-a11y--bottom-right' : 'fpvsi-a11y--bottom-left';

  return (
    <div ref={ref} className={`fpvsi-a11y ${posClass}`} style={{ zIndex }}>
      {/* Panel */}
      <div className={`fpvsi-a11y__panel-wrap ${open ? 'fpvsi-a11y__panel-wrap--open' : 'fpvsi-a11y__panel-wrap--closed'}`}>
        <div className="fpvsi-a11y__panel">
          {/* Header */}
          <div className="fpvsi-a11y__header">
            <div className="fpvsi-a11y__header-glow" />
            <div className="fpvsi-a11y__header-content">
              <div className="fpvsi-a11y__header-left">
                <div className="fpvsi-a11y__header-icon">
                  <Accessibility />
                </div>
                <div>
                  <span className="fpvsi-a11y__header-title">{labels.title}</span>
                  {activeCount > 0 && (
                    <p className="fpvsi-a11y__header-subtitle">{labels.activeCount(activeCount)}</p>
                  )}
                </div>
              </div>
              <div className="fpvsi-a11y__header-actions">
                {dirty && (
                  <button onClick={reset} className="fpvsi-a11y__header-btn fpvsi-a11y__header-btn--reset" aria-label={labels.reset}>
                    <RotateCcw />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="fpvsi-a11y__header-btn" aria-label={labels.close}>
                  <X />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="fpvsi-a11y__body">
            {/* Font size */}
            {hasFeature('fontSize') && (
              <div
                className={`fpvsi-a11y__row ${state.fontSize !== 0 ? 'fpvsi-a11y__row--active' : 'fpvsi-a11y__row--inactive'}`}
                style={{ animation: open ? 'a11ySlideIn 0.4s ease-out 50ms both' : 'none' }}
              >
                <div className="fpvsi-a11y__row-left">
                  <div className="fpvsi-a11y__row-icon"><Type /></div>
                  <span className="fpvsi-a11y__row-label">{labels.fontSize}</span>
                </div>
                <div className="fpvsi-a11y__fontsize-controls">
                  <button onClick={() => changeFontSize(-1)} disabled={state.fontSize <= -2} className="fpvsi-a11y__fontsize-btn" aria-label={labels.reduceText}>
                    <Minus />
                  </button>
                  <span className="fpvsi-a11y__fontsize-value">
                    {state.fontSize > 0 ? `+${state.fontSize}` : state.fontSize}
                  </span>
                  <button onClick={() => changeFontSize(1)} disabled={state.fontSize >= 4} className="fpvsi-a11y__fontsize-btn" aria-label={labels.increaseText}>
                    <Plus />
                  </button>
                </div>
              </div>
            )}

            {/* Toggle options */}
            {opts.map(({ key, icon: Icon, label }, i) => {
              const active = state[key];
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={`fpvsi-a11y__row ${active ? 'fpvsi-a11y__row--active' : 'fpvsi-a11y__row--inactive'}`}
                  style={{ animation: open ? `a11ySlideIn 0.4s ease-out ${(i + 1) * 50 + 50}ms both` : 'none' }}
                  aria-pressed={active}
                  aria-label={label}
                >
                  <div className="fpvsi-a11y__row-left">
                    <div className="fpvsi-a11y__row-icon"><Icon /></div>
                    <span className="fpvsi-a11y__row-label">{label}</span>
                  </div>
                  <div className={`fpvsi-a11y__switch ${active ? 'fpvsi-a11y__switch--on' : 'fpvsi-a11y__switch--off'}`}>
                    <div className="fpvsi-a11y__switch-knob" />
                  </div>
                </button>
              );
            })}

            {/* TTS */}
            {hasFeature('tts') && ttsSupported && (
              <div style={{ paddingTop: 6, animation: open ? 'a11ySlideIn 0.4s ease-out 380ms both' : 'none' }}>
                <div className="fpvsi-a11y__section-header fpvsi-a11y__section-header--tts">
                  <Volume2 />
                  <span className="fpvsi-a11y__section-label">{labels.ttsSection}</span>
                </div>
                <div className={`fpvsi-a11y__tts-block ${ttsActive ? 'fpvsi-a11y__tts-block--active' : 'fpvsi-a11y__tts-block--inactive'}`}>
                  <div className="fpvsi-a11y__tts-top">
                    <div className="fpvsi-a11y__tts-left">
                      <div className="fpvsi-a11y__row-icon">
                        <Volume2 />
                      </div>
                      <div>
                        <span className="fpvsi-a11y__tts-info-label">
                          {ttsActive ? (ttsReading ? labels.ttsReading : labels.ttsActive) : labels.ttsOff}
                        </span>
                        <span className="fpvsi-a11y__tts-hint">
                          {ttsActive ? labels.ttsHint : labels.ttsHintOff}
                        </span>
                      </div>
                    </div>
                    <div className="fpvsi-a11y__tts-actions">
                      {ttsReading && (
                        <button onClick={(e) => { e.stopPropagation(); ttsStop(); }} className="fpvsi-a11y__tts-stop" aria-label={labels.ttsStop}>
                          <Square />
                        </button>
                      )}
                      <button onClick={toggleTts} className="fpvsi-a11y__tts-toggle" aria-pressed={ttsActive} aria-label={labels.ttsSection}>
                        <div className={`fpvsi-a11y__switch ${ttsActive ? 'fpvsi-a11y__switch--on' : 'fpvsi-a11y__switch--off'}`}>
                          <div className="fpvsi-a11y__switch-knob" />
                        </div>
                      </button>
                    </div>
                  </div>
                  {ttsActive && (
                    <div className="fpvsi-a11y__tts-speed">
                      <span className="fpvsi-a11y__tts-speed-label">{labels.ttsSpeed}</span>
                      {TTS_SPEEDS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setTtsSpeed(s.value)}
                          className={`fpvsi-a11y__tts-speed-btn ${ttsSpeed === s.value ? 'fpvsi-a11y__tts-speed-btn--active' : 'fpvsi-a11y__tts-speed-btn--inactive'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                      {ttsReading && (
                        <div className="fpvsi-a11y__tts-bars">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="fpvsi-a11y__tts-bar" style={{ animation: `a11yBar 0.8s ease-in-out ${i * 0.15}s infinite alternate` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Languages */}
            {hasFeature('languages') && languages.length > 0 && (
              <div style={{ paddingTop: 6, animation: open ? 'a11ySlideIn 0.4s ease-out 450ms both' : 'none' }}>
                <div className="fpvsi-a11y__section-header fpvsi-a11y__section-header--lang">
                  <Globe />
                  <span className="fpvsi-a11y__section-label">{labels.langSection}</span>
                </div>
                <div className="fpvsi-a11y__langs">
                  {languages.map((l) => {
                    const active = lang === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => switchLanguage(l.code)}
                        className={`fpvsi-a11y__lang-btn ${active ? 'fpvsi-a11y__lang-btn--active' : 'fpvsi-a11y__lang-btn--inactive'}`}
                        aria-label={l.label}
                        title={l.label}
                      >
                        <div className="fpvsi-a11y__lang-flag-wrap">
                          <img src={l.flag} alt={l.label} className="fpvsi-a11y__lang-flag" />
                          {active && (
                            <div className="fpvsi-a11y__lang-check">
                              <Check />
                            </div>
                          )}
                        </div>
                        <span className="fpvsi-a11y__lang-code">{l.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="fpvsi-a11y__footer">
            <p className="fpvsi-a11y__footer-text">{labels.footer}</p>
          </div>
        </div>
      </div>

      {/* FAB trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fpvsi-a11y__trigger ${
          open
            ? 'fpvsi-a11y__trigger--open'
            : dirty
              ? 'fpvsi-a11y__trigger--dirty'
              : 'fpvsi-a11y__trigger--default'
        }`}
        aria-label={labels.trigger}
        aria-expanded={open}
      >
        <Accessibility />
        {dirty && !open && (
          <span className="fpvsi-a11y__badge">
            <span className="fpvsi-a11y__badge-text">{activeCount}</span>
          </span>
        )}
        {dirty && !open && (
          <span className="fpvsi-a11y__pulse" />
        )}
      </button>
    </div>
  );
}
