/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Test environment
    environment: 'node',
    
    // Setup files
    setupFiles: ['./test/setup.ts'],
    
    // Test patterns
    include: [
      'test/**/*.test.ts',
      'test/**/*.spec.ts'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'test/helpers/**/*',
      'test/factories/**/*'
    ],
    
    // Global test configuration
    globals: true,
    
    // Reporter options
    reporter: ['verbose'],
    
    // Coverage configuration (simplificada)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'prisma/',
        '*.config.*',
        'src/server.ts'
      ],
    },
    
    // Timeout configuration
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Pool options for better isolation
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    
    // Retry failed tests
    retry: 1,
    
    // File parallelization - disabled for database tests
    fileParallelism: false,
  },
  
  // Module resolution usando o tsconfig
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
});