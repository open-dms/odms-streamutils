import { afterEach, describe, expect, it, mock } from "bun:test";
import { finished } from "node:stream/promises";
import { redisWriteStream } from ".";

const mockClient = {
  connect: () => Promise.resolve(),
  on: () => {},
  xAdd: mock((key: string, id: string, message: Record<string, string>) =>
    Promise.resolve()
  ),
};

mock.module("redis", () => ({
  createClient: () => mockClient,
}));

describe("redis stream", () => {
  afterEach(() => {
    mockClient.xAdd.mockClear();
  });

  it("should write to redis", async () => {
    const stream = await redisWriteStream("redis://localhost", "stream_key");
    await finished(stream.end("test1"));
    expect(mockClient.xAdd).toHaveBeenCalled();
    expect(mockClient.xAdd.mock.lastCall).toEqual([
      "stream_key",
      "*",
      {
        message: "test1",
      },
    ]);
  });
});
