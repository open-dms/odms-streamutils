import { Transform } from "node:stream";

const get = (propName: string) =>
  new Transform({
    objectMode: true,
    transform(chunk: Record<string, unknown>, _, callback) {
      callback(null, chunk[propName]);
    },
  });

export const props = { get };
