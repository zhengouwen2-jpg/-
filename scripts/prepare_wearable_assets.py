from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


ASSETS = {
    "hero": "clean_versions/01_hero_system_16x9_clean.png",
    "emotion": "clean_versions/09_emotion_sensing_16x9_clean.png",
    "commute": "final/10_scene_commute_16x9.png",
    "office": "final/11_scene_office_16x9.png",
    "sleep": "final/12_scene_sleep_4x5.png",
    "inner": "final/05_product_inner_16x9.png",
    "exploded": "final/06_exploded_ecosystem_16x9.png",
    "product-front": "final/03_product_front_16x9.png",
    "product-rear": "final/04_product_rear_16x9.png",
    "temple": "final/07_macro_temple_4x5.png",
    "material": "final/08_macro_material_4x5.png",
    "app": "clean_versions/14_app_ecosystem_4x5_clean.png",
}


def save_variant(source: Path, destination: Path, width: int) -> None:
    with Image.open(source) as image:
        image = image.convert("RGB")
        scale = min(1.0, width / image.width)
        size = (round(image.width * scale), round(image.height * scale))
        if size != image.size:
            image = image.resize(size, Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=84, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    for stem, relative_path in ASSETS.items():
        source = args.source / relative_path
        if not source.exists():
            raise FileNotFoundError(source)
        for suffix, width in (("mobile", 900), ("desktop", 1920)):
            destination = args.output / f"{stem}-{suffix}.webp"
            save_variant(source, destination, width)
            print(f"{destination.name}: {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
