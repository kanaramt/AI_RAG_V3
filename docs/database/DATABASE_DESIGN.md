# Database Design

## Purpose

This document defines the complete database architecture for the Bhavna Enterprise Agentic AI Platform.

The platform uses multiple databases because different types of data require different storage technologies.

Each database has a single responsibility.

No database should be used outside its intended purpose.

---

# Database Overview

The platform consists of the following storage systems.

| Database | Purpose |
|-----------|---------|
| SQLite | Default local platform database for development and single-user deployments |
| PostgreSQL | Enterprise platform database for production and multi-user deployments |
| Qdrant | Primary production vector database |
| FAISS | Local vector database for development, benchmarking and testing |
| Object Storage | Original documents and extracted files |

---

## Database Selection

The relational database layer should be configurable.

Supported relational databases

- SQLite (Default Development)
- PostgreSQL (Enterprise Production)

Future Support

- SQL Server
- MySQL

The application should access the relational database through a common Repository Layer so that switching databases does not require changes to business logic.

---

# Database Access Architecture

The platform should never communicate directly with SQLite or PostgreSQL from Platform Engines.

Instead every database operation must pass through a Repository Layer.

```text
Platform Engine
        │
        ▼
Repository Layer
        │
        ▼
SQLite / PostgreSQL
```

Benefits

- Database independent business logic
- Easy migration between databases
- Easier testing
- Easier maintenance
- Future database support

---

## Repository Responsibilities

The Repository Layer is responsible for

- Create
- Read
- Update
- Delete
- Transactions
- Pagination
- Filtering
- Sorting
- Connection Management

Business logic should never exist inside repositories.

---

# Database Domains

The platform database is divided into logical domains.

Each domain has one responsibility.

---

## 1. Platform Domain

Purpose

Stores platform administration and configuration.

Contains

- Users
- Roles
- Permissions
- Sessions
- Connectors
- Connector Jobs
- Platform Settings
- Scheduler

---

## 2. AI Domain

Purpose

Stores all AI-related configuration.

Contains

- LLM Providers
- Embedding Models
- Reranker Models
- Prompt Templates
- LangGraph Workflows
- Agent Definitions
- Tool Registry
- AI Model Versions

---

## 3. Knowledge Domain

Purpose

Stores knowledge processing information.

Contains

- Documents
- Chunks
- Metadata
- Document Versions
- Chunk Versions
- Processing Jobs

---

## 4. Retrieval Domain

Purpose

Stores retrieval information.

Contains

- Search History
- Retrieved Chunks
- Retrieval Scores
- Reranker Scores
- Search Sessions

---

## 5. Evaluation Domain

Purpose

Stores quality evaluation.

Contains

- Faithfulness
- Correctness
- Groundedness
- Context Precision
- Context Recall
- User Feedback

---

## 6. Analytics Domain

Purpose

Stores platform analytics.

Contains

- Token Usage
- Latency
- Performance Metrics
- Audit Logs
- Error Logs
- Usage Statistics

---

## 7. Optimization Domain

Purpose

Stores optimization history.

Contains

- Re-chunk Jobs
- Re-embedding Jobs
- Re-index Jobs
- Optimization Reports
- Benchmark Results

---

# Platform Domain Tables

The Platform Domain stores platform administration and configuration.

The following tables belong to this domain.

| Table | Purpose |
|--------|---------|
| users | Stores platform users |
| roles | Stores user roles |
| permissions | Stores system permissions |
| user_roles | Maps users to roles |
| role_permissions | Maps roles to permissions |
| user_sessions | Stores active login sessions |
| tenants | Stores organization/client information |
| connectors | Stores connector configurations |
| connector_jobs | Stores ingestion job executions |
| platform_settings | Stores global platform configuration |
| scheduler_jobs | Stores scheduled jobs |

---

# AI Domain Tables

The AI Domain stores all AI-related configuration and reusable AI assets.

The following tables belong to this domain.

| Table | Purpose |
|--------|---------|
| llm_providers | Stores configured LLM providers |
| llm_models | Stores available LLM models |
| embedding_models | Stores embedding models |
| reranker_models | Stores reranker models |
| prompt_templates | Stores reusable prompt templates |
| agent_definitions | Stores AI agent definitions |
| agent_workflows | Stores LangGraph / workflow definitions |
| tool_registry | Stores AI tools available to agents |
| model_parameters | Stores configurable model parameters |
| model_versions | Stores model version history |

---

# Knowledge Domain Tables

The Knowledge Domain stores all processed enterprise knowledge.

| Table | Purpose |
|--------|---------|
| documents | Stores document information |
| document_versions | Stores document version history |
| chunks | Stores processed chunks |
| chunk_versions | Stores chunk version history |
| chunk_metadata | Stores metadata for each chunk |
| processing_jobs | Stores document processing jobs |
| processing_history | Stores document processing history |


---

# Retrieval Domain Tables

The Retrieval Domain stores all retrieval operations and search history.

| Table | Purpose |
|--------|---------|
| search_sessions | Stores user search sessions |
| search_queries | Stores user queries |
| retrieved_chunks | Stores chunks retrieved for each query |
| retrieval_scores | Stores vector similarity scores |
| reranker_scores | Stores reranker scores |
| search_results | Stores final retrieval results |

---

# Evaluation Domain Tables

The Evaluation Domain stores AI response quality and retrieval evaluation.

| Table | Purpose |
|--------|---------|
| evaluations | Stores evaluation results |
| faithfulness_scores | Stores faithfulness scores |
| correctness_scores | Stores correctness scores |
| groundedness_scores | Stores groundedness scores |
| context_precision_scores | Stores context precision scores |
| context_recall_scores | Stores context recall scores |
| user_feedback | Stores user feedback |

---

# Analytics Domain Tables

The Analytics Domain stores platform usage, performance metrics and audit information.

| Table | Purpose |
|--------|---------|
| audit_logs | Stores platform audit logs |
| token_usage | Stores LLM and embedding token usage |
| performance_metrics | Stores performance metrics |
| latency_metrics | Stores execution latency |
| usage_statistics | Stores platform usage statistics |
| error_logs | Stores application and processing errors |
| system_metrics | Stores system resource metrics |

---

# Optimization Domain Tables

The Optimization Domain stores optimization history and recommendations.

| Table | Purpose |
|--------|---------|
| optimization_jobs | Stores optimization job details |
| rechunk_jobs | Stores document re-chunking jobs |
| reembedding_jobs | Stores re-embedding jobs |
| reindex_jobs | Stores vector re-indexing jobs |
| benchmark_results | Stores benchmarking results |
| optimization_recommendations | Stores optimization recommendations |

---

# Standard Table Columns

Unless there is a specific reason not to, every table should contain the following standard columns.

| Column | Purpose |
|---------|---------|
| id | Primary key |
| tenant_id | Organization or client identifier (where applicable) |
| created_at | Record creation timestamp |
| updated_at | Last update timestamp |
| created_by | User who created the record |
| updated_by | User who last updated the record |
| is_active | Active/Inactive status |
| version | Record version number |

These columns provide:

- Auditability
- Versioning
- Multi-tenancy
- Change tracking
- Easier maintenance

---

# Table Relationships

The following high-level relationships exist between the database domains.

Platform Domain
    ├── Users
    ├── Roles
    ├── Permissions
    ├── Connectors
    └── Scheduler

            │
            ▼

AI Domain
    ├── LLM Models
    ├── Embedding Models
    ├── Reranker Models
    ├── Prompt Templates
    └── Agent Workflows

            │
            ▼

Knowledge Domain
    ├── Documents
    ├── Document Versions
    ├── Chunks
    ├── Chunk Metadata
    └── Processing Jobs

            │
            ▼

Retrieval Domain
    ├── Search Sessions
    ├── Search Queries
    ├── Retrieved Chunks
    ├── Retrieval Scores
    └── Search Results

            │
            ▼

Evaluation Domain
    ├── Evaluations
    ├── Faithfulness
    ├── Correctness
    ├── Groundedness
    └── User Feedback

            │
            ▼

Analytics Domain
    ├── Audit Logs
    ├── Token Usage
    ├── Performance Metrics
    ├── Latency Metrics
    └── Error Logs

            │
            ▼

Optimization Domain
    ├── Optimization Jobs
    ├── Rechunk Jobs
    ├── Reembedding Jobs
    ├── Reindex Jobs
    └── Benchmark Results