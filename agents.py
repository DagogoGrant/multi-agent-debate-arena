from ollama_client import OllamaClient

class Agent:
    def __init__(self, name, role, personality, client=None, model=None, traits=None, knowledge=None):
        self.name = name
        self.role = role
        self.personality = personality
        self.client = client or OllamaClient()
        self.model = model
        self.traits = traits or {"aggressiveness": 0.5, "formality": 0.5}
        self.knowledge = knowledge
        self.history = []

    def build_system_prompt(self, topic):
        prompt = f"You are {self.name}, a {self.personality} participant in a debate about: '{topic}'.\n"
        prompt += f"Your role: {self.role}.\n"
        prompt += f"COGNITIVE PROFILE: Aggressiveness={self.traits['aggressiveness']}, Formality={self.traits['formality']}.\n"
        if self.knowledge:
            prompt += f"GROUNDING KNOWLEDGE: {self.knowledge}\n"
        
        prompt += "- MANDATORY: Structure your response using these exactly capitalized tags for logic mapping:\n"
        prompt += "  CLAIM: [Your main point]\n"
        prompt += "  PREMISE: [The logic behind your point]\n"
        prompt += "  SUPPORT: [Evidence supporting your point]\n"
        prompt += "  ATTACK: [Targeted rebuttal of the opponent]\n"
        prompt += "- Stay in character and maintain your profile.\n"
        prompt += "CRITICAL: At the very end, include hidden linguistic metadata:\n"
        prompt += "[[SENTIMENT: score, TTR: score, FALLACIES: [list]]]\n"
        return prompt

    async def get_response(self, topic, conversation_history, stream=True):
        system_prompt = self.build_system_prompt(topic)
        messages = [{"role": "system", "content": system_prompt}]
        for speaker, message in conversation_history:
            role = "assistant" if speaker == self.name else "user"
            messages.append({"role": role, "content": f"{speaker}: {message}"})
        async for chunk in self.client.chat(messages, stream=stream, model_override=self.model):
            yield chunk

class ProAgent(Agent):
    def __init__(self, name="Agent A (PRO)", personality="logical and facts-driven", client=None, model="llama3.2:3b", traits=None, knowledge=None):
        super().__init__(name, "Argue IN FAVOR OF the topic.", personality, client, model, traits, knowledge)

class ContraAgent(Agent):
    def __init__(self, name="Agent B (CONTRA)", personality="critical and analytical", client=None, model="llama3.2:3b", traits=None, knowledge=None):
        super().__init__(name, "Argue AGAINST the topic.", personality, client, model, traits, knowledge)

class ModeratorAgent(Agent):
    def __init__(self, name="Moderator", personality="guiding and neutral", client=None, model="llama3.2:3b", traits=None, knowledge=None):
        super().__init__(name, "Introduce the topic and manage turns.", personality, client, model, traits, knowledge)

    async def introduce(self, topic):
        messages = [
            {"role": "system", "content": f"You are the {self.name}. Introduce the debate: '{topic}'."},
            {"role": "user", "content": "Please start the session."}
        ]
        async for chunk in self.client.chat(messages, stream=True, model_override=self.model):
            yield chunk

class FactCheckerAgent(Agent):
    def __init__(self, name="Fact-Checker", personality="precise and inquisitive", client=None, model="llama3.2:3b", traits=None, knowledge=None):
        super().__init__(name, "Audit the debate for fallacies based on provided knowledge.", personality, client, model, traits, knowledge)

    async def check_facts(self, topic, transcript):
        transcript_text = "\n".join([f"{speaker}: {message}" for speaker, message in transcript])
        prompt = f"Review this debate: {transcript_text}\n"
        if self.knowledge: prompt += f"Use this truth source: {self.knowledge}"
        messages = [{"role": "system", "content": f"You are the {self.name}."}, {"role": "user", "content": prompt}]
        async for chunk in self.client.chat(messages, stream=True, model_override=self.model):
            yield chunk

class JudgeAgent(Agent):
    def __init__(self, name="Judge", personality="neutral and objective", client=None, model="llama3.2:3b", traits=None, knowledge=None):
        super().__init__(name, "Declare a winner.", personality, client, model, traits, knowledge)

    async def evaluate(self, topic, transcript, stream=True):
        transcript_text = "\n".join([f"{speaker}: {message}" for speaker, message in transcript])
        messages = [{"role": "system", "content": "Judge the debate. Finish with SCORECARD:"}, {"role": "user", "content": transcript_text}]
        async for chunk in self.client.chat(messages, stream=stream, model_override=self.model):
            yield chunk

class AnalystAgent(Agent):
    def __init__(self, name="Strategic Analyst", personality="insightful", client=None, model="llama3.2:3b", traits=None, knowledge=None):
        super().__init__(name, "Synthesize the debate.", personality, client, model, traits, knowledge)

    async def summarize(self, topic, transcript):
        transcript_text = "\n".join([f"{speaker}: {message}" for speaker, message in transcript])
        messages = [{"role": "system", "content": "Create an executive briefing briefing."}, {"role": "user", "content": transcript_text}]
        async for chunk in self.client.chat(messages, stream=True, model_override=self.model):
            yield chunk
