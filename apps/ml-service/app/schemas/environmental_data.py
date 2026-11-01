from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class RainfallRecord(BaseModel):
    date: date
    rainfall_mm: float = Field(ge=0)
    duration_hours: Optional[float] = Field(default=None, ge=0)


class WaterLevelRecord(BaseModel):
    date: date
    water_level_m: float
    station_name: str


class LandUseData(BaseModel):
    built_up_percentage: float = Field(ge=0, le=100)
    vegetation_percentage: float = Field(ge=0, le=100)
    water_body_percentage: float = Field(ge=0, le=100)
    open_land_percentage: float = Field(ge=0, le=100)
    impervious_surface_percentage: float = Field(ge=0, le=100)


class DrainageData(BaseModel):
    drainage_capacity_m3_per_hour: float = Field(ge=0)
    estimated_peak_runoff_m3_per_hour: float = Field(ge=0)
    drainage_coverage_percentage: float = Field(ge=0, le=100)
    blocked_drainage_percentage: float = Field(ge=0, le=100)


class ElevationData(BaseModel):
    minimum_elevation_m: float
    maximum_elevation_m: float
    average_elevation_m: float
    slope_percentage: float = Field(ge=0)


class HistoricalFloodRecord(BaseModel):
    year: int
    flood_occurred: bool
    severity: int | None = Field(
        default=None,
        ge=1,
        le=5,
    )
    affected_area_percentage: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
    )


class EnvironmentalDataset(BaseModel):
    region: str

    rainfall_records: List[RainfallRecord]
    water_level_records: List[WaterLevelRecord]

    land_use: LandUseData
    drainage: DrainageData
    elevation: ElevationData

    historical_floods: List[HistoricalFloodRecord]

    data_source: str
    is_mock_data: bool = True