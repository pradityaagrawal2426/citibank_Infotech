"""Auth API - login, register, demo access"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os

from app.database import get_db
from app.models.models import User, StudentProfile, UserRole

import bcrypt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

SECRET_KEY = os.getenv("SECRET_KEY", "raahsetu-dev-secret-key-change-in-prod-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str
    is_demo: bool


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "student"


def _safe_verify(plain: str, hashed: str) -> bool:
    """Verify password using direct bcrypt."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:71], hashed.encode("utf-8"))
    except Exception:
        return False


def _safe_hash(password: str) -> str:
    """Hash password using direct bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8")[:71], bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.id == int(user_id)).first()


def require_user(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user


def require_facilitator(current_user: User = Depends(require_user)):
    if current_user.role not in [UserRole.FACILITATOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Facilitator access required")
    return current_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not _safe_verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": str(user.id)}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role.value,
        is_demo=user.is_demo,
    )


@router.post("/register", response_model=Token)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    role = UserRole.STUDENT
    if req.role == "facilitator":
        role = UserRole.FACILITATOR
    user = User(
        username=req.username,
        email=f"{req.username}@raahsetu.in",
        hashed_password=_safe_hash(req.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role.value,
        is_demo=user.is_demo,
    )


class DemoLoginRequest(BaseModel):
    persona: str  # priya, raju, kavya, facilitator


@router.post("/demo-login", response_model=Token)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    persona_map = {
        "priya": "demo_student_priya",
        "raju": "demo_student_raju",
        "kavya": "demo_student_kavya",
        "facilitator": "demo_facilitator",
    }
    username = persona_map.get(req.persona)
    if not username:
        raise HTTPException(status_code=400, detail="Unknown demo persona")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found")
    token = create_access_token({"sub": str(user.id)}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role.value,
        is_demo=user.is_demo,
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role.value,
        "is_demo": current_user.is_demo,
        "preferred_language": current_user.preferred_language,
    }
