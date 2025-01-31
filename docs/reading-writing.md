# Reading and Writing

## readFile

Asynchronously reads a file and optionally applies a Parser function.

```ts
import { readFile } from "@foxkit/fs";

const str = await readFile("your-file.txt");
//    ^? FileReadResult<string>

const data = await readFile("your-file.txt", file => file.split("\n"));
//    ^? FileReadResult<string[]>
```

### FileReadResult

`FileReadResult` is an object describing the result of a file read. Always contains `success` property. If successful the read/parsed data is available in the `data` property, otherwise the error that occurred can be found in the `error` property.

```ts
const res = await readFile("your-file.txt");
if (res.success) {
  const data = res.data;
  //    ?^ string
} else {
  console.error(data.error); // print error
}
```

### Usage with `JSON.parse`

As `JSON.parse` returns `any` as its result you can use a generic to override the return type your parser function:

```ts
const res = await readFile<ExampleType>("example.json", file =>
  JSON.parse(file)
);
if (!res.success) throw res.error;
res.data;
//   ^?  ExampleType
```

## writeFile

Asynchronously writes any data to file. Non-string data must be supplied with a serialiser function. Directories are created as needed.

```ts
import { writeFile } from "@foxkit/fs";

const str = await writeFile("your-file.txt", "Hello, World!");
//    ^? FileWriteResult

const values = ["some", "values", "in", "an", "Array"];
const data = await writeFile("values.csv", values, data => data.join(","));
//    ^? FileWriteResult
```

### FileWriteResult

`FileWriteResult` is an object describing the result of a file write. Always contains `success` property. If unsuccessful the error that occured can be found in the `error` property.

```ts
const values = ["some", "values", "in", "an", "Array"];
const data = await writeFile("values.csv", values, data => data.join(","));

if (!res.success) {
  data.error; // now contains whatever was thrown
}
```
