"""Regenerate all published tables and charts from the downloaded UCI CSV."""

from __future__ import annotations

import json
from pathlib import Path
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from src.traffic_analysis import grouped_volume, load_traffic  # noqa: E402


def save_chart(fig: plt.Figure, name: str) -> None:
    fig.savefig(ROOT / "results" / name, dpi=160, bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    hourly, quality = load_traffic(ROOT / "data" / "Metro_Interstate_Traffic_Volume.csv")
    output = ROOT / "results"
    output.mkdir(exist_ok=True)
    tables = {
        "hourly_by_day_type.csv": grouped_volume(hourly, ["day_type", "hour"]),
        "day_type.csv": grouped_volume(hourly, ["day_type"]),
        "monthly.csv": grouped_volume(hourly, ["month"]),
        "yearly.csv": grouped_volume(hourly, ["year"]),
    }
    for filename, table in tables.items():
        table.to_csv(output / filename, index=False)
    (output / "data_quality.json").write_text(json.dumps(quality, indent=2) + "\n", encoding="utf-8")
    site_data = {"hourly": tables["hourly_by_day_type.csv"].to_dict(orient="records"),
                 "monthly": tables["monthly.csv"].to_dict(orient="records")}
    (ROOT / "docs" / "data.json").write_text(json.dumps(site_data, separators=(",", ":")) + "\n", encoding="utf-8")

    plt.rcParams.update({"font.family": "DejaVu Sans", "axes.spines.top": False, "axes.spines.right": False})
    fig, ax = plt.subplots(figsize=(10, 5.2))
    colors = {"Weekday": "#ce5b31", "Weekend": "#66744d"}
    for day_type, group in tables["hourly_by_day_type.csv"].groupby("day_type"):
        ax.plot(group["hour"], group["mean_vehicles"], marker="o", markersize=3,
                linewidth=2.5, label=day_type, color=colors[day_type])
    ax.set(xlabel="Hour of day (local time)", ylabel="Mean vehicles per observed hour",
           title="Traffic by hour and day type", xticks=range(0, 24, 2))
    ax.grid(axis="y", alpha=0.2)
    ax.legend(frameon=False)
    save_chart(fig, "hourly_patterns.png")

    fig, ax = plt.subplots(figsize=(9, 4.8))
    monthly = tables["monthly.csv"]
    ax.bar(monthly["month"], monthly["mean_vehicles"], color="#66744d")
    ax.set(xlabel="Month", ylabel="Mean vehicles per observed hour",
           title="Observed traffic by month", xticks=range(1, 13))
    ax.grid(axis="y", alpha=0.2)
    ax.set_axisbelow(True)
    save_chart(fig, "monthly_patterns.png")
    print(f"Wrote {len(tables)} tables, 2 charts, site data, and quality metadata")


if __name__ == "__main__":
    main()
