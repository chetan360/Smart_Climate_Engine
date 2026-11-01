from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.environmental_data import EnvironmentalDataset
from app.schemas.query import StructuredQuery
from app.schemas.risk_analysis import RiskAnalysisResult


class InterventionType(str, Enum):
    DRAINAGE_EXPANSION = "drainage_expansion"
    DRAINAGE_MAINTENANCE = "drainage_maintenance"
    RAINWATER_HARVESTING = "rainwater_harvesting"
    PERMEABLE_PAVEMENT = "permeable_pavement"
    BIOSWALES = "bioswales"
    RETENTION_POND = "retention_pond"
    URBAN_GREEN_SPACE = "urban_green_space"


class Scenario(BaseModel):
    id: str
    name: str
    intervention_type: InterventionType
    description: str

    estimated_cost: float = Field(ge=0)
    currency: str = "INR"

    estimated_flood_risk_reduction_percentage: float = Field(
        ge=0,
        le=100,
    )

    groundwater_recharge_benefit_percentage: float = Field(
        ge=0,
        le=100,
    )

    environmental_impact_score: float = Field(
        ge=0,
        le=100,
    )

    implementation_time_months: int = Field(ge=1)

    advantages: list[str]
    limitations: list[str]

    is_mock_estimate: bool = True


class ScenarioGenerationRequest(BaseModel):
    structured_query: StructuredQuery
    environmental_data: EnvironmentalDataset
    risk_analysis: RiskAnalysisResult


class ScenarioGenerationResponse(BaseModel):
    region: str
    problem_type: str
    scenarios: list[Scenario]
    is_mock_data: bool