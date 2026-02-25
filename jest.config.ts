// jest.config.ts — Configuration Jest pour les tests d'intégrité
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 120_000,
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        resolveJsonModule: true,
      },
    }],
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  verbose: true,
  transformIgnorePatterns: ['/node_modules/'],
}

export default config
