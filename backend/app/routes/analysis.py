from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from kiteconnect import KiteConnect
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..models import Analysis, Holding, User
from ..schemas import AnalysisResponse, ConcentrationItem, HoldingBase, PortfolioResponse, Recommendation, SectorItem
from .dependencies import get_current_user

router = APIRouter(prefix="/analysis", tags=["analysis"])
settings = get_settings()


def _compute_summary(holdings: List[Holding]) -> PortfolioResponse:
    holdings_payload = [
        HoldingBase(
            symbol=holding.symbol,
            quantity=holding.quantity,
            avg_price=holding.avg_price,
            ltp=holding.ltp,
            pnl=holding.pnl,
        )
        for holding in holdings
    ]

    total_invested = sum(item.quantity * item.avg_price for item in holdings_payload)
    total_value = sum(item.quantity * item.ltp for item in holdings_payload)
    total_pnl = sum(item.pnl for item in holdings_payload)

    return PortfolioResponse(
        holdings=holdings_payload,
        total_invested=round(total_invested, 2),
        total_value=round(total_value, 2),
        total_pnl=round(total_pnl, 2),
    )


def _generate_recommendation(holding: Holding, weight: float) -> Recommendation:
    invested = holding.quantity * holding.avg_price
    ai_score = 50.0
    if invested > 0:
        pnl_ratio = holding.pnl / invested
        ai_score = max(0.0, min(100.0, 60 + pnl_ratio * 100))

    if weight > 0.25:
        risk_level = "High"
    elif weight > 0.15:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    if holding.pnl > 0 and risk_level != "High":
        recommendation = "Hold"
    elif holding.pnl < 0 and risk_level == "High":
        recommendation = "Reduce Exposure"
    else:
        recommendation = "Review"

    return Recommendation(
        symbol=holding.symbol,
        ai_score=round(ai_score, 2),
        risk=risk_level,
        recommendation=recommendation,
    )


@router.get("", response_model=AnalysisResponse)
def get_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    kite = KiteConnect(api_key=settings.kite_api_key)
    if not current_user.kite_access_token:
        raise HTTPException(status_code=401, detail="User is not authenticated with Kite")

    kite.set_access_token(current_user.kite_access_token)

    try:
        holdings_raw = kite.holdings()
    except Exception as exc:  # pragma: no cover - external API
        raise HTTPException(status_code=400, detail=f"Failed to fetch holdings: {exc}") from exc

    sector_map: Dict[str, str] = {}
    for item in holdings_raw:
        symbol = item.get("tradingsymbol") or item.get("symbol")
        if symbol:
            sector = item.get("sector") or "Unknown"
            sector_map[symbol] = sector

    holdings = (
        db.query(Holding)
        .filter(Holding.user_id == current_user.id)
        .order_by(Holding.symbol.asc())
        .all()
    )

    if not holdings:
        raise HTTPException(status_code=404, detail="Holdings not found. Sync your portfolio first.")

    summary = _compute_summary(holdings)

    total_value = summary.total_value or 1.0
    concentration: List[ConcentrationItem] = []
    sector_breakdown: Dict[str, float] = {}
    recommendations: List[Recommendation] = []

    db.query(Analysis).filter(Analysis.user_id == current_user.id).delete()

    for holding in holdings:
        value = holding.quantity * holding.ltp
        weight = value / total_value if total_value else 0
        concentration.append(
            ConcentrationItem(
                symbol=holding.symbol,
                value=round(value, 2),
                weight=round(weight * 100, 2),
            )
        )

        sector = sector_map.get(holding.symbol, "Unknown")
        sector_breakdown[sector] = sector_breakdown.get(sector, 0.0) + value

        recommendation = _generate_recommendation(holding, weight)
        recommendations.append(recommendation)

        db_analysis = Analysis(
            user_id=current_user.id,
            symbol=holding.symbol,
            ai_score=recommendation.ai_score,
            risk=recommendation.risk,
            recommendation=recommendation.recommendation,
            timestamp=datetime.utcnow(),
        )
        db.add(db_analysis)

    db.commit()

    total_sector_value = sum(sector_breakdown.values()) or 1.0
    sector_payload = [
        SectorItem(
            sector=sector,
            value=round(value, 2),
            weight=round((value / total_sector_value) * 100, 2),
        )
        for sector, value in sector_breakdown.items()
    ]

    return AnalysisResponse(
        summary=summary,
        concentration=concentration,
        sector_breakdown=sector_payload,
        recommendations=recommendations,
        generated_at=datetime.utcnow(),
    )
