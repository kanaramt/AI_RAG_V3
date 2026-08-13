class PromptBuilder:
    """
    Builds prompts for the LLM.
    """

    def build(
        self,
        query: str,
        context: str,
        has_attachments: bool = False
    ) -> str:
        """
        Build a structured prompt that combines context (from RAG database,
        image OCR, or attached documents) with the user query.
        """
        if not context or not context.strip():
            return query

        if has_attachments:
            return f"""You are an enterprise AI vision and document analysis assistant.

INSTRUCTIONS:
- The user has attached files, screenshots, or image snapshots to this prompt.
- The extracted text and visual content of the user's attached file/image is provided below under 'Attached Image / Snapshot Content'.
- Carefully read and analyze the attached content to answer the user's question DIRECTLY, clearly, and comprehensively (just like ChatGPT and Claude).
- Do NOT output "Not found in internal knowledge source" when analyzing attached files/images — answer the user's question using the attached content.

---
Attached Image / Snapshot Content
---

{context}

---
User Question
---

{query}

---
Answer
---
"""
        else:
            return f"""You are a strict Enterprise Knowledge Base Assistant.

CRITICAL GROUNDING RULES:
- You MUST answer the user prompt STRICTLY and EXCLUSIVELY using ONLY the internal vector database document context provided below (extracted from documents in backend/data/).
- Do NOT use pre-trained external knowledge, general internet knowledge, or invent details not present in the retrieved context.
- If the user query asks about a topic, location, tool, general knowledge, or concept (e.g. "where is Delhi in India") NOT directly answered in the retrieved internal context below, do NOT answer using pre-trained knowledge.
- Instead, respond EXACTLY: "I am sorry, but the requested information is not available in the internal knowledge base documents. To answer questions outside the internal knowledge base, please select 'Google / Web Search' from the search mode dropdown."

---
Retrieved Internal Vector DB Knowledge Context
---

{context}

---
User Question
---

{query}

---
Answer
---
"""