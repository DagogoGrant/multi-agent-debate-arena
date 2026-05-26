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

## How to Use Your Local Ollama with the Cloud Website

If you are using the live deployed website, it cannot normally access the AI models running on your personal laptop. To fix this, you must run Ollama locally and open a secure "tunnel" so the website can communicate with your computer.

### Step-by-Step Guide

**1. Download and Install Ollama**
- Go to [ollama.com](https://ollama.com) and download the installer for your operating system (Mac, Windows, or Linux).
- Install the application and open your terminal/command prompt.
- Pull a small model to test with:
  ```bash
  ollama pull llama3.2:3b
  ```

**2. Start Ollama with Security Bypassed**
By default, Ollama blocks requests from external websites for security reasons. You must start it with a special command to allow the tunnel:
- **Mac/Linux:**
  ```bash
  OLLAMA_ORIGINS="*" ollama serve
  ```
- **Windows (Command Prompt):**
  ```cmd
  set OLLAMA_ORIGINS="*" && ollama serve
  ```
*(Note: Keep this terminal window open!)*

**3. Create the Secure Tunnel**
You need to generate a public URL that forwards to your local Ollama port (`11434`). We recommend using a free **Cloudflare Tunnel**:
- Open a **new** terminal window (do not close the Ollama one).
- Run this exact command:
  ```bash
  cloudflared tunnel --url http://localhost:11434 --http-host-header="localhost"
  ```
  *(If you don't have cloudflared installed, you can use Pinggy via SSH: `ssh -p 443 -R0:localhost:11434 a.pinggy.io`)*

**4. Connect the App**
- Look at the terminal output from Step 3 and find the generated URL (it will look something like `https://random-words.trycloudflare.com`).
- Open the **ArgueMind Elite** website.
- Click the **Settings** gear icon in the menu.
- Paste your tunnel URL into the **Local Ollama Base URL** field.

The live website will now route all AI debate requests directly into your laptop's local hardware!
