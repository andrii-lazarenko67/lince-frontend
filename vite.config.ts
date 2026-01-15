import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
    allowedHosts: ['.railway.app']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Split CSS per chunk for better caching
    cssCodeSplit: true,
    // Increase warning limit for legitimate large vendor chunks
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // MUI core
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          // MUI icons (large package)
          'vendor-mui-icons': ['@mui/icons-material'],
          // State management
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Charts - only loaded on pages with charts
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          // PDF renderer (heavy) - only loaded on Reports page
          'vendor-pdf': ['@react-pdf/renderer', 'buffer'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next'],
        }
      }
    }
  },
  define: {
    // Polyfill for @react-pdf/renderer which uses Buffer
    'global': 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  }
})
