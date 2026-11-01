from fastapi import APIRouter, HTTPException

from app.schemas.risk_analysis import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
)
from app.services.risk_analysis_service import risk_analysis_service


router = APIRouter(
    prefix="/internal/risk-analysis",
    tags=["Risk Analysis"],
)


@router.post(
    "/analyze",
    response_model=RiskAnalysisResponse,
)
def analyze_environmental_risk(
    request: RiskAnalysisRequest,
):

    try:
        result = risk_analysis_service.analyze_risk(
            structured_query=request.structured_query,
            environmental_data=request.environmental_data,
        )

        return RiskAnalysisResponse(
            request=request,
            result=result,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )