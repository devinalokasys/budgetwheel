import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Deliberately separate from vite.config.ts: that file's BUILD_TARGET
// branching (dist vs dist-dealer, index.html vs dealer.html, the
// dev-server-only dealer-dev-entry middleware) is entirely about build
// entry selection and irrelevant to tests. Merging risks a future edit
// there silently changing test behavior.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      all: true,
      // Scoped to "core logic" only, per explicit user decision — the
      // data/mapper layer, auth route guards, and form validation, not
      // the ~40 presentational page components. provider.ts and
      // schema.ts are deliberately absent: pure interface/type
      // declarations with zero executable code (tsconfig.app.json's own
      // erasableSyntaxOnly proves they erase at compile time).
      include: [
        'src/lib/db/mappers.ts',
        'src/lib/db/index.ts',
        'src/lib/db/localProvider.ts',
        'src/lib/db/firestoreProvider.ts',
        'src/components/ProtectedRoute.tsx',
        'src/components/DealerRoute.tsx',
        'src/components/DealerRegistrationForm.tsx',
        'src/contexts/AuthContext.tsx',
        'src/lib/auth.ts',
        'src/lib/firebase.ts',
        'src/lib/formLogic.ts',
      ],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
