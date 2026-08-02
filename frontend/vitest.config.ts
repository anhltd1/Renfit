import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

// Vitest configuration for the Renfit frontend.
// Uses jsdom so React Testing Library can render components, and loads a setup
// file that registers jest-dom matchers. Kept separate from vite.config.ts to
// avoid pulling test-only plugins into the production build.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
