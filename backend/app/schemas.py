from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class UserSchema(BaseModel):
    id: int
    email: str
    name: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class HoldingBase(BaseModel):
    symbol: str = Field(..., alias="symbol")
    quantity: float
    avg_price: float
    ltp: float
    pnl: float


class HoldingResponse(HoldingBase):
    id: int
    last_updated: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class PortfolioResponse(BaseModel):
    holdings: List[HoldingBase]
    total_invested: float
    total_value: float
    total_pnl: float


class Recommendation(BaseModel):
    symbol: str
    ai_score: float
    risk: str
    recommendation: str


class ConcentrationItem(BaseModel):
    symbol: str
    value: float
    weight: float


class SectorItem(BaseModel):
    sector: str
    value: float
    weight: float


class AnalysisResponse(BaseModel):
    summary: PortfolioResponse
    concentration: List[ConcentrationItem]
    sector_breakdown: List[SectorItem]
    recommendations: List[Recommendation]
    generated_at: datetime


class AuthUrlResponse(BaseModel):
    auth_url: str


class AuthSuccessResponse(BaseModel):
    message: str
    email: str
    name: str | None = None
