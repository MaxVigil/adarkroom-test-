import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'script/generated/react',
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/react/main.tsx'),
      name: 'LightRoomReact',
      formats: ['iife'],
      fileName: () => 'light-room-react.js',
      cssFileName: 'light-room-react',
    },
  },
});
