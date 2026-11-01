from pydantic import BaseModel, Field
from typing import List, Optional


class AnalysisRequest(BaseModel):
    region: str = Field(..., description="Target region or neighborhood")
    problem: str = Field(..., description="Environmental problem described by the official")
    budget: Optional[float] = Field(
        default=None,
        description="Maximum available budget"
    )
    currency: str = "INR"
    priorities: List[str] = Field(default_factory=list)


class Intervention(BaseModel):
    name: str
    estimated_cost: float
    flood_risk_reduction: float
    environmental_impact: str
    advantages: List[str]
    disadvantages: List[str]


class AnalysisResponse(BaseModel):
    analysis_id: str
    region: str
    identified_problem: str
    risk_summary: str
    interventions: List[Intervention]
    recommended_intervention: str
    explanation: str