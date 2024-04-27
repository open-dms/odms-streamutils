![Bun Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fopen-dms%2Fodms-streamutils%2Fmain%2Fpackage.json&query=%24.engines.bun&logo=bun&logoColor=%23f9f1e1&label=Bun&color=%23f9f1e1)
![Typescript Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fopen-dms%2Fodms-streamutils%2Fmain%2Fpackage.json&query=%24.devDependencies.typescript&label=Typescript)
![Coverage](https://raw.githubusercontent.com/open-dms/odms-streamutils/gh-pages/coverage.svg)

# Streamutils

A collection of simple stream implementations for building data pipelines.

## Usage

> check out this example here: [examples/example-1](./examples/example-1)

Let's say you have some input tokens in this form:

_token.txt_

```plain
"Erfurt"
"Ansbach"
```

You then build your pipeline like this:

```typescript
import { json, split, toString } from "@odms/streamutils";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

pipeline(
  process.stdin,
  toString(),
  split("\n"),
  json.parse(),

  // turn each chunk into an object with property 'city'
  new Transform({
    objectMode: true,
    transform: (city: string, _, callback) => {
      callback(null, { city });
    },
  }),

  json.toLines(),
  process.stdout
);
```

Explanation:

- process.stdin &ndash; read from stdin
- toString &ndash; convert input Buffer into string
- split &ndash; split the input chunk into multiple chunks using newline
- json.parse &ndash; remove outer double quotes
- _... here comes your custom stream ..._
- json.toLines &ndash; stringify into line-json
- process.stdout &ndash; write to stdout

Run pipeline:

```bash
# cd examples/example-1
# bun install
cat token.txt | bun index.ts
```

This will produce this output:

```plain
{"city":"Erfurt"}
{"city":"Ansbach"}
```

---

<center>Proudly developing with <a href="https://bun.sh/"><img alt="Bun typescript runtime" src="https://bun.sh/logo-square.png" height="24px" style="vertical-align: bottom;" /> Bun</a></center>
