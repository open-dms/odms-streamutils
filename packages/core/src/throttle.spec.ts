import { describe, expect, it } from "bun:test";
import { fakeTimers } from "@repo/test";
import { throttle } from ".";

const clock = fakeTimers();

describe("TimerStream", () => {
  it("should throttle", async () => {
    const result: Array<string> = [];
    const throttleTime = 1500;

    const stream = throttle({ throttleTime });

    stream.on("data", (data) => {
      result.push(data);
    });

    const streamEnded = new Promise((resolve) => stream.on("end", resolve));

    stream.write("data-1");
    stream.write("data-2");
    stream.end("data-3");

    expect(result).toHaveLength(1);

    clock.tick(throttleTime / 2);
    expect(result).toHaveLength(1);
    clock.tick(throttleTime / 2);
    expect(result).toHaveLength(2);

    clock.tick(throttleTime);
    expect(result).toHaveLength(3);

    // assert stream has ended
    expect(streamEnded).resolves.toBeUndefined();

    expect(result).toEqual(["data-1", "data-2", "data-3"]);
    await streamEnded;
  });

  it("should adjust throttling time based on reported times", () => {
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

    stream.on("data", (data) => {
      result.push(data);
    });

    const streamEnded = new Promise((resolve) => stream.on("end", resolve));

    stream.write("data-1");
    stream.write("data-2");
    stream.end("data-3");

    expect(result).toHaveLength(1);

    stream.report(3000);

    clock.tick(1500);
    expect(result).toHaveLength(2);
    clock.tick(1500);
    expect(result).toHaveLength(2);
    clock.tick(1500);
    expect(result).toHaveLength(3);

    // assert stream has ended
    expect(streamEnded).resolves.toBeUndefined();
  });
});
