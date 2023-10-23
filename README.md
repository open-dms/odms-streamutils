# Streamutils

A collection of simple stream implementations for building data pipelines.

## Usage

For instance, you may want to use these utility streams for building your pipeline:

```typescript
import { http, json, split, throttle, toString } from "@odms/streamutils";
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
