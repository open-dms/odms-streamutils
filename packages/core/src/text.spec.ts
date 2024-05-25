import { describe, expect, it } from "bun:test";
import { join, newline, split } from "./";

describe("split", () => {
  it("should split chunks", () => {
    const result: Array<string> = [];
    const stream = split(",");
    stream.on("data", (data: string) => result.push(data));
    stream.end("Erfurt , , Ansbach");

    expect(result).toEqual(["Erfurt", "Ansbach"]);
  });

  it("should join chunks", () => {
    const stream = join().end(["foo", "bar"]);
    expect(stream.read()).toBe("foo\nbar");
  });

  it("should add a newline", () => {
    const stream = newline().end("test");
    expect(stream.read()).toBe("test\n");
  });
});
