import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'lucide-react'],
  banner: { js: '"use client";' },
  loader: { '.css': 'text' },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
