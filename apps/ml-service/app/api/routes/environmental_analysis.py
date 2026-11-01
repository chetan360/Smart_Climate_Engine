from fastapi import APIRouter, HTTPException

from app.schemas.environmental_analysis import (
    QueryWithEnvironmentalData,
)
from app.schemas.query import QueryUnderstandingRequest
from app.services.environmental_data_service import (
    EnvironmentalDataService,
)
from app.services.query_understanding_service import (
    understand_query,
)


router = APIRouter(
    prefix="/internal/environmental-analysis",
    tags=["Environmental Analysis"],
)


environmental_data_service = EnvironmentalDataService()


@router.post(
    "/prepare",
    response_model=QueryWithEnvironmentalData,
)
def prepare_environmental_analysis(
    request: QueryUnderstandingRequest,
):
    query_result = understand_query(request)

    structured_query = query_result.structured_query

    if not structured_query.region:
        raise HTTPException(
            status_code=422,
            detail=(
                "The region could not be identified. "
                "Please provide a specific region."
            ),
        )

    environmental_data = (
        environmental_data_service.get_environmental_data(
            region=structured_query.region,
        )
    )

    return QueryWithEnvironmentalData(
        structured_query=structured_query,
        environmental_data=environmental_data,
    )