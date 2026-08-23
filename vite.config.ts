import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// Vite + embedded Vitest config.
// PWA/service-worker support is wired here (see docs/architecture.md § Performance).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Disabled by default in the harness skeleton; enable per-project once you
      // have an offline/caching strategy (see docs/architecture.md § Service Workers).
      disable: true,
      manifest: {
        name: 'frontend-harness',
        short_name: 'fe-harness',
        theme_color: '#0f172a',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    globals: false,
    environment: './src/test/vitest-environment.ts',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    // E2E specs are run by Playwright, not Vitest. Layer A is not run by Vitest either:
    // it is generated in the `harness` repo, verified here by sha, and carries its own
    // suite written against `node:test` — the one runner it can rely on in a Python repo,
    // a pnpm repo and a vendored tree no package manager has visited. Collecting it here
    // fails with "No test suite found", because the registrations go to Node's runner
    // rather than Vitest's. `.prettierignore` and `eslint.config.js` already exclude the
    // same directory for the same underlying reason: nothing in it can be fixed from here.
    // `.factory/` is the software factory's own scratch space: it holds a git worktree
    // per run, each a full second copy of this repository. Vitest globbed into them and
    // ran the *worktree's* specs as if they were this checkout's — on 2026-08-22 a single
    // stale worktree made `pnpm test` fail 4 files that do not exist at this path, and
    // blocked a push until it was removed by hand. A run's own gates execute inside its
    // worktree, where this path is again `.factory/` and again excluded, so nothing loses
    // coverage: the exclusion is of other checkouts, not of any test.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.agents/vendor/**', '.factory/**'],
  },
});
