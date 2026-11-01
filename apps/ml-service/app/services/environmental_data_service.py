from app.repositories.environmental_data_repository import (
    EnvironmentalDataRepository,
)
from app.schemas.environmental_data import EnvironmentalDataset


class EnvironmentalDataService:

    def __init__(self):
        self.repository = EnvironmentalDataRepository()

    def get_environmental_data(
        self,
        region: str,
    ) -> EnvironmentalDataset:
        """
        Retrieve environmental data for a region.
        """

        if not region or not region.strip():
            raise ValueError("Region cannot be empty")

        return self.repository.get_data_for_region(
            region=region.strip(),
        )