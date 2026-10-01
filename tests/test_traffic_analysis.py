from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import pandas as pd

from src.traffic_analysis import grouped_volume, load_traffic


class TrafficAnalysisTests(unittest.TestCase):
    def write_sample(self, path: Path, volumes: list[int]) -> None:
        pd.DataFrame({
            "date_time": ["2018-01-01 08:00:00", "2018-01-01 08:00:00", "2018-01-06 08:00:00"][:len(volumes)],
            "traffic_volume": volumes,
            "weather_main": ["Rain", "Clouds", "Clear"][:len(volumes)],
            "holiday": ["None"] * len(volumes),
        }).to_csv(path, index=False)

    def test_duplicate_weather_rows_do_not_double_count_traffic(self) -> None:
        with TemporaryDirectory() as directory:
            source = Path(directory) / "traffic.csv"
            self.write_sample(source, [100, 100, 50])
            hourly, quality = load_traffic(source)
            self.assertEqual(quality["duplicate_weather_rows"], 1)
            self.assertEqual(len(hourly), 2)
            table = grouped_volume(hourly, ["day_type"])
            self.assertEqual(dict(zip(table.day_type, table.mean_vehicles)),
                             {"Weekday": 100.0, "Weekend": 50.0})

    def test_conflicting_volume_for_same_hour_is_rejected(self) -> None:
        with TemporaryDirectory() as directory:
            source = Path(directory) / "traffic.csv"
            self.write_sample(source, [100, 200])
            with self.assertRaisesRegex(ValueError, "Conflicting traffic volumes"):
                load_traffic(source)


if __name__ == "__main__":
    unittest.main()
