import { Readable, Writable } from "node:stream";
import { createClient } from "redis";

const readQueueTimeout = 100;

export const redisWriteQueue = async ({
  url,
  channel,
}: {
  url: string;
  channel: string;
}) => {
  const client = createClient({ url });
  return new Writable({
    objectMode: true,
    async construct(callback) {
      client.on("error", (err) => this.emit("error", err));
      let error = null;
      try {
        await client.connect();
      } catch (cause) {
        error = Error("Failed to connect to redis client", { cause });
      }
      callback(error);
    },
    async destroy(_error, callback) {
      await client.quit();
      callback();
    },
    async write(message: unknown, _, callback) {
      let error = null;
      try {
        await client.rPush(
          channel,
          typeof message === "string" ? message : JSON.stringify(message)
        );
      } catch (cause: unknown) {
        error = new Error("Redis RPUSH error", { cause });
      }
      callback(error);
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
      let error = null;
      try {
        await client.connect();
      } catch (cause) {
        error = Error("Failed to connect to redis client", { cause });
      }
      callback(error);
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
            let value = null;
            try {
              value = JSON.parse(data.element);
            } catch (err) {
              value = data.element;
            }
            paused = !this.push(value);
          }
        }
      } catch (err) {
        this.emit("error", Error("Redis BRPOP error", { cause: err }));
      }
    },
  });
};
