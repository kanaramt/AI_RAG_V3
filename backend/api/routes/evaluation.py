from fastapi import APIRouter

from backend.schemas.review.knowledge_review import (
    KnowledgeReview,
)
from backend.services.evaluation.evaluation_service import (
    EvaluationService,
)

router = APIRouter(
    prefix="/evaluations",
    tags=["Evaluation"],
)

evaluation_service = EvaluationService()


@router.post("/")
async def evaluate_review(
    review: KnowledgeReview,
):
    return evaluation_service.evaluate(
        review
    )