import { Transform } from "node:stream";

export const split = (delimiter: string) => {
  const stream = new Transform({
    readableObjectMode: true,
    transform: (chunk: Buffer, _, callback) => {
      chunk
        .toString("utf8")
        .split(delimiter)
        .filter((str) => str.length > 0)
        .map((str) => str.trim())
        .forEach((str) => stream.push(str));
      callback();
    },
  });
  return stream;
};
