# Slush founder pitch feed

A mobile-first Slush-inspired prototype based on the four reference images in the project root.

## Run locally

Run `node server.cjs`, then open `http://127.0.0.1:5173`.

No installation or build step is required. The static application is in `dist/`; the active application code is `dist/startup-feed.js`.

## Experience

- Feed opens directly with founder pitches; the app header and feed filter headings are hidden.
- Vertical scroll snapping and desktop previous/next controls.
- Public founder videos embedded through the YouTube IFrame API with playback, mute, progress, and loading/error states.
- Only the active pitch can play. Opening a profile or conversation, leaving Feed, and hiding the page pause playback.
- Startup profiles, a local shortlist, and shareable pitch links.
- A per-startup demo conversation with suggested openers, draft retention, and local message history.
- Home, Program, My Agenda, Meetings, Map, and Feed remain in the bottom navigation. Only Home and Feed are implemented.
- Reduced-motion preferences disable autoplay and smooth scrolling.

## Demo boundaries

The historical pitch videos and sample company profiles are not connected to the companies. Messages are saved on this device and explicitly marked **not delivered**. Real messaging, founder accounts, and founder video uploads need a backend and authentication; they are not implemented in this prototype.

Public video sources:
- DoorDash (YC S13): https://www.ycombinator.com/blog/doordash-from-application-to-ipo/
- Zenefits (YC W13) and Campus Job (YC W15): https://www.ycombinator.com/video

Videos remain on YouTube and require network access. No YouTube videos are downloaded or republished. Fonts use Google Fonts with system fallbacks.
