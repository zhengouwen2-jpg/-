from __future__ import annotations

import argparse
import io
import zipfile
from pathlib import Path

from PIL import Image


SCREENS = {
    "app-headwear-link.webp": ("ppt/media/image28.png", (640, 30, 4225, 6735), 1000),
    "app-rear-link.webp": ("ppt/media/image27.png", (912, 24, 4030, 5472), 1000),
    "app-temperature.webp": ("ppt/media/image29.png", (490, 0, 4284, 6728), 1000),
    "app-massage.webp": ("ppt/media/image30.png", (520, 0, 4258, 6722), 1000),
    "app-health-report.webp": ("ppt/media/image34.jpeg", None, None),
    "app-emotion-calendar.webp": ("ppt/media/image35.jpeg", (170, 0, 698, 1158), None),
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract the six wearable App screens from the source PPTX.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.source) as deck:
        for filename, (member, crop_box, target_width) in SCREENS.items():
            with Image.open(io.BytesIO(deck.read(member))) as image:
                image = image.convert("RGB")
                if crop_box:
                    image = image.crop(crop_box)
                if target_width and image.width != target_width:
                    height = round(image.height * target_width / image.width)
                    image = image.resize((target_width, height), Image.Resampling.LANCZOS)
                destination = args.output / filename
                image.save(destination, "WEBP", quality=90, method=6)
                print(f"{filename}: {image.width}x{image.height}, {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
