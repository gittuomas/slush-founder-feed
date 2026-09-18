# Video export

This is the reproducible exporter for the sharp, cropped iPhone presentation video. It uses the repository's MP4 clips and renders the captions, icons, bottom navigation, and phone frame as vector artwork. No browser recording, screenshots, Codex runtime, or GitHub credentials are needed.

## Install

Use Node.js 22+ and Python 3.10+:

```sh
npm ci --prefix tools/video
python -m pip install -r tools/video/requirements.txt
```

`imageio-ffmpeg` provides a platform-specific FFmpeg binary. Alternatively, install FFmpeg with `libx264` and put it on PATH, set `FFMPEG_BINARY`, or pass `--ffmpeg /path/to/ffmpeg`. The vector renderer uses Arial, with the system's sans-serif fallback when Arial is unavailable; install Arial for matching typography across machines.

## Make the presentation video

From the repository root:

```sh
python tools/video/render.py
```

The default output is `artifacts/video/Slush-founder-feed-loop-4K.mp4`: **1876 × 3840, 60 fps, 27.2 seconds**, silent H.264 MP4 with fast-start playback. It shows Relay, Signal Studio, then Loop, with 0.7-second upward swipes beginning at 10, 18, and 26.433 seconds. The last swipe reveals the same source frame used at the opening, creating an infinite-scroll loop. The video footage retains the detail of the original source files; the UI is rendered at the output resolution.

The default `libx264` encoder works without an Intel GPU. On a machine with supported Intel Quick Sync hardware and drivers, use the faster encoder used for the delivered export:

```sh
python tools/video/render.py --encoder h264_qsv
```

Hardware encoding is explicitly selected; a hardware failure does not silently fall back or publish a partial result. A custom destination is supported with `--output /path/to/video.mp4`. Existing output at that path is overwritten.

## Fast check and inspection

```sh
python tools/video/render.py --preview
python tools/video/check.py artifacts/video/preview.mp4
```

Preview mode renders a 960-pixel-high, approximately two-second sample containing all three swipes and the return to the first frame. It uses the same vector layers and composition pipeline as the full export.

Check the full video the same way:

```sh
python tools/video/check.py artifacts/video/Slush-founder-feed-loop-4K.mp4
```

The checker reads the adjacent JSON manifest, extracts opening, transition, and closing frames, checks dimensions, creates a contact sheet, and compares the decoded first and last frames. Small pixel differences are expected from lossy encoding. Inspect the saved full-resolution frames for text and icon sharpness.

## Files and customization

- `config.json`: clip order, assets, captions, geometry, timing, and frame rate.
- `vector-ui.cjs`: export-specific SVG layout, rasterized by Sharp; reads the icon paths from `dist/startup-feed.js`.
- `render.py`: resolves FFmpeg, generates overlays, renders each pitch, and composites the scrolling loop with a fixed phone frame.
- `check.py`: output inspection and loop-seam check.

The vector layout deliberately avoids screenshot scaling. It is a presentation rendering of the app, not a live browser capture; update it alongside future UI design changes. Captions are laid out for the supplied text, so inspect longer replacements. For a different resolution, keep the output and feed dimensions, offsets, and SVG layout in proportion.

Each run creates fresh temporary layers and intermediate videos and removes them on completion. It does not reuse stale cached renders. Final MP4s, manifests, and inspection images live under ignored `artifacts/`; dependencies and generated files are not committed. The static app continues to run with `node server.cjs` without these export dependencies.
