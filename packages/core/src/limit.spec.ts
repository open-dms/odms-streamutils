import { describe, expect, it } from "bun:test";
import { limit } from "./limit";

describe("limit", () => {
  it("should limit the stream items", async () => {
    const results: Array<number> = [];
    const stream = limit(2).on("data", (data) => results.push(data));
    stream.write(1);
    stream.write(2);
    stream.end(3);

    expect(results).toEqual([1, 2]);
  });
});
