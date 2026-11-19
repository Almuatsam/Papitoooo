import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runFlashSequence, type FlashSequenceInput } from "@/lib/flash-sequence";
import { createTorchControl, trackSupportsTorch, type TorchControl } from "@/lib/torch";
import { FLASH_FADE_MS, FLASH_HOLD_MS, TORCH_LEAD_MS } from "@/lib/constants";

type Log = string[];

function timedSleep(log: Log, signal?: AbortSignal) {
  return (ms: number) =>
    new Promise<void>((resolve, reject) => {
      log.push(`sleep:${ms}`);
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
}

function fakeTorch(log: Log, onResult = true): TorchControl {
  return {
    on: async () => {
      log.push("torch:on");
      return onResult;
    },
    off: async () => {
      log.push("torch:off");
    },
  };
}

function makeInput(log: Log, overrides: Partial<FlashSequenceInput> = {}): FlashSequenceInput {
  return {
    screenFlash: true,
    torch: null,
    showScreen: () => log.push("screen:on"),
    fadeScreen: () => log.push("screen:fade"),
    hideScreen: () => log.push("screen:off"),
    waitForFreshFrame: async () => {
      log.push("fresh-frame");
    },
    capture: () => {
      log.push("capture");
      return "frame";
    },
    sleep: timedSleep(log),
    ...overrides,
  };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("runFlashSequence", () => {
  it("lights the screen, holds, grabs while still lit, then fades", async () => {
    const log: Log = [];
    const result = runFlashSequence(makeInput(log));
    await vi.advanceTimersByTimeAsync(FLASH_HOLD_MS + FLASH_FADE_MS);
    await expect(result).resolves.toBe("frame");
    expect(log).toEqual([
      "screen:on",
      `sleep:${FLASH_HOLD_MS}`,
      "fresh-frame",
      "capture",
      "screen:fade",
      `sleep:${FLASH_FADE_MS}`,
      "screen:off",
    ]);
  });

  it("does not grab before the hold has elapsed", async () => {
    const log: Log = [];
    void runFlashSequence(makeInput(log));
    await vi.advanceTimersByTimeAsync(FLASH_HOLD_MS - 1);
    expect(log).toContain("screen:on");
    expect(log).not.toContain("capture");
    await vi.advanceTimersByTimeAsync(1);
    expect(log).toContain("capture");
  });

  it("turns the torch on first and off right after the grab", async () => {
    const log: Log = [];
    const result = runFlashSequence(makeInput(log, { torch: fakeTorch(log) }));
    await vi.advanceTimersByTimeAsync(FLASH_HOLD_MS + FLASH_FADE_MS);
    await result;
    expect(log.indexOf("screen:on")).toBeLessThan(log.indexOf("torch:on"));
    expect(log.indexOf("torch:on")).toBeLessThan(log.indexOf("capture"));
    expect(log.indexOf("capture")).toBeLessThan(log.indexOf("torch:off"));
    expect(log.indexOf("torch:off")).toBeLessThan(log.indexOf("screen:fade"));
    expect(log.filter((entry) => entry === "torch:off")).toHaveLength(1);
  });

  it("uses the torch alone on a back camera, leading by the torch delay", async () => {
    const log: Log = [];
    const result = runFlashSequence(makeInput(log, { screenFlash: false, torch: fakeTorch(log) }));
    await vi.advanceTimersByTimeAsync(TORCH_LEAD_MS);
    await expect(result).resolves.toBe("frame");
    expect(log).toEqual(["torch:on", `sleep:${TORCH_LEAD_MS}`, "fresh-frame", "capture", "torch:off"]);
  });

  it("falls back to the screen flash when applyConstraints fails", async () => {
    const log: Log = [];
    const applyConstraints = vi.fn().mockRejectedValue(new Error("NotSupportedError"));
    const track = {
      getCapabilities: () => ({ torch: true }),
      applyConstraints,
    } as unknown as MediaStreamTrack;
    const torch = createTorchControl(track);
    expect(torch).not.toBeNull();

    const result = runFlashSequence(makeInput(log, { screenFlash: false, torch }));
    await vi.advanceTimersByTimeAsync(FLASH_HOLD_MS + FLASH_FADE_MS);
    await expect(result).resolves.toBe("frame");
    expect(log.indexOf("screen:on")).toBeGreaterThanOrEqual(0);
    expect(log.indexOf("screen:on")).toBeLessThan(log.indexOf("capture"));
    expect(log).toContain(`sleep:${FLASH_HOLD_MS}`);
  });

  it("does nothing visible when flash is off and there is no torch", async () => {
    const log: Log = [];
    const result = runFlashSequence(makeInput(log, { screenFlash: false }));
    await vi.advanceTimersByTimeAsync(0);
    await expect(result).resolves.toBe("frame");
    expect(log).toEqual(["fresh-frame", "capture"]);
  });

  it("turns the torch and screen off when cancelled mid-hold", async () => {
    const log: Log = [];
    const controller = new AbortController();
    const result = runFlashSequence(
      makeInput(log, { torch: fakeTorch(log), sleep: timedSleep(log, controller.signal) }),
    );
    const settled = result.catch((err: Error) => err.name);
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await expect(settled).resolves.toBe("AbortError");
    expect(log).not.toContain("capture");
    expect(log).toContain("torch:off");
    expect(log.at(-1)).toBe("screen:off");
  });

  it("turns the torch and screen off when the grab throws", async () => {
    const log: Log = [];
    const result = runFlashSequence(
      makeInput(log, {
        torch: fakeTorch(log),
        capture: () => {
          throw new Error("boom");
        },
      }),
    );
    const settled = result.catch((err: Error) => err.message);
    await vi.advanceTimersByTimeAsync(FLASH_HOLD_MS);
    await expect(settled).resolves.toBe("boom");
    expect(log).toContain("torch:off");
    expect(log.at(-1)).toBe("screen:off");
  });
});

describe("torch support", () => {
  it("reports no torch when the capability is missing or false", () => {
    expect(trackSupportsTorch(null)).toBe(false);
    expect(trackSupportsTorch({} as MediaStreamTrack)).toBe(false);
    expect(trackSupportsTorch({ getCapabilities: () => ({}) } as unknown as MediaStreamTrack)).toBe(false);
    expect(trackSupportsTorch({ getCapabilities: () => ({ torch: false }) } as unknown as MediaStreamTrack)).toBe(false);
  });

  it("drives the torch through applyConstraints and never throws", async () => {
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const track = { getCapabilities: () => ({ torch: true }), applyConstraints } as unknown as MediaStreamTrack;
    const control = createTorchControl(track)!;
    await expect(control.on()).resolves.toBe(true);
    await control.off();
    expect(applyConstraints).toHaveBeenNthCalledWith(1, { advanced: [{ torch: true }] });
    expect(applyConstraints).toHaveBeenNthCalledWith(2, { advanced: [{ torch: false }] });

    applyConstraints.mockRejectedValue(new Error("nope"));
    await expect(control.on()).resolves.toBe(false);
    await expect(control.off()).resolves.toBeUndefined();
  });
});
