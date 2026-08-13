from backend.schemas.retrieval.retrieved_document import RetrievedDocument

from backend.services.generation.citation_manager import CitationManager
from backend.services.generation.guardrails import Guardrails
from backend.services.generation.response_generator import ResponseGenerator


class GenerationService:
    """
    Enterprise Generation Pipeline.
    """

    def __init__(self):

        self.generator = ResponseGenerator()
        self.guardrails = Guardrails()
        self.citation_manager = CitationManager()

    def generate(
        self,
        query: str,
        context: str,
        documents: list[RetrievedDocument],
    ) -> dict:

        response = self.generator.generate(
            query=query,
            context=context,
        )

        response = self.guardrails.validate(
            response,
        )

        citations = self.citation_manager.build(
            documents,
        )

        return {
            "answer": response,
            "citations": citations,
        }