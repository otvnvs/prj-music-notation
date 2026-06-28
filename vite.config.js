import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),

    // FIX: Redirects Vite's dev server root / path to read index.vite.html
    {
      name: 'dev-server-spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If the browser requests the root URL, rewrite it to target your Vite file
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/index.vite.html';
          }
          next();
        });
      }
    },
    
    // Keeps your production build output named correctly as index.html inside dist/
    {
      name: 'rename-vite-html-output',
      closeBundle: async () => {
        const buildDir = resolve(__dirname, 'dist');
        const oldPath = path.join(buildDir, 'index.vite.html');
        const newPath = path.join(buildDir, 'index.html');
        
        if (fs.existsSync(oldPath)) {
          await fs.promises.rename(oldPath, newPath);
          console.log('Successfully renamed build output to standard index.html');
        }
      }
    }
  ],
  server: {
    // Automatically opens the browser to your targeted dev route when starting the server
    open: '/index.vite.html' 
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.vite.html')
      }
    }
  }
});

