![Bun Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fopen-dms%2Fodms-streamutils%2Fmain%2Fpackage.json&query=%24.devDependencies.bun&logo=bun&logoColor=%23f9f1e1&label=Bun&color=%23f9f1e1)
![Typescript Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fopen-dms%2Fodms-streamutils%2Fmain%2Fpackage.json&query=%24.devDependencies.typescript&label=Typescript)
![Coverage](https://raw.githubusercontent.com/open-dms/odms-streamutils/gh-pages/coverage.svg)

# Streamutils

A collection of simple stream implementations for building data pipelines.

## Usage

For instance, you may want to use these utility streams for building your pipeline:

```typescript
import { json, split, toString } from "@odms/streamutils";
import { pipeline } from "node:stream";

pipeline(
  process.stdin,
  toString(),
  split("\n"),
  json.parse(),
  // ... do some work here
  json.toLines(),
  process.stdout
);
```
