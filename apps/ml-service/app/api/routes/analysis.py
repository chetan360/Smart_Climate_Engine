from fastapi import APIRouter

from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_service import analyze_climate_problem

router = APIRouter(
    prefix="/internal/analysis",
    tags=["Climate Analysis"],
)


@router.post(
    "",
    response_model=AnalysisResponse,
)
def create_analysis(request: AnalysisRequest):
    return analyze_climate_problem(request)