import { ServerOptions } from './types.ts';

export const VERSION = '0.1.0';

export const MEDIA_TYPES: Record<string, string> = {
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
  '.map': 'application/json',
  '.txt': 'text/plain',
  '.ts': 'text/typescript',
  '.tsx': 'text/tsx',
  '.js': 'application/javascript',
  '.jsx': 'text/jsx',
  '.gz': 'application/gzip',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.ico': 'image/vnd.microsoft.icon',
};

export const DEFAULT_OPTS: ServerOptions = {
  port: 3000,
  https: false,
  poweredBy: true,
};
