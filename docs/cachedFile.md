# Cached File Adapter

The cached file adapter combines [`readFile` and `writeFile`](./reading-writing.md) into one adapter with caching capability:

```ts
import { createCachedFile } from "@foxkit/fs";

const valuesFile = createCachedFile({
  parse: file => file.split(","),
  serialize: data => data.join(",")
});
const values: string[] = ["some", "values", "in", "an", "Array"];

// write to file
const writeRes = await valuesFile.write("values.csv", values);
if (!writeRes.success) throw writeRes.error;

// is the file cached now?
if (!valuesFile.has("values.csv")) {
  throw new Error("Didn't cache?");
}

// read the file again
const readRes = await valuesFile.read("values.csv");
if (!readRes.success) throw readRes.error;

readRes.data;
//      ^? string[]
```

## Maximum Cache Age

The lifespan of a file in the internal cache can be declared as either the `maxCacheAge` property or passed as a parameter to the `read` and `has` method.

Should a file exceed either this value, it will be purged from the cache and re-read if needed:

```ts
// continues above example, assumes more than 5 seconds have passed
readRes.data === values; // true, data was retrieved from cache

valuesFile.has("values.csv", 3); // false, the cached file was older than 3 seconds and was purged from the cache

const newRead = await valuesFile.read("values.csv");
if (!newRead.success) throw newRead.error;

newRead.data === values; // false, data was read from file
```

If no `maxCacheAge` is given, or a negative number was passed, the cache age check is skipped and files remain cached forever.

## Methods

- `CachedFile.write(path: string, data: T)`: Asynchronously serializes data and writes to file. Cache is updated with the same data as well.
- `CachedFile.read(path: string, maxCacheAge?: number)`: Asynchronously reads and parses file. Taken from cache if available. File is removed from cache if max cache age is exceeded.
- `CachedFile.has(path: string, maxCacheAge?: number)`: Checks if a file is currently cached. File is removed from cache if max cache age is exceeded.
