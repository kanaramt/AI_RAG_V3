# Vector Database Design

## Purpose

This document defines how vector databases are used within the Bhavna Enterprise Agentic AI Platform.

The platform supports multiple vector databases.

Each vector database has a specific responsibility.

---

# Vector Database Overview

| Vector Database | Purpose |
|-----------------|---------|
| FAISS | Local development, testing and benchmarking |
| Qdrant | Primary production vector database |

---

# Design Principles

- Vector databases store embeddings only.
- Original documents are never stored in vector databases.
- Metadata should always accompany vectors.
- Vector databases should remain replaceable.
- Business logic should never directly interact with vector databases.

---

# Vector Database Access Architecture

Platform Engines

↓

Repository Layer

↓

Vector Store Layer

↓

FAISS / Qdrant

---

Benefits

- Easy replacement of vector databases.
- Supports multiple vector databases.
- Easier testing.
- Cleaner architecture.

---

# Collection Strategy

Collections are logical containers that store vector embeddings.

Collections should be organized by tenant and knowledge base.

The platform should never store all vectors inside one collection.

Recommended Structure

Tenant
    ├── Knowledge Base
            ├── Collection Version

Example

Tenant_A
    ├── HR
    ├── Finance
    ├── Policies

Tenant_B
    ├── Engineering
    ├── Sales

Benefits

- Multi-tenant isolation
- Easier versioning
- Easier re-indexing
- Better scalability
- Easier backup and restore

---

# Vector Metadata

Every vector stored in the vector database should include metadata.

Metadata enables filtering, auditing, retrieval optimization and traceability.

| Metadata Field | Purpose |
|----------------|---------|
| tenant_id | Organization identifier |
| knowledge_base_id | Knowledge base identifier |
| document_id | Source document |
| document_version | Source document version |
| chunk_id | Chunk identifier |
| chunk_version | Chunk version |
| source | Original source (PDF, SQL, SharePoint, etc.) |
| connector | Connector used for ingestion |
| file_name | Original file name |
| file_type | PDF, DOCX, XLSX, HTML, etc. |
| page_number | Source page number (if applicable) |
| section | Document section |
| language | Document language |
| tags | Searchable tags |
| embedding_model | Embedding model used |
| embedding_version | Embedding model version |
| created_at | Embedding creation timestamp |
| updated_at | Last update timestamp |
| checksum | Detect document changes |
| is_active | Active vector flag |

---

## Metadata Design Rules

- Metadata should be stored with every vector.
- Metadata should support filtering before vector search.
- Metadata should remain independent of embedding values.
- Metadata should be versioned along with vectors.

---

# Embedding Versioning

The platform must support multiple embedding versions without deleting previous embeddings.

Embedding versioning allows comparison between different embedding models and re-embedding strategies.

Each vector should store:

| Field | Purpose |
|--------|---------|
| embedding_model | Model used to generate embeddings |
| embedding_version | Version of the embedding model |
| chunk_version | Version of the source chunk |
| metadata_version | Version of metadata schema |
| indexing_version | Version of indexing pipeline |
| created_at | Embedding creation timestamp |

---

## Versioning Rules

- Never overwrite existing embeddings.
- New embedding versions should create new vectors.
- Old versions remain available until validation is complete.
- Only one embedding version should be marked as Active for production retrieval.
- Previous versions can be restored if required.

---

# Collection Versioning

Collections should support versioning to allow safe upgrades without affecting production retrieval.

Instead of modifying an existing collection, a new collection version should be created.

Example

Tenant_A
    └── HR
          ├── hr_v1
          ├── hr_v2
          └── hr_v3

Only one collection version should be marked as Production.

---

## Collection Versioning Rules

- Never overwrite an existing collection.
- Create a new collection for major indexing changes.
- Validate the new collection before switching production.
- Keep previous collection versions for rollback.
- Production collection switching should be configurable from the Platform UI.

---

# Hybrid Retrieval Strategy

The platform should support multiple retrieval strategies.

Retrieval Strategy Pipeline

User Query
        │
        ▼
Query Analysis
        │
        ▼
Query Router
        │
        ├── Vector Search (Qdrant / FAISS)
        ├── Keyword Search
        ├── Metadata Filtering
        ├── SQL Search (Future)
        ├── Graph Search (Future)
        └── Web Search (Future)
                │
                ▼
Result Fusion
                │
                ▼
Reranker
                │
                ▼
Context Compression
                │
                ▼
Generation Engine

---

## Supported Retrieval Strategies

- Dense Vector Search
- Hybrid Search
- Metadata Filtering
- Multi-Query Retrieval
- Contextual Compression
- HyDE (Future)
- Graph RAG (Future)
- RAPTOR (Future)
- ColBERT (Future)

---

## Design Rules

- Retrieval strategies must be pluggable.
- Multiple strategies should be benchmarked.
- New retrieval techniques should not require backend redesign.
- Retrieval metrics should be stored for evaluation.

---

# FAISS Strategy

FAISS is the local vector database used for development, testing and benchmarking.

It is not intended to be the primary production vector database.

---

## Responsibilities

- Local development
- Offline experimentation
- Embedding benchmarking
- Retrieval benchmarking
- Performance testing
- Prototype development

---

## Design Rules

- FAISS indexes are stored locally.
- FAISS indexes can be recreated at any time.
- FAISS should not be considered the source of truth.
- Metadata should remain in the relational database.
- FAISS can be disabled without affecting production architecture.

---

# Qdrant Strategy

Qdrant is the primary production vector database.

It is responsible for persistent, scalable and enterprise-grade vector retrieval.

---

## Responsibilities

- Production vector storage
- Metadata filtering
- Hybrid retrieval
- Multi-tenant collections
- Collection versioning
- High-performance similarity search

---

## Design Rules

- Qdrant is the production vector store.
- Every vector must include metadata.
- Collections should support versioning.
- Collections should support tenant isolation.
- Retrieval should use only the active production collection.
- Qdrant should remain replaceable through the Vector Store Layer.