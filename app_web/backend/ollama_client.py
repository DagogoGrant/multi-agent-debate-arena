import httpx
import json

class OllamaClient:
    def __init__(self, model="llama3.2:3b", base_url="http://localhost:11434"):
        self.model = model
        self.base_url = f"{base_url}/api/chat"

    async def chat(self, messages, stream=True, model_override=None):
        payload = {
            "model": model_override if model_override else self.model,
            "messages": messages,
            "stream": stream
        }
        print(f"DEBUG: Ollama Request Payload: {json.dumps(payload)}")
        
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                if stream:
                    async with client.stream("POST", self.base_url, json=payload) as response:
                        print(f"DEBUG: Ollama Response Status: {response.status_code}")
                        response.raise_for_status()
                        async for line in response.aiter_lines():
                            if line:
                                try:
                                    data = json.loads(line)
                                    chunk = data.get("message", {}).get("content", "")
                                    if chunk:
                                        yield chunk
                                except Exception as json_err:
                                    print(f"DEBUG: JSON Parse Error: {json_err} on line: {line}")
                else:
                    response = await client.post(self.base_url, json=payload)
                    print(f"DEBUG: Ollama Response Status: {response.status_code}")
                    response.raise_for_status()
                    data = response.json()
                    yield data.get("message", {}).get("content", "")
            except Exception as e:
                print(f"DEBUG: Ollama Connection Error: {e}")
                yield f"Error communicating with Ollama: {e}"
