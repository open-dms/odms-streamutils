import { Transform } from "node:stream";

/**
 * Transform each chunk using `JSON.parse()`.
 *
 * ```ts
 * const stream = json.parse();
 * stream.on('data', (data) => console.log(data));
 * stream.write('{"a":"foo"}');
 * stream.end('{"b":"bar"}');
 * // produces:
 * // { a: 'foo' }
 * // { b: 'bar' }
 * ```
 */
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

/**
 * Transform each chunk with `JSON.stringify`, appending a newline.
 *
 * ```ts
 * const stream = json.toLines();
 * stream.on('data', (data) => console.log(data));
 * stream.write({ a: 'foo' });
 * stream.end({ b: 'bar' });
 * // produces:
 * // {"a":"foo"}\n
 * // {"b":"bar"}\n
 * ```
 */
const toLines = () =>
  new Transform({
    writableObjectMode: true,
    transform(chunk: string, _, callback) {
      callback(null, JSON.stringify(chunk) + "\n");
    },
  });

export const json = { parse, toLines };
