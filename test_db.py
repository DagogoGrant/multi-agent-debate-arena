from backend.database import SessionLocal, engine
from backend import models
from backend.auth import get_password_hash
import json

# Initialize DB
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # 1. Create a dummy user
    user = db.query(models.User).filter_by(email="test@test.com").first()
    if not user:
        user = models.User(email="test@test.com", hashed_password=get_password_hash("password"))
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # 2. Try to save a debate
    db_session = models.DebateSession(
        user_id=user.id,
        topic="Test Topic",
        transcript=json.dumps([("PRO", "Hello")])
    )
    db.add(db_session)
    db.commit()
    print("SUCCESS")
except Exception as e:
    print("FAILED:", e)
finally:
    db.close()
