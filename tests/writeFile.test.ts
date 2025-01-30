import * as fs from "fs/promises";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { writeFile } from "../src";
import { sleep } from "./utils/sleep";

const filePath = "./__test__";

test.after.each(async () => {
  await fs.rm(filePath, { force: true });
});

test("it can write string to file", async () => {
  const content = "Hello World";
  const res = await writeFile(filePath, content);
  assert.ok(res.success, "write was successful");
  assert.not(res.error, "no error was returned");
  const stat = await fs.stat(filePath);
  assert.ok(stat.isFile(), "file was created");
  const writtenFileContent = await fs.readFile(filePath, "utf-8");
  assert.is(writtenFileContent, content, "correct content was written");
});

test("it can write json to file (sync)", async () => {
  const content = { foobar: true, bar: "baz" };
  const res = await writeFile(filePath, content, data =>
    JSON.stringify(data, null, 2)
  );
  assert.ok(res.success, "write was successful");
  assert.not(res.error, "no error was returned");
  const stat = await fs.stat(filePath);
  assert.ok(stat.isFile(), "file was created");
  const writtenFileContent = await fs.readFile(filePath, "utf-8");
  const parsedFileContent = JSON.parse(writtenFileContent);
  assert.equal(parsedFileContent, content, "correct content was written");
});

test("it can write json to file (async)", async () => {
  const content = { foobar: true, bar: "baz" };
  const res = await writeFile(filePath, content, async data => {
    await sleep(25);
    return JSON.stringify(data, null, 2);
  });
  assert.ok(res.success, "write was successful");
  assert.not(res.error, "no error was returned");
  const stat = await fs.stat(filePath);
  assert.ok(stat.isFile(), "file was created");
  const writtenFileContent = await fs.readFile(filePath, "utf-8");
  const parsedFileContent = JSON.parse(writtenFileContent);
  assert.equal(parsedFileContent, content, "correct content was written");
});

test("it transforms string data given transformer", async () => {
  const content = "hello world";
  const res = await writeFile(filePath, content, str => str.toUpperCase());
  assert.ok(res.success, "write was successful");
  assert.not(res.error, "no error was returned");
  const stat = await fs.stat(filePath);
  assert.ok(stat.isFile(), "file was created");
  const writtenFileContent = await fs.readFile(filePath, "utf-8");
  assert.is(
    writtenFileContent,
    content.toUpperCase(),
    "correct content was written"
  );
});

test("it returns error when it can't write", async () => {
  const res = await writeFile("tests/utils/dummy.txt/test", "Oopsie");
  assert.not(res.success, "write was not succesful");
  assert.ok(res.error instanceof Error, "an error was returned");
});

test.run();
