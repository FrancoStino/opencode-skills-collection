// SPDX-License-Identifier: MIT
import { createServer } from 'node:http';
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';

const MAX_INDEXED_FILES = 10000;
const SKIPPED_DIRECTORIES = new Set(['.git', '.next', '.cache', 'node_modules']);

function inside(root, file) {
  const rel = relative(root, file);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function buildFileIndex(root, entry) {
  const files = new Map();
  const blocked = new Set();
  const entryPath = resolve(root, entry);
  if (!inside(root, entryPath)) throw new TypeError('Deck entry must be inside the deck root');
  const entryReal = realpathSync(entryPath);
  if (!inside(root, entryReal) || !statSync(entryReal).isFile()) {
    throw new TypeError('Deck entry must be an in-root file');
  }
  files.set('/', entryReal);

  const pending = [{ directory: root, depth: 0 }];
  let indexed = 0;
  while (pending.length) {
    const { directory, depth } = pending.pop();
    if (depth > 64) throw new RangeError('Deck directory nesting exceeds the 64-level limit');
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      if (SKIPPED_DIRECTORIES.has(item.name)) continue;
      const candidate = resolve(directory, item.name);
      if (!inside(root, candidate)) continue;
      const route = `/${relative(root, candidate).split(sep).join('/')}`;

      if (item.isDirectory()) {
        pending.push({ directory: candidate, depth: depth + 1 });
        continue;
      }
      if (!item.isFile() && !item.isSymbolicLink()) continue;
      indexed += 1;
      if (indexed > MAX_INDEXED_FILES) {
        throw new RangeError(`Deck contains more than ${MAX_INDEXED_FILES} files; select a smaller deck directory`);
      }

      let canonical;
      try {
        canonical = realpathSync(candidate);
      } catch {
        blocked.add(route);
        continue;
      }
      if (!inside(root, canonical)) {
        blocked.add(route);
        continue;
      }
      if (!statSync(canonical).isFile()) continue;
      files.set(route, canonical);
    }
  }
  return { files, blocked };
}

// Serve an explicitly selected deck directory, including its in-root assets.
// Request paths only select entries in a startup-verified map; they never reach
// filesystem APIs. Symlinks outside the deck are indexed as blocked routes.
export async function startDeckServer(directory, entry, mimeTypes = {}) {
  const root = realpathSync(directory);
  if (!statSync(root).isDirectory()) throw new TypeError('Deck root must be a directory');
  const { files, blocked } = buildFileIndex(root, entry);
  const server = createServer((req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const port = server.address()?.port;
    const allowedHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);
    if (!allowedHosts.has(req.headers.host || '')) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }
    try {
      const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
      if (!pathname.startsWith('/') || /[\0\r\n]/.test(pathname)) {
        res.writeHead(400); res.end('Bad request'); return;
      }
      if (pathname.split('/').some(segment => segment === '.' || segment === '..')) {
        res.writeHead(403); res.end('Forbidden'); return;
      }
      if (blocked.has(pathname)) {
        res.writeHead(403); res.end('Forbidden'); return;
      }
      const file = files.get(pathname);
      if (!file) {
        res.writeHead(404); res.end('Not found'); return;
      }
      if (!statSync(file).isFile()) {
        res.writeHead(404); res.end('Not found'); return;
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 404);
      res.end(error instanceof URIError ? 'Bad request' : 'Not found');
    }
  });
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { server.removeListener('error', reject); done(); });
  });
  return server;
}
