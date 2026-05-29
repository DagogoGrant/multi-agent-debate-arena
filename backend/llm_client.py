import json
import litellm

class LLMClient:
    def __init__(self, default_model="ollama/llama3.2:3b", base_url="http://localhost:11434"):
        self.default_model = default_model
        self.base_url = base_url

    async def chat(self, messages, stream=True, model_config=None):
        """
        model_config expects a dictionary:
        {
            "provider": "ollama", # or "openai", "anthropic"
            "model": "llama3.2:3b", # or "gpt-4o", "claude-3-5-sonnet-20240620"
            "api_key": "optional-key-if-not-ollama"
        }
        """
        provider = "ollama"
        model_name = "llama3.2:3b"
        api_key = None
        base_url = None
        
        if model_config:
            provider = model_config.get("provider", "ollama").lower()
            model_name = model_config.get("model", "llama3.2:3b")
            api_key = model_config.get("api_key", None)
            base_url = model_config.get("base_url", None)
            
        # Format the model string for litellm
        litellm_model = model_name
        if provider == "ollama" and not litellm_model.startswith("ollama/"):
            litellm_model = f"ollama/{model_name}"
        elif provider == "openai" and not litellm_model.startswith("openai/"):
            litellm_model = f"openai/{model_name}"
        elif provider == "anthropic" and not litellm_model.startswith("anthropic/"):
            litellm_model = f"anthropic/{model_name}"
        elif provider == "gemini" and not litellm_model.startswith("gemini/"):
            litellm_model = f"gemini/{model_name}"
        elif provider == "grok" and not litellm_model.startswith("xai/"):
            litellm_model = f"xai/{model_name}"
            
        kwargs = {
            "model": litellm_model,
            "messages": messages,
            "stream": stream,
        }
        
        if base_url:
            kwargs["api_base"] = base_url
        elif provider == "ollama":
            kwargs["api_base"] = self.base_url
            
        if api_key:
            kwargs["api_key"] = api_key

        print(f"DEBUG: LiteLLM Request: model={litellm_model}, provider={provider}, stream={stream}")
        
        try:
            if stream:
                response = await litellm.acompletion(**kwargs)
                async for chunk in response:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield content
            else:
                response = await litellm.acompletion(**kwargs)
                yield response.choices[0].message.content
        except Exception as e:
            print(f"DEBUG: LiteLLM Error: {e}")
            yield f"Error communicating with LLM ({provider} - {litellm_model}): {e}"
