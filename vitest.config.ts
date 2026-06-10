import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    // Run sequentially to prevent process timeouts on resource-constrained environments
    fileParallelism: false,
    testTimeout: 20000,
  },
})
