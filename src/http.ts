import { Transform } from "node:stream";

export const http = {
  /**
   * Transform chunks of type `Request`, fetches and produces chunks of type `Response`.
   *
   * ```ts
   * const stream = http.fetch();
   * stream.on('data', async (response: Response) => console.log(await response.text()));
   * stream.end(new Request("https://example.com"));
   * // outputs some text from example.com
   * ```
   */
  fetch: () =>
    new Transform({
      objectMode: true,
      async transform(request: Request, _, callback) {
        const start = Date.now();

        let error;
        let response: Response | undefined;

        try {
          response = await fetch(request);
          this.emit("response", {
            request,
            response,
            responseTime: Date.now() - start,
          });
        } catch (err) {
          error = err instanceof Error ? err : new Error(String(err));
        }

        callback(error, response);
      },
    }),
};
