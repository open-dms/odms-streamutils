import { Writable } from "node:stream";
import { createClient } from "redis";

export const redisWriteStream = async (url: string, key: string) => {
  const client = createClient({ url });
  const stream = new Writable({
    objectMode: true,
    async construct(callback) {
      client.on("error", (err) => this.emit("error", err));
      try {
        await client.connect();
      } catch (err: unknown) {
        return callback(
          err instanceof Error
            ? err
            : Error("Failed to connect redis client", { cause: err })
        );
      }
      callback();
    },
    async write(message: string, _, callback) {
      try {
        await client.xAdd(key, "*", { message });
      } catch (err: unknown) {
        return callback(
          err instanceof Error ? err : Error("Redix XADD error", { cause: err })
        );
      }
      callback();
    },
  });
  return stream;
};
