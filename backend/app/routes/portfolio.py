from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from kiteconnect import KiteConnect
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..models import Holding, User
from ..schemas import HoldingBase, PortfolioResponse
from .dependencies import get_current_user

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
settings = get_settings()


def _normalize_holding(item: dict) -> HoldingBase:
    symbol = item.get("tradingsymbol") or item.get("symbol")
    if not symbol:
        raise ValueError("Holding symbol missing")

    quantity = float(item.get("quantity") or item.get("shares") or 0.0)
    avg_price = float(item.get("average_price") or item.get("avg_price") or 0.0)
    ltp = float(item.get("last_price") or item.get("ltp") or 0.0)
    pnl = float(item.get("pnl") or ((ltp - avg_price) * quantity))

    return HoldingBase(symbol=symbol, quantity=quantity, avg_price=avg_price, ltp=ltp, pnl=pnl)


@router.get("", response_model=PortfolioResponse)
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PortfolioResponse:
    kite = KiteConnect(api_key=settings.kite_api_key)
    if not current_user.kite_access_token:
        raise HTTPException(status_code=401, detail="User is not authenticated with Kite")

    kite.set_access_token(current_user.kite_access_token)

    try:
        holdings_raw = kite.holdings()
    except Exception as exc:  # pragma: no cover - external API
        raise HTTPException(status_code=400, detail=f"Failed to fetch holdings: {exc}") from exc

    holdings: List[HoldingBase] = []
    total_invested = total_value = total_pnl = 0.0

    db.query(Holding).filter(Holding.user_id == current_user.id).delete()

    for item in holdings_raw:
        try:
            normalized = _normalize_holding(item)
        except ValueError:
            continue

        holdings.append(normalized)
        total_invested += normalized.quantity * normalized.avg_price
        total_value += normalized.quantity * normalized.ltp
        total_pnl += normalized.pnl

        db_holding = Holding(
            user_id=current_user.id,
            symbol=normalized.symbol,
            quantity=normalized.quantity,
            avg_price=normalized.avg_price,
            ltp=normalized.ltp,
            pnl=normalized.pnl,
            last_updated=datetime.utcnow(),
        )
        db.add(db_holding)

    db.commit()

    return PortfolioResponse(
        holdings=holdings,
        total_invested=round(total_invested, 2),
        total_value=round(total_value, 2),
        total_pnl=round(total_pnl, 2),
    )
