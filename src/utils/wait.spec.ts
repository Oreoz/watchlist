import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { wait } from "./wait";

describe("wait", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the requested delay", async () => {
    const completed = vi.fn();

    wait(100).then(completed);

    await vi.advanceTimersByTimeAsync(99);
    expect(completed).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(completed).toHaveBeenCalledOnce();
  });

  it("supports zero-millisecond waits", async () => {
    const promise = wait(0);

    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();
  });
});
