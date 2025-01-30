import { readFile } from "./readFile";
import type { FileReadResult } from "./readFile";
import { writeFile } from "./writeFile";

/* readFile */
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

/* writeFile */
// simple string use
writeFile("path", "data");

// string with serializer should be allowed
writeFile("path", "data", data => data.toUpperCase());

// expect error with non-string data and missing serializer
writeFile(
  "path",
  //@ts-expect-error
  { data: "as object" }
);

// non-string data with serializer should be fine
writeFile("path", { data: "as object" }, data => JSON.stringify(data));

// non-string data with async serializer should be fine
writeFile("path", { data: "as object" }, async data => JSON.stringify(data));
