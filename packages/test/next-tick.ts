export function nextTick(): Promise<void> {
  return new Promise<void>((resolve) => process.nextTick(() => resolve()));
}
