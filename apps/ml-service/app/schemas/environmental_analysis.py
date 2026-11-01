from pydantic import BaseModel

from app.schemas.environmental_data import EnvironmentalDataset
from app.schemas.query import StructuredQuery


class QueryWithEnvironmentalData(BaseModel):
    structured_query: StructuredQuery
    environmental_data: EnvironmentalDataset