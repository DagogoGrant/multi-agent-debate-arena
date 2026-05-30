from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import os
import json
import asyncio
from typing import List, Optional
from agents import DynamicAgent
from utils import WebSearcher, parse_metadata, HistoryLogger

import urllib.request
import urllib.error

app = FastAPI()

import models
from database import engine
from auth import auth_router
from sqlalchemy import text

# Create SQLite tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Hotfix for Render: Add the hashed_password column if it doesn't exist
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))
except Exception:
    pass

# Hotfix: Add sharing columns if they don't exist (must be separate blocks for SQLite)
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN is_public BOOLEAN DEFAULT 0"))
except Exception:
    pass

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN share_id VARCHAR"))
except Exception:
    pass

app.include_router(auth_router)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/proxy/models")
async def proxy_models(request: Request):
    try:
        data = await request.json()
        base_url = data.get("base_url")
        api_key = data.get("api_key", "")
        
        if not base_url:
            return {"error": "base_url required"}
            
        url = f"{base_url.rstrip('/')}/models"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP Error {e.code}: {e.reason}"}
    except Exception as e:
        return {"error": str(e)}



@app.get("/")
async def health_check():
    return {"status": "online", "message": "ArgueMind Backend is running"}

class AgentConfig(BaseModel):
    name: str
    role: str
    personality: str
    stance: str
    provider: str = "ollama"
    model: str = "llama3.2:3b"
    api_key: Optional[str] = None
    base_url: Optional[str] = None

class SessionConfig(BaseModel):
    topic: str
    rounds: int = 2
    web_grounding: bool = True
    agents: List[AgentConfig]

@app.get("/api/templates")
async def get_templates():
    with open("templates.json", "r") as f:
        return json.load(f)

from auth import get_current_user
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

@app.get("/api/history")
async def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(models.DebateSession).filter(models.DebateSession.user_id == current_user.id).order_by(models.DebateSession.created_at.desc()).all()
    
    history = []
    for s in sessions:
        history.append({
            "id": str(s.id),
            "topic": s.topic,
            "date": s.created_at.strftime("%Y%m%d_%H%M%S"),
            "status": "COMPLETED"
        })
    return history

@app.get("/api/history/{debate_id}")
async def get_debate_detail(debate_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(models.DebateSession).filter(models.DebateSession.id == debate_id, models.DebateSession.user_id == current_user.id).first()
    if not session:
        return {"error": "Debate not found"}
        
    return {
        "topic": session.topic,
        "transcript": json.loads(session.transcript) if session.transcript else [],
        "share_id": session.share_id,
        "is_public": session.is_public
    }

import uuid

@app.post("/api/history/{debate_id}/share")
async def share_debate(debate_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(models.DebateSession).filter(models.DebateSession.id == debate_id, models.DebateSession.user_id == current_user.id).first()
    if not session:
        return {"error": "Debate not found"}
    
    if not session.share_id:
        session.share_id = str(uuid.uuid4())[:8]
    session.is_public = True
    db.commit()
    
    return {"share_id": session.share_id, "is_public": session.is_public}

@app.get("/api/share/{share_id}")
async def get_shared_debate(share_id: str, db: Session = Depends(get_db)):
    session = db.query(models.DebateSession).filter(models.DebateSession.share_id == share_id, models.DebateSession.is_public == True).first()
    if not session:
        return {"error": "Shared debate not found"}
        
    return {
        "topic": session.topic,
        "transcript": json.loads(session.transcript) if session.transcript else []
    }

from auth import get_current_user

@app.post("/api/debate")
async def debate_stream(config: SessionConfig, current_user: models.User = Depends(get_current_user)):
    async def event_generator():
        print(f"DEBUG: Starting event generator for topic: {config.topic}")
        
        # 1. Initialization
        yield {"event": "status", "data": "Initializing Dynamic Research Pipeline..."}
        await asyncio.sleep(0.5)
        
        # 2. Web Research
        knowledge = "No internet facts found."
        if config.web_grounding:
            yield {"event": "status", "data": "Conducting Web Research..."}
            knowledge = WebSearcher.search_topic(config.topic)
        
        # 3. Initialize Dynamic Agents
        dynamic_agents = []
        for a in config.agents:
            api_key = a.api_key
            if a.provider == 'openai' and not api_key:
                api_key = current_user.openai_api_key
            elif a.provider == 'anthropic' and not api_key:
                api_key = current_user.anthropic_api_key
            elif a.provider == 'gemini' and not api_key:
                api_key = current_user.gemini_api_key
                
            dynamic_agents.append(
                DynamicAgent(
                    name=a.name, 
                    role=a.role, 
                    personality=a.personality, 
                    stance=a.stance, 
                    model_config={"provider": a.provider, "model": a.model, "api_key": api_key, "base_url": a.base_url},
                    knowledge=knowledge
                )
            )
        
        transcript = []
        try:

            # 4. Opening Statement (NEUTRAL)
            for ag in dynamic_agents:
                if ag.stance == "NEUTRAL":
                    yield {"event": "status", "data": f"{ag.name} Opening..."}
                    full_intro = ""
                    async for chunk in ag.execute_task(config.topic, transcript, "introduce"):
                        full_intro += chunk
                        yield {"event": "delta", "data": json.dumps({"agent": ag.name, "text": chunk})}
                    transcript.append((ag.name, full_intro))
                    yield {"event": "agent_end", "data": json.dumps({"agent": ag.name, "full_text": full_intro})}

            # 5. Debate Rounds (PRO / CONTRA)
            for r in range(config.rounds):
                for ag in dynamic_agents:
                    if ag.stance in ["PRO", "CONTRA"]:
                        yield {"event": "status", "data": f"Round {r+1}: {ag.name} speaking..."}
                        full_resp = ""
                        async for chunk in ag.execute_task(config.topic, transcript, "respond"):
                            full_resp += chunk
                            yield {"event": "delta", "data": json.dumps({"agent": f"{ag.name} ({ag.stance})", "text": chunk})}
                    
                        m = parse_metadata(full_resp)
                        transcript.append((f"{ag.name} ({ag.stance})", m["clean_text"]))
                        yield {"event": "agent_end", "data": json.dumps({
                            "agent": f"{ag.name} ({ag.stance})", 
                            "full_text": m["clean_text"],
                            "metadata": {"sentiment": m["sentiment"], "ttr": m["ttr"]}
                        })}

            # 6. Fact Check (AUDITOR)
            for ag in dynamic_agents:
                if ag.stance == "AUDITOR":
                    yield {"event": "status", "data": f"{ag.name} Cross-Referencing Facts..."}
                    full_f = ""
                    async for chunk in ag.execute_task(config.topic, transcript, "check_facts"):
                        full_f += chunk
                        yield {"event": "delta", "data": json.dumps({"agent": ag.name, "text": chunk})}
                    transcript.append((ag.name, full_f))
                    yield {"event": "agent_end", "data": json.dumps({"agent": ag.name, "full_text": full_f})}

            # 7. Judgment (EXEC)
            for ag in dynamic_agents:
                if ag.stance == "EXEC":
                    yield {"event": "status", "data": f"{ag.name} Rendering Verdict..."}
                    full_j = ""
                    async for chunk in ag.execute_task(config.topic, transcript, "evaluate"):
                        full_j += chunk
                        yield {"event": "delta", "data": json.dumps({"agent": ag.name, "text": chunk})}
                    transcript.append((ag.name, full_j))
                    yield {"event": "agent_end", "data": json.dumps({"agent": ag.name, "full_text": full_j})}

            # 8. Final Summary (ANALYST)
            for ag in dynamic_agents:
                if ag.stance == "ANALYST":
                    yield {"event": "status", "data": f"{ag.name} Generating Final Brief..."}
                    full_a = ""
                    async for chunk in ag.execute_task(config.topic, transcript, "summarize"):
                        full_a += chunk
                        yield {"event": "delta", "data": json.dumps({"agent": ag.name, "text": chunk})}
                    transcript.append((ag.name, full_a))
                    yield {"event": "agent_end", "data": json.dumps({"agent": ag.name, "full_text": full_a})}
        
        finally:
            if transcript:
                # Save partial or full debate to history database
                from database import SessionLocal
                db = SessionLocal()
                try:
                    db_session = models.DebateSession(
                        user_id=current_user.id,
                        topic=config.topic,
                        transcript=json.dumps(transcript)
                    )
                    db.add(db_session)
                    db.commit()
                except Exception as e:
                    print("Failed to save debate to DB:", e)
                finally:
                    db.close()
        
        yield {"event": "complete", "data": "Debate finalized."}

    return EventSourceResponse(event_generator(), ping=15)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
