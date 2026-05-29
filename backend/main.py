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

@app.get("/api/history")
async def get_history():
    history_dir = "history"
    if not os.path.exists(history_dir):
        os.makedirs(history_dir, exist_ok=True)
        return []
    files = [f for f in os.listdir(history_dir) if f.endswith(".json")]
    history = []
    for f in files:
        try:
            with open(os.path.join(history_dir, f), "r") as file:
                data = json.load(file)
                history.append({
                    "id": f,
                    "topic": data.get("topic", "Unknown"),
                    "date": f.replace("debate_", "").replace(".json", ""),
                    "status": "COMPLETED"
                })
        except: continue
    return sorted(history, key=lambda x: x["date"], reverse=True)

@app.get("/api/history/{debate_id}")
async def get_debate_detail(debate_id: str):
    history_dir = "history"
    file_path = os.path.join(history_dir, debate_id)
    if not os.path.exists(file_path):
        return {"error": "Debate not found"}
    with open(file_path, "r") as file:
        return json.load(file)

@app.post("/api/debate")
async def debate_stream(config: SessionConfig):
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
        dynamic_agents = [
            DynamicAgent(
                name=a.name, 
                role=a.role, 
                personality=a.personality, 
                stance=a.stance, 
                model_config={"provider": a.provider, "model": a.model, "api_key": a.api_key, "base_url": a.base_url},
                knowledge=knowledge
            ) 
            for a in config.agents
        ]
        
        transcript = []

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
        
        # Save to history
        logger = HistoryLogger()
        logger.save_debate(config.topic, transcript)
        
        yield {"event": "complete", "data": "Debate finalized."}

    return EventSourceResponse(event_generator(), ping=15)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
