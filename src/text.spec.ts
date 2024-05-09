import { describe, expect, it } from "bun:test";
import { split } from "./";

describe("split", () => {
  it("should split chunks", () => {
    const result: Array<string> = [];
    const stream = split(",");
    stream.on("data", (data: string) => result.push(data));
    stream.end("Erfurt , , Ansbach");

    expect(result).toEqual(["Erfurt", "Ansbach"]);
  });
});
