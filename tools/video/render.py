"""Render the cropped, looping iPhone presentation without a browser."""
import argparse
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def find_ffmpeg(explicit=None):
    candidate = explicit or os.environ.get('FFMPEG_BINARY') or shutil.which('ffmpeg')
    if candidate:
        return str(candidate)
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise RuntimeError('Install requirements.txt, put ffmpeg on PATH, or pass --ffmpeg.') from error


def run(command):
    subprocess.run([str(value) for value in command], check=True)


def even(value):
    return max(2, round(value / 2) * 2)


def render(args):
    config = json.loads((HERE / 'config.json').read_text(encoding='utf-8-sig'))
    if args.preview:
        scale = 960 / config['height']
        for key in ('width', 'height', 'feedWidth', 'feedHeight'):
            config[key] = even(config[key] * scale)
        for key in ('feedX', 'feedY'):
            config[key] = round(config[key] * scale)
        config.update(fps=30, transition=0.2, endHold=2 / 30)
        for clip in config['clips']:
            clip['seconds'] = 0.6
    clips = config['clips']
    if not clips:
        raise ValueError('config.json needs at least one clip.')
    for clip in clips:
        source = ROOT / 'dist' / 'media' / clip['asset']
        if not source.is_file():
            raise FileNotFoundError(source)
    ffmpeg = find_ffmpeg(args.ffmpeg)
    node = shutil.which('node')
    if not node:
        raise RuntimeError('Node.js is required to render the vector overlays.')
    output = Path(args.output).expanduser().resolve() if args.output else ROOT / 'artifacts/video' / ('preview.mp4' if args.preview else 'Slush-founder-feed-loop-4K.mp4')
    output.parent.mkdir(parents=True, exist_ok=True)
    fps, transition = config['fps'], config['transition']
    width, height = config['feedWidth'], config['feedHeight']
    duration = sum(clip['seconds'] for clip in clips) + transition + config['endHold']
    frames = math.ceil(round(duration * fps, 6))
    encode = (['-c:v', 'libx264', '-preset', 'fast', '-crf', '14'] if args.encoder == 'libx264'
              else ['-c:v', 'h264_qsv', '-preset', 'fast', '-global_quality', '14'])
    common = [ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', '-filter_complex_threads', '2']
    with tempfile.TemporaryDirectory(prefix='slush-video-', dir=output.parent) as directory:
        work = Path(directory)
        settings = work / 'config.json'
        settings.write_text(json.dumps(config), encoding='utf-8')
        run([node, HERE / 'vector-ui.cjs', work, settings])
        cards = []
        for index, clip in enumerate(clips):
            card = work / f'card-{index}.mp4'
            cards.append(card)
            filters = (f'[0:v]fps={fps},scale={width}:{height}:force_original_aspect_ratio=increase,'
                       f'crop={width}:{height},setsar=1[v];[v][1:v]overlay=0:0:format=auto,'
                       'drawbox=x=0:y=ih-2:w=iw:h=2:color=white@0.2:t=fill,format=yuv420p[out]')
            # One PNG frame is retained by overlay; it need not be decoded in a loop.
            run(common + ['-i', ROOT / 'dist/media' / clip['asset'], '-i', work / f"{clip['id']}-overlay.png",
                          '-filter_complex', filters, '-map', '[out]', '-t', clip['seconds'] + transition,
                          '-an'] + encode + ['-threads', '8', card])
            print(f"Rendered {clip['name']}", flush=True)
        normalize = f'setpts=PTS-STARTPTS,format=yuv444p,fps={fps},settb=AVTB'
        filters = [f'[{i}:v]{normalize}[v{i}]' for i in range(len(clips))]
        # The incoming final card is the exact source frame used at the opening.
        filters.append(f'[{len(clips)}:v]trim=end_frame=1,tpad=stop_mode=clone:stop_duration={transition + config["endHold"] + 1},{normalize}[return]')
        previous, offset = 'v0', 0
        for index, clip in enumerate(clips):
            offset += clip['seconds']
            incoming = f'v{index + 1}' if index + 1 < len(clips) else 'return'
            label = f'swipe{index}'
            filters.append(f'[{previous}][{incoming}]xfade=transition=slideup:duration={transition}:offset={offset},fps={fps},settb=AVTB[{label}]')
            previous = label
        filters.append(f'[{previous}]pad={config["width"]}:{config["height"]}:{config["feedX"]}:{config["feedY"]}:color=black[base]')
        filters.append(f'[base][{len(clips) + 1}:v]overlay=0:0:format=auto,format=yuv420p[out]')
        command = common.copy()
        for card in cards:
            command += ['-i', card]
        command += ['-i', cards[0], '-i', work / 'chrome-overlay.png', '-filter_complex', ';'.join(filters),
                    '-map', '[out]', '-frames:v', frames, '-an'] + encode + ['-threads', '8', '-movflags', '+faststart', output]
        print('Compositing the scrolling loop...', flush=True)
        run(command)
    manifest = {'width': config['width'], 'height': config['height'], 'fps': fps, 'frames': frames,
                'duration': frames / fps, 'swipes': [sum(c['seconds'] for c in clips[:i + 1]) for i in range(len(clips))],
                'transition': transition, 'encoder': args.encoder}
    output.with_suffix('.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'Created {output} ({config["width"]} x {config["height"]}, {fps} fps)', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='Destination MP4; defaults to artifacts/video/. Existing output is replaced.')
    parser.add_argument('--ffmpeg', help='FFmpeg executable; otherwise use FFMPEG_BINARY, PATH, or imageio-ffmpeg.')
    parser.add_argument('--encoder', choices=['libx264', 'h264_qsv'], default='libx264', help='Portable CPU encoder or optional Intel Quick Sync.')
    parser.add_argument('--preview', action='store_true', help='Fast 960px-high check with all three swipes and the loop seam.')
    render(parser.parse_args())
