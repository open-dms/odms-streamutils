import { Transform } from "node:stream";

export const toString = () =>
  new Transform({
    readableObjectMode: true,
    transform: (chunk: Buffer, _, callback) => {
      callback(null, chunk.toString("utf8"));
    },
  });
