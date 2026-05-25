# ArgueMind Elite (React + FastAPI)

An advanced, web-augmented multi-agent AI debate arena built using **React (Vite)** and **FastAPI**. ArgueMind Elite simulates professional debating by pitting custom-profiled AI agents against each other, monitored by real-time fact-checkers, judged by an objective arbiter, and visualized through deep logic structure charts.

---

## Key Features

*   **Multi-Agent Cognitive Ecosystem**:
    *   **Moderator**: Establishes the arena, introduces the topic, and enforces guidelines.
    *   **Strategy Lead (PRO)** & **Counter-Strategist (CONTRA)**: Fully custom profiles with controllable aggressiveness and formality levels. Can run on different local models (e.g., Llama 3.2) or cloud providers (OpenAI, Anthropic, Gemini, Grok).
    *   **Compliance Auditor**: Analyzes the transcript dynamically to flag logical fallacies and audit arguments against a truth/knowledge source.
    *   **Chief Analyst**: Generates a high-level executive briefing summarizing the strategic arguments.
*   **Real-Time Web Grounding**: Leverages DuckDuckGo search integration to ingest current-event web data dynamically, ensuring the debate is not limited by static training cutoffs.
*   **Intelligence Lab Visualizations**: 
    *   **Fact Check Queue**: Live extraction of logically verified and unverified claims.
    *   **Confidence Heatmap**: Dynamic radar chart tracking topical focus (Regulation, Market, Risks, Legal, Competition).
    *   **Persuasion Probability**: Real-time sentiment analysis shifting the probability between PRO and CONTRA.
*   **Provider Agnostic**: Mix and match Ollama, OpenAI, Anthropic, Gemini, and Grok on an agent-by-agent basis!

---

## Tech Stack & Architecture

- **Backend**: Python 3.10+, FastAPI, LiteLLM
- **Frontend**: React 18, Vite, TailwindCSS, Recharts, Framer Motion
- **Local AI Provider**: Ollama
- **Cloud AI Providers**: OpenAI, Anthropic, Gemini, Grok (via LiteLLM)
- **Search Tooling**: `duckduckgo_search` for dynamic grounding

### File Map
```bash
├── frontend/           # React + Vite application (UI, Canvas, Arena, Intelligence Lab)
├── backend/
│   ├── main.py         # FastAPI server (SSE Streaming, API endpoints)
│   ├── agents.py       # Modular agent classes processing task pipelines
│   ├── llm_client.py   # LiteLLM router supporting Ollama + Cloud APIs
│   ├── utils.py        # Web search utilities and history logging
│   └── history/        # Auto-generated JSON files containing session archives
```

---

## Setup & Installation (Development)

### 1. Prerequisites
Ensure you have Ollama running locally and have pulled your models:
```bash
ollama pull llama3.2:3b
```

### 2. Backend Setup
```bash
cd backend
pip install fastapi uvicorn litellm pydantic sse-starlette duckduckgo-search
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

---

## Production Deployment & Local Ollama

If you deploy the Frontend to a service like Vercel and the Backend to a service like Render/Heroku, the cloud backend will no longer be able to reach `http://localhost:11434` for Ollama.

**How to allow cloud users to use their Local Ollama:**
1. Start Ollama locally.
2. Install `ngrok` and expose your Ollama port:
   ```bash
   ngrok http 11434
   ```
3. Copy the generated `https://...ngrok.io` URL.
4. In the deployed ArgueMind web app, click the **Settings** gear icon.
5. Paste the URL into the **Local Ollama Base URL (For ngrok/tunnels)** field.

The FastAPI backend will now seamlessly route the AI requests directly to your local machine!
