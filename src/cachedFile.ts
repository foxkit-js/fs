import { resolve } from "path";
import type { FileSerializer, FileWriteResult } from "./writeFile";
import { writeFile } from "./writeFile";
import type { FileParser, FileReadResult } from "./readFile";
import { readFile } from "./readFile";

/**
 * Options object to configure cached file read/write adapter
 */
interface CachedFileOpts<T> {
  /**
   * Maximum cache age in seconds
   */
  maxCacheAge?: number;
  /**
   * Function that parses data `T` from string to any type. May be async.
   */
  parse: FileParser<T>;
  /**
   * Function that transform data `T` to string. May be async.
   */
  serialize: FileSerializer<T>;
}

interface FileCache<T> {
  cacheTime: number;
  data: T;
}

function getTime() {
  return Math.trunc(Date.now() / 1000);
}

function createFileCache<T>() {
  const cache = new Map<string, FileCache<T>>();

  function checkAge(cached: FileCache<T>, maxCacheAge: number) {
    if (maxCacheAge < 0) return true; // always true for negative max age
    const now = getTime();
    const age = now - cached.cacheTime;
    return age <= maxCacheAge;
  }

  function set(path: string, data: T) {
    const fullPath = resolve(path);
    const now = getTime();
    cache.set(fullPath, { cacheTime: now, data });
  }

  function get(path: string, maxCacheAge?: number) {
    const fullPath = resolve(path);
    const cached = cache.get(fullPath);
    if (!cached) return;

    if (typeof maxCacheAge == "undefined") return cached;
    if (checkAge(cached, maxCacheAge)) return cached;
    cache.delete(fullPath);
    return;
  }

  function has(path: string, maxCacheAge?: number) {
    const fullPath = resolve(path);
    // with no valid maxCacheAge simply use Map method
    if (typeof maxCacheAge == "undefined") return cache.has(fullPath);

    const cached = cache.get(fullPath);
    if (!cached) return false;
    if (checkAge(cached, maxCacheAge)) return true;
    cache.delete(fullPath);
    return false;
  }

  return { set, get, has };
}

interface CachedFile<T> {
  write: (path: string, data: T) => FileWriteResult;
  read: (path: string, maxCacheAge?: number) => FileReadResult<T>;
  has: (path: string, maxCacheAge?: number) => boolean;
}

/**
 * Creates file read/write adapter with built-in caching
 * @param opts Object with `parse` and `serialize` functions, as well as optional `maxCacheAge`. Functions may be omitted for string data.
 * @returns Adapter
 */
export function createCachedFile<T>(opts: CachedFileOpts<T>): CachedFile<T>;
export function createCachedFile(
  opts: Partial<CachedFileOpts<string>>
): CachedFile<string>;
export function createCachedFile<T = string>(opts: Partial<CachedFileOpts<T>>) {
  const parse: FileParser<T> = opts?.parse || (v => v as T);
  const serialize: FileSerializer<T> = opts?.serialize || (v => v as string);
  const cache = createFileCache<T>();

  /**
   * Asynchronously serializes data and writes to file. Cache is updated with
   * the same data as well.
   * @param path Path pointing to the file
   * @param data Data to write to the file
   * @returns FileWriteResult
   */
  async function write(path: string, data: T): ReturnType<typeof writeFile<T>> {
    const res = await writeFile(path, data, serialize);
    if (!res.success) return res;
    cache.set(path, data);
    return res;
  }

  /**
   * Asynchronously reads and parses file. Taken from cache if available. File
   * is removed from cache if max cache age is exceeded.
   * @param path Path pointing to the file
   * @param maxCacheAge Optional override for max cache age in seconds
   * @returns FileReadResult
   */
  async function read(
    path: string,
    maxCacheAge?: number
  ): ReturnType<typeof readFile<T>> {
    const cached = cache.get(path, maxCacheAge ?? opts.maxCacheAge);
    if (cached) return { data: cached.data, success: true };

    const res = await readFile(path, parse);
    if (!res.success) return res;
    cache.set(path, res.data);
    return res;
  }

  /**
   * Checks if a file is currently cached. File is removed from cache if max
   * cache age is exceeded.
   * @param path Path pointing to the file
   * @param maxCacheAge Optional override for max cache age in seconds
   * @returns boolean
   */
  function has(path: string, maxCacheAge?: number) {
    return cache.has(path, maxCacheAge ?? opts.maxCacheAge);
  }

  return { write, read, has };
}
