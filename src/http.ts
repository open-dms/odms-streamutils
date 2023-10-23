import { Transform } from "node:stream";

export const http = {
  fetch: () =>
    new Transform({
      objectMode: true,
      async transform(request: Request, _, callback) {
        const start = Date.now();

        let error;
        let response;

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
