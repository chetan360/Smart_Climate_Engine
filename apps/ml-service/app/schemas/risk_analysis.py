from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.environmental_data import EnvironmentalDataset
from app.schemas.query import StructuredQuery


class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


class RiskFactor(BaseModel):
    name: str
    contribution: float = Field(ge=0, le=100)
    explanation: str


class RiskAnalysisRequest(BaseModel):
    structured_query: StructuredQuery
    environmental_data: EnvironmentalDataset


class RiskAnalysisResult(BaseModel):
    region: str
    problem_type: str

    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel

    summary: str
    risk_factors: list[RiskFactor]

    is_mock_data: bool
    data_source: str


class RiskAnalysisResponse(BaseModel):
    request: RiskAnalysisRequest
    result: RiskAnalysisResult