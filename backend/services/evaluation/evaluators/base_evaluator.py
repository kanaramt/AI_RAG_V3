from abc import ABC, abstractmethod

from backend.schemas.evaluation.evaluation_result import (
    EvaluationResult,
)
from backend.schemas.review.knowledge_review import (
    KnowledgeReview,
)


class BaseEvaluator(ABC):
    """
    Base interface for every evaluation engine.
    """

    @abstractmethod
    def evaluate(
        self,
        review: KnowledgeReview,
    ) -> EvaluationResult:
        """
        Evaluate one review.
        """
        raise NotImplementedError