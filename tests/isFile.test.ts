import { test } from "uvu";
import * as assert from "uvu/assert";
import { isFile } from "../src";

test("it finds files", async () => {
  assert.ok(await isFile("tests/utils/dummy.txt"));
});

test("it returns false for directory", async () => {
  assert.not(await isFile("tests/utils"));
});

test("it returns false for missig file", async () => {
  assert.not(await isFile("tests/utils/file_does_not_exist"));
});

test.run();
