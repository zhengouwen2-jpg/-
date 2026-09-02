from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def composite_variant(
    source: Image.Image,
    crop_box: tuple[int, int, int, int],
    canvas_size: tuple[int, int],
    scaled_size: tuple[int, int],
    paste_at: tuple[int, int],
) -> Image.Image:
    subject = source.crop(crop_box).resize(scaled_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    canvas.alpha_composite(subject, paste_at)
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare responsive wearable intro portraits.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    with Image.open(args.source) as image:
        source = image.convert("RGBA")

        variants = {
            "intro-wearer-desktop.webp": composite_variant(
                source,
                crop_box=(150, 340, 1290, 1100),
                canvas_size=(1600, 1000),
                scaled_size=(1277, 851),
                paste_at=(323, 74),
            ),
            "intro-wearer-mobile.webp": composite_variant(
                source,
                crop_box=(420, 340, 1160, 1090),
                canvas_size=(900, 1100),
                scaled_size=(900, 912),
                paste_at=(0, 94),
            ),
        }

        for filename, variant in variants.items():
            destination = args.output / filename
            variant.save(destination, "WEBP", quality=92, method=6, exact=True)
            print(f"{destination.name}: {variant.width}x{variant.height}, {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
