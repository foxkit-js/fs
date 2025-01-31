# Checks

`isFile` and `isDirectory` are used to check whether there is a file or directory at a given path:

```ts
import { isDirectory, isFile } from "@foxkit/fs";

await isDirectory("assets"); // boolean
await isFile("./assets/picture.png"); // boolean
```

Note: Errors are not passed by these functions!
