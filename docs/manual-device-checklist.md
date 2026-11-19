# Manual device checklist

Automated tests run in Chromium, Firefox and WebKit with a fake camera. These
things only a real phone can prove.

## How the flash behaves

- Front camera: a full-screen white layer is held for 450 ms so auto-exposure
  adapts, the frame is grabbed while it is still white, then it fades over 150 ms.
- Torch (real camera light): turned on 400 ms before the grab when the active
  camera reports `torch` capability (normally Android Chromium back camera),
  and off right after. If the torch fails, the screen flash is used.
- Flash setting on the camera screen: Auto (default) or Off.

## Per browser

### Android: Chrome, Edge, Samsung Internet, Opera, Brave
- [ ] Front camera, Flash Auto: whole screen goes white (status bar area included), photo is visibly brighter in a dark room than with Flash Off.
- [ ] Tap Switch camera: the back camera opens, the preview is NOT mirrored, and a text photo reads correctly.
- [ ] Back camera, Flash Auto: the camera light turns on about 0.4 s before each shot and off right after. It is off after Stop, after leaving the screen, and after switching apps.
- [ ] Screen does not dim during a 4-photo session.
- [ ] All 13 filters: preview looks like the saved strip.

### Android: Firefox
- [ ] Same as above, except the torch is usually not offered: the screen flash must still run on the back camera too.

### iPhone / iPad: Safari, Chrome, Edge, Firefox, Opera, Brave, DuckDuckGo (all WebKit)
- [ ] Front camera, Flash Auto: full-screen white flash, photo brighter in a dark room.
- [ ] No torch is expected. The screen flash must always run.
- [ ] Every filter looks the same in the live preview and in the downloaded strip (the preview is drawn through a canvas on WebKit).
- [ ] Heaviest filter (Cybercore), 4 photos: the result appears in about 2 s or less on an iPhone 11 class phone, and the page never freezes.
- [ ] Screen stays awake during a session (Safari 16.4+).

### In-app browsers: Instagram, WhatsApp, Snapchat, TikTok, Facebook
- [ ] If the camera is blocked: the message says to open the link in your browser, and the Use your phone camera app button opens the phone camera (with its own flash).
- [ ] Photos taken that way go through the chosen filter and frame.
- [ ] If the camera works: live preview and strip match for every filter.
- [ ] Torch off after backgrounding the app.

### Desktop: Chrome, Edge, Firefox, Safari
- [ ] Flash Auto flashes the whole window. Flash Off does not.
- [ ] No Switch camera button with a single webcam.
