#!/usr/bin/env python3
"""
clean_dexcom.py

Strips a raw Dexcom Clarity CSV export down to just the two columns
that matter for a meal/glucose log: Timestamp and Glucose Value.

Dexcom exports one CSV with a bunch of unrelated setup rows mixed in
(Alert thresholds, Device info, etc.) before the actual EGV (Estimated
Glucose Value) readings start. This script:

  1. Skips everything that isn't an "EGV" row (readings only).
  2. Keeps just Timestamp + Glucose Value (mg/dL).
  3. Optionally filters to a date/time window (--start / --end).
  4. Writes out clean CSV (default) or JSON (--format json).

Usage:
    python clean_dexcom.py input.csv
    python clean_dexcom.py input.csv -o clean.csv
    python clean_dexcom.py input.csv --start "2026-07-18 16:00" --end "2026-07-18 20:00"
    python clean_dexcom.py input.csv --format json -o readings.json

    Or run with no arguments to be prompted for a folder and file:
    python clean_dexcom.py

No external dependencies -- standard library only.
"""

import argparse
import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path


def parse_dt(value: str) -> datetime:
    """Accept a few common formats so you don't have to remember ISO exactly."""
    formats = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise argparse.ArgumentTypeError(
        f"Could not parse date/time: {value!r}. "
        "Try formats like 2026-07-18 or '2026-07-18 16:00'."
    )


def extract_readings(input_path, start=None, end=None):
    """Yield (timestamp_str, timestamp_dt, glucose_int) for each EGV row in range."""
    with open(input_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Event Type") != "EGV":
                continue

            ts_raw = row.get("Timestamp (YYYY-MM-DDThh:mm:ss)", "").strip()
            glucose_raw = row.get("Glucose Value (mg/dL)", "").strip()

            if not ts_raw or not glucose_raw:
                continue

            try:
                ts_dt = datetime.strptime(ts_raw, "%Y-%m-%dT%H:%M:%S")
            except ValueError:
                continue

            if start and ts_dt < start:
                continue
            if end and ts_dt > end:
                continue

            try:
                glucose = int(glucose_raw)
            except ValueError:
                continue

            yield ts_raw, ts_dt, glucose


def write_csv(rows, output_path):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Timestamp", "Glucose (mg/dL)"])
        for ts_raw, _, glucose in rows:
            writer.writerow([ts_raw, glucose])


def write_json(rows, output_path):
    data = [
        {"timestamp": ts_raw, "glucose_mg_dl": glucose}
        for ts_raw, _, glucose in rows
    ]
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def list_csv_candidates(folder: Path):
    """Return .csv files in folder, newest first, excluding files already cleaned."""
    files = [
        p for p in folder.glob("*.csv")
        if not p.name.endswith("_clean.csv")
    ]
    return sorted(files, key=lambda p: p.stat().st_mtime, reverse=True)


def prompt_choice(prompt: str, default: str) -> str:
    response = input(f"{prompt} [{default}]: ").strip()
    return response or default


def prompt_for_input_file() -> Path:
    """Interactively ask which folder and which file to clean. Used when no
    filename is given on the command line."""
    folder_str = prompt_choice("Which folder is your Dexcom data in?", "dexcom-data")
    folder = Path(folder_str)

    if not folder.is_dir():
        print(f"Folder not found: {folder}", file=sys.stderr)
        sys.exit(1)

    candidates = list_csv_candidates(folder)
    if not candidates:
        print(f"No .csv files found in {folder}", file=sys.stderr)
        sys.exit(1)

    print("\nFound these files (newest first):")
    for i, path in enumerate(candidates, start=1):
        size_kb = path.stat().st_size / 1024
        print(f"  {i}. {path.name}  ({size_kb:.0f} KB)")

    choice = prompt_choice("\nWhich file?", "1")
    try:
        index = int(choice) - 1
        return candidates[index]
    except (ValueError, IndexError):
        print(f"'{choice}' isn't a valid choice.", file=sys.stderr)
        sys.exit(1)


def derive_output_stem(input_path: Path) -> str:
    """Pull a date out of long Dexcom export filenames so the output name
    stays short, e.g. Clarity_Export_S_Jami_2026-07-19_074614.csv -> 2026-07-19"""
    match = re.search(r"\d{4}-\d{2}-\d{2}", input_path.stem)
    if match:
        return match.group(0)
    return input_path.stem


def main():
    parser = argparse.ArgumentParser(description="Clean a raw Dexcom CSV export down to timestamp + glucose.")
    parser.add_argument("input", nargs="?", help="Path to the raw Dexcom CSV export. If omitted, you'll be prompted to pick a folder and file.")
    parser.add_argument("-o", "--output", help="Output file path (default: <date>_clean.<ext>)")
    parser.add_argument("--format", choices=["csv", "json"], default="csv", help="Output format (default: csv)")
    parser.add_argument("--start", type=parse_dt, help="Only include readings at/after this time, e.g. '2026-07-18 16:00'")
    parser.add_argument("--end", type=parse_dt, help="Only include readings at/before this time, e.g. '2026-07-18 20:00'")
    args = parser.parse_args()

    if args.input:
        input_path = Path(args.input)
    else:
        input_path = prompt_for_input_file()

    rows = list(extract_readings(input_path, start=args.start, end=args.end))

    if not rows:
        print("No EGV readings found in that file/window.", file=sys.stderr)
        sys.exit(1)

    if args.output:
        output_path = args.output
    else:
        stem = derive_output_stem(input_path)
        output_path = str(input_path.parent / f"{stem}_clean.{args.format}")

    if args.format == "json":
        write_json(rows, output_path)
    else:
        write_csv(rows, output_path)

    first_ts, _, first_g = rows[0]
    last_ts, _, last_g = rows[-1]
    print(f"Wrote {len(rows)} readings to {output_path}")
    print(f"Range: {first_ts} ({first_g} mg/dL)  ->  {last_ts} ({last_g} mg/dL)")


if __name__ == "__main__":
    main()