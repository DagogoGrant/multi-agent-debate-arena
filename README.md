# 🌐 ArgueMind Elite

An advanced, **Web-Augmented Multi-Agent AI Debate Arena** built using local LLMs (via Ollama) and Streamlit. ArgueMind Elite simulates professional debating by pitting custom-profiled AI agents against each other, monitored by real-time fact-checkers, judged by an objective arbiter, and visualized through deep logic structure charts.

---

## 🚀 Key Features

*   **Multi-Agent Cognitive Ecosystem**:
    *   **Moderator**: Establishes the arena, introduces the topic, and enforces guidelines.
    *   **Agent A (PRO)** & **Agent B (CONTRA)**: Fully custom profiles with controllable **Aggressiveness** and **Formality** levels. Can run on different local models (e.g., Llama 3.2, Llama 3, Phi-3).
    *   **Fact-Checker**: Analyzes the transcript dynamically to flag logical fallacies and audit arguments against a truth/knowledge source.
    *   **Judge**: Evaluates overall debate performance and outputs a detailed **Winner Scorecard**.
    *   **Strategic Analyst**: Generates a high-level executive briefing summarizing the strategic arguments.
*   **Real-Time Web Grounding**: Leverages DuckDuckGo search integration to ingest current-event web data dynamically, ensuring the debate isn't limited by static training cutoffs.
*   **Logic Architecture Flow Visualization**: Extracts semantic logic nodes (`CLAIM`, `PREMISE`, `SUPPORT`, `ATTACK`) from the raw text stream and renders an interactive **Sankey logic flow diagram** using Plotly.
*   **Persuasion & Tone Telemetry**:
    *   **Tone Index Monitoring**: Tracks real-time sentiment variation throughout the rounds.
    *   **Type-Token Ratio (TTR)**: Computes and displays lexical diversity.
    *   **Persuasion Confidence Gauge**: Evaluates live PRO vs. CONTRA argument strengths to output a real-time confidence model.
*   **MacOS Voice Synthesis**: Integrates natively with the system text-to-speech engine to speak the debate lines aloud.
*   **Historical Research Archives**: Automatically archives every debate session (including transcript JSONs, sentiment, latency, and judging scorecards) into a searchable local archive directory (`history/`).

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Python 3
- **Frontend & Dashboard**: Streamlit (with dark glassmorphism styling)
- **Local AI Provider**: Ollama (supports async inference streaming via HTTP POST requests)
- **Analytics & Graphs**: Plotly (Sankey Diagrams, indicator gauges, and line charts), Pandas, and NumPy
- **Search Tooling**: `duckduckgo_search` for search queries

### File Map
```bash
├── app.py              # Main Streamlit dashboard UI (Arena, Lab, and Archives)
├── main.py             # CLI-based runner for running debates in the terminal
├── agents.py           # Modular agent classes (ProAgent, ContraAgent, JudgeAgent, etc.)
├── ollama_client.py    # Asynchronous, non-blocking client interface for Ollama APIs
├── utils.py            # Text parsing, TTR computation, and DuckDuckGo grounding functions
└── history/            # Auto-generated JSON files containing session archives
```

---

## ⚡ Setup & Installation

### 1. Prerequisites
Ensure you have [Ollama](https://ollama.com/) running locally and have pulled your models:
```bash
# Pull the recommended default model
ollama pull llama3.2:3b

# Optional larger models
ollama pull llama3:8b
ollama pull phi3
```

### 2. Clone & Install Dependencies
Clone this repository to your local system, then install the required Python libraries:
```bash
pip install streamlit pandas plotly httpx duckduckgo-search
```

### 3. Run the Dashboard
Fire up the Streamlit engine:
```bash
streamlit run app.py
```

### 4. Run via Terminal (Alternative)
To execute a rapid test debate directly in the terminal without opening the browser:
```bash
python main.py
```

---

## 📖 How It Works Under the Hood

1. **Prompt Structuring**: The agent builds a system prompt dynamically based on its profile parameters, including **Aggressiveness** and **Formality**.
2. **Metadata Ingestion**: Agents are instructed to inject structural linguistic metrics at the end of their responses (e.g. `[[SENTIMENT: score, TTR: score, FALLACIES: [list]]]` & tag lines like `CLAIM:`, `PREMISE:`).
3. **Real-time Parsing**: The utility engine strips away these metadata brackets, calculates lexical token-density indexes, extracts semantic logic blocks, and updates the reactive UI and data dashboards.
