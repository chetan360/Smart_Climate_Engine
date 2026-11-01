from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ProblemType(str, Enum):
    FLOODING = "flooding"
    WATER_SCARCITY = "water_scarcity"
    URBAN_HEAT = "urban_heat"
    POLLUTION = "pollution"
    LAND_DEGRADATION = "land_degradation"
    UNKNOWN = "unknown"


class QueryUnderstandingRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=10,
        description="Natural-language query from the official",
    )


class StructuredQuery(BaseModel):
    region: Optional[str] = None
    problem_type: ProblemType = ProblemType.UNKNOWN
    problem_description: str
    budget: Optional[float] = None
    currency: Optional[str] = None
    priorities: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)


class QueryUnderstandingResponse(BaseModel):
    original_query: str
    structured_query: StructuredQuery