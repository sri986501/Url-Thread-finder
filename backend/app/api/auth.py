from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, AuditLog
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.schemas.common import ApiResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
import json

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=ApiResponse[TokenResponse])
def register(req: UserRegisterRequest, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # First registered user can be ADMIN if desired, otherwise default USER
    is_first = db.query(User).count() == 0
    role = "ADMIN" if is_first else "USER"

    user = User(
        name=req.name,
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        resource_type="User",
        resource_id=user.id,
        metadata_json=json.dumps({"email": user.email, "role": user.role}),
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return ApiResponse.ok(TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    ))

@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(req: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Log audit
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="User",
        resource_id=user.id,
        metadata_json=json.dumps({"email": user.email}),
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return ApiResponse.ok(TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    ))

@router.post("/logout", response_model=ApiResponse[dict])
def logout(current_user: User = Depends(get_current_user)):
    return ApiResponse.ok({"message": "Successfully logged out."})

@router.get("/me", response_model=ApiResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return ApiResponse.ok(UserResponse.model_validate(current_user))
