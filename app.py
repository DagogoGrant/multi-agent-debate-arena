import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import time
import re
import os
import json
import subprocess
from agents import ProAgent, ContraAgent, JudgeAgent, ModeratorAgent, FactCheckerAgent, AnalystAgent
from utils import HistoryLogger, parse_metadata, format_scorecard, extract_logic_nodes, WebSearcher

# ---------------------------------------------------------
# ARGUMIND ELITE v10: WEB-AUGMENTED
# ---------------------------------------------------------
st.set_page_config(page_title="ArgueMind Elite", page_icon="🌐", layout="wide")

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
    .stApp { background-color: #0b0e14; color: #e6edf3; }
    .workbench-card {
        background: rgba(23, 28, 35, 0.4);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

AVATARS = {
    "Moderator": "assets/avatars/moderator.png",
    "Agent A (PRO)": "assets/avatars/pro.png",
    "Agent B (CONTRA)": "assets/avatars/contra.png",
    "Fact-Checker": "assets/avatars/judge.png",
    "Judge": "assets/avatars/judge.png",
    "Strategic Analyst": "assets/avatars/analyst.png"
}

def speak(text):
    if st.session_state.get("voice_enabled", False):
        clean = re.sub(r'\[\[.*?\]\]', '', text)
        subprocess.Popen(["say", "-v", "Samantha", clean])

# ---------------------------------------------------------
# SIDEBAR: ELITE MODULES
# ---------------------------------------------------------
with st.sidebar:
    st.header("Elite Control Panel")
    topic = st.text_input("Analysis Topic", "Humans should colonize Mars.")
    rounds = st.slider("Depth of Analysis", 1, 5, 2)
    
    st.divider()
    st.subheader("Factual Grounding")
    web_on = st.toggle("Real-Time Web Grounding", True, help="Search the live internet for topic facts.")
    u_file = st.file_uploader("Internal Knowledge Base (txt)", type=["txt"])
    
    st.divider()
    st.subheader("Cognitive Warfare")
    with st.expander("Agent A (PRO) Profile"):
        m_pro = st.selectbox("Model", ["llama3.2:3b", "llama3:8b", "phi3"], key="m_pro")
        ag_pro = st.slider("Aggressiveness", 0.0, 1.0, 0.5, key="ag_pro")
        fm_pro = st.slider("Formality", 0.0, 1.0, 0.5, key="fm_pro")
        
    with st.expander("Agent B (CONTRA) Profile"):
        m_con = st.selectbox("Model", ["llama3.2:3b", "llama3:8b", "phi3"], key="m_con")
        ag_con = st.slider("Aggressiveness", 0.0, 1.0, 0.5, key="ag_con")
        fm_con = st.slider("Formality", 0.0, 1.0, 0.5, key="fm_con")
    
    st.divider()
    st.session_state.voice_enabled = st.toggle("Voice Synthesis", False)
    if st.button("Re-Initialize Engine", use_container_width=True):
        st.session_state.clear(); st.rerun()

# State
if "messages" not in st.session_state: st.session_state.messages = []
if "transcript" not in st.session_state: st.session_state.transcript = []
if "sent_hist" not in st.session_state: st.session_state.sent_hist = []
if "logic_edges" not in st.session_state: st.session_state.logic_edges = []
if "fallacy_log" not in st.session_state: st.session_state.fallacy_log = []
if "telemetry" not in st.session_state: st.session_state.telemetry = []
if "last_opponent_claim" not in st.session_state: st.session_state.last_opponent_claim = "Topic Root"

tab_arena, tab_lab, tab_archives = st.tabs(["🏟️ Arena", "🔬 The Lab", "📂 Archives"])

# ---------------------------------------------------------
# TAB 1: ARENA
# ---------------------------------------------------------
with tab_arena:
    c_chat, c_tele = st.columns([3, 1])
    
    with c_tele:
        st.markdown('<div class="workbench-card"><h4>System Performance</h4></div>', unsafe_allow_html=True)
        if st.session_state.telemetry:
            last = st.session_state.telemetry[-1]
            st.metric("Inference Throughput", f"{last['tps']:.1f} t/s")
            st.metric("Web Latency", f"{last.get('web_lat', 0):.2f}s")
        else: st.info("Run engine to see performance.")

    with c_chat:
        chat_box = st.container(height=550)
        for m in st.session_state.messages:
            with chat_box.chat_message(m["role"], avatar=AVATARS.get(m["role"])):
                st.write(m["content"])
        
        if st.button("INITIATE WEB-AUGMENTED ENGINE", use_container_width=True):
            st.session_state.sent_hist, st.session_state.messages, st.session_state.transcript = [], [], []
            st.session_state.logic_edges, st.session_state.fallacy_log, st.session_state.telemetry = [], [], []
            st.session_state.last_opponent_claim = "Topic Root"
            
            knowledge = u_file.read().decode() if u_file else ""
            web_lat = 0
            
            if web_on:
                with st.status(" Deep Researching Topic via Live Web..."):
                    start_web = time.time()
                    web_facts = WebSearcher.search_topic(topic)
                    knowledge += f"\n\nLIVE INTERNET FACTS (CURRENT EVENTS):\n{web_facts}"
                    web_lat = time.time() - start_web
                    st.success("Web Intelligence Grounded.")

            # Traits
            t_pro = {"aggressiveness": ag_pro, "formality": fm_pro}
            t_con = {"aggressiveness": ag_con, "formality": fm_con}
            
            mod = ModeratorAgent(model=m_pro, knowledge=knowledge)
            pro = ProAgent(model=m_pro, traits=t_pro, knowledge=knowledge)
            con = ContraAgent(model=m_con, traits=t_con, knowledge=knowledge)
            fact = FactCheckerAgent(model=m_con, knowledge=knowledge)
            jud = JudgeAgent(model=m_pro, knowledge=knowledge)
            analyst = AnalystAgent(model=m_pro, knowledge=knowledge)
            
            with chat_box.chat_message("Moderator", avatar=AVATARS["Moderator"]):
                p, full = st.empty(), ""
                try:
                    for chunk in mod.introduce(topic): full += chunk; p.write(parse_metadata(full)["clean_text"])
                except Exception as e:
                    full = f"ERROR: Moderator failed. {e}"; p.error(full)
                st.session_state.messages.append({"role":"Moderator", "content":parse_metadata(full)["clean_text"]})
                speak(full)

            for r in range(1, rounds + 1):
                for ag in [pro, con]:
                    start = time.time()
                    with chat_box.chat_message(ag.name, avatar=AVATARS.get(ag.name)):
                        p, full = st.empty(), ""
                        try:
                            for chunk in ag.get_response(topic, st.session_state.transcript):
                                full += chunk; p.write(parse_metadata(full)["clean_text"])
                            if not full.strip():
                                full = "ERROR: Agent returned empty response. Check if model is running."
                                p.error(full)
                        except Exception as e:
                            full = f"ERROR: Agent model call failed. {e}"; p.error(full)
                            
                        latency = time.time() - start
                        tps = len(full.split()) / (latency or 1)
                        st.session_state.telemetry.append({"tps": tps, "latency": latency, "web_lat": web_lat})
                        
                        m = parse_metadata(full)
                        st.session_state.transcript.append((ag.name, m["clean_text"]))
                        st.session_state.sent_hist.append({"agent": ag.name, "sentiment": m["sentiment"], "ttr": m["ttr"]})
                        st.session_state.messages.append({"role": ag.name, "content": m["clean_text"]})
                        speak(full)

                        # Logic Mapping
                        nodes = extract_logic_nodes(m["clean_text"], ag.name)
                        main_c = None
                        for n in nodes:
                            lbl = f"{ag.name[:5]}: {n['type']} ({n['content'][:15]}...)"
                            if n['type'] == "CLAIM":
                                main_c = lbl
                                clr = "rgba(88,166,255,0.4)" if "PRO" in ag.name else "rgba(248,81,73,0.4)"
                                st.session_state.logic_edges.append((st.session_state.last_opponent_claim, lbl, clr))
                            elif main_c:
                                clr = "rgba(88,166,255,0.15)" if "PRO" in ag.name else "rgba(248,81,73,0.15)"
                                st.session_state.logic_edges.append((main_c, lbl, clr))
                        if main_c: st.session_state.last_opponent_claim = main_c

                with chat_box.chat_message("Fact-Checker", avatar=AVATARS["Fact-Checker"]):
                    p, full = st.empty(), ""
                    try:
                        for chunk in fact.check_facts(topic, st.session_state.transcript):
                            full += chunk; p.write(parse_metadata(full)["clean_text"])
                    except Exception as e:
                        full = f"ERROR: Fact-Checker failed. {e}"; p.error(full)
                    st.session_state.messages.append({"role": "Fact-Checker", "content": parse_metadata(full)["clean_text"]})
                    if "fallacies" in full.lower(): st.toast("🚨 Grounding Exception Match")

            with chat_box.chat_message("Judge", avatar=AVATARS["Judge"]):
                p, full = st.empty(), ""
                try:
                    for chunk in jud.evaluate(topic, st.session_state.transcript): full += chunk; p.write(full)
                except Exception as e:
                    full = f"ERROR: Judge failed. {e}"; p.error(full)
                st.session_state.messages.append({"role": "Judge", "content": full})

            with chat_box.chat_message("Strategic Analyst", avatar=AVATARS["Strategic Analyst"]):
                p, full = st.empty(), ""
                try:
                    for chunk in analyst.summarize(topic, st.session_state.transcript): full += chunk; p.write(full)
                except Exception as e:
                    full = f"ERROR: Strategic Analyst failed. {e}"; p.error(full)
                st.session_state.messages.append({"role": "Strategic Analyst", "content": full})
                st.balloons()
            
            HistoryLogger().save_debate(topic, st.session_state.transcript, metrics=st.session_state.sent_hist)

# ---------------------------------------------------------
# TAB 2: THE LAB
# ---------------------------------------------------------
with tab_lab:
    c1, c2 = st.columns([2, 1])
    with c1:
        st.subheader("Logic Architecture Flow")
        if st.session_state.logic_edges:
            labels = []
            sources, targets, values, colors = [], [], [], []
            for edge in st.session_state.logic_edges:
                if edge[0] not in labels: labels.append(edge[0])
                if edge[1] not in labels: labels.append(edge[1])
            for s, t, clr in st.session_state.logic_edges:
                sources.append(labels.index(s)); targets.append(labels.index(t)); values.append(1); colors.append(clr)
            fig = go.Figure(data=[go.Sankey(
                node = dict(pad = 20, thickness = 15, label = labels, color = "#e6edf3"),
                link = dict(source = sources, target = targets, value = values, color = colors)
            )])
            fig.update_layout(template="plotly_dark", height=500, margin=dict(l=0,r=0,t=0,b=0), paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)
        else: st.info("Awaiting live argumentation data stream...")

    with c2:
        st.subheader("Persuasion Probability")
        if st.session_state.sent_hist:
            pro_s = sum([m['sentiment'] for m in st.session_state.sent_hist if 'PRO' in m['agent']])
            con_s = sum([m['sentiment'] for m in st.session_state.sent_hist if 'CONTRA' in m['agent']])
            prob = 50 + (pro_s - con_s) * 20
            prob = max(5, min(95, prob))
            fig_g = go.Figure(go.Indicator(
                mode = "gauge+number", value = prob, title = {'text': "PRO Confidence (%)"},
                gauge = {'axis': {'range': [0, 100]}, 'bar': {'color': "#58a6ff"}, 'bgcolor': "rgba(0,0,0,0)"}
            ))
            fig_g.update_layout(height=250, margin=dict(l=20,r=20,t=40,b=20), paper_bgcolor='rgba(0,0,0,0)', font={'color': "#e6edf3"})
            st.plotly_chart(fig_g, use_container_width=True)
        
        st.divider()
        st.subheader("Tone Index Monitoring")
        if st.session_state.sent_hist:
            df = pd.DataFrame(st.session_state.sent_hist)
            fig_sent = px.line(df, x=df.index, y="sentiment", color="agent", template="plotly_dark", markers=True,
                               color_discrete_map={"Agent A (PRO)": "#58a6ff", "Agent B (CONTRA)": "#f85149"})
            fig_sent.update_layout(height=200, margin=dict(l=0,r=0,t=20,b=0), paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_sent, use_container_width=True)

# ---------------------------------------------------------
# TAB 3: ARCHIVES
# ---------------------------------------------------------
with tab_archives:
    st.subheader("Historical Research Archives")
    q = st.text_input("Semantic session search...", "")
    if os.path.exists("history"):
        files = sorted(os.listdir("history"), reverse=True)
        filt = [f for f in files if q.lower() in f.lower()]
        sel = st.selectbox("Historical Session Logs", filt)
        if sel:
            with open(os.path.join("history", sel), "r") as f: d = json.load(f)
            st.success(f"Session: {d.get('topic')}")
            st.json(d)
    else: st.info("No archives found.")
