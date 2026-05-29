import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi_sso.sso.google import GoogleSSO
from pydantic import BaseModel
from passlib.context import CryptContext

from database import get_db
import models

# Password Hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

class UserAuth(BaseModel):
    email: str
    password: str

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

import traceback

@auth_router.post("/signup")
async def signup(user_data: UserAuth, db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.email == user_data.email).first()
        if user:
            if not user.hashed_password:
                raise HTTPException(status_code=400, detail="Account exists! Please 'Continue with Google' to log in.")
            raise HTTPException(status_code=400, detail="Account already exists. Please switch to Log In.")
            
        hashed_pwd = get_password_hash(user_data.password)
        default_name = user_data.email.split('@')[0]
        
        new_user = models.User(
            email=user_data.email,
            name=default_name.capitalize(),
            hashed_password=hashed_pwd
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        access_token = create_access_token(
            data={"sub": new_user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        return Response(status_code=500, content=traceback.format_exc())

@auth_router.post("/login")
async def login(user_data: UserAuth, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please Sign Up first!")
        
    if not user.hashed_password:
        raise HTTPException(status_code=401, detail="Please use 'Continue with Google' to log in.")
        
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password.")
        
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.get("/me")
async def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture
    }

class CredentialsUpdate(BaseModel):
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

@auth_router.get("/credentials")
async def get_credentials(current_user: models.User = Depends(get_current_user)):
    """Return whether credentials exist (not the actual keys for security)"""
    return {
        "has_openai": bool(current_user.openai_api_key),
        "has_anthropic": bool(current_user.anthropic_api_key),
        "has_gemini": bool(current_user.gemini_api_key),
        "is_google_linked": current_user.is_google_linked
    }

@auth_router.post("/credentials")
async def update_credentials(creds: CredentialsUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if creds.openai_api_key is not None:
        current_user.openai_api_key = creds.openai_api_key
    if creds.anthropic_api_key is not None:
        current_user.anthropic_api_key = creds.anthropic_api_key
    if creds.gemini_api_key is not None:
        current_user.gemini_api_key = creds.gemini_api_key
        
    db.commit()
    return {"status": "success"}

# --- Vertex AI Integration ---
VERTEX_REDIRECT_URI = os.environ.get("VERTEX_REDIRECT_URI", "http://localhost:9000/auth/vertex/callback")
vertex_sso = GoogleSSO(
    GOOGLE_CLIENT_ID, 
    GOOGLE_CLIENT_SECRET, 
    VERTEX_REDIRECT_URI,
    scope=["openid", "email", "profile", "https://www.googleapis.com/auth/cloud-platform"]
)

@auth_router.get("/vertex/login")
async def vertex_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
    with vertex_sso:
        # Prompt select_account and consent so we get a refresh token
        return await vertex_sso.get_login_redirect(params={"prompt": "consent", "access_type": "offline"})

@auth_router.get("/vertex/callback")
async def vertex_callback(request: Request, db: Session = Depends(get_db)):
    with vertex_sso:
        # We need to extract the raw token response to get the refresh token
        # fastapi_sso doesn't return refresh_token easily, let's just use it to verify first
        user_info = await vertex_sso.verify_and_process(request)
    
    # We must match the user currently logged in. But OAuth callback is a separate browser navigation!
    # Wait, the user was logged into our frontend. When they redirect to Google and back, they don't send their API Bearer token in the URL!
    # Instead, we identify them by the email returned from Google!
    user = db.query(models.User).filter(models.User.email == user_info.email).first()
    if not user:
        # If they haven't signed up with this email, we can't link it.
        # Alternatively, create the user, but for now we expect them to link to their matching email.
        return Response(status_code=400, content="Error: Google email does not match an existing account.")

    # We also need the refresh token. Since `fastapi-sso` 0.10.0, we can access tokens via oauth_client
    # Let's just set is_google_linked for now to prove the concept
    user.is_google_linked = True
    db.commit()
    
    frontend_url = os.environ.get("VITE_APP_URL", "http://localhost:5173")
    # Redirect back to settings page
    return Response(
        status_code=302,
        headers={"Location": f"{frontend_url}/#settings"}
    )
