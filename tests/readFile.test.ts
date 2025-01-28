import { test } from "uvu";
import * as assert from "uvu/assert";
import { readFile } from "../src";
import { testJSON } from "./utils/testJSON";

console.assert(typeof testJSON == "object");

test("it succeeds on lorem.txt", async () => {
  const res = await readFile("tests/utils/lorem.txt");
  assert.ok(res.success, "file read succeeded");
  assert.not(res.error, "no error was returned");
  assert.type(res.data, "string", "content is correct type (string)");
  assert.is(res.data, "lorem ipsum dolor sit amet", "content is correct data");
});

test("it parses test.json", async () => {
  const res = await readFile("tests/utils/test.json", str => JSON.parse(str));
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
