import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi_sso.sso.google import GoogleSSO

from database import get_db
import models

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

# Google SSO Configuration
# Users will need to set these in their .env or Render dashboard
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
# Needs to match the deployed URL exactly in Google Cloud Console
REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:9000/auth/google/callback")

google_sso = GoogleSSO(
    GOOGLE_CLIENT_ID, 
    GOOGLE_CLIENT_SECRET, 
    REDIRECT_URI
)

auth_router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@auth_router.get("/google/login")
async def google_login():
    """Redirects the user to Google login page"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured on server")
    with google_sso:
        return await google_sso.get_login_redirect()

@auth_router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handles the callback from Google"""
    with google_sso:
        user_info = await google_sso.verify_and_process(request)
        
    # Check if user exists, else create
    user = db.query(models.User).filter(models.User.email == user_info.email).first()
    if not user:
        user = models.User(
            email=user_info.email,
            name=user_info.display_name,
            picture=user_info.picture,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate JWT for our app
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # We redirect the user back to the frontend dashboard, with the token in the URL or via postMessage
    # For a simple SPA, we can redirect back to frontend URL with token in hash fragment
    frontend_url = os.environ.get("VITE_APP_URL", "http://localhost:5173")
    return Response(
        status_code=302,
        headers={"Location": f"{frontend_url}/#access_token={access_token}"}
    )

@auth_router.get("/me")
async def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture
    }
