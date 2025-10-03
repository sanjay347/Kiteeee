from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User


def get_current_user(
    x_user_email: str | None = Header(default=None, convert_underscores=False),
    db: Session = Depends(get_db),
) -> User:
    if not x_user_email:
        raise HTTPException(status_code=401, detail="X-User-Email header is required")

    user = db.query(User).filter(User.email == x_user_email).first()
    if user is None or not user.kite_access_token:
        raise HTTPException(status_code=401, detail="User not authenticated with Kite")

    return user
