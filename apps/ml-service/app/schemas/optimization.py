from pydantic import BaseModel, Field

from app.schemas.query import StructuredQuery
from app.schemas.risk_analysis import RiskAnalysisResult
from app.schemas.scenario import Scenario


class OptimizationRequest(BaseModel):
    structured_query: StructuredQuery
    risk_analysis: RiskAnalysisResult
    scenarios: list[Scenario]


class OptimizedCombination(BaseModel):
    combination_id: str

    scenario_ids: list[str]
    scenario_names: list[str]

    total_cost: float = Field(ge=0)
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

    optimization_score: float = Field(
        ge=0,
        le=100,
    )

    recommendation_reason: str

    is_mock_estimate: bool = True


class OptimizationResponse(BaseModel):
    region: str
    problem_type: str

    budget: float | None
    currency: str

    combinations_evaluated: int
    optimization_weights: dict[str, float]
    recommended_combinations: list[OptimizedCombination]

    optimization_method: str
    is_mock_data: bool