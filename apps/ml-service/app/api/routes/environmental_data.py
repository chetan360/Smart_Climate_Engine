from fastapi import APIRouter, HTTPException, Query

from app.schemas.environmental_data import EnvironmentalDataset
from app.services.environmental_data_service import (
    EnvironmentalDataService,
)


router = APIRouter(
    prefix="/internal/environmental-data",
    tags=["Environmental Data"],
)


environmental_data_service = EnvironmentalDataService()


@router.get(
    "",
    response_model=EnvironmentalDataset,
)
def get_environmental_data(
    region: str = Query(
        ...,
        min_length=2,
        description="Target region or neighborhood",
    ),
):
    try:
        return environmental_data_service.get_environmental_data(
            region=region,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error