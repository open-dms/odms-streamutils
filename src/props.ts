import { Transform } from "node:stream";

/**
 * Transform chunkts of type `Record<string, unknown>`, picking a prop.
 *
 * ```ts
 * const stream = props.get('foo');
 * stream.on('data', (data: string) => console.log(data));
 * stream.end({ foo: 'bar' });
 * // bar
 * ```
 */
const get = (propName: string) =>
  new Transform({
    objectMode: true,
    transform(chunk: Record<string, unknown>, _, callback) {
      callback(null, chunk[propName]);
    },
  });

export const props = { get };
