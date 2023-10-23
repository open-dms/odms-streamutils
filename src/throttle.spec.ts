import { throttle } from ".";
import { describe, expect, it, vi } from "vitest";

vi.useFakeTimers();

describe("TimerStream", () => {
  it("should throttle", async () => {
    const result: Array<string> = [];
    const throttleTime = 1500;

    const stream = throttle({ throttleTime });
    stream.write("data-1");
    stream.write("data-2");
    stream.end("data-3");

    stream.on("data", (data) => {
      result.push(data);
    });

    await new Promise((resolve) => stream.once("data", resolve));
    expect(result).toHaveLength(1);

    vi.advanceTimersByTime(throttleTime / 2);
    expect(result).toHaveLength(1);
    vi.advanceTimersByTime(throttleTime / 2);
    expect(result).toHaveLength(2);

    vi.advanceTimersByTime(throttleTime);
    expect(result).toHaveLength(3);

    await new Promise((resolve) => stream.on("end", resolve));

    expect(result).toEqual(["data-1", "data-2", "data-3"]);
  });

  it("should adjust throttling time based on reprted times", () => {
    const stream = throttle({ throttleTime: 1500 });
    expect(stream.throttleTime).toBe(1500);
    stream.report(3000);
    expect(stream.throttleTime).toBe(3000);
    stream.report(2800);
    stream.report(2700);
    stream.report(1900);
    stream.report(1400);
    stream.report(1200);
    stream.report(800);
    stream.report(700);
    stream.report(1000);
    expect(stream.throttleTime).toBe(1500);
  });

  it("should adjust throttling", async () => {
    const result: Array<string> = [];
    const throttleTime = 1500;

    const stream = throttle({ throttleTime });
    stream.write("data-1");
    stream.write("data-2");
    stream.end("data-3");

    stream.on("data", (data) => {
      result.push(data);
    });

    await new Promise((resolve) => stream.once("data", resolve));
    expect(result).toHaveLength(1);

    stream.report(3000);

    vi.advanceTimersByTime(1500);
    expect(result).toHaveLength(2);
    vi.advanceTimersByTime(1500);
    expect(result).toHaveLength(2);

    vi.advanceTimersByTime(1500);
    expect(result).toHaveLength(3);

    await new Promise((resolve) => stream.on("end", resolve));
  });
});
