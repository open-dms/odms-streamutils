import { Transform } from "node:stream";
import type { TransformCallback } from "stream";
import { getMedian } from "./util";

export type ThrottleTimeAdjustMethod = (
  baseThrottleTime: number,
  reportedTimes: Array<number>
) => number;

export interface ThrottleStreamOptions {
  throttleTime?: number;
  throttleTimeAdjustMethod?: ThrottleTimeAdjustMethod;
}

function defaultThrottleTimeAdjustMethod(
  baseThrottleTime: number,
  reportedTimes: Array<number>
): number {
  return Math.max(baseThrottleTime, getMedian(reportedTimes) || 0);
}

class ThrottleStream extends Transform {
  private timeout?: Timer;
  private pushImmediate = true;
  private baseThrottleTime: number;
  private reportedTimes: Array<number> = [];
  private throttleTimeAdjustMethod: ThrottleTimeAdjustMethod;

  constructor(options?: ThrottleStreamOptions) {
    super({ objectMode: true });
    this.baseThrottleTime = options?.throttleTime || 1000;
    this.throttleTimeAdjustMethod =
      options?.throttleTimeAdjustMethod || defaultThrottleTimeAdjustMethod;
  }

  public get throttleTime() {
    return this.throttleTimeAdjustMethod(
      this.baseThrottleTime,
      this.reportedTimes
    );
  }

  public report(time: number) {
    this.reportedTimes = this.reportedTimes.concat(time).slice(-10);
  }

  async _transform(
    data: any,
    _: BufferEncoding,
    callback: TransformCallback
  ): Promise<void> {
    if (this.pushImmediate) {
      this.pushImmediate = false;
      callback(null, data);
      return;
    }

    this.timeout = setTimeout(() => {
      clearTimeout(this.timeout);
      delete this.timeout;
      callback(null, data);
    }, this.throttleTime);
  }
}

/**
 * Returns a `ThrottleStream` initialized with `options`.
 *
 * Passes input chunks only after `throttleTime` has elapsed. `throttleTime`
 * only functions as a base timeout. Using `throttleTimeAdjustMethod`, it's
 * possible to adjust the timeout according to some factors. This way it's
 * possible to handle back pressure.
 *
 * For implementation options of `throttleTimeAdjustMethod`, refer to
 * `defaultThrottleTimeAdjustMethod`.
 *
 * ```ts
 * const timer = throttle({ throttleTime: 300 });
 * ```
 */
export const throttle = (options?: ThrottleStreamOptions) =>
  new ThrottleStream(options);
