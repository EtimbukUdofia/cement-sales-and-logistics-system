import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // build: {
  //   // Optimize for production
  //   minify: 'terser',
  //   sourcemap: false,
  //   rollupOptions: {
  //     output: {
  //       // Remove console.log in production builds
  //       manualChunks: {
  //         vendor: ['react', 'react-dom'],
  //       },
  //     },
  //   },
  // },
  // esbuild: {
  //   // Remove console.log and debugger statements in production
  //   drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  // },
})
