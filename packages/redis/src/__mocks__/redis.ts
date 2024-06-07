import { mock } from "bun:test";

export const mockClient = {
  connect: mock(() => Promise.resolve()),
  on: () => {},
  quit: () => Promise.resolve(),
  rPush: mock().mockResolvedValue(undefined),
  brPop: mock().mockResolvedValue(undefined),
  xAdd: mock((key: string, id: string, message: Record<string, string>) =>
    Promise.resolve()
  ),
};
