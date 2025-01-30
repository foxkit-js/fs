import { test } from "uvu";
import * as assert from "uvu/assert";
import type { FileReadResult } from "../src";
import { readFile } from "../src";
import { testJSON } from "./utils/testJSON";
import { sleep } from "./utils/sleep";

test("it succeeds on lorem.txt", async () => {
  const res = await readFile("tests/utils/lorem.txt");
  assert.ok(res.success, "file read succeeded");
  assert.not(res.error, "no error was returned");
  assert.type(res.data, "string", "content is correct type (string)");
  assert.is(res.data, "lorem ipsum dolor sit amet", "content is correct data");
});

test("it parses test.json (sync)", async () => {
  const res = await readFile("tests/utils/test.json", str => JSON.parse(str));
  assert.ok(res.success, "file read succeeded");
  assert.not(res.error, "no error was returned");
  assert.type(res.data, "object", "content was parsed");
  assert.equal(res.data, testJSON, "content was parsed correctly");
});

test("it parses test.json (async)", async () => {
  const res = await readFile("tests/utils/test.json", async str => {
    await sleep(25);
    return JSON.parse(str);
  });
  assert.ok(res.success, "file read succeeded");
  assert.not(res.error, "no error was returned");
  assert.type(res.data, "object", "content was parsed");
  assert.equal(res.data, testJSON, "content was parsed correctly");
});

test("it returns error if read fails", async () => {
  const res = await readFile("tests/utils/file-does-not-exist");
  assert.not(res.success, "file read failed");
  assert.not(res.data, "no data was returned");
  assert.ok(res.error instanceof Error);
});

test("it returns errors thrown in parser", async () => {
  const error = new Error("Hello Test");
  const res = await readFile("tests/utils/lorem.txt", data => {
    throw error;
    return data;
  });
  assert.not(res.success, "file read failed");
  assert.not(res.data, "no data was returned");
  assert.ok(res.error === error, "the thrown error was returned");
});

test.run();

/**
 * Test types
 */
// prettier-ignore
const _ = () => {
  // simple string use
  const _0 = readFile("") satisfies FileReadResult<string>;
  
  // string with parser should be allowed
  const _1 = readFile("", data =>
    data.toUpperCase()
  ) satisfies FileReadResult<string>;
  
  // parser should override return type
  const _2 = readFile("", data => data.split("\n")) satisfies FileReadResult<string[]>;
  const _3 = readFile("", data => data.split("\n")
    //@ts-expect-error
  ) satisfies FileReadResult<string>;
  
  // accepts async parser function
  const _4 = readFile("", async data => data.split("\n")) satisfies FileReadResult<string[]>;
  const _5 = readFile("", async data => data.split("\n")
    //@ts-expect-error
  ) satisfies FileReadResult<string>;
};
