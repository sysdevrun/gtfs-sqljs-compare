import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gtfs-sqljs-compare/',
  optimizeDeps: {
    exclude: ['sql.js']
  },
  build: {
    outDir: 'dist'
  },
  assetsInclude: ['**/*.wasm']
})
