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
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/desktop.png',
            sizes: '1903x927',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/mobile.png',
            sizes: '485x927',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      registerType: 'autoUpdate',
      includeAssets: ['/assets/**/*']
    })
  ]
});
