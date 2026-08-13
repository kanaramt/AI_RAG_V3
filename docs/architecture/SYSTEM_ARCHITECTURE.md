# Bhavna Enterprise Agentic AI Platform
# Complete System Architecture

---

# 1. High Level Architecture

```
                                        User
                                          │
                                          ▼
                              Frontend (Web UI)
                                          │
                                          ▼
                               FastAPI Backend API
                                          │
                                          ▼
                                  Platform Core
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        ▼                                 ▼                                 ▼
 Platform Services                 Platform Engines                Platform Infrastructure
        │                                 │                                 │
        └─────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
                          Enterprise Storage & AI Layer
```

---

# 2. Platform Core

```
Platform Core

├── Configuration Manager
├── Engine Registry
├── Service Registry
├── Connector Registry
├── Repository Registry
├── Plugin Manager
├── Dependency Manager
└── Startup Manager
```

Purpose

- Initializes the platform
- Registers all components
- Loads configuration
- Starts the platform

---

# 3. Platform Services

```
Platform Services

├── Authentication
├── Authorization
├── Configuration
├── Scheduler
├── Queue Manager
├── Logging
├── Monitoring
├── Notification
├── Cache
└── Repository Layer
```

Purpose

Shared services used by every engine.

---

# 4. Platform Engines

```
Platform Engines

├── Data Ingestion Engine
├── Document Intelligence Engine
├── Embedding Engine
├── Retrieval Engine
├── Generation Engine
├── Evaluation Engine
├── Analytics Engine
├── Optimization Engine
└── Agent Orchestration Engine
```

Each engine performs one responsibility only.

---

# 5. Enterprise Data Sources

```
Enterprise Data Sources

├── Local Files
├── Network Drives
├── SharePoint
├── OneDrive
├── Google Drive
├── Google Docs
├── Google Sheets
├── SQL Server
├── PostgreSQL
├── SQLite
├── MySQL
├── REST APIs
├── Web URLs
└── Sitemaps
```

---

# 6. End-to-End Processing Pipeline

```
Enterprise Data Sources
            │
            ▼
Data Ingestion Engine
            │
            ▼
Document Intelligence Engine
            │
            ▼
Embedding Engine
            │
            ▼
FAISS + Qdrant
            │
            ▼
Retrieval Engine
            │
            ▼
Generation Engine
            │
            ▼
Evaluation Engine
            │
            ▼
Analytics Engine
            │
            ▼
Optimization Engine
            │
            └──────────────────────────────┐
                                           │
                                           ▼
                               Rechunk / Reembed
                                           │
                                           ▼
                                  Embedding Engine
```

---

# 7. AI Layer

```
AI Layer

├── LLM Providers
│      ├── Ollama
│      ├── OpenAI
│      ├── Anthropic
│      ├── Gemini
│      └── Azure OpenAI
│
├── Embedding Models
│
├── Reranker Models
│
├── Prompt Templates
│
├── AI Agents
│
└── LangGraph Workflows
```

---

# 8. Storage Layer

```
Storage Layer

Relational Database

├── SQLite
└── PostgreSQL


Vector Databases

├── FAISS
└── Qdrant


Object Storage

└── Original Files
```

---

# 9. Database Architecture

```
Platform Domain

AI Domain

Knowledge Domain

Retrieval Domain

Evaluation Domain

Analytics Domain

Optimization Domain
```

---

# 10. User Query Flow

```
User Prompt
      │
      ▼
Retrieval Engine
      │
      ▼
Query Analysis
      │
      ▼
Query Routing
      │
      ▼
Hybrid Search
      │
      ▼
Metadata Filtering
      │
      ▼
Reranker
      │
      ▼
Context Compression
      │
      ▼
Generation Engine
      │
      ▼
LLM
      │
      ▼
Response
      │
      ▼
Evaluation
      │
      ▼
Analytics
```

---

# 11. Optimization Loop

```
User Feedback
        │
        ▼
Evaluation Reports
        │
        ▼
Analytics
        │
        ▼
Optimization Engine
        │
        ▼
Metadata Optimization
        │
        ▼
Chunk Optimization
        │
        ▼
Rechunk
        │
        ▼
Reembedding
        │
        ▼
Vector Store Update
```

---

# 12. Future Expansion

```
Future Modules

├── Graph RAG
├── Vision RAG
├── SQL Agent
├── BI Agent
├── MCP Servers
├── Multi-Agent System
├── Voice Agent
├── Computer Use Agent
└── Autonomous Workflows
```

---

# 13. Relational Analytics & Trace System

```
User Query
    │
    ▼
Pipeline Trace Collector (Steps 1-7)
    │
    ▼
RAG Evaluation Engine (Correctness, Faithfulness, Groundedness)
    │
    ▼
Relational Storage Engine (`chat_history_records` Table)
    │
    ├─► IST Timestamp Calculation (%Y-%m-%d %H:%M:%S IST)
    ├─► Similarity Score & Citations Extraction
    ├─► Memory Source Classification (Long-Term / Short-Term / None)
    ├─► Files & Chunks Tracking
    └─► Search Source Classification (Vector DB / Web / LLM / Attachment)
    │
    ▼
Analytics UI & CSV Export Engine (`GET /api/history/csv`)
```