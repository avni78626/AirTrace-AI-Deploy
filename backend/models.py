from pydantic import BaseModel


class CitizenReport(BaseModel):

    city: str

    description: str

    latitude: float

    longitude: float
    