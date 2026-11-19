/**
 * Keeps the screen awake with the Screen Wake Lock API while a session runs.
 * Silently does nothing where the API is missing or refuses.
 */
interface WakeLockSentinelLike {
  release(): Promise<void>;
}

interface WakeLockApi {
  request(type: "screen"): Promise<WakeLockSentinelLike>;
}

export interface ScreenWakeLock {
  acquire(): Promise<void>;
  release(): Promise<void>;
}

export function createScreenWakeLock(): ScreenWakeLock {
  let sentinel: WakeLockSentinelLike | null = null;

  return {
    async acquire() {
      if (sentinel || typeof navigator === "undefined") return;
      const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
      if (!api) return;
      try {
        sentinel = await api.request("screen");
      } catch {
        sentinel = null;
      }
    },
    async release() {
      const current = sentinel;
      sentinel = null;
      try {
        await current?.release();
      } catch {
        // Already released by the browser (page hidden) — nothing to do.
      }
    },
  };
}
