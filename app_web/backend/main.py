from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import os
import json
import asyncio
import time
from agents import ProAgent, ContraAgent, ModeratorAgent, FactCheckerAgent, JudgeAgent, AnalystAgent
from utils import WebSearcher, parse_metadata, HistoryLogger

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/api/debate")
async def debate_stream(topic: str, rounds: int = 2, web_grounding: bool = True):
    async def event_generator():
        print(f"DEBUG: Starting event generator for topic: {topic}")
        
        # 1. Initialization
        yield {"event": "status", "data": "Initializing Research Pipeline..."}
        await asyncio.sleep(0.5)
        
        # 2. Web Research (Optional)
        knowledge = "No internet facts found."
        if web_grounding:
            yield {"event": "status", "data": "Conducting Web Research..."}
            knowledge = WebSearcher.search_topic(topic)
        
        # 3. Initialize Agents
        moderator = ModeratorAgent(knowledge=knowledge)
        pro = ProAgent(knowledge=knowledge)
        con = ContraAgent(knowledge=knowledge)
        fact_checker = FactCheckerAgent(knowledge=knowledge)
        judge = JudgeAgent()
        analyst = AnalystAgent()
        
        transcript = []

        # 4. Opening Statement (Moderator)
        yield {"event": "status", "data": "Moderator Opening..."}
        full_intro = ""
        async for chunk in moderator.introduce(topic):
            full_intro += chunk
            yield {"event": "delta", "data": json.dumps({"agent": "Moderator", "text": chunk})}
        transcript.append(("Moderator", full_intro))
        yield {"event": "agent_end", "data": json.dumps({"agent": "Moderator", "full_text": full_intro})}

        # 5. Debate Rounds
        for r in range(rounds):
            # PRO turn
            yield {"event": "status", "data": f"Round {r+1}: Agent PRO speaking..."}
            full_p = ""
            async for chunk in pro.get_response(topic, transcript):
                full_p += chunk
                yield {"event": "delta", "data": json.dumps({"agent": "Agent A (PRO)", "text": chunk})}
            
            m_p = parse_metadata(full_p)
            transcript.append(("Agent A (PRO)", m_p["clean_text"]))
            yield {"event": "agent_end", "data": json.dumps({
                "agent": "Agent A (PRO)", 
                "full_text": m_p["clean_text"],
                "metadata": {"sentiment": m_p["sentiment"], "ttr": m_p["ttr"]}
            })}

            # CON turn
            yield {"event": "status", "data": f"Round {r+1}: Agent CONTRA speaking..."}
            full_c = ""
            async for chunk in con.get_response(topic, transcript):
                full_c += chunk
                yield {"event": "delta", "data": json.dumps({"agent": "Agent B (CONTRA)", "text": chunk})}
            
            m_c = parse_metadata(full_c)
            transcript.append(("Agent B (CONTRA)", m_c["clean_text"]))
            yield {"event": "agent_end", "data": json.dumps({
                "agent": "Agent B (CONTRA)", 
                "full_text": m_c["clean_text"],
                "metadata": {"sentiment": m_c["sentiment"], "ttr": m_c["ttr"]}
            })}

        # 6. Fact Check & Judgment
        yield {"event": "status", "data": "Cross-Referencing Facts..."}
        full_f = ""
        async for chunk in fact_checker.check_facts(topic, transcript):
            full_f += chunk
            yield {"event": "delta", "data": json.dumps({"agent": "Fact-Checker", "text": chunk})}
        transcript.append(("Fact-Checker", full_f))
        yield {"event": "agent_end", "data": json.dumps({"agent": "Fact-Checker", "full_text": full_f})}

        yield {"event": "status", "data": "Judge Rendering Verdict..."}
        full_j = ""
        async for chunk in judge.evaluate(topic, transcript):
            full_j += chunk
            yield {"event": "delta", "data": json.dumps({"agent": "Judge", "text": chunk})}
        transcript.append(("Judge", full_j))
        yield {"event": "agent_end", "data": json.dumps({"agent": "Judge", "full_text": full_j})}

        # 7. Final Summary
        yield {"event": "status", "data": "Generating Final Brief..."}
        full_a = ""
        async for chunk in analyst.summarize(topic, transcript):
            full_a += chunk
            yield {"event": "delta", "data": json.dumps({"agent": "Strategic Analyst", "text": chunk})}
        
        # Save to history
        logger = HistoryLogger()
        logger.save_debate(topic, transcript)
        
        yield {"event": "agent_end", "data": json.dumps({"agent": "Strategic Analyst", "full_text": full_a})}
        yield {"event": "complete", "data": "Debate finalized."}

    return EventSourceResponse(event_generator(), ping=15)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
