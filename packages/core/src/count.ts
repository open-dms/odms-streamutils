import { Transform } from "node:stream";

export const count = () => {
  let count = 0;
  return new Transform({
    objectMode: true,
    transform(chunk, _, callback) {
      this.emit("count", ++count);
      callback(null, chunk);
    },
  });
};
