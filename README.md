# fpvsi-a11y-widget

Accessibility widget for React apps — font size, high contrast, big cursor, text spacing, dyslexia font, link highlighting, text-to-speech reader, and language switcher (GTranslate).

**Zero Tailwind dependency.** Pure CSS with BEM + CSS custom properties. Works in any React project.

## Install

```bash
npm install fpvsi-a11y-widget
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `lucide-react >= 0.300`

## Quick Start

```tsx
import { AccessibilityWidget } from 'fpvsi-a11y-widget';

export default function App() {
  return (
    <>
      {/* your app */}
      <AccessibilityWidget />
    </>
  );
}
```

That's it — the widget injects its own `<style>` tag at runtime. No CSS imports needed.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `{ primary?: string; accent?: string }` | `{ primary: '#A10D5E', accent: '#F29429' }` | Brand colors. 7 CSS vars are derived automatically. |
| `position` | `'bottom-left' \| 'bottom-right'` | `'bottom-left'` | FAB position |
| `features` | `A11yFeature[]` | All features | Which features to show |
| `languages` | `A11yLanguage[]` | ES, EN, GL, CA, EU | Language options (GTranslate) |
| `ttsLang` | `string` | `'es-ES'` | Text-to-speech language |
| `labels` | `Partial<A11yLabels>` | Spanish labels | Override any UI text |
| `storageKey` | `string` | `'a11y-prefs'` | localStorage key |
| `zIndex` | `number` | `9998` | z-index of the widget |

### Features

Available feature keys: `fontSize`, `contrast`, `bigCursor`, `textSpacing`, `dyslexiaFont`, `highlightLinks`, `tts`, `languages`

```tsx
// Only show font size and contrast
<AccessibilityWidget features={['fontSize', 'contrast']} />
```

### Custom Colors

```tsx
<AccessibilityWidget colors={{ primary: '#1a5276', accent: '#f39c12' }} />
```

From the two colors, the widget derives:
- `--a11y-primary`, `--a11y-primary-dark`, `--a11y-primary-darker`, `--a11y-primary-light`
- `--a11y-accent`
- `--a11y-primary-rgb`, `--a11y-accent-rgb` (for rgba usage)

### Custom Labels (i18n)

```tsx
<AccessibilityWidget
  labels={{
    title: 'Accessibility',
    fontSize: 'Text Size',
    contrast: 'High Contrast',
    footer: 'Preferences saved in your browser',
  }}
  ttsLang="en-US"
/>
```

### Languages (GTranslate)

Pass `languages` to show the language switcher. Requires GTranslate script loaded on the page.

```tsx
<AccessibilityWidget
  languages={[
    { code: 'es', label: 'Español', flag: '/flags/es.svg' },
    { code: 'en', label: 'English', flag: '/flags/gb.svg' },
  ]}
/>
```

Or disable it:

```tsx
<AccessibilityWidget features={['fontSize', 'contrast', 'tts']} />
```

## Exports

```tsx
import {
  AccessibilityWidget,
  DEFAULT_COLORS,
  DEFAULT_LABELS,
  ALL_FEATURES,
  DEFAULT_LANGUAGES,
  TTS_SPEEDS,
  A11Y_DEFAULTS,
} from 'fpvsi-a11y-widget';

import type {
  A11yWidgetProps,
  A11yColors,
  A11yLabels,
  A11yLanguage,
  A11yFeature,
  A11yState,
} from 'fpvsi-a11y-widget';
```

## License

MIT
