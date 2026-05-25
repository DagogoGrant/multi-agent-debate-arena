from llm_client import LLMClient

class DynamicAgent:
    def __init__(self, name, role, personality, stance, client=None, model_config=None, traits=None, knowledge=None):
        self.name = name
        self.role = role
        self.personality = personality
        self.stance = stance
        self.client = client or LLMClient()
        self.model_config = model_config
        self.traits = traits or {"aggressiveness": 0.5, "formality": 0.5}
        self.knowledge = knowledge

    def build_system_prompt(self, topic):
        prompt = f"You are {self.name}, a {self.personality} participant in a strategy session about: '{topic}'.\n"
        prompt += f"Your role: {self.role}.\n"
        prompt += f"COGNITIVE PROFILE: Aggressiveness={self.traits['aggressiveness']}, Formality={self.traits['formality']}.\n"
        if self.knowledge:
            prompt += f"GROUNDING KNOWLEDGE: {self.knowledge}\n"
        
        if self.stance in ["PRO", "CONTRA"]:
            prompt += "- MANDATORY: Structure your response using these exactly capitalized tags for logic mapping:\n"
            prompt += "  CLAIM: [Your main point]\n"
            prompt += "  PREMISE: [The logic behind your point]\n"
            prompt += "  SUPPORT: [Evidence supporting your point]\n"
            prompt += "  ATTACK: [Targeted rebuttal of the opponent]\n"
            prompt += "- Stay in character and maintain your profile.\n"
            prompt += "CRITICAL: At the very end, include hidden linguistic metadata on a SINGLE LINE:\n"
            prompt += "[[SENTIMENT: score_number, TTR: score_number, FALLACIES: [list]]]\n"
            prompt += "Example: [[SENTIMENT: 0.8, TTR: 0.65, FALLACIES: [ad hominem]]]\n"
        return prompt

    async def execute_task(self, topic, transcript, task_type="respond", stream=True):
        if task_type == "introduce":
            messages = [
                {"role": "system", "content": f"You are the {self.name}. {self.role} Introduce the session: '{topic}'."},
                {"role": "user", "content": "Please start the session."}
            ]
            async for chunk in self.client.chat(messages, stream=True, model_config=self.model_config):
                yield chunk
                
        elif task_type == "check_facts":
            transcript_text = "\n".join([f"{speaker}: {message}" for speaker, message in transcript])
            prompt = f"Review this session: {transcript_text}\n"
            if self.knowledge: prompt += f"Use this truth source: {self.knowledge}"
            prompt += "\n- AT THE END, PROVIDE EXACTLY 3 DATA TAGS for the UI:\n"
            prompt += "FACT_ITEM: [claim] | STATUS: [Verified/Needs Evidence/Weak Logic]\n"
            messages = [{"role": "system", "content": f"You are {self.name}. {self.role}"}, {"role": "user", "content": prompt}]
            async for chunk in self.client.chat(messages, stream=True, model_config=self.model_config):
                yield chunk

        elif task_type == "evaluate":
            transcript_text = "\n".join([f"{speaker}: {message}" for speaker, message in transcript])
            messages = [{"role": "system", "content": f"You are {self.name}. {self.role} Finish with SCORECARD:"}, {"role": "user", "content": transcript_text}]
            async for chunk in self.client.chat(messages, stream=stream, model_config=self.model_config):
                yield chunk

        elif task_type == "summarize":
            transcript_text = "\n".join([f"{speaker}: {message}" for speaker, message in transcript])
            prompt = f"Summarize this session: {transcript_text}\n"
            prompt += "\n- AT THE END, PROVIDE THESE DATA TAGS for the dashboard:\n"
            prompt += "PRO_STRONG: [brief statement]\n"
            prompt += "CON_WEAK: [brief statement]\n"
            prompt += "INSIGHT: [one sentence summary]\n"
            messages = [{"role": "system", "content": f"You are {self.name}. {self.role} Create an executive briefing."}, {"role": "user", "content": prompt}]
            async for chunk in self.client.chat(messages, stream=True, model_config=self.model_config):
                yield chunk

        else: # respond
            system_prompt = self.build_system_prompt(topic)
            messages = [{"role": "system", "content": system_prompt}]
            for speaker, message in transcript:
                role = "assistant" if speaker == self.name else "user"
                messages.append({"role": role, "content": f"{speaker}: {message}"})
            async for chunk in self.client.chat(messages, stream=stream, model_config=self.model_config):
                yield chunk
