import { test } from "uvu";
import * as assert from "uvu/assert";
import { isDirectory } from "../src";

test("it finds directories", async () => {
  assert.ok(await isDirectory("tests/utils"));
});

test("it returns false for files", async () => {
  assert.not(await isDirectory("tests/utils/dummy.txt"));
});

test("it returns false for missig directory", async () => {
  assert.not(await isDirectory("tests/utils/file_does_not_exist"));
});

test.run();
