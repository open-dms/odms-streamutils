import { createClient } from "redis";
import { RedisReadable, RedisWritable } from "./lib/stream";

const readQueueTimeout = 100;

export const redisWriteQueue = async ({
  url,
  channel,
}: {
  url: string;
  channel: string;
}) => {
  const client = createClient({ url });
  return new RedisWritable({
    client,
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
  const client = createClient({ url });
  return new RedisReadable({
    client,
    signal,
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
