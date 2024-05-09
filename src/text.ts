import { Transform } from "node:stream";

/**
 * Transforms chunks by splitting using a `delimiter`.
 *
 * The output chunks are automatically filtered and trimmed.
 *
 * ```ts
 * const stream = split(',');
 * stream.on('data', (data: string) => console.log(data));
 * stream.end('Erfurt , , Ansbach');
 * // Erfurt
 * // Ansbach
 * ```
 */
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

/**
 * Transform chunks of type array into strings.
 *
 */
export const join = (delimiter = "\n") =>
  new Transform({
    objectMode: true,
    transform(chunk: Array<unknown>, _, callback) {
      callback(null, chunk.join(delimiter));
    },
  });

/**
 * Transforms chunks adding newline at the end.
 *
 */
export const newline = () =>
  new Transform({
    objectMode: true,
    transform(chunk, _, callback) {
      callback(null, chunk + "\n");
    },
  });
