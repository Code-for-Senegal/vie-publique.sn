import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    // Test files location
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'components/**/*.{js,ts,vue}',
        'composables/**/*.{js,ts}',
        'stores/**/*.{js,ts}',
        'plugins/**/*.{js,ts}',
        'server/**/*.{js,ts}',
        'layouts/**/*.{js,ts,vue}',
      ],
      exclude: [
        'node_modules/',
        'test/',
        '.nuxt/',
        '.output/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
