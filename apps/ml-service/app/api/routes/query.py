from fastapi import APIRouter

from app.schemas.query import (
    QueryUnderstandingRequest,
    QueryUnderstandingResponse,
)
from app.services.query_understanding_service import understand_query


router = APIRouter(
    prefix="/internal/query",
    tags=["Query Understanding"],
)


@router.post(
    "/understand",
    response_model=QueryUnderstandingResponse,
)
def understand_official_query(
    request: QueryUnderstandingRequest,
):
    return understand_query(request)