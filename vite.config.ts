import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// On GitHub Pages a project site is served from /<repo-name>/, so the asset
// base must match the repository. Deriving it from GITHUB_REPOSITORY (which
// Actions always sets, as "owner/repo") means the same code builds correctly
// in any repo — a test copy, a rename, or the original — with nothing to edit.
function resolveBase(): string {
  if (process.env.GITHUB_ACTIONS !== 'true') return '/';
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return repository ? `/${repository}/` : '/Kallista/';
}

export default defineConfig(() => {
  return {
    base: resolveBase(),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase';
            if (id.includes('node_modules/react') || id.includes('node_modules/motion')) return 'ui';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
