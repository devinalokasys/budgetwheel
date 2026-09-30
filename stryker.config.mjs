/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.config.ts' },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.stryker.json',
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  // Keep this list identical to vitest.config.ts's coverage.include — see
  // the comment there for why these 11 files and not provider.ts/schema.ts
  // or the presentational pages.
  mutate: [
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
  thresholds: { high: 100, low: 100, break: 100 },
  timeoutMS: 60000,
}
