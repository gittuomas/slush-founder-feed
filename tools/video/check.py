"""Extract a contact sheet and compare the first and last decoded frames."""
import argparse
import json
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image, ImageDraw
from render import find_ffmpeg


def check(video, ffmpeg=None):
    video = Path(video).resolve()
    info = json.loads(video.with_suffix('.json').read_text(encoding='utf-8'))
    fps = info['fps']
    frames = sorted(set([0, info['frames'] - 1] + [round((t + info['transition'] / 2) * fps) for t in info['swipes']]))
    directory = video.parent / (video.stem + '-check')
    directory.mkdir(exist_ok=True)
    select = '+'.join(f'eq(n,{frame})' for frame in frames)
    subprocess.run([find_ffmpeg(ffmpeg), '-y', '-hide_banner', '-loglevel', 'error', '-i', str(video),
                    '-vf', f"select='{select}'", '-fps_mode', 'vfr', str(directory / 'frame-%02d.png')], check=True)
    images = [Image.open(directory / f'frame-{i + 1:02d}.png').convert('RGB') for i in range(len(frames))]
    if any(image.size != (info['width'], info['height']) for image in images):
        raise RuntimeError('Encoded dimensions differ from the export manifest.')
    difference = float(np.abs(np.asarray(images[0], dtype=np.float32) - np.asarray(images[-1], dtype=np.float32)).mean())
    sheet = Image.new('RGB', (240 * len(images), 516), '#101112')
    draw = ImageDraw.Draw(sheet)
    for index, (image, frame) in enumerate(zip(images, frames)):
        image.thumbnail((240, 490))
        sheet.paste(image, (index * 240, 22))
        draw.text((index * 240 + 8, 5), f'{frame / fps:.2f}s', fill='white')
    sheet.save(directory / 'contact-sheet.jpg')
    print(f'Opening/closing mean channel difference: {difference:.3f} / 255 (lossy encoding may differ slightly).')
    print(f'Inspect {directory / "contact-sheet.jpg"}')
    if difference > 3:
        raise RuntimeError('The loop seam differs visibly; inspect the first and last frames.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('video', help='MP4 produced by render.py, with its adjacent JSON manifest.')
    parser.add_argument('--ffmpeg')
    args = parser.parse_args()
    check(args.video, args.ffmpeg)
