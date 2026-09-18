# Slush video feed

A mobile-first Slush-inspired app based on the four reference images in the project root. Home and Feed are implemented. The six-item bottom bar retains the reference app's Home, Program, My Agenda, Meetings, and Map tabs, with Feed added last. The four unimplemented tabs are labeled as coming soon.

## Run locally

Run `node server.cjs`, then open `http://127.0.0.1:5173`.

No installation or build step is required. The static application is in `dist/`.

## Feed behavior

- Vertical scroll snapping, touch swiping, and desktop arrow navigation.
- Only the visible video plays; leaving Feed, opening a dialog, or hiding the page pauses playback.
- Muted autoplay, play/pause, progress, keyboard arrows and spacebar.
- Likes and saved videos persist locally on the device. Saved view includes an empty state.
- Shareable links select the corresponding video.
- Reduced-motion preferences disable autoplay and smooth scrolling.
- Playback failures show a retry control.

## Demo content

Clips are sample stock footage, not actual Slush footage. Replace the entries in `clips` in `dist/app.js` and their media files to use your own videos. There is no backend, account system, live social data, or event integration.

Media sources (Mixkit Free License, checked September 18, 2026):
- https://mixkit.co/free-stock-video/woman-working-on-a-computer-in-a-boardroom-4807/
- https://mixkit.co/free-stock-video/vlogger-recording-in-sign-language-4550/
- https://mixkit.co/free-stock-video/a-pair-of-employees-working-in-a-call-center-4603/

Typography uses Google Fonts with system fallbacks.
