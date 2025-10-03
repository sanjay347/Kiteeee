from fastapi import APIRouter, Depends, HTTPException, Query
from kiteconnect import KiteConnect
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..models import User
from ..schemas import AuthSuccessResponse, AuthUrlResponse

router = APIRouter(prefix="/auth/kite", tags=["auth"])
settings = get_settings()


@router.get("/login", response_model=AuthUrlResponse)
def kite_login() -> AuthUrlResponse:
    kite = KiteConnect(api_key=settings.kite_api_key)
    login_url = kite.login_url()
    if "redirect_url" not in login_url:
        login_url = f"{login_url}&redirect_url={settings.kite_redirect_url}"
    return AuthUrlResponse(auth_url=login_url)


@router.get("/callback", response_model=AuthSuccessResponse)
def kite_callback(
    request_token: str = Query(..., description="Request token returned by Kite Connect"),
    db: Session = Depends(get_db),
) -> AuthSuccessResponse:
    kite = KiteConnect(api_key=settings.kite_api_key)

    try:
        data = kite.generate_session(request_token, api_secret=settings.kite_api_secret)
    except Exception as exc:  # pragma: no cover - depends on external API
        raise HTTPException(status_code=400, detail=f"Failed to authenticate with Kite: {exc}") from exc

    access_token = data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Access token not received from Kite")

    kite.set_access_token(access_token)
    try:
        profile = kite.profile()
    except Exception as exc:  # pragma: no cover - depends on external API
        raise HTTPException(status_code=400, detail=f"Failed to fetch profile: {exc}") from exc

    email = profile.get("email")
    name = profile.get("user_name") or profile.get("user_shortname")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Kite profile")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(email=email, name=name, kite_access_token=access_token)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = name or user.name
        user.kite_access_token = access_token
        db.add(user)
        db.commit()
        db.refresh(user)

    return AuthSuccessResponse(message="Authentication successful", email=user.email, name=user.name)
