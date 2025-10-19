import { build } from 'vite';
import { resolve } from 'path';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');

  // First build the main PWA app
  console.log('📦 Building main PWA app...');
  await build({
    configFile: resolve(__dirname, '../vite.config.ts'),
    build: {
      outDir: 'dist/extension',
    },
  });

  console.log('🔧 Building extension background script...');
  // Build the extension background script
  await build({
    configFile: false,
    define: {
      global: 'globalThis',
      'process.env': {},
    },
    build: {
      outDir: 'dist/extension',
      lib: {
        entry: resolve(__dirname, '../src/extension/background/background.ts'),
        name: 'background',
        fileName: 'background',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['chrome'],
        output: {
          globals: {
            chrome: 'chrome',
          },
        },
      },
    },
  });

  console.log('🔧 Building extension content script...');
  // Build content script
  await build({
    configFile: false,
    define: {
      global: 'globalThis',
    },
    build: {
      outDir: 'dist/extension',
      lib: {
        entry: resolve(__dirname, '../src/extension/content/contentScript.ts'),
        name: 'content',
        fileName: 'content',
        formats: ['es'],
      },
    },
  });

  // Copy manifest and other assets
  if (!existsSync('dist/extension')) {
    await mkdir('dist/extension', { recursive: true });
  }

  try {
    // Copy manifest
    await copyFile(
      resolve(__dirname, '../src/extension/manifest.json'),
      resolve(__dirname, '../dist/extension/manifest.json')
    );

    // Copy popup HTML
    await copyFile(
      resolve(__dirname, '../src/extension/popup/popup.html'),
      resolve(__dirname, '../dist/extension/popup.html')
    );

    // Copy popup JS
    await copyFile(
      resolve(__dirname, '../src/extension/popup/popup.js'),
      resolve(__dirname, '../dist/extension/popup.js')
    );

    // Copy icons directory if it exists
    const iconsSource = resolve(__dirname, '../public/icons');
    const iconsDest = resolve(__dirname, '../dist/extension/icons');

    if (existsSync(iconsSource)) {
      await mkdir(iconsDest, { recursive: true });
      // Copy icon files
      const { readdir, copyFile: copyFileAsync } = await import('fs/promises');
      const iconFiles = await readdir(iconsSource);

      for (const file of iconFiles) {
        await copyFileAsync(
          resolve(iconsSource, file),
          resolve(iconsDest, file)
        );
      }
    }

    console.log('✅ Chrome Extension built successfully!');
    console.log('📁 Extension files are in: dist/extension/');
    console.log('🔧 To install: Load unpacked extension from dist/extension/ in Chrome');
  } catch (error) {
    console.error('❌ Error copying files:', error);
  }
}

buildExtension().catch(console.error);