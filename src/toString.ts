import { Transform } from "node:stream";

/**
 * Transforms the input Buffer to string.
 */
export const toString = () =>
  new Transform({
    readableObjectMode: true,
    transform: (chunk: Buffer, _, callback) => {
      callback(null, chunk.toString("utf8"));
    },
  });
