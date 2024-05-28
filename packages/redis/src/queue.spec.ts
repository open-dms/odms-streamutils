import { nextTick } from "@repo/test";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { finished } from "node:stream/promises";
import { redisReadQueue, redisWriteQueue } from ".";

const mockClient = {
  connect: mock(() => Promise.resolve()),
  on: () => {},
  quit: () => Promise.resolve(),
  rPush: mock().mockResolvedValue(undefined),
  brPop: mock().mockResolvedValue(undefined),
};

mock.module("redis", () => ({
  createClient: () => mockClient,
}));

describe("redis", () => {
  afterEach(() => {
    mockClient.connect.mockReset();
    mockClient.rPush.mockClear();
  });

  describe("write queue", () => {
    it("should write to queue", async () => {
      const stream = await redisWriteQueue({
        url: "redis://localhost",
        channel: "queue_key",
      });
      await finished(stream.end("test1"));
      expect(mockClient.rPush).toHaveBeenCalled();
      expect(mockClient.rPush.mock.lastCall).toEqual(["queue_key", "test1"]);
    });

    it("should handle connection error", async () => {
      mockClient.connect.mockRejectedValueOnce(Error("Connection error"));
      const stream = await redisWriteQueue({
        url: "redis://localhost",
        channel: "queue_key",
      });
      await nextTick();
      expect(stream.errored).toBeInstanceOf(Error);
      expect(stream.errored?.message).toBe("Failed to connect to redis client");
      expect(stream.errored?.cause).toEqual(Error("Connection error"));
    });

    it("should handle write error", async () => {
      mockClient.rPush.mockImplementationOnce(() =>
        Promise.reject(Error("Some redis error"))
      );

      const stream = await redisWriteQueue({
        url: "redis://localhost",
        channel: "queue_key",
      });

      expect(finished(stream.end("test"))).rejects.toHaveProperty(
        "cause.message",
        "Some redis error"
      );
    });
  });

  describe("read queue", () => {
    it("should read from queue", async () => {
      const stream = await redisReadQueue({
        url: "redis://localhost",
        channel: "queue_key",
      });
      const response: Array<string> = [];

      stream.on("data", (data) => {
        response.push(data);
        stream.push(null);
      });

      mockClient.brPop.mockResolvedValueOnce({
        key: "queue_key",
        element: "response1",
      });

      await finished(stream);
      expect(response).toEqual(["response1"]);
    });

    it("should handle connection error", async () => {
      mockClient.connect.mockRejectedValueOnce(Error("Connection error"));
      const stream = await redisReadQueue({
        url: "redis://localhost",
        channel: "queue_key",
      });
      await nextTick();
      expect(stream.errored?.message).toBe("Failed to connect to redis client");
      expect(stream.errored).toBeInstanceOf(Error);
      expect(stream.errored?.cause).toEqual(Error("Connection error"));
    });

    it("should throw if abort signal is not sent before destroying", async () => {
      const controller = new AbortController();
      const stream = await redisReadQueue({
        url: "redis://localhost",
        channel: "queue_key",
        signal: controller.signal,
      });

      stream.destroy();
      expect(finished(stream)).rejects.toThrowError();
    });

    it("should abort", async () => {
      const controller = new AbortController();
      const stream = await redisReadQueue({
        url: "redis://localhost",
        channel: "queue_key",
        signal: controller.signal,
      });

      stream.resume();
      controller.abort();
      await finished(stream);
      expect(stream.closed).toBeTrue();
    });

    it("should handle read error", async () => {
      mockClient.brPop.mockImplementationOnce(() =>
        Promise.reject(Error("Some redis error"))
      );

      const stream = await redisReadQueue({
        url: "redis://localhost",
        channel: "queue_key",
      });

      expect(finished(stream.resume())).rejects.toHaveProperty(
        "cause.message",
        "Some redis error"
      );
    });
  });
});
