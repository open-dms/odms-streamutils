import { Transform } from "node:stream";

export const split = (delimiter: string) => {
  const stream = new Transform({
    objectMode: true,
    transform: (chunk: string, _, callback) => {
      chunk
        .split(delimiter)
        .map((str) => str.trim())
        .filter((str) => str.length > 0)
        .forEach((str) => stream.push(str));
      callback();
    },
  });
  return stream;
};
