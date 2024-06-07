import {
  Readable,
  Writable,
  type ReadableOptions,
  type WritableOptions,
} from "node:stream";
import type { createClient } from "redis";

/**
 * Adds commom stream options for redis write streams.
 *
 */
export class RedisWritable extends Writable {
  client: ReturnType<typeof createClient>;

  constructor(
    options: WritableOptions & {
      client: ReturnType<typeof createClient>;
    }
  ) {
    super({ objectMode: true });
    this.client = options.client;
    if (options.write) {
      this._write = options.write?.bind(this);
    }
  }

  async _construct(
    callback: (error?: Error | null | undefined) => void
  ): Promise<void> {
    this.client.on("error", (err) => this.emit("error", err));
    let error = null;
    try {
      await this.client.connect();
    } catch (cause) {
      error = Error("Failed to connect to redis client", { cause });
    }
    callback(error);
  }

  async _destroy(
    error: Error | null,
    callback: (error?: Error | null | undefined) => void
  ): Promise<void> {
    await this.client.quit();
    callback();
  }
}

/**
 * Adds commom stream options for redis read streams.
 *
 * Creates an internal abort controller, if no external signal is
 * given. If using an external controller and signal, make sure to abort
 * before shutting down the stream.
 *
 */
export class RedisReadable extends Readable {
  client: ReturnType<typeof createClient>;
  controller?: AbortController;
  signal: AbortSignal;

  constructor({
    client,
    signal,
    ...options
  }: ReadableOptions & {
    client: ReturnType<typeof createClient>;
    signal?: AbortSignal;
  }) {
    super({
      objectMode: true,
      ...options,
    });
    this.client = client;
    if (signal) {
      this.signal = signal;
    } else {
      this.controller = new AbortController();
      this.signal = this.controller.signal;
    }
    if (options.read) {
      this._read = options.read?.bind(this);
    }
  }

  async _construct(
    callback: (error?: Error | null | undefined) => void
  ): Promise<void> {
    this.client.on("error", (err) => this.emit("error", err));
    this.signal.onabort = () => this.push(null);
    let error = null;
    try {
      await this.client.connect();
    } catch (cause) {
      error = Error("Failed to connect to redis client", { cause });
    }
    callback(error);
  }

  async _destroy(
    cause: Error | null,
    callback: (error?: Error | null | undefined) => void
  ): Promise<void> {
    let error = null;
    if (!this.signal?.aborted) {
      if (this.controller) {
        this.controller.abort();
      } else {
        error = Error(
          "Before destroying the stream, send the abort signal first."
        );
      }
    }
    if (cause) {
      if (error) {
        error.cause = cause;
      } else {
        error = cause;
      }
    }

    // todo in case redis.quit fails, this error is shadowing preexisting errors
    try {
      await this.client.quit();
    } catch (causeQuit) {
      error = Error("Error quitting redis client", { cause: causeQuit });
    }

    callback(error);
  }
}
