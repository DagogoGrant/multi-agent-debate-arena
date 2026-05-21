import os
import json
import re
from datetime import datetime

class HistoryLogger:
    def __init__(self, history_dir="history"):
        self.history_dir = history_dir
        if not os.path.exists(self.history_dir):
            os.makedirs(self.history_dir)

    def save_debate(self, topic, transcript, metrics=None, winner_info=None):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"debate_{timestamp}.json"
        filepath = os.path.join(self.history_dir, filename)
        
        data = {
            "topic": topic,
            "timestamp": timestamp,
            "transcript": transcript,
            "metrics": metrics,
            "winner_info": winner_info
        }
        
        with open(filepath, "w") as f:
            json.dump(data, f, indent=4)
        return filepath

def calculate_ttr(text):
    """
    Calculates Type-Token Ratio (Lexical Diversity).
    """
    words = re.findall(r'\w+', text.lower())
    if not words:
        return 0
    unique_words = set(words)
    return round(len(unique_words) / len(words), 3)

def parse_metadata(text):
    """
    Parses linguistic metadata from agent response.
    Format expected: [[SENTIMENT: X, TTR: Y, FALLACIES: [Z]]]
    """
    pattern = r"\[\[SENTIMENT:\s*([\d\.-]+),\s*TTR:\s*([\d\.-]+),\s*FALLACIES:\s*\[(.*?)\]\]\]"
    match = re.search(pattern, text)
    if match:
        return {
            "sentiment": float(match.group(1)),
            "ttr": float(match.group(2)),
            "fallacies": [f.strip() for f in match.group(3).split(",") if f.strip()],
            "clean_text": text.replace(match.group(0), "").strip()
        }
    return {"sentiment": 0.0, "ttr": calculate_ttr(text), "fallacies": [], "clean_text": text}

def format_scorecard(text):
    """
    Extracts the scorecard part from the judge's response.
    """
    if "SCORECARD:" in text:
        return text.split("SCORECARD:")[1].strip()
    return None

from duckduckgo_search import DDGS

class WebSearcher:
    @staticmethod
    def search_topic(topic, max_results=5):
        try:
            with DDGS() as ddgs:
                results = [r for r in ddgs.text(topic, max_results=max_results)]
                if not results: return "No internet facts found."
                summary = "\n".join([f"- {r['title']}: {r['body']}" for r in results])
                return summary
        except Exception as e:
            return f"Strategic search failed: {e}"

def extract_logic_nodes(text, speaker):
    """
    Extracts semantic logic nodes from response.
    """
    nodes = []
    patterns = {
        "CLAIM": r"CLAIM:\s*(.*?)(?=\n|PREMISE|SUPPORT|ATTACK|$)",
        "PREMISE": r"PREMISE:\s*(.*?)(?=\n|CLAIM|SUPPORT|ATTACK|$)",
        "SUPPORT": r"SUPPORT:\s*(.*?)(?=\n|CLAIM|PREMISE|ATTACK|$)",
        "ATTACK": r"ATTACK:\s*(.*?)(?=\n|CLAIM|PREMISE|SUPPORT|$)"
    }
    
    for tag, regex in patterns.items():
        matches = re.findall(regex, text, re.IGNORECASE | re.DOTALL)
        for m in matches:
            content = m.strip()
            if content:
                nodes.append({"type": tag, "content": content, "speaker": speaker})
    return nodes
