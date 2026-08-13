from anthropic.types.beta import beta_managed_agents_outcome_evaluation_resource

from backend.schemas.evaluation.evaluation_result import (
    EvaluationResult,
)
from backend.schemas.review.knowledge_review import (
    KnowledgeReview,
)

from backend.services.evaluation.evaluators.composite_evaluator import (
    CompositeEvaluator,
)

from backend.database.session import SessionLocal

from backend.services.evaluation.evaluation_sql_repository import (
    EvaluationSQLRepository,
)

class EvaluationService:
    """
    Enterprise Evaluation Service.

    This service delegates evaluation to the
    Composite Evaluator.
    """

    def __init__(self):

        self.evaluator = CompositeEvaluator()

    def evaluate(
        self,
        review: KnowledgeReview,
    ) -> EvaluationResult:

        evaluation = self.evaluator.evaluate(
            review
        )

        db = SessionLocal()

        try:

            repository = (
                EvaluationSQLRepository(db)
            )
            
            repository.create(
                evaluation
            )
            

        finally:

            db.close()

        return evaluation