import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function copyStaticCyberpenguinsAssets() {
  return {
    name: 'copy-static-cyberpenguins-assets',
    closeBundle() {
      const rootDir = process.cwd();
      const distDir = path.resolve(rootDir, 'dist');
      const entries = ['css', 'js', 'manifest.webmanifest', '.htaccess'];
      entries.forEach((entry) => {
        const src = path.join(rootDir, entry);
        const dest = path.join(distDir, entry);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
      });
    }
  };
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [copyStaticCyberpenguinsAssets()]
});
