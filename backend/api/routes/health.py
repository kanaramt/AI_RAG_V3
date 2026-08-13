from fastapi import APIRouter
from backend.services.llm.llm_factory import LLMFactory

router = APIRouter()


@router.get("/health")
async def health():
    llm = LLMFactory.create()
    return llm.health_check()