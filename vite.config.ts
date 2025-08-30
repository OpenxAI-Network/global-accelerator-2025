import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: "::",
    port: 8080,
    open: false,
    strictPort: true,
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  publicDir: 'public',
}))