from anthropic.types.beta import beta_managed_agents_agent_tool_config_params
from anthropic.types.beta import beta_managed_agents_agent_tool_config_params
import uuid

from backend.schemas.evaluation.evaluation_result import (
    EvaluationResult,
)
from backend.schemas.recommendation.recommendation_result import (
    RecommendationResult,
)
from backend.schemas.review.knowledge_review import (
    KnowledgeReview,
)
from backend.schemas.review.review_status import (
    ReviewStatus,
)

from backend.services.evaluation.evaluation_service import (
    EvaluationService,
)
from backend.services.knowledge_review.review_repository import (
    ReviewRepository,
)
from backend.services.recommendation.recommendation_service import (
    RecommendationService,
)

from backend.database.session import SessionLocal

from backend.services.knowledge_review.review_sql_repository import (
    ReviewSQLRepository,
)

from backend.services.knowledge_review.review_analytics import (
    ReviewAnalytics,
)
from backend.services.evaluation.evaluation_sql_repository import (
    EvaluationSQLRepository,
)

class ReviewService:
    """
    Enterprise Knowledge Review Service.
    """

    def __init__(self):

        self.db = SessionLocal()

        self.repository = ReviewSQLRepository(
            self.db
        )

        self.evaluation_service = EvaluationService()

        self.recommendation_service = RecommendationService()

        self.analytics = ReviewAnalytics()

        self.recommendation_service = RecommendationService()

    def create_review(
        self,
        review: KnowledgeReview,
    ) -> tuple[
        KnowledgeReview,
        EvaluationResult,
        RecommendationResult,
    ]:

        review.review_id = str(uuid.uuid4())

        review.status = ReviewStatus.PENDING

        review = self.repository.create(
            review
        )

        evaluation = self.evaluation_service.evaluate(
            review
        )

        recommendation = (
            self.recommendation_service.recommend(
                evaluation
            )
        )

        return (
            review,
            evaluation,
            recommendation,
        )

    def get_reviews(
        self,
    ) -> list[KnowledgeReview]:

        return self.repository.get_all()

    def get_pending_reviews(
        self,
    ) -> list[KnowledgeReview]:

        return self.repository.get_pending()

    def update_status(
        self,
        review_id: str,
        status: ReviewStatus,
    ) -> bool:

        return self.repository.update_status(
            review_id,
            status,
        )

    def get_analytics(
        self,
    ) -> dict:

        reviews = self.repository.get_all()

        evaluation_repository = (
            EvaluationSQLRepository(
                self.db
            )
        )

        evaluations = (
            evaluation_repository.get_all()
        )

        return self.analytics.summary(
            reviews,
            evaluations,
        )