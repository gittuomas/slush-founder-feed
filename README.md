# Slush founder pitch feed

A mobile-first Slush-inspired prototype based on the four reference images in the project root.

## Run locally

Run `node server.cjs`, then open `http://127.0.0.1:5173`.

No installation or build step is required. The static application is in `dist/`; the active application code is `dist/startup-feed.js`.

## Experience

- Feed opens directly with founder pitches; the app header and feed filter headings are hidden.
- Vertical scroll snapping and desktop previous/next controls.
- Full-height native HTML video with no third-party player UI, tap-to-pause, muted autoplay, looping, progress, and loading/error states.
- Only the active pitch can play. Opening a profile or conversation, leaving Feed, and hiding the page pause playback.
- Startup profiles, a local shortlist, and shareable pitch links.
- A per-startup demo conversation with suggested openers, draft retention, and local message history.
- Home, Program, My Agenda, Meetings, Map, and Feed remain in the bottom navigation. Only Home and Feed are implemented.
- Reduced-motion preferences disable autoplay and smooth scrolling.

## Demo boundaries

The startup profiles are fictional concepts. The sample footage does not depict their founders or actual pitches. Messages are saved on this device and explicitly marked **not delivered**. Real messaging, founder accounts, and founder video uploads need a backend and authentication; they are not implemented in this prototype.

## Clip selection

Signal Studio leads with the clip selected by the user. The other clips show an informal recording setup and a camera-facing speaker in portrait framing, replacing generic office footage. Several moments from each candidate were reviewed to avoid distracting cameras obscuring the speaker. All three are silent visual placeholders; the sound control explicitly indicates this. They are local MP4s under the Mixkit Free License:

- Signal Studio: https://mixkit.co/free-stock-video/vlogger-recording-in-sign-language-4550/
- Relay: https://mixkit.co/free-stock-video/youtuber-recording-himself-41289/
- Loop: https://mixkit.co/free-stock-video/portrait-of-an-influencer-talking-to-the-camera-42323/

For real founder recordings, use portrait 9:16 MP4s with clear speech, the speaker's face in the upper half, and room in the lower third for startup information. Replace the `video` and `poster` fields in `startups`, set `hasAudio: true`, and replace the corresponding local media files; the player needs no other integration. Fonts use Google Fonts with system fallbacks.

## Device preview

The default entry point (`dist/index.html`) presents the app inside a responsive iPhone-style frame. All device styling and sizing live in `device-preview.css` and `device-preview.js`. The real application entry point is `dist/app.html`; it has no dependency on the device wrapper and can be opened directly via the preview's **Open app** link. The iframe keeps app navigation, viewport sizing, and dialogs inside the device screen. Pitch share links open the default preview at the selected startup.
