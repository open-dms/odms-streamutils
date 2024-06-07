import { createClient } from "redis";
import { RedisWritable } from "./lib/stream";

export const redisWriteStream = async ({
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
        await client.xAdd(channel, "*", {
          message:
            typeof message === "string" ? message : JSON.stringify(message),
        });
      } catch (cause) {
        error = new Error("Redix XADD error", { cause });
      }
      callback(error);
    },
  });
};
