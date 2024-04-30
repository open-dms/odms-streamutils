import { run } from "node-jq";
import { Transform } from "node:stream";

/**
 * Transform the stream using `jq`.
 *
 * Example:
 *
 * ```ts
 * import { jq } from "@odms/streamutils";
 * pipeline(process.stdin, jq(".filter[].items"), process.out);
 * ```
 *
 * Thanks to [node-js](https://www.npmjs.com/package/node-jq). For filter syntax, refer to the [jq manual](https://jqlang.github.io/jq/).
 *
 * @param filter filter used to work on the json
 */
export const jq = (filter: string) =>
  new Transform({
    objectMode: true,
    async transform(chunk, _, callback) {
      try {
        const data = await run(filter, chunk, {
          input: typeof chunk === "string" ? "string" : "json",
          output: "compact",
        });
        callback(null, data);
      } catch (err: unknown) {
        callback(
          err instanceof Error
            ? err
            : new Error("Error running jq filter", { cause: err })
        );
      }
    },
  });
