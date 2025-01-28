import { readFile } from "./readFile";
import type { FileReadResult } from "./readFile";
import { writeFile } from "./writeFile";

/* readFile */
// simple string use
const _0 = readFile("") satisfies FileReadResult<string>;

// string with transformer should be allowed
const _1 = readFile("", data =>
  data.toUpperCase()
) satisfies FileReadResult<string>;

// transformer should override return type
const _2 = readFile("", data => data.split("\n")) satisfies FileReadResult<string[]>;
const _3 = readFile("", data => data.split("\n")
  //@ts-expect-error
) satisfies FileReadResult<string>;

/* writeFile */
// simple string use
writeFile("path", "data");

// string with transformer should be allowed
writeFile("path", "data", data => data.toUpperCase());

// expect error with non-string data and missing transformer
writeFile(
  "path",
  //@ts-expect-error
  { data: "as object" }
);

// non-string data with transformer should be fine
writeFile("path", { data: "as object" }, data => JSON.stringify(data));
