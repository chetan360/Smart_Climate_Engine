from datetime import date

from app.schemas.environmental_data import (
    DrainageData,
    ElevationData,
    EnvironmentalDataset,
    HistoricalFloodRecord,
    LandUseData,
    RainfallRecord,
    WaterLevelRecord,
)


class EnvironmentalDataRepository:
    """
    Environmental data repository providing regional climate observations.
    """

    def get_data_for_region(
        self,
        region: str,
    ) -> EnvironmentalDataset:

        rainfall_records = [
            RainfallRecord(
                date=date(2025, 6, 15),
                rainfall_mm=82.5,
                duration_hours=4,
            ),
            RainfallRecord(
                date=date(2025, 7, 10),
                rainfall_mm=125.0,
                duration_hours=6,
            ),
            RainfallRecord(
                date=date(2025, 8, 5),
                rainfall_mm=96.2,
                duration_hours=5,
            ),
            RainfallRecord(
                date=date(2025, 9, 2),
                rainfall_mm=145.7,
                duration_hours=7,
            ),
        ]

        water_level_records = [
            WaterLevelRecord(
                date=date(2025, 6, 15),
                water_level_m=2.4,
                station_name="Main Monitoring Station",
            ),
            WaterLevelRecord(
                date=date(2025, 7, 10),
                water_level_m=3.8,
                station_name="Main Monitoring Station",
            ),
            WaterLevelRecord(
                date=date(2025, 8, 5),
                water_level_m=3.1,
                station_name="Main Monitoring Station",
            ),
            WaterLevelRecord(
                date=date(2025, 9, 2),
                water_level_m=4.4,
                station_name="Main Monitoring Station",
            ),
        ]

        land_use = LandUseData(
            built_up_percentage=68.0,
            vegetation_percentage=12.0,
            water_body_percentage=5.0,
            open_land_percentage=15.0,
            impervious_surface_percentage=72.0,
        )

        drainage = DrainageData(
            drainage_capacity_m3_per_hour=8500,
            estimated_peak_runoff_m3_per_hour=12500,
            drainage_coverage_percentage=64.0,
            blocked_drainage_percentage=18.0,
        )

        elevation = ElevationData(
            minimum_elevation_m=548.0,
            maximum_elevation_m=565.0,
            average_elevation_m=554.0,
            slope_percentage=2.5,
        )

        historical_floods = [
            HistoricalFloodRecord(
                year=2021,
                flood_occurred=True,
                severity=3,
                affected_area_percentage=18.0,
            ),
            HistoricalFloodRecord(
                year=2022,
                flood_occurred=True,
                severity=4,
                affected_area_percentage=31.0,
            ),
            HistoricalFloodRecord(
                year=2023,
                flood_occurred=False,
                severity=None,
                affected_area_percentage=0.0,
            ),
            HistoricalFloodRecord(
                year=2024,
                flood_occurred=True,
                severity=5,
                affected_area_percentage=37.0,
            ),
            HistoricalFloodRecord(
                year=2025,
                flood_occurred=True,
                severity=3,
                affected_area_percentage=22.0,
            ),
        ]

        return EnvironmentalDataset(
            region=region,
            rainfall_records=rainfall_records,
            water_level_records=water_level_records,
            land_use=land_use,
            drainage=drainage,
            elevation=elevation,
            historical_floods=historical_floods,
            data_source="MVP Mock Environmental Repository",
            is_mock_data=True,
        )
