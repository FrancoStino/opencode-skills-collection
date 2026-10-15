#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const CACHE_DIRECTORY = resolve(tmpdir(), `aas-eas-workflow-refs-${typeof process.getuid === 'function' ? process.getuid() : process.pid}`);
const DEFAULT_TTL_SECONDS = 15 * 60;
const MAX_BYTES = 1024 * 1024;
const MAX_CACHE_BYTES = 6 * MAX_BYTES + 4096;
const APPROVED_URLS = new Set([
  'https://api.expo.dev/v2/workflows/schema',
  'https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/syntax.mdx',
  'https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/pre-packaged-jobs.mdx',
]);

export async function fetchCached(url, {
  cacheDirectory = CACHE_DIRECTORY,
  fetchImpl = globalThis.fetch,
  timeoutMs = 10000,
  maxBytes = MAX_BYTES,
} = {}) {
  if (!APPROVED_URLS.has(url)) throw new Error('Only the three documented Expo reference URLs are accepted');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new Error('Invalid timeout');
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_BYTES) throw new Error('Invalid response limit');
  await mkdir(cacheDirectory, { recursive: true, mode: 0o700 });
  const directory = await lstat(cacheDirectory);
  if (!directory.isDirectory() || directory.isSymbolicLink()) throw new Error('Cache must be a real directory');
  if (typeof process.getuid === 'function' && (directory.uid !== process.getuid() || (directory.mode & 0o022))) {
    throw new Error('Cache directory must be owned by this user and not writable by others');
  }
  const cacheFile = resolve(cacheDirectory, createHash('sha256').update(url).digest('hex') + '.json');
  const cached = await loadCacheEntry(cacheFile, url, maxBytes);
  if (cached && cached.expires > Math.floor(Date.now() / 1000)) return cached.data;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      redirect: 'error',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'max-age=0',
        ...(cached?.etag && { 'If-None-Match': cached.etag }),
      },
    });
    if (response.status === 304 && cached) {
      await storeResponse(cacheFile, { ...cached, expires: getExpires(response.headers) }, response.headers);
      return cached.data;
    }
    if (!response.ok) throw new Error(`Reference request failed: HTTP ${response.status}`);
    const length = response.headers.get('content-length');
    if (length && /^\d+$/.test(length) && Number(length) > maxBytes) {
      await response.body?.cancel();
      throw new Error('Reference response exceeds byte limit');
    }
    if (!response.body) throw new Error('Missing reference body');
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) throw new Error('Reference response exceeds byte limit');
        chunks.push(value);
      }
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const data = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (!data.trim()) throw new Error('Empty reference response');
    await storeResponse(cacheFile, {
      url, etag: response.headers.get('etag'), expires: getExpires(response.headers), data,
    }, response.headers);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function loadCacheEntry(cacheFile, url, maxBytes) {
  let handle;
  try {
    if (!Number.isInteger(constants.O_NOFOLLOW) || constants.O_NOFOLLOW <= 0) return null;
    handle = await open(cacheFile, constants.O_RDONLY | constants.O_NOFOLLOW);
    const info = await handle.stat();
    if (!info.isFile() || info.size > MAX_CACHE_BYTES) return null;
    const buffer = Buffer.alloc(MAX_CACHE_BYTES + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead > MAX_CACHE_BYTES) return null;
    const entry = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytesRead)));
    if (entry.url !== url || typeof entry.data !== 'string' || !Number.isFinite(entry.expires)) return null;
    if (entry.expires > Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS) return null;
    if (entry.etag != null && (typeof entry.etag !== 'string' || entry.etag.length > 1024 || /[\r\n]/.test(entry.etag))) return null;
    if (!entry.data.trim() || Buffer.byteLength(entry.data, 'utf8') > maxBytes) return null;
    return entry;
  } catch { return null; }
  finally { await handle?.close(); }
}

async function storeResponse(cacheFile, entry, headers) {
  if (/\bno-store\b/i.test(headers.get('cache-control') || '')) {
    await unlink(cacheFile).catch(error => { if (error.code !== 'ENOENT') throw error; });
    return;
  }
  await saveCacheEntry(cacheFile, entry);
}

async function saveCacheEntry(cacheFile, entry) {
  const temporary = `${cacheFile}.${process.pid}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(JSON.stringify(entry));
    await handle.close(); handle = undefined;
    await rename(temporary, cacheFile);
  } finally {
    await handle?.close();
    await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

function getExpires(headers) {
  const now = Math.floor(Date.now() / 1000);
  const directive = headers.get('cache-control') || '';
  if (/\bno-store\b|\bno-cache\b/i.test(directive)) return now;
  const match = directive.match(/\bmax-age=(\d+)/i);
  let ttl = DEFAULT_TTL_SECONDS;
  if (match) ttl = Math.min(Number(match[1]), DEFAULT_TTL_SECONDS);
  else if (headers.get('expires')) {
    const expires = Date.parse(headers.get('expires'));
    if (Number.isFinite(expires)) ttl = Math.max(0, Math.min(Math.floor(expires / 1000) - now, ttl));
  }
  return now + ttl;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const url = process.argv[2];
  if (!url || url === '--help' || url === '-h') {
    console.log('Usage: node fetch.js <one documented Expo reference URL>\nBounded read-only HTTPS fetch; local cache; no redirects.');
    process.exitCode = url ? 0 : 1;
  } else {
    try { console.log(await fetchCached(url)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
