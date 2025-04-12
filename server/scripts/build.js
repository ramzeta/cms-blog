import { mkdir, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

async function build() {
  try {
    // Create dist directory
    await mkdir(distDir, { recursive: true });

    // Copy necessary files and directories
    const filesToCopy = [
      'index.js',
      'database',
      'routes',
      'middleware',
      'scripts'
    ];

    for (const file of filesToCopy) {
      await cp(
        join(rootDir, file),
        join(distDir, file),
        { recursive: true }
      );
    }

    console.log('Server build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();