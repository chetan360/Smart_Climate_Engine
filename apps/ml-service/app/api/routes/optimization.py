from fastapi import APIRouter, HTTPException

from app.schemas.optimization import (
    OptimizationRequest,
    OptimizationResponse,
)
from app.services.optimization_service import optimization_service


router = APIRouter(
    prefix="/internal/optimization",
    tags=["Optimization"],
)


@router.post(
    "/optimize",
    response_model=OptimizationResponse,
)
def optimize_scenarios(
    request: OptimizationRequest,
):

    try:
        return optimization_service.optimize(request)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )