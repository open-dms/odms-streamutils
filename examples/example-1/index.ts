import { json, split, toString } from "@repo/core";
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
