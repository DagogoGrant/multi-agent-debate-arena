from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    
    # Store generic app settings and keys
    openai_api_key = Column(String, nullable=True)
    anthropic_api_key = Column(String, nullable=True)
    gemini_api_key = Column(String, nullable=True)
    
    # Store provider-level OAuth tokens (Phase 2)
    google_refresh_token = Column(String, nullable=True)
    google_access_token = Column(String, nullable=True)
    
    # Simple boolean flag to track if they linked google as a provider
    is_google_linked = Column(Boolean, default=False)
