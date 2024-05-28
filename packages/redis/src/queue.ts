import { Readable, Writable } from "node:stream";
import { createClient } from "redis";

export const redisWriteQueue = async (url: string, channel: string) => {
  const client = createClient({ url });
  return new Writable({
    objectMode: true,
    async construct(callback) {
      client.on("error", (err) => this.emit("error", err));
      try {
        await client.connect();
      } catch (err_1) {
        callback(
          err_1 instanceof Error
            ? err_1
            : Error("Failed to connect redis client", { cause: err_1 })
        );
      }
      callback();
    },
    async write(message: string, _, callback) {
      try {
        await client.rPush(channel, message);
      } catch (err: unknown) {
        return callback(
          err instanceof Error
            ? err
            : Error("Redis RPUSH error", { cause: err })
        );
      }
    },
  });
};

export const redisReadQueue = async ({
  url,
  channel,
  signal,
}: {
  url: string;
  channel: string;
  signal?: AbortSignal;
}) => {
  let controller: AbortController;
  const client = createClient({ url });

  return new Readable({
    objectMode: true,
    async construct(callback) {
      client.on("error", (err) => this.emit("error", err));
      if (!signal) {
        controller = new AbortController();
        signal = controller.signal;
      }
      signal.onabort = () => this.push(null);
      try {
        await client.connect();
        callback();
      } catch (err) {
        callback(Error("Failed to connect to redis client", { cause: err }));
      }
    },
    async destroy(_error, callback) {
      let error = null;
      if (!signal?.aborted) {
        if (controller) {
          controller.abort();
        } else {
          error = Error(
            "Before destroying the stream, send the abort signal first."
          );
        }
      }

      await client.quit();
      callback(error);
    },
    async read() {
      try {
        let paused = false;
        while (!paused && !signal?.aborted) {
          const data = await client.brPop(channel, readQueueTimeout / 1000);
          if (data) {
            paused = !this.push(data.element);
          }
        }
      } catch (err) {
        this.emit("error", Error("Redis BRPOP error", { cause: err }));
      }
    },
  });
};
