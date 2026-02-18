import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

// Custom plugin to copy static assets into build output
function copyStaticAssets() {
  const projectDir = resolve(__dirname);
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const outDir = resolve(__dirname, '../_site');

      // Copy directories from project root
      const dirs = ['assets', 'functions'];
      dirs.forEach((dir) => {
        const src = resolve(projectDir, dir);
        const dest = resolve(outDir, dir);
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true });
        }
      });

      // Copy individual files from public/ directory
      const publicFiles = ['manifest.json', 'sw.js'];
      publicFiles.forEach((file) => {
        const src = resolve(projectDir, 'public', file);
        const dest = resolve(outDir, file);
        if (existsSync(src)) {
          cpSync(src, dest);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  root: '.',
  build: {
    outDir: '../_site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'app.html'),
        landing: resolve(__dirname, 'landing.html'),
      },
    },
    // Keep asset filenames predictable for middleware allowlist
    assetsDir: 'dist',
  },
  server: {
    port: 3000,
    fs: {
      // Allow serving files from parent directory during dev
      allow: ['..'],
    },
  },
});
