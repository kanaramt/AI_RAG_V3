from backend.llm.providers.claude import ClaudeProvider
from backend.llm.providers.gemini import GeminiProvider
from backend.llm.providers.grok import GrokProvider
from backend.llm.providers.groq import GroqProvider
from backend.llm.providers.ollama import OllamaProvider
from backend.llm.providers.openai import OpenAIProvider


LLM_PROVIDER_REGISTRY = {
    "ollama": OllamaProvider,
    "openai": OpenAIProvider,
    "gemini": GeminiProvider,
    "claude": ClaudeProvider,
    "grok": GrokProvider,
    "groq": GroqProvider,
}