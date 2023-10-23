import { Transform } from "node:stream";

const parse = () =>
  new Transform({
    objectMode: true,
    transform(chunk: string, _, callback) {
      try {
        callback(null, JSON.parse(chunk));
      } catch (err) {
        const error = new Error(`Error parsing chunk '${chunk}'`, {
          cause: {
            chunk,
            err: err instanceof Error ? err : new Error(String(err)),
          },
        });
        callback(error);
      }
    },
  });

const toLines = () =>
  new Transform({
    writableObjectMode: true,
    transform(chunk: string, _, callback) {
      callback(null, JSON.stringify(chunk) + "\n");
    },
  });

export const json = { parse, toLines };
