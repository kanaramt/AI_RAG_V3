from backend.llm.config import LLMConfig
from backend.llm.registry import LLM_PROVIDER_REGISTRY
from backend.llm.providers.base import BaseLLMProvider


class LLMFactory:
    """
    Factory responsible for creating
    the appropriate LLM provider.
    """

    @staticmethod
    def create(config: LLMConfig) -> BaseLLMProvider:

        provider_name = config.provider.lower()

        provider_class = LLM_PROVIDER_REGISTRY.get(provider_name)

        if provider_class is None:
            available = ", ".join(LLM_PROVIDER_REGISTRY.keys())

            raise ValueError(
                f"Unsupported provider '{provider_name}'. "
                f"Available providers: {available}"
            )

        return provider_class(config)

    @staticmethod
    def get_llm_by_model(model_name: str, temperature: float = 0.2) -> BaseLLMProvider:
        """
        Dynamically construct the LLM provider based on the model name.
        """
        import os
        from backend.settings import settings

        model_name_lower = model_name.lower()
        
        if "gpt" in model_name_lower:
            provider = "openai"
            model = "gpt-4o"
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("⚠️ OpenAI API Key is missing. Please add your OPENAI_API_KEY in Settings -> API Keys & Cloud LLMs.")
            base_url = None
        elif "claude" in model_name_lower:
            provider = "claude"
            model = "claude-3-5-sonnet-20241022"
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("⚠️ Anthropic Claude API Key is missing. Please add your ANTHROPIC_API_KEY in Settings -> API Keys & Cloud LLMs.")
            base_url = None
        elif "gemini" in model_name_lower:
            provider = "gemini"
            model = model_name if "gemini" in model_name_lower else "gemini-2.5-flash"
            api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("⚠️ Google Gemini API Key is missing. Please add your GEMINI_API_KEY in Settings -> API Keys & Cloud LLMs.")
            base_url = None
        elif "grok" in model_name_lower:
            provider = "grok"
            model = "grok-beta"
            api_key = os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
            if not api_key:
                raise ValueError("⚠️ xAI Grok API Key is missing. Please add your GROK_API_KEY in Settings -> API Keys & Cloud LLMs.")
            base_url = "https://api.x.ai/v1"
        elif "groq" in model_name_lower or "llama-3.3" in model_name_lower or "llama-3.1" in model_name_lower or "mixtral" in model_name_lower or "gemma2" in model_name_lower:
            provider = "groq"
            model = model_name if ("llama-" in model_name_lower or "mixtral" in model_name_lower or "gemma" in model_name_lower) else "llama-3.3-70b-versatile"
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("⚠️ Groq API Key is missing. Please add your GROQ_API_KEY in Settings -> API Keys & Cloud LLMs.")
            base_url = "https://api.groq.com/openai/v1"
        else:
            provider = "ollama"
            # Map frontend tags to locally available tags
            if model_name_lower == "llama3":
                model = "llama3:latest"
            elif model_name_lower == "llama3.2":
                model = "llama3.2:latest"
            elif model_name_lower == "mistral":
                model = "mistral:latest"
            elif model_name_lower == "phi3":
                model = "phi3:latest"
            else:
                model = model_name
            api_key = None
            base_url = settings.OLLAMA_BASE_URL

        config = LLMConfig(
            provider=provider,
            model=model,
            api_key=api_key,
            base_url=base_url,
            temperature=temperature
        )
        return LLMFactory.create(config)