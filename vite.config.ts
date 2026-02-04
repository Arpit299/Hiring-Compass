import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Ensure proper dev server configuration
    port: 5173,
    strictPort: false, // Fall back to next available port if 5173 is in use
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  preview: {
    port: 4173,
  },
})
