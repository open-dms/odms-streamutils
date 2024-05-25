import { Writable } from "node:stream";
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
      callback();
    },
  });
};
