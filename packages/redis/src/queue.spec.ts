import { afterEach, describe, expect, it, mock } from "bun:test";
import { finished } from "node:stream/promises";
import { redisWriteQueue } from ".";

const mockClient = {
  connect: () => Promise.resolve(),
  on: () => {},
  rPush: mock((key: string, message: string) => Promise.resolve()),
};

mock.module("redis", () => ({
  createClient: () => mockClient,
}));

describe("redis queue", () => {
  afterEach(() => {
    mockClient.rPush.mockClear();
  });

  it("should write to redis", async () => {
    const stream = await redisWriteQueue("redis://localhost", "stream_key");
    await finished(stream.end("test1"));
    expect(mockClient.rPush).toHaveBeenCalled();
    expect(mockClient.rPush.mock.lastCall).toEqual(["stream_key", "test1"]);
  });
});
