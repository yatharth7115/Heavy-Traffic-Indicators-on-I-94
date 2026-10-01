"""Download the original I-94 traffic dataset from the UCI archive."""

from __future__ import annotations

import gzip
import io
from pathlib import Path
import urllib.request
import zipfile


URL = "https://archive.ics.uci.edu/static/public/492/metro+interstate+traffic+volume.zip"
DESTINATION = Path(__file__).resolve().parents[1] / "data" / "Metro_Interstate_Traffic_Volume.csv"


def main() -> None:
    request = urllib.request.Request(URL, headers={"User-Agent": "i94-traffic-analysis/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))
    compressed = archive.read("Metro_Interstate_Traffic_Volume.csv.gz")
    raw = gzip.decompress(compressed)
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    DESTINATION.write_bytes(raw)
    print(f"Downloaded {DESTINATION} ({len(raw):,} bytes)")


if __name__ == "__main__":
    main()
