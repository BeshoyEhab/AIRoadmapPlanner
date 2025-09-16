/* eslint-env node */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
      // Enable Fast Refresh with default settings
      fastRefresh: true,
      // Use default Babel configuration
      babel: {
        plugins: [],
      },
    }),
  ],
  // Enable better error overlays
  clearScreen: true,
  logLevel: 'info',
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    hmr: {
      overlay: true,
    },
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // Enable source maps in development
    sourcemap: true,
  },
  build: {
    // Enable better source maps for debugging
    sourcemap: true,
    // Add cache-busting hashes to output files
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ai-vendor': ['@google/generative-ai'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          'export-vendor': ['jspdf', 'html2canvas', 'file-saver'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Generate source maps for production debugging
    sourcemap: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@google/generative-ai',
      'lucide-react'
    ]
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
