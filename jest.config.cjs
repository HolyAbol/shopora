/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        // per-file transpile, skips whole-project type checking/resolution
        // so the explicit ".ts" import extensions in this codebase don't
        // trip TS's module-resolution diagnostics during tests
        isolatedModules: true,
        tsconfig: {
          module: 'CommonJS',
          target: 'ES2022',
          esModuleInterop: true,
        },
      },
    ], 
  },
};
