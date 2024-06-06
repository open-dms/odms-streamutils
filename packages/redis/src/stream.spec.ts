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
    const stream = await redisWriteStream({
      url: "redis://localhost",
      channel: "stream_key",
    });
    stream.write({ testKey: "testValue" });
    stream.end("test1");
    await finished(stream);
    expect(mockClient.xAdd).toHaveBeenCalledTimes(2);
    expect(mockClient.xAdd.mock.calls[0]).toEqual([
      "stream_key",
      "*",
      {
        message: '{"testKey":"testValue"}',
      },
    ]);
    expect(mockClient.xAdd.mock.calls[1]).toEqual([
      "stream_key",
      "*",
      {
        message: "test1",
      },
    ]);
  });
});
