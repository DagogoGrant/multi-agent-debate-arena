import time
import os
from agents import ProAgent, ContraAgent, JudgeAgent, ModeratorAgent, FactCheckerAgent
from utils import HistoryLogger

def run_debate(topic, rounds=2):
    print(f"\n{'='*20}")
    print(f"DEBATE TOPIC: {topic}")
    print(f"{'='*20}\n")
    
    # Initialize agents
    moderator = ModeratorAgent()
    pro_agent = ProAgent()
    contra_agent = ContraAgent()
    fact_checker = FactCheckerAgent()
    judge = JudgeAgent()
    logger = HistoryLogger()
    
    transcript = []
    
    # 1. Introduction
    print(f"{moderator.name}: ", end="", flush=True)
    intro_full = ""
    for chunk in moderator.introduce(topic):
        print(chunk, end="", flush=True)
        intro_full += chunk
    print("\n")
    
    time.sleep(1)

    # 2. Debate Rounds
    for r in range(1, rounds + 1):
        print(f"--- Round {r} ---")
        
        # PRO Agent's turn
        print(f"{pro_agent.name}: ", end="", flush=True)
        pro_response_chunks = []
        for chunk in pro_agent.get_response(topic, transcript):
            print(chunk, end="", flush=True)
            pro_response_chunks.append(chunk)
        pro_full_response = "".join(pro_response_chunks)
        transcript.append((pro_agent.name, pro_full_response))
        print("\n")
        
        time.sleep(0.5)

        # CONTRA Agent's turn
        print(f"{contra_agent.name}: ", end="", flush=True)
        contra_response_chunks = []
        for chunk in contra_agent.get_response(topic, transcript):
            print(chunk, end="", flush=True)
            contra_response_chunks.append(chunk)
        contra_full_response = "".join(contra_response_chunks)
        transcript.append((contra_agent.name, contra_full_response))
        print("\n")
        
        time.sleep(0.5)

        # Fact Checker's report
        print(f" {fact_checker.name}: ", end="", flush=True)
        for chunk in fact_checker.check_facts(topic, transcript):
            print(chunk, end="", flush=True)
        print("\n")

        time.sleep(1)

    # 3. Final Judging
    print(f"{'='*20}")
    print(f"JUDGING THE DEBATE")
    print(f"{'='*20}\n")
    
    print(f"{judge.name}: ", end="", flush=True)
    judge_full = ""
    for chunk in judge.evaluate(topic, transcript):
        print(chunk, end="", flush=True)
        judge_full += chunk
    print("\n")
    
    # 4. Save history
    history_file = logger.save_debate(topic, transcript, winner_info=judge_full)
    print(f" Debate saved to: {history_file}")

if __name__ == "__main__":
    debate_topic = "AI should replace teachers in schools."
    run_debate(debate_topic, rounds=2)
