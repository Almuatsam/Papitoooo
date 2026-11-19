import { FLASH_FADE_MS, FLASH_HOLD_MS, TORCH_LEAD_MS } from "@/lib/constants";
import type { TorchControl } from "@/lib/torch";

export interface FlashSequenceInput {
  /** Light the screen white (front camera, or a torch that failed). */
  screenFlash: boolean;
  /** Real camera light, when the active track has one. */
  torch: TorchControl | null;
  /** Show the full-screen white layer at full opacity. */
  showScreen: () => void;
  /** Start fading the white layer out. */
  fadeScreen: () => void;
  /** Remove the white layer. */
  hideScreen: () => void;
  /** Resolves once the video has delivered a frame newer than now. */
  waitForFreshFrame: () => Promise<void>;
  /** Grabs the frame from the video. */
  capture: () => string | null;
  /** Abortable delay. Rejects with an AbortError when the signal fires. */
  sleep: (ms: number) => Promise<void>;
  holdMs?: number;
  fadeMs?: number;
  torchLeadMs?: number;
}

/**
 * One flash + capture:
 *
 *   screen white (and torch on) -> hold so exposure adapts -> wait for a fresh
 *   frame -> grab it while still lit -> torch off -> fade the screen out.
 *
 * The torch is switched off and the screen layer removed on every exit path,
 * including cancel (abort) and errors.
 */
export async function runFlashSequence(input: FlashSequenceInput): Promise<string | null> {
  const holdMs = input.holdMs ?? FLASH_HOLD_MS;
  const fadeMs = input.fadeMs ?? FLASH_FADE_MS;
  const torchLeadMs = input.torchLeadMs ?? TORCH_LEAD_MS;
  let screenOn = false;
  let torchTouched = false;
  let torchOff = false;

  const turnScreenOn = () => {
    if (screenOn) return;
    screenOn = true;
    input.showScreen();
  };

  try {
    if (input.screenFlash) turnScreenOn();

    let torchLit = false;
    if (input.torch) {
      torchTouched = true;
      torchLit = await input.torch.on();
    }
    // A torch that refused to light means the screen flash has to do the job.
    if (input.torch && !torchLit) turnScreenOn();

    // With nothing lit (flash off, or a back camera without a torch) there is nothing to wait for.
    const waitMs = screenOn ? holdMs : torchLit ? torchLeadMs : 0;
    if (waitMs > 0) await input.sleep(waitMs);
    await input.waitForFreshFrame();
    const frame = input.capture();

    if (torchTouched) {
      torchOff = true;
      await input.torch?.off();
    }
    if (screenOn) {
      input.fadeScreen();
      await input.sleep(fadeMs);
    }
    return frame;
  } finally {
    if (torchTouched && !torchOff) await input.torch?.off();
    if (screenOn) input.hideScreen();
  }
}
