import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    target: 'es2022',
  },
  server: {
    proxy: {
      '/data': {
        target: 'http://localhost:8055',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/data/, ''),
        followRedirects: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
