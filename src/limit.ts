import { Transform, type TransformCallback } from "node:stream";

class LimitStream extends Transform {
  private limit = -1;
  private count = 0;

  constructor({ limit }: { limit?: number }) {
    super({ objectMode: true });
    this.limit = limit || -1;
  }

  _transform(chunk: any, _: BufferEncoding, callback: TransformCallback): void {
    if (this.limit === -1 || this.count < this.limit) {
      this.count++;
      return callback(null, chunk);
    }
    callback();
  }
}

export const limit = (limit: number) => new LimitStream({ limit });
