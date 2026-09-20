import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import purgecss from "vite-plugin-purgecss";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ isSsrBuild }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    proxy: {
      "/api/auth/initiate": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: () => "/functions/v1/initiate-shareholder-auth",
      },
      "/api/auth/verify": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: () => "/functions/v1/verify-shareholder-otp",
      },
      "/api/auth/session": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: () => "/functions/v1/shareholder-session",
      },
      "/api/cast-vote": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: () => "/functions/v1/cast-vote",
      },
      "/api/eligible-events": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: () => "/functions/v1/eligible-events",
      },
      "/api/functions": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/api\/functions/, "/functions/v1"),
      },
      "/supabase-proxy": {
        target: "https://tpfvvuuumfuvbqkackwk.supabase.co",
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/supabase-proxy/, ""),
      },
    },
  },
  plugins: [
    react(),
    purgecss({
      content: ['./index.html', './src/**/*.{ts,tsx,html}'],
      defaultExtractor: (content) => content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
      safelist: {
        standard: ['html', 'body'],
        greedy: [/^animate/, /^aos/, /^swiper/, /^framer/, /^xl:/, /^lg:/, /^md:/, /^sm:/, /^hover:/, /^focus:/, /^data-/, /^aria-/, /^lucide/, /^radix/]
      }
    }) as unknown as Plugin,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: "hidden",
    minify: "esbuild",
    modulePreload: {
      polyfill: false,
      resolveDependencies(filename, deps) {
        // Exclude heavy lazy chunks from initial page HTML preloads
        return deps.filter(dep =>
          !dep.includes('three') &&
          !dep.includes('pdf') &&
          !dep.includes('supabase') &&
          !dep.includes('charts') &&
          !dep.includes('animation') &&
          !dep.includes('markdown') &&
          !dep.includes('ogl')
        );
      },
    },
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            manualChunks(id) {
              if (id.includes('vite/preload-helper')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules')) {
                // Core React, Helmet, and shared styling primitives (must be isolated so lazy leaf chunks don't capture them)
                if (/[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|clsx|tailwind-merge)[\\/]/.test(id)) {
                  return 'vendor-react';
                }
                // Three.js & 3D WebGL (standalone leaf)
                if (/[\\/]node_modules[\\/](three|@react-three|ogl)[\\/]/.test(id)) {
                  return 'three-bundle';
                }
                // PDF & Document Generation (standalone leaf)
                if (/[\\/]node_modules[\\/](jspdf|jspdf-autotable|pdfjs-dist|mammoth|tesseract\.js)[\\/]/.test(id)) {
                  return 'pdf-bundle';
                }
                // Supabase SDK (standalone leaf)
                if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) {
                  return 'supabase-bundle';
                }
                // Charts library (only used on dashboard pages)
                if (/[\\/]node_modules[\\/](recharts|react-smooth|d3-scale|d3-shape|d3-path|d3-interpolate|d3-color|d3-time|d3-format|d3-array)[\\/]/.test(id)) {
                  return 'charts-bundle';
                }
                // Animation libraries (deferred, non-critical)
                if (/[\\/]node_modules[\\/](motion|framer-motion|gsap)[\\/]/.test(id)) {
                  return 'animation-bundle';
                }
                // Icon library (large tree, split for better caching)
                if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
                  return 'icons-bundle';
                }
                // Markdown renderer (only used on blog/content pages)
                if (/[\\/]node_modules[\\/]react-markdown[\\/]/.test(id)) {
                  return 'markdown-bundle';
                }
                // i18n runtime (loaded eagerly but cacheable separately)
                if (/[\\/]node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/.test(id)) {
                  return 'i18n-bundle';
                }
              }
            },
          },
    },
  },
  // vite-react-ssg: static site generation options
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    entry: 'src/main.tsx',
    includedRoutes: async (paths: string[]) => {
      const blogSlugs = [
        'sebi-compliant-evoting-guide',
        'role-of-scrutinizer-form-mgt-13',
        'agm-remote-evoting-timeline-checklist',
        'how-online-shareholder-voting-works',
        'agm-evoting-vs-physical-meeting',
        'benefits-electronic-voting-shareholders'
      ];
      const blogRoutes = blogSlugs.map(slug => `/blog/${slug}`);

      const resourceSlugs = [
        'what-is-shareholder-e-voting',
        'how-agm-e-voting-works',
        'how-egm-e-voting-works',
        'how-proxy-voting-works',
        'record-date-and-voting-entitlement',
        'ordinary-vs-special-resolution',
        'scrutinizer-voting-workflow'
      ];
      const resourceRoutes = resourceSlugs.map(slug => `/resources/${slug}`);

      return Array.from(new Set([...paths, ...blogRoutes, ...resourceRoutes]));
    },
  },
}));
