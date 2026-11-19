/**
 * Torch (the phone's real camera light) via MediaStreamTrack constraints.
 * Chromium on Android exposes it, normally on the back camera; most front
 * cameras and every iOS browser report no torch. Detection is by capability,
 * never by user-agent, and every call is wrapped so a failure just means
 * "use the screen flash".
 */

type TorchConstraint = MediaTrackConstraintSet & { torch?: boolean };
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };

export interface TorchControl {
  /** Turns the torch on. Resolves false if the device refused. */
  on(): Promise<boolean>;
  /** Turns the torch off. Never throws. */
  off(): Promise<void>;
}

/** True when the track reports it can drive a torch. */
export function trackSupportsTorch(track: MediaStreamTrack | null | undefined): boolean {
  if (!track || typeof track.getCapabilities !== "function") return false;
  try {
    return (track.getCapabilities() as TorchCapabilities).torch === true;
  } catch {
    return false;
  }
}

async function setTorch(track: MediaStreamTrack, enabled: boolean): Promise<boolean> {
  try {
    await track.applyConstraints({ advanced: [{ torch: enabled } as TorchConstraint] });
    return true;
  } catch {
    return false;
  }
}

/** A controller for the track\x27s torch, or null when the track has none. */
export function createTorchControl(track: MediaStreamTrack | null | undefined): TorchControl | null {
  if (!track || !trackSupportsTorch(track)) return null;
  let lit = false;
  return {
    async on() {
      const ok = await setTorch(track, true);
      lit = ok;
      return ok;
    },
    async off() {
      // Always attempt the off call, even if `on` reported failure: some
      // devices throw but still light up.
      await setTorch(track, false);
      lit = false;
    },
  };
}
