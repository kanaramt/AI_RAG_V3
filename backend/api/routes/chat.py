import time
import re
import base64
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends

from backend.schemas.chat import ChatCreateSchema, RenameSchema, ChatRequest, ChatResponse
from backend.dependencies import get_memory, get_retrieval_service
from backend.schemas.retrieval.retrieval_request import RetrievalRequest
from backend.services.retrieval.retrieval_service import RetrievalService
from backend.services.evaluation_service import calculate_rag_metrics
from backend.services.ingestion_service import IngestionService
from backend.engines.generation.generation_engine import GenerationEngine
from backend.settings import settings

router = APIRouter()

def classify_query(query: str, attachments: list) -> str:
    query_lower = query.lower().strip()
    query_clean = re.sub(r'[^\w\s]', '', query_lower).strip()
    
    # 1. Unsafe Request
    unsafe_keywords = ["exploit", "hack", "bypass security", "illegal", "crack password"]
    if any(kw in query_clean for kw in unsafe_keywords):
        return "UNSAFE_REQUEST"
        
    # 2. Token Optimisation checks (Acknowledgements)
    acknowledgements = {"thanks", "thank you", "okay", "ok", "sure", "done", "perfect", "got it", "understood", "yes", "no", "confirm", "cancel"}
    if query_clean in acknowledgements:
        return "CONVERSATIONAL"
        
    # 3. Greeting
    greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hola", "greetings", "yo"}
    if query_clean in greetings or query_clean.startswith("hey "):
        return "GREETING"
        
    # 4. Small Talk
    small_talk = {
        "how are you", "what can you do", "who are you", "tell me about yourself",
        "whats your name", "what is your name", "who developed you", "who built you",
        "who created you", "tell me about you"
    }
    if query_clean in small_talk:
        return "SMALL_TALK"
        
    # 5. Identity Questions
    identity = ["do you remember me", "who am i", "what's my name", "what is my name", "my name is", "i am", "do you know me", "do u know me"]
    if any(id_q in query_clean for id_q in identity):
        return "IDENTITY_QUESTIONS"
        
    # 6. Conversation Follow-up
    follow_ups = ["explain again", "continue", "more details", "simplify this", "summarise above", "tell me more"]
    if any(f_u in query_clean for f_u in follow_ups):
        return "CONVERSATION_FOLLOW_UP"
        
    # 7. Web Search
    web_keywords = ["search the web", "browse", "internet", "google search", "current weather", "latest news"]
    if any(wk in query_lower for wk in web_keywords):
        return "WEB_SEARCH"
        
    # 8. Analytics Request
    analytics = ["chart", "plot", "eda", "statistics", "kpi", "graph", "dataframe analytics"]
    if any(an in query_lower for an in analytics):
        return "ANALYTICS_REQUEST"
        
    # 9. Database Query
    db_keywords = ["select", "sql", "query database", "database table", "from table", "join", "group by", "order by", "where", "insert into", "create table"]
    if any(db in query_lower for db in db_keywords):
        return "DATABASE_QUERY"
        
    # 10. Coding Request
    coding = [
        "code", "python", "sql", "function", "class", "method", "import", "def", "script", 
        "error", "exception", "debug", "compile", "run", "syntax", "js", "html", "css", 
        "binary search", "algorithm", "sort", "linked list", "tree", "array", "recursion",
        "write a python", "write python", "write code", "implement", "program", "developer"
    ]
    if any(cd in query_lower for cd in coding) or re.search(r'[{}\[\]();<>+=/*]', query):
        return "CODING_REQUEST"
        
    # 11. Document Question (text files, PDFs, CSVs)
    if attachments and any(
        a.get('textContent') or
        (a.get('dataUrl') and (a.get('type') == 'application/pdf' or a.get('name', '').lower().endswith(('.pdf', '.docx', '.xlsx', '.csv', '.txt', '.pptx'))))
        for a in attachments
    ):
        return "DOCUMENT_QUESTION"
        
    # 12. Visual Analysis (Image snapshots only)
    if attachments and any(
        a.get('type', '').startswith('image/') or
        a.get('name', '').lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff'))
        for a in attachments
    ):
        return "VISUAL_ANALYSIS"
        
    # 13. Company Knowledge
    company_keywords = ["policy", "leave", "onboarding", "hr", "benefits", "ABC Software", "office", "holiday"]
    if any(ck in query_lower for ck in company_keywords):
        return "COMPANY_KNOWLEDGE"
        
    if len(query.split()) == 0:
        return "AMBIGUOUS_REQUEST"
        
    if len(query.split()) < 5:
        return "SIMPLE_KNOWLEDGE"
        
    return "TECHNICAL_KNOWLEDGE"

def ocr_base64_image(data_url: str) -> str:
    try:
        import numpy as np
        import cv2
        from backend.services.document_intelligence import DocumentIntelligence
        
        if "," in data_url:
            header, base64_data = data_url.split(",", 1)
        else:
            base64_data = data_url
            
        image_bytes = base64.b64decode(base64_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is not None:
            # Preserve resolution for high-DPI screenshots (up to 2500px)
            max_dim = 2500
            h, w = img.shape[:2]
            if max(h, w) > max_dim:
                scale = max_dim / max(h, w)
                img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
                
            reader = DocumentIntelligence.get_reader()
            results = reader.readtext(img)
            extracted = " ".join(t for _, t, _ in results)
            
            # If standard OCR extracted minimal text, try contrast enhancement (CLAHE for dark mode/low contrast screenshots)
            if len(extracted.strip()) < 15:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
                enhanced = clahe.apply(gray)
                res_enh = reader.readtext(enhanced)
                extracted_enh = " ".join(t for _, t, _ in res_enh)
                if len(extracted_enh.strip()) > len(extracted.strip()):
                    extracted = extracted_enh
                    
            if extracted.strip():
                return f"[Extracted Image/Snapshot Text & Visual Code]:\n{extracted.strip()}"
    except Exception as e:
        print(f"Error performing OCR on image attachment: {e}")
    return ""

def extract_pdf_from_base64(data_url: str) -> str:
    try:
        import pypdf
        import io
        
        if "," in data_url:
            header, base64_data = data_url.split(",", 1)
        else:
            base64_data = data_url
            
        pdf_bytes = base64.b64decode(base64_data)
        pdf_file = io.BytesIO(pdf_bytes)
        
        reader = pypdf.PdfReader(pdf_file)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        print(f"Error extracting PDF text from attachment: {e}")
    return ""


async def extract_attachment_content(attach: dict) -> str:
    """
    Extract text content from any frontend attachment (OCR for images/snapshots, 
    DocumentExtractor for PDF, DOCX, XLSX, PPTX, CSV, TXT, code files).
    """
    name = attach.get('name', 'attachment')
    text = attach.get('textContent')
    if text and text.strip():
        return text.strip()
        
    data_url = attach.get('dataUrl')
    if not data_url:
        return ""
        
    # Image snapshots / uploaded image files
    is_img = attach.get('type', '').startswith('image/') or name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.gif'))
    if is_img:
        import asyncio
        return await asyncio.to_thread(ocr_base64_image, data_url)
        
    # Non-image files (PDF, DOCX, XLSX, PPTX, CSV, TXT, etc.)
    try:
        header, base64_data = data_url.split(",", 1) if "," in data_url else ("", data_url)
        file_bytes = base64.b64decode(base64_data)
        
        import io
        from fastapi import UploadFile
        from backend.services.document_intelligence import DocumentIntelligence
        
        mock_file = UploadFile(
            filename=name,
            file=io.BytesIO(file_bytes)
        )
        
        extracted = await DocumentIntelligence.extract_text(mock_file)
        if extracted and extracted.strip():
            return extracted.strip()
    except Exception as e:
        print(f"Error in DocumentIntelligence extraction for {name}: {e}")
        
    # Fallback to PyPDF if PDF
    if name.lower().endswith('.pdf') or attach.get('type') == 'application/pdf':
        return extract_pdf_from_base64(data_url)
        
    return ""


# --- Conversations CRUD ---

@router.get("")
async def list_chats(memory = Depends(get_memory)):
    return memory.list_conversations()

@router.post("")
async def create_chat(data: ChatCreateSchema, memory = Depends(get_memory)):
    from uuid import uuid4
    chat_id = f"chat-{int(time.time() * 1000)}-{uuid4().hex[:6]}"
    return memory.create_conversation(chat_id, data.title, data.model)

@router.put("/{chat_id}")
async def rename_chat(chat_id: str, data: RenameSchema, memory = Depends(get_memory)):
    success = memory.rename_conversation(chat_id, data.title)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "success"}

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, memory = Depends(get_memory)):
    success = memory.delete_conversation(chat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "success"}

# --- Messages CRUD & Orchestration Pipeline ---

@router.get("/{chat_id}/messages")
async def get_messages(chat_id: str, memory = Depends(get_memory)):
    return memory.get_messages(chat_id)

@router.delete("/{chat_id}/messages/truncate/{msg_id}")
async def truncate_chat_messages(chat_id: str, msg_id: str, memory = Depends(get_memory)):
    success = memory.truncate_messages(chat_id, msg_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"status": "success"}

@router.post("/{chat_id}/messages")
async def post_message(
    chat_id: str,
    data: ChatRequest,
    memory = Depends(get_memory),
    retrieval_service: RetrievalService = Depends(get_retrieval_service)
):
    chat = memory.get_conversation(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    history = memory.get_messages(chat_id)
    query = data.text
    
    # Pipeline trace — collects each processing step for the frontend panel
    pipeline_trace = []
    
    # 1. Query Classification
    intent = classify_query(query, data.attachments)
    print(f"[RAG Router] Classified Intent: {intent}")
    pipeline_trace.append({
        "step": 1,
        "label": "Query Classification",
        "detail": f"Intent detected: {intent}",
        "status": "done"
    })

    # Immediate responses for unsafe or ambiguous inputs to keep latency low
    if intent == "UNSAFE_REQUEST":
        memory.add_message(conversation_id=chat_id, sender="user", text=query, attachments=data.attachments)
        return memory.add_message(
            conversation_id=chat_id,
            sender="assistant",
            text="I'm sorry, but I cannot assist with unsafe or secure-bypass queries.",
            citations=[]
        )
    elif intent == "AMBIGUOUS_REQUEST":
        memory.add_message(conversation_id=chat_id, sender="user", text=query, attachments=data.attachments)
        return memory.add_message(
            conversation_id=chat_id,
            sender="assistant",
            text="Could you please clarify your question or specify the details?",
            citations=[]
        )

    # 3. Dynamic Real-Time URL Extraction & Live Web Browsing
    url_pattern = r'https?://[^\s>]+'
    urls = re.findall(url_pattern, query)
    url_attached_parts = []
    citations = []

    if urls:
        from backend.services.ingestion.web_loader import WebLoader
        for url in urls:
            clean_url = url.rstrip('.,;()[]{}')
            try:
                print(f"[Chat Pipeline] Live fetching URL in real-time: {clean_url}")
                loader = WebLoader(clean_url, timeout=12)
                web_data = loader.fetch_and_clean()
                page_title = web_data.get("title", clean_url)
                page_text = web_data.get("text", "")

                if page_text:
                    url_attached_parts.append(
                        f"=== Live Webpage Content: {page_title} ({clean_url}) ===\n"
                        f"{page_text[:8000]}\n"
                        f"========================================================"
                    )
                    citations.append({
                        "id": f"url-{time.time()}",
                        "name": f"🌐 {page_title}",
                        "source": f"{page_title} ({clean_url})",
                        "score": 1.0,
                        "snippet": page_text[:300] + "..."
                    })

                    # Queue background vector store indexing
                    import asyncio
                    asyncio.create_task(IngestionService.ingest_url(clean_url, memory))
            except Exception as web_err:
                print(f"[Chat Pipeline] Error live browsing URL {clean_url}: {web_err}")

    # 4. Save User Message
    user_msg = memory.add_message(
        conversation_id=chat_id,
        sender="user",
        text=query,
        attachments=data.attachments
    )

    # 5. Extract and Auto-Ingest/Embed All Frontend Attachments into Vector Database
    attachment_parts = []
    attachment_parts.extend(url_attached_parts)
    start_time = time.time()
    
    for attach in data.attachments:
        extracted_text = await extract_attachment_content(attach)
        if extracted_text and extracted_text.strip():
            attachment_parts.append(
                f"=== Attached File: {attach.get('name', 'attachment')} ===\n"
                f"{extracted_text.strip()}\n"
                f"====================================="
            )
            # Add explicit citation for the UI to show the attached document was read
            citations.append({
                "id": attach.get('id', str(time.time())),
                "name": attach.get('name', 'Attached Document'),
                "source": attach.get('name', 'Attached Document') + " (Direct Attachment)",
                "score": 1.0,
                "snippet": extracted_text.strip()[:300] + "..."
            })
            
            # Auto-convert & embed attached/pasted file into Vector Database & Memory Registry
            try:
                import asyncio
                asyncio.create_task(
                    IngestionService.ingest_pasted_content(
                        title=attach.get('name', 'Attached Document'),
                        content=extracted_text.strip(),
                        memory=memory
                    )
                )
                print(f"✅ Auto-ingested attached file '{attach.get('name')}' into Vector Store & Knowledge Base (Background Task)!")
            except Exception as ing_err:
                print(f"Warning: Could not auto-ingest attachment '{attach.get('name')}': {ing_err}")

    # 6. Retrieve Document Context (RAG)
    retrieved_context_str = ""
    
    # Determine if we should query the vector knowledge base.
    NO_RETRIEVAL_INTENTS = {
        "GREETING", "SMALL_TALK", "CONVERSATIONAL", "UNSAFE_REQUEST",
        "IDENTITY_QUESTIONS", "AMBIGUOUS_REQUEST"
    }
    has_attachments = len(attachment_parts) > 0
    
    # Retrieve from vector database ONLY if: intent is knowledge-seeking AND user has NO direct attachments.
    # (When user attaches a file/snapshot, the attached file IS the primary context!)
    should_retrieve = (intent not in NO_RETRIEVAL_INTENTS) and not has_attachments
    
    if should_retrieve:
        req = RetrievalRequest(
            query=query,
            top_k=data.settings.get('topK', 3),
            filters={}
        )
        # Step 2: Query rewriting
        pipeline_trace.append({
            "step": 2,
            "label": "Query Rewriting",
            "detail": f"Rewriting prompt for better semantic retrieval...",
            "status": "done"
        })
        # Step 3: Embedding generation
        try:
            from backend.services.embedding_service import EmbeddingService
            _emb_preview = EmbeddingService().generate_embedding(query)
            emb_dims = len(_emb_preview) if _emb_preview else 0
            emb_snippet = str([round(v, 4) for v in _emb_preview[:6]]) + (" ..." if emb_dims > 6 else "")
            pipeline_trace.append({
                "step": 3,
                "label": "Embedding Generation",
                "detail": f"Query converted to {emb_dims}-dim vector embedding: {emb_snippet}",
                "status": "done"
            })
        except Exception as emb_err:
            pipeline_trace.append({
                "step": 3,
                "label": "Embedding Generation",
                "detail": f"Embedding generated (dim unknown): {emb_err}",
                "status": "done"
            })
        # Step 4: Semantic + Keyword Search
        pipeline_trace.append({
            "step": 4,
            "label": "Semantic & Keyword Search",
            "detail": f"Running dense (semantic) + sparse (keyword/BM25) hybrid retrieval with top_k={data.settings.get('topK', 3)}...",
            "status": "running"
        })
        try:
            response_retrieval, context_str = await retrieval_service.retrieve(req)
            retrieved_context_str = context_str
            num_docs = len(response_retrieval.documents)
            # Update step 4 detail with retrieval results
            pipeline_trace[-1]["detail"] = f"Retrieved {num_docs} document chunk(s) via hybrid search (dense + BM25 fusion)"
            pipeline_trace[-1]["status"] = "done"

            # STRICT CAP: Only top 3 chunks are shown in the UI as citations.
            # The full context_str (used by the LLM) is already capped at top_k by the reranker.
            # Snippet is truncated to ~150 chars (≈2 lines) — display only, does NOT affect LLM input.
            MAX_CITATIONS = 3
            SNIPPET_MAX_CHARS = 150  # ~2 display lines; purely for UI card preview
            for doc in response_retrieval.documents[:MAX_CITATIONS]:
                raw_snippet = doc.text or ""
                display_snippet = raw_snippet[:SNIPPET_MAX_CHARS] + ("..." if len(raw_snippet) > SNIPPET_MAX_CHARS else "")
                citations.append({
                    "id": doc.id,
                    "name": doc.source or "Database Vector Store",
                    "source": doc.source or "Database Vector Store",
                    "score": doc.score,
                    # Snippet is shortened for UI card only — LLM receives full text via context_str
                    "snippet": display_snippet
                })
            # Step 5: Context assembly preview
            context_preview = (context_str[:200] + " ...") if context_str and len(context_str) > 200 else (context_str or "(empty)")
            pipeline_trace.append({
                "step": 5,
                "label": "Context Assembly",
                "detail": f"[Retrieved Context Snippet]: {context_preview}",
                "status": "done"
            })
        except Exception as e:
            pipeline_trace[-1]["status"] = "error"
            pipeline_trace[-1]["detail"] = f"Retrieval error: {e}"
            print(f"[Retrieval Error] Failed to retrieve context: {e}")
    else:
        pipeline_trace.append({
            "step": 2,
            "label": "Retrieval Skipped",
            "detail": f"No vector retrieval needed for intent: {intent}" + (" (direct attachment context used)" if has_attachments else ""),
            "status": "skipped"
        })

    # Strict Grounding Check: If query requires vector DB retrieval but no matching document chunks exist
    if should_retrieve and not retrieved_context_str.strip() and intent not in {"GREETING", "SMALL_TALK", "IDENTITY_QUESTIONS"}:
        out_of_knowledge_response = (
            "I am sorry, but the requested information is not available in the internal vector database knowledge base documents.\n\n"
            "To answer questions outside the internal knowledge base, please select **'Google / Web Search'** from the search mode dropdown."
        )
        assistant_msg = memory.add_message(
            conversation_id=chat_id,
            sender="assistant",
            text=out_of_knowledge_response,
            citations=[]
        )
        return assistant_msg

    # 7. Long-Term Memory Recall (dense search in past dialogues)
    recalled_memory_str = ""
    try:
        from backend.services.vector_store.qdrant_service import QdrantService
        from backend.services.embedding_service import EmbeddingService
        
        qdrant_memory = QdrantService(collection_name="long_term_memory")
        query_emb = EmbeddingService().generate_embedding(query)
        mem_results = qdrant_memory.search_dense(query_emb, top_k=2)
        
        recalled_snippets = []
        for point in mem_results:
            if point.score > 0.40: # Cosine similarity threshold for memory matches
                recalled_snippets.append(point.payload.get("text", ""))
        if recalled_snippets:
            recalled_memory_str = "\n[Recalled Past Conversations (Long Term Memory)]:\n" + "\n\n".join(recalled_snippets) + "\n"
            print(f"[Memory Recalled] Found matching dialogues.")
    except Exception as e:
        print(f"Error querying long term memory: {e}")

    # 8. Setup System Prompt Instructions
    system_instruction = data.system_prompt or "You are a premium enterprise assistant."
    
    if urls or url_attached_parts:
        system_instruction = (
            "You are an AI Web Search & Live Page Analysis Agent. "
            "Real-time webpage content has been fetched directly from the live URL(s) provided in the prompt. "
            "Use the extracted webpage text to answer the user's question completely, accurately, and in detail. "
            "You have full live internet browsing and webpage extraction capabilities enabled. "
            "Never claim that you lack internet access or cannot fetch live web pages."
        )
    elif intent == "GREETING":
        system_instruction = (
            "You are an intelligent, helpful AI assistant. "
            "The user is greeting you (e.g. 'hi', 'hello', 'hey', 'good morning'). "
            "Respond warmly, politely, and intelligently. "
            "IMPORTANT: Keep your response short, brief, and concise (1-2 sentences maximum)."
        )
    elif intent == "SMALL_TALK":
        system_instruction = "You are AI RAG playground. Provide a concise answer (maximum 4-5 lines). Do not search databases."
    elif intent in {"TECHNICAL_KNOWLEDGE", "SIMPLE_KNOWLEDGE", "COMPANY_KNOWLEDGE", "DOCUMENT_QUESTION"} or (intent not in {"GREETING", "SMALL_TALK", "IDENTITY_QUESTIONS", "UNSAFE_REQUEST"} and not has_attachments and not urls):
        system_instruction = (
            "You are a strict Enterprise Knowledge Base Assistant. "
            "CRITICAL RULE: You MUST answer the user prompt strictly based ONLY on the provided internal vector database context extracted from documents in backend/data/. "
            "Do NOT rely on external pre-trained knowledge or make assumptions. "
            "If the provided internal context does not contain the answer, state: 'I am sorry, but the requested information is not available in the internal knowledge base documents. To answer questions outside the internal knowledge base, please select Google / Web Search from the search mode dropdown.'"
        )

    elif intent == "CODING_REQUEST":
        system_instruction = (
            "You are an Expert AI Software Engineer and Senior Developer. "
            "The user is asking for code, programming algorithms, functions, or software engineering explanations. "
            "ALWAYS PROVIDE COMPLETE, PRODUCTION-READY, WELL-COMMENTED CODE BLOCKS IN PRE-FORMATTED CODE SNIPPETS (```python ... ``` or ```sql ... ``` or ```javascript ... ```). "
            "Include code implementation, step-by-step logic breakdown, and time/space complexity analysis."
        )
    elif intent == "DATABASE_QUERY":
        system_instruction = (
            "You are an Expert SQL & Database Architect Agent. "
            "ALWAYS PROVIDE COMPLETE, OPTIMIZED SQL QUERIES IN PRE-FORMATTED CODE SNIPPETS (```sql ... ```) along with query breakdown and execution explanations."
        )
    elif intent == "ANALYTICS_REQUEST":
        system_instruction = "You are the Data Analyst Agent. Explain trends, KPIs, and generate EDA metrics."
    elif intent == "VISUAL_ANALYSIS" or has_attachments:
        system_instruction = "You are an AI Vision & Document Analysis Agent. You are given the extracted content of user-attached files, images, webpage URLs, or pasted snapshots. Carefully read the extracted content and answer the user's question directly and accurately."

    elif intent == "DOCUMENT_QUESTION":
        system_instruction = "You are an AI Document Reader Agent. Carefully read the provided document content and answer the user's question based on it."

    # Mandatory Structured Response Instructions (ChatGPT/Claude style)
    STRUCTURED_OUTPUT_INSTRUCTION = (
        "\n\n[MANDATORY RESPONSE FORMATTING INSTRUCTIONS]:\n"
        "Always structure your output cleanly and professionally like ChatGPT and Claude.\n"
        "Apply the following formatting elements as appropriate based on the query requirement:\n"
        "1. **Executive Briefing**: Start with a clear 1-2 sentence briefing / summary.\n"
        "2. **Headings & Sub-headings**: Organize distinct sections using clear Markdown Headings (### Section Title).\n"
        "3. **Structured Points & Lists**: Use bullet points (-) or numbered lists (1., 2.) for details, steps, or itemization.\n"
        "4. **Tabular Format**: Whenever presenting metrics, parameters, comparisons, or structured data, use Markdown Tables (| Header 1 | Header 2 |).\n"
        "5. **Canvas & Code Blocks**: Enclose code, queries, equations, or canvas breakdowns in pre-formatted code blocks (```python ... ```).\n"
    )

    if intent != "GREETING":
        system_instruction += STRUCTURED_OUTPUT_INSTRUCTION

    # Append retrieved context and long term memories to system prompt ONLY when no direct attachments present
    if retrieved_context_str and not has_attachments:
        system_instruction += f"\n\nRetrieved context from database documents:\n{retrieved_context_str}\n"
    if recalled_memory_str:
        system_instruction += recalled_memory_str

    # 9. Format message histories
    messages = [{"role": "system", "content": system_instruction}]
    
    # Context window: include last 6 message turns
    for msg in history[-6:]:
        role = "user" if msg['sender'] == 'user' else "assistant"
        messages.append({"role": role, "content": msg['text']})
        
    # Build current user message - always focus on attachment content when present
    from backend.services.generation.prompt_builder import PromptBuilder
    prompt_builder = PromptBuilder()

    # Build user content combining retrieved context or attachment content + user query
    if has_attachments:
        combined_context = "\n\n".join(attachment_parts)
        user_content = prompt_builder.build(query=query, context=combined_context, has_attachments=True)
    elif should_retrieve and retrieved_context_str:
        user_content = prompt_builder.build(query=query, context=retrieved_context_str, has_attachments=False)
    else:
        user_content = query
        
    messages.append({"role": "user", "content": user_content})

    # 10. Generate response
    response_text = ""
    is_technical_error = False
    llm_step_num = len(pipeline_trace) + 1
    pipeline_trace.append({
        "step": llm_step_num,
        "label": "Sending to LLM",
        "detail": f"Sending assembled context + query to model: {data.model}",
        "status": "running"
    })
    try:
        generation_engine = GenerationEngine()

        response_text = await generation_engine.generate(
            model=data.model,
            messages=messages,
            temperature=data.settings.get("temperature", 0.2),
        )
        pipeline_trace[-1]["status"] = "done"
        pipeline_trace[-1]["detail"] = f"LLM ({data.model}) generated response successfully"
    except Exception as e:
        is_technical_error = True
        pipeline_trace[-1]["status"] = "error"
        pipeline_trace[-1]["detail"] = f"LLM error: {e}"
        print(f"[LLM Error] Generating response failed: {e}")
        response_text = (
            f"⚠️ Error generating response from LLM (`{data.model}`): {str(e)}\n\n"
            "Please check if the Ollama service is running locally (`ollama run llama3`) or if cloud API keys are configured in Settings."
        )

    # 10b. Generate context-aware follow-up suggestions (concurrent, non-blocking)
    suggestions = []
    try:
        def _get_clean_topic(text: str, max_len: int = 50) -> str:
            cleaned = text.strip()
            if len(cleaned) <= max_len:
                return cleaned
            words = cleaned[:max_len].rsplit(" ", 1)
            return words[0] if words[0] else cleaned[:max_len]

        clean_topic = _get_clean_topic(query, 50)

        suggestion_messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert AI assistant. Based on the user prompt and assistant response, "
                    "generate exactly 3 complete, natural, highly relevant follow-up questions or actions "
                    "the user might want to ask next to explore the topic deeper.\n"
                    "- Every suggestion MUST be a complete, well-formatted sentence or question.\n"
                    "- Do NOT truncate sentences or cut off mid-word.\n"
                    "- Include 1 web search action formatted as 'Search Google: [topic]'\n"
                    "- Output ONLY a valid JSON array of 3 strings.\n"
                    "Example: [\"What are the practical applications of deep learning?\", \"Search Google: deep learning algorithms latest updates 2026\", \"How do neural networks compare to traditional models?\"]"
                )
            },
            {
                "role": "user",
                "content": f"User Prompt: {query}\nAssistant Response Context: {response_text[:800]}\n\nGenerate 3 complete follow-up suggestions as a JSON array."
            }
        ]
        generation_engine = GenerationEngine()

        suggestion_raw = await generation_engine.generate(
            model=data.model,
            messages=suggestion_messages,
            temperature=0.6,
        )   
        
        # Parse JSON safely
        import re as _re
        json_match = _re.search(r'\[.*?\]', suggestion_raw, _re.DOTALL)
        if json_match:
            import json as _json
            parsed = _json.loads(json_match.group())
            suggestions = [str(s).strip() for s in parsed if s][:3]
        
        # Ensure at least 1 Google Search suggestion is present
        has_google_sug = any("search" in s.lower() or "google" in s.lower() for s in suggestions)
        if not has_google_sug:
            google_q = f"Search Google: {clean_topic}"
            if len(suggestions) >= 3:
                suggestions[2] = google_q
            else:
                suggestions.append(google_q)

        print(f"[Suggestion Engine] Generated {len(suggestions)} suggestions successfully.")
    except Exception as e:
        print(f"[Suggestion Engine] Failed to generate suggestions: {e}")
        clean_topic = _get_clean_topic(query, 45)
        suggestions = [
            f"Can you explain more details about {clean_topic}?",
            f"Search Google: {clean_topic} latest updates",
            f"What are the main advantages and challenges of {clean_topic}?"
        ]

    latency_ms = (time.time() - start_time) * 1000.0

    # 11. Store Dialogue turn to Long-Term Memory (vector index in Qdrant)
    try:
        from backend.services.vector_store.qdrant_service import QdrantService
        from backend.services.embedding_service import EmbeddingService
        
        qdrant_memory = QdrantService(collection_name="long_term_memory")
        dialogue_content = f"User: {query}\nAssistant: {response_text}"
        dialogue_emb = EmbeddingService().generate_embedding(dialogue_content)
        
        from uuid import uuid4
        dialogue_id = str(uuid4())
        
        qdrant_memory.add_documents(
            ids=[dialogue_id],
            documents=[dialogue_content],
            embeddings=[dialogue_emb],
            metadatas=[{"timestamp": time.time()}]
        )
    except Exception as e:
        print(f"Error saving dialogue exchange to long term memory: {e}")

    # 12. Run RAG Evaluation metrics calculation & SQLite Logging
    c_rel, faith, a_rel = 0.0, 0.0, 0.0
    try:
        eval_context = retrieved_context_str + "\n".join(attachment_parts)
        c_rel, faith, a_rel = await calculate_rag_metrics(
            query=query,
            retrieved_context=eval_context or "",
            response=response_text,
            model_name=data.model,
            is_error=is_technical_error
        )
        memory.add_eval_record(
            query=query,
            context_relevance=c_rel,
            faithfulness=faith,
            answer_relevance=a_rel,
            latency_ms=latency_ms
        )
        eval_step_num = len(pipeline_trace) + 1
        pipeline_trace.append({
            "step": eval_step_num,
            "label": "RAG Evaluation",
            "detail": (
                f"Correctness: {round(a_rel * 100)}% | "
                f"Faithfulness: {round(faith * 100)}% | "
                f"Groundedness: {round(c_rel * 100)}%"
            ),
            "status": "done"
        })
    except Exception as eval_err:
        print(f"[Evaluation Error]: {eval_err}")

    # Compute token cost estimate
    time_taken_s = latency_ms / 1000.0
    model_lower = data.model.lower()
    if "gpt-4o" in model_lower:
        token_cost = "~$0.0025"
    elif "claude" in model_lower:
        token_cost = "~$0.0030"
    elif "gemini" in model_lower:
        token_cost = "~$0.0001"
    elif "groq" in model_lower or "llama-3.3" in model_lower:
        token_cost = "~$0.0005"
    elif "grok" in model_lower:
        token_cost = "~$0.0020"
    else:
        token_cost = "$0.0000 (Local)"

    # Confidence = average of the three metrics
    confidence = round((c_rel + faith + a_rel) / 3.0, 3) if not is_technical_error else 0.0

    metrics_obj = {
        "correctness": round(a_rel * 100),
        "faithfulness": round(faith * 100),
        "groundedness": round(c_rel * 100),
        "confidence": round(confidence * 100),
        "time_taken_s": round(time_taken_s, 2),
        "token_cost": token_cost
    }

    # 13. Save Assistant Message and return
    assistant_msg = memory.add_message(
        conversation_id=chat_id,
        sender="assistant",
        text=response_text,
        citations=citations,
        suggestions=suggestions if suggestions else [],
        metrics=metrics_obj
    )

    # Append live metrics & pipeline trace directly to the response dict (not stored in DB)
    assistant_msg["metrics"] = metrics_obj
    assistant_msg["pipeline_trace"] = pipeline_trace
    assistant_msg["user_message_id"] = user_msg["id"] if user_msg else None

    # 14. Accurately store comprehensive record to Relational DB (chat_history_records)
    try:
        from datetime import datetime, timezone, timedelta
        ist_tz = timezone(timedelta(hours=5, minutes=30))
        timestamp_ist = datetime.now(ist_tz).strftime("%Y-%m-%d %H:%M:%S IST")

        similarity_score = None
        if citations:
            scores = [c.get("score") for c in citations if isinstance(c.get("score"), (int, float))]
            if scores:
                similarity_score = round(max(scores), 4)

        if recalled_memory_str:
            memory_source = "Long-Term Memory"
        elif history and len(history) > 1:
            memory_source = "Short-Term Memory"
        else:
            memory_source = "None"

        files_used_list = []
        chunks_used_list = []
        chunk_meta_list = []
        for c in citations:
            src = c.get("name") or c.get("source")
            if src and src not in files_used_list:
                files_used_list.append(src)
            cid = c.get("id")
            if cid and str(cid) not in chunks_used_list:
                chunks_used_list.append(str(cid))
            
            meta_parts = []
            idx_val = c.get("chunk_index") or c.get("index")
            if idx_val is not None:
                meta_parts.append(f"Idx:{idx_val}")
            pg = c.get("page") or c.get("page_number")
            if pg is not None:
                meta_parts.append(f"Pg:{pg}")
            txt = c.get("text") or c.get("snippet") or ""
            if txt:
                meta_parts.append(f"Len:{len(txt)}ch")
            tokens = c.get("tokens") or c.get("token_count")
            if tokens:
                meta_parts.append(f"Tok:{tokens}")
            if meta_parts:
                chunk_meta_list.append("; ".join(meta_parts))

        files_used = ", ".join(files_used_list) if files_used_list else None
        chunks_used = ", ".join(chunks_used_list) if chunks_used_list else None
        chunk_metadata = " | ".join(chunk_meta_list) if chunk_meta_list else None

        if urls or url_attached_parts:
            search_source = "Google / Web Search"
        elif should_retrieve and citations:
            search_source = "Vector DB (Local)"
        elif has_attachments:
            search_source = "Direct Attachment"
        else:
            search_source = "LLM Direct Knowledge"

        rec_id = f"rec-{int(time.time() * 1000)}-{uuid4().hex[:6]}"
        memory.add_history_record(
            record_id=rec_id,
            timestamp_ist=timestamp_ist,
            user_prompt=query,
            retrieved_response=response_text,
            response_metrics=metrics_obj,
            timetaken_s=round(time_taken_s, 2),
            similarity_score=similarity_score,
            llm_model=data.model,
            memory_source=memory_source,
            files_used=files_used,
            chunks_used=chunks_used,
            chunk_metadata=chunk_metadata,
            search_source=search_source
        )
    except Exception as log_err:
        print(f"[History Record Logging Error]: {log_err}")

    # 15. Automatically capture user interaction to Dataset Collection (data/query_dataset/*.json)
    try:
        from backend.services.dataset_service import DatasetService
        retrieved_chunk_text = [c.get("snippet") or c.get("text") for c in citations if (c.get("snippet") or c.get("text"))]

        dataset_record = DatasetService.save_interaction(
            query=query,
            conversation_id=chat_id,
            llm_response=response_text,
            retrieved_chunk_ids=chunks_used_list if 'chunks_used_list' in locals() else [],
            retrieved_chunk_text=retrieved_chunk_text,
            source_documents=files_used_list if 'files_used_list' in locals() else [],
            retrieval_score=similarity_score if 'similarity_score' in locals() else None,
            feedback="unrated",
            metadata={
                "model": data.model,
                "metrics": metrics_obj
            }
        )
        assistant_msg["interaction_id"] = dataset_record["interaction_id"]
    except Exception as ds_err:
        print(f"[Dataset Logging Error]: {ds_err}")

    return assistant_msg



# Additional Router for History & CSV Analytics Endpoints
from fastapi import APIRouter
from fastapi.responses import Response

history_router = APIRouter(prefix="/history", tags=["History & Analytics"])

@history_router.get("")
async def get_chat_history_records(memory = Depends(get_memory)):
    """Retrieve full relational chat history analytics records."""
    return memory.get_history_records(limit=500)

@history_router.delete("")
async def clear_all_history_records(memory = Depends(get_memory)):
    """Clear all chat history records."""
    memory.clear_all_history_records()
    return {"message": "All history records cleared successfully"}

@history_router.delete("/{record_id}")
async def delete_single_history_record(record_id: str, memory = Depends(get_memory)):
    """Delete a single history record by ID."""
    success = memory.delete_history_record(record_id)
    if not success:
        raise HTTPException(status_code=404, detail="History record not found")
    return {"message": f"History record {record_id} deleted successfully"}

@history_router.get("/csv")
async def download_chat_history_csv(memory = Depends(get_memory)):
    """Generate and return CSV file download of all history records."""
    import csv
    import io

    records = memory.get_history_records(limit=1000)
    output = io.StringIO()
    writer = csv.writer(output)

    # Required CSV Column Headers in Order
    writer.writerow([
        "Unique ID",
        "Timestamp (IST)",
        "User Prompt",
        "Retrieved Response",
        "Response Metrics",
        "Time Taken (s)",
        "Similarity Score",
        "LLM Model Used",
        "Memory Source",
        "File(s) Used",
        "Chunk(s) Used",
        "Chunk Metadata",
        "Search Source"
    ])

    for r in records:
        m = r.get("response_metrics") or {}
        metrics_str = f"Correctness: {m.get('correctness', 0)}%, Faithfulness: {m.get('faithfulness', 0)}%, Groundedness: {m.get('groundedness', 0)}%, Confidence: {m.get('confidence', 0)}%"
        writer.writerow([
            r.get("id") or "NULL",
            r.get("timestamp_ist") or "NULL",
            r.get("user_prompt") or "NULL",
            r.get("retrieved_response") or "NULL",
            metrics_str,
            r.get("timetaken_s") if r.get("timetaken_s") is not None else "NULL",
            r.get("similarity_score") if r.get("similarity_score") is not None else "NULL",
            r.get("llm_model") or "NULL",
            r.get("memory_source") or "NULL",
            r.get("files_used") or "NULL",
            r.get("chunks_used") or "NULL",
            r.get("chunk_metadata") or "NULL",
            r.get("search_source") or "NULL"
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=chat_history_analytics.csv"
        }
    )