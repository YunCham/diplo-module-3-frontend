import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Precompresión gzip en build: comprime UNA vez y Nginx sirve el .gz con
    // 'gzip_static on' (no recomprime en cada request). Solo gzip porque la
    // imagen oficial nginx:alpine no trae el módulo brotli.
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 1024, deleteOriginFile: false }),
  ],
  build: {
    // NO publicar sourcemaps en producción: exponen tu código fuente original
    // a cualquiera que abra las DevTools.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Separar dependencias estables en chunks propios -> el navegador cachea
        // 'react'/'vendor' entre despliegues y solo re-descarga tu código de app.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: [
            'axios',
            'zod',
            'react-hook-form',
            '@hookform/resolvers',
            'zustand',
            'date-fns',
            'uuid',
          ],
        },
      },
    },
  },
})
