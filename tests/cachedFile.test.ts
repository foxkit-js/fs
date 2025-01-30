import * as fs from "fs/promises";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { createCachedFile } from "../src/cachedFile";
import type { FileReadResult } from "../src";
import { testJSON } from "./utils/testJSON";
import { sleep } from "./utils/sleep";

const file = createCachedFile<unknown>({
  parse: data => JSON.parse(data),
  serialize: data => JSON.stringify(data),
  maxCacheAge: 9999999999
});

const filePath = "./__test__";

test.after(async () => {
  await fs.rm(filePath, { force: true });
});

test("it stores data in cache", async () => {
  const res = await file.write(filePath, testJSON);
  assert.ok(res.success, "file write succeeded");
  assert.ok(file.has(filePath), "file is in cache");
  assert.is(
    (await file.read(filePath)).data,
    testJSON,
    "returns the same object from cache"
  );
});

test("it respects max-age", async () => {
  assert.ok(file.has(filePath), "file is in cache from previous test");
  await sleep(1501);
  assert.not(
    file.has(filePath, 1),
    "file is gone after over a second with max age of 1"
  );
});

test("it reads non-stored file", async () => {
  assert.not(file.has(filePath), "file is not in cache after previous test");
  const res = await file.read(filePath);
  assert.ok(res.success, "file read succeeded");
  assert.equal(res.data, testJSON, "file was parsed correctly");
  assert.ok(file.has(filePath), "file is in cache again");
});

test("it return FileWriteResult with error", async () => {
  const badPath = "tests/utils/file-does-not-exist";
  const res = await file.read(badPath);
  assert.not(res.success, "file read failed");
  assert.not(res.data, "no data was returned");
  assert.ok(res.error instanceof Error, "error was returned");
  assert.not(file.has(badPath), "nothing was put into cache");
});

test.run();

/**
 * Test types
 */
// prettier-ignore
const _ = () => {
  const _fileString = createCachedFile({});
  const _fileArr = createCachedFile({
    parse: (data) => data.split(","),
    serialize: (data) => data.join(",")
  });

  // file reads have correct types
  const _0 = _fileString.read("") satisfies FileReadResult<string>;
  const _1 = _fileArr.read("") satisfies FileReadResult<string[]>;
  // @ts-expect-error
  const _2 = _fileArr.read("") satisfies FileReadResult<string>;

  // explodes when types of parser and serializer don't match
  const _3 = createCachedFile(
    // @ts-expect-error
    { parse: data => data.split(","), serialize: (data: Record<string, string>) => JSON.stringify(data) }
  )

  // can still put maxCacheAge when T is string
  const _4 = createCachedFile({ maxCacheAge: 42 })
}
