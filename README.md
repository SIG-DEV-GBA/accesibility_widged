# fpvsi-a11y-widget

[![npm version](https://img.shields.io/npm/v/fpvsi-a11y-widget.svg)](https://www.npmjs.com/package/fpvsi-a11y-widget)
[![license](https://img.shields.io/npm/l/fpvsi-a11y-widget.svg)](https://github.com/SIG-DEV-GBA/accesibility_widged/blob/main/LICENSE)

Widget de accesibilidad para aplicaciones React. Incluye ajuste de tamaño de fuente, alto contraste, cursor grande, espaciado de texto, fuente para dislexia, resaltado de enlaces, lector de voz (Text-to-Speech) y selector de idiomas (GTranslate).

**Sin dependencia de Tailwind.** CSS puro con metodología BEM + CSS custom properties. Funciona en cualquier proyecto React.

## Funcionalidades

- **Tamaño de fuente** — Aumentar/reducir el tamaño del texto (de -2 a +4 niveles)
- **Alto contraste** — Aplica filtro de alto contraste a toda la página
- **Cursor grande** — Cursor aumentado para mejor visibilidad
- **Espaciado de texto** — Mayor separación entre letras, palabras y líneas
- **Fuente legible** — Cambia a Verdana/Trebuchet (mejor para dislexia)
- **Resaltar enlaces** — Destaca todos los enlaces con borde y subrayado
- **Lector de voz (TTS)** — Modo interactivo: hover resalta bloques, click lee en voz alta
- **Selector de idiomas** — Integración con GTranslate para traducción automática

### Mobile UX

En pantallas moviles (<768px) el widget cambia automaticamente a un patron nativo:

- **Trigger**: mini-tab lateral (36x36px) pegada al borde de la pantalla, centrada verticalmente
- **Panel**: bottom sheet full-width que sube desde abajo con animacion slide-up
- **Backdrop**: fondo oscuro semitransparente con cierre al tap
- **Handle**: barra indicadora gris en la parte superior del sheet
- **Tab dirty**: cuando hay opciones activas, la tab se pone en color primario

En desktop (>=768px) se mantiene el FAB circular + panel flotante habitual.

La deteccion es automatica via `matchMedia` + CSS media queries, incluyendo rotacion de pantalla.

Todas las preferencias se guardan automáticamente en `localStorage`.

## Instalacion

```bash
npm install fpvsi-a11y-widget
```

### Dependencias peer

El paquete requiere que tu proyecto ya tenga instaladas estas dependencias:

```bash
npm install react react-dom lucide-react
```

| Dependencia | Version minima |
|-------------|----------------|
| `react` | >= 18 |
| `react-dom` | >= 18 |
| `lucide-react` | >= 0.300 |

## Uso basico

```tsx
import { AccessibilityWidget } from 'fpvsi-a11y-widget';

export default function App() {
  return (
    <>
      {/* tu app */}
      <AccessibilityWidget />
    </>
  );
}
```

Eso es todo. El widget inyecta su propio `<style>` tag en runtime. No necesitas importar archivos CSS.

### Next.js (App Router)

En `app/layout.tsx`:

```tsx
import { AccessibilityWidget } from 'fpvsi-a11y-widget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
```

El paquete incluye la directiva `'use client'` automáticamente.

### Next.js (Pages Router)

En `pages/_app.tsx`:

```tsx
import { AccessibilityWidget } from 'fpvsi-a11y-widget';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <AccessibilityWidget />
    </>
  );
}
```

### Vite / Create React App

```tsx
import { AccessibilityWidget } from 'fpvsi-a11y-widget';

function App() {
  return (
    <div>
      <h1>Mi App</h1>
      <AccessibilityWidget />
    </div>
  );
}
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `colors` | `{ primary?: string; accent?: string }` | `{ primary: '#A10D5E', accent: '#F29429' }` | Colores de marca. Se derivan 7 CSS vars automaticamente. |
| `position` | `'bottom-left' \| 'bottom-right'` | `'bottom-left'` | Posicion del boton flotante. En mobile, determina el lado de la tab lateral (izquierda o derecha). |
| `features` | `A11yFeature[]` | Todas | Funcionalidades a mostrar |
| `languages` | `A11yLanguage[]` | ES, EN, GL, CA, EU | Opciones de idioma (GTranslate) |
| `ttsLang` | `string` | `'es-ES'` | Idioma del lector de voz |
| `labels` | `Partial<A11yLabels>` | Textos en castellano | Override de textos de la interfaz |
| `storageKey` | `string` | `'a11y-prefs'` | Clave de localStorage |
| `zIndex` | `number` | `9998` | z-index del widget |

## Configuracion avanzada

### Seleccionar funcionalidades

Las funcionalidades disponibles son: `fontSize`, `contrast`, `bigCursor`, `textSpacing`, `dyslexiaFont`, `highlightLinks`, `tts`, `languages`

```tsx
// Solo tamaño de fuente, contraste y lector de voz
<AccessibilityWidget features={['fontSize', 'contrast', 'tts']} />
```

```tsx
// Todo excepto idiomas
<AccessibilityWidget features={['fontSize', 'contrast', 'bigCursor', 'textSpacing', 'dyslexiaFont', 'highlightLinks', 'tts']} />
```

### Colores personalizados

```tsx
<AccessibilityWidget colors={{ primary: '#1a5276', accent: '#f39c12' }} />
```

A partir de los 2 colores, el widget genera automaticamente 7 CSS custom properties:

| Variable CSS | Derivacion |
|-------------|------------|
| `--a11y-primary` | Color primario directo |
| `--a11y-primary-dark` | Primario oscurecido 12% |
| `--a11y-primary-darker` | Primario oscurecido 25% |
| `--a11y-primary-light` | Primario aclarado 15% |
| `--a11y-accent` | Color de acento directo |
| `--a11y-primary-rgb` | RGB del primario (para rgba()) |
| `--a11y-accent-rgb` | RGB del acento (para rgba()) |

### Textos personalizados / i18n

```tsx
// Widget en ingles
<AccessibilityWidget
  labels={{
    title: 'Accessibility',
    fontSize: 'Text Size',
    contrast: 'High Contrast',
    bigCursor: 'Large Cursor',
    textSpacing: 'Text Spacing',
    dyslexiaFont: 'Readable Font',
    highlightLinks: 'Highlight Links',
    ttsSection: 'Voice Reader',
    ttsActive: 'Active',
    ttsReading: 'Reading...',
    ttsOff: 'Disabled',
    ttsHint: 'Click on any text',
    ttsHintOff: 'Click to activate',
    ttsStop: 'Stop reading',
    ttsSpeed: 'Speed',
    langSection: 'Language',
    footer: 'Preferences saved in your browser',
    trigger: 'Accessibility options',
    reset: 'Reset',
    close: 'Close',
    reduceText: 'Reduce text',
    increaseText: 'Increase text',
  }}
  ttsLang="en-US"
/>
```

Solo necesitas pasar los textos que quieras cambiar — los demas usan los valores por defecto (castellano).

### Selector de idiomas (GTranslate)

El selector de idiomas funciona con GTranslate. Necesitas tener el script de GTranslate cargado en tu pagina.

```tsx
<AccessibilityWidget
  languages={[
    { code: 'es', label: 'Español', flag: '/flags/es.svg' },
    { code: 'en', label: 'English', flag: '/flags/gb.svg' },
    { code: 'fr', label: 'Français', flag: '/flags/fr.svg' },
  ]}
/>
```

Para desactivar el selector de idiomas, simplemente no incluyas `'languages'` en el array de `features`:

```tsx
<AccessibilityWidget features={['fontSize', 'contrast', 'bigCursor', 'textSpacing', 'dyslexiaFont', 'highlightLinks', 'tts']} />
```

### Posicion y z-index

```tsx
// Esquina inferior derecha con z-index alto
<AccessibilityWidget position="bottom-right" zIndex={99999} />
```

### Multiples instancias

Si necesitas varias instancias (poco comun), usa `storageKey` diferente:

```tsx
<AccessibilityWidget storageKey="a11y-site-a" />
<AccessibilityWidget storageKey="a11y-site-b" />
```

## Exports

### Componente

```tsx
import { AccessibilityWidget } from 'fpvsi-a11y-widget';
```

### Constantes

```tsx
import {
  DEFAULT_COLORS,     // { primary: '#A10D5E', accent: '#F29429' }
  DEFAULT_LABELS,     // Todos los textos por defecto
  ALL_FEATURES,       // Array con todas las features
  DEFAULT_LANGUAGES,  // ES, EN, GL, CA, EU
  TTS_SPEEDS,         // [0.75x, 1x, 1.25x, 1.5x]
  A11Y_DEFAULTS,      // Estado inicial (todo desactivado)
} from 'fpvsi-a11y-widget';
```

### Tipos TypeScript

```tsx
import type {
  A11yWidgetProps,  // Props del componente
  A11yColors,       // { primary: string; accent: string }
  A11yLabels,       // Todos los textos de la UI
  A11yLanguage,     // { code: string; label: string; flag: string }
  A11yFeature,      // Union type de features
  A11yState,        // Estado de las preferencias
} from 'fpvsi-a11y-widget';
```

## Como funciona

1. **CSS inyectado**: Al montar el componente, se crea un `<style id="fpvsi-a11y-styles">` en el `<head>` con todo el CSS necesario. No se duplica si ya existe.

2. **CSS custom properties**: Los colores se establecen como variables CSS en `:root`, accesibles desde todo el documento.

3. **Clases globales**: Las funcionalidades de accesibilidad (contraste, cursor, espaciado, etc.) aplican clases CSS al `<html>` (`a11y-contrast`, `a11y-big-cursor`, etc.).

4. **TTS interactivo**: En modo lector de voz, se registran event listeners globales (mouseover/mouseout/click) que resaltan y leen elementos de texto usando la Web Speech API.

5. **Persistencia**: Las preferencias se guardan en `localStorage` bajo la clave configurada (`a11y-prefs` por defecto).

## Compatibilidad

- React 18+
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Text-to-Speech requiere Web Speech API (disponible en la mayoria de navegadores modernos)
- GTranslate (solo si se usa la funcionalidad de idiomas)

## Estructura del paquete

```
dist/
├── index.mjs       # ESM (40 KB)
├── index.js        # CJS (44 KB)
├── index.d.ts      # TypeScript declarations
├── index.d.mts     # TypeScript declarations (ESM)
├── index.mjs.map   # Source maps
└── index.js.map    # Source maps
```

## Desarrollo

```bash
git clone https://github.com/SIG-DEV-GBA/accesibility_widged.git
cd accesibility_widged
npm install
npm run build    # Build ESM + CJS + types
npm run dev      # Watch mode
```

## Licencia

MIT
