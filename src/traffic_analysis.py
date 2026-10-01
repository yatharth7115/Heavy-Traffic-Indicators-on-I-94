"""Reproducible descriptive analysis of hourly westbound I-94 traffic."""

from __future__ import annotations

from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {"date_time", "traffic_volume", "weather_main", "holiday"}


def load_traffic(path: str | Path) -> tuple[pd.DataFrame, dict[str, int]]:
    """Return one traffic observation per timestamp and basic quality counts.

    The UCI file repeats some hours for multiple weather descriptions. All
    repeated rows for a timestamp must report the same traffic volume.
    """
    raw = pd.read_csv(path, keep_default_na=False)
    missing = REQUIRED_COLUMNS - set(raw.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")
    raw["date_time"] = pd.to_datetime(raw["date_time"], errors="raise")
    raw["traffic_volume"] = pd.to_numeric(raw["traffic_volume"], errors="raise")
    if raw["date_time"].isna().any() or raw["traffic_volume"].isna().any():
        raise ValueError("Missing timestamp or traffic volume")
    if (raw["traffic_volume"] < 0).any():
        raise ValueError("Negative traffic volume")
    conflicts = raw.groupby("date_time")["traffic_volume"].nunique().gt(1).sum()
    if conflicts:
        raise ValueError(f"Conflicting traffic volumes at {conflicts} timestamps")
    hourly = raw.sort_values("date_time").drop_duplicates("date_time").copy()
    hourly["hour"] = hourly["date_time"].dt.hour
    hourly["weekday"] = hourly["date_time"].dt.dayofweek
    hourly["month"] = hourly["date_time"].dt.month
    hourly["year"] = hourly["date_time"].dt.year
    hourly["day_type"] = hourly["weekday"].lt(5).map({True: "Weekday", False: "Weekend"})
    quality = {
        "raw_rows": len(raw),
        "unique_hours": len(hourly),
        "duplicate_weather_rows": len(raw) - len(hourly),
        "first_timestamp": str(hourly["date_time"].min()),
        "last_timestamp": str(hourly["date_time"].max()),
    }
    return hourly, quality


def grouped_volume(hourly: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    """Mean, median, and observed-hour count for each group."""
    result = (
        hourly.groupby(columns, observed=True)["traffic_volume"]
        .agg(mean_vehicles="mean", median_vehicles="median", observed_hours="size")
        .reset_index()
    )
    result["mean_vehicles"] = result["mean_vehicles"].round(1)
    result["median_vehicles"] = result["median_vehicles"].round(1)
    return result
