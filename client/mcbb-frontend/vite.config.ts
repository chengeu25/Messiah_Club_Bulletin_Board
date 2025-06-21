import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'goSHARC: Student Happenings and Recommendations for Clubs',
        short_name: 'goSHARC',
        description:
          'A centrailzed, online platform for university student engagement.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/assets/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      registerType: 'autoUpdate',
      includeAssets: ['/assets/**/*']
    })
  ]
});
