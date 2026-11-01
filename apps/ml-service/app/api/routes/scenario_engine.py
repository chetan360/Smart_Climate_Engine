from fastapi import APIRouter, HTTPException

from app.schemas.scenario import (
    ScenarioGenerationRequest,
    ScenarioGenerationResponse,
)
from app.services.scenario_engine_service import scenario_engine_service


router = APIRouter(
    prefix="/internal/scenario-engine",
    tags=["Scenario Engine"],
)


@router.post(
    "/generate",
    response_model=ScenarioGenerationResponse,
)
def generate_scenarios(
    request: ScenarioGenerationRequest,
):

    try:
        return scenario_engine_service.generate_scenarios(
            structured_query=request.structured_query,
            environmental_data=request.environmental_data,
            risk_analysis=request.risk_analysis,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )