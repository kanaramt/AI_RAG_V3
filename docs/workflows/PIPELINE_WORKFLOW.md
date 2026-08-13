# Pipeline Workflow

## Purpose

This document defines the end-to-end workflow of the Bhavna Enterprise Agentic AI Platform.

Every request, document, embedding, retrieval, evaluation and optimization process should follow the workflows defined in this document.

The workflow document acts as the blueprint for backend implementation.

---

# Platform Workflow

The platform consists of independent workflow pipelines.

1. Data Ingestion Pipeline
2. Document Intelligence Pipeline
3. Embedding Pipeline
4. Retrieval Pipeline
5. Generation Pipeline
6. Evaluation Pipeline
7. Analytics Pipeline
8. Optimization Pipeline

Each pipeline is independent and communicates through clearly defined interfaces.

No pipeline should directly execute another pipeline's business logic.

---

# 1. Data Ingestion Pipeline

## Purpose

The Data Ingestion Pipeline is responsible for collecting data from supported sources and preparing it for the Document Intelligence Pipeline.

It does not parse, chunk or embed data.

---

## Supported Sources

- Local Files
- Network Folders
- SharePoint
- OneDrive
- Google Drive
- Google Docs
- Google Sheets
- SQL Server
- PostgreSQL
- SQLite
- MySQL
- REST APIs
- Web URLs
- Sitemaps

---

## Workflow

Connector

↓

Authentication

↓

Connection Validation

↓

Data Discovery

↓

Change Detection

↓

Data Extraction

↓

Raw Data Storage

↓

Ingestion Logging

↓

Document Intelligence Pipeline

---

## Responsibilities

- Connect to data sources
- Validate connections
- Discover available data
- Detect new, modified and deleted data
- Extract raw data
- Store ingestion metadata
- Log ingestion activities

---

## Output

- Raw Documents
- Raw Database Records
- Raw Web Content
- Ingestion Metadata
- Processing Job

---

# 2. Document Intelligence Pipeline

## Purpose

The Document Intelligence Pipeline transforms raw data into AI-ready knowledge.

It is responsible for understanding the document, extracting meaningful content, enriching it with metadata and preparing it for embedding.

It does not generate embeddings or retrieve information.

---

## Workflow

Raw Data

↓

Document Type Detection

↓

File Validation

↓

Content Extraction

↓

OCR (if required)

↓

Document Structure Detection

↓

Table Extraction

↓

Image Extraction

↓

Cleaning

↓

Normalization

↓

Language Detection

↓

Duplicate Detection

↓

Chunking

↓

Chunk Validation

↓

Metadata Generation

↓

Quality Validation

↓

AI-ready Chunks

↓

Embedding Pipeline

---

## Responsibilities

- Detect document type
- Validate files
- Extract content
- Perform OCR
- Detect document structure
- Extract tables
- Extract images
- Clean content
- Normalize content
- Detect language
- Remove duplicates
- Chunk documents
- Generate metadata
- Validate processed data

---

## Output

- AI-ready Chunks
- Chunk Metadata
- Processing Report
- Validation Report

---

# 3. Embedding Pipeline

## Purpose

The Embedding Pipeline converts AI-ready chunks into vector embeddings and stores them in the configured vector database.

It does not parse documents or retrieve information.

---

## Workflow

AI-ready Chunks

↓

Embedding Queue

↓

Embedding Model Selection

↓

Batch Processing

↓

Embedding Generation

↓

Embedding Validation

↓

Metadata Attachment

↓

Vector Store Selection

↓

Vector Storage

↓

Embedding Logging

↓

Embedding Report

---

## Responsibilities

- Select embedding model
- Generate embeddings
- Batch processing
- Validate embeddings
- Attach metadata
- Store vectors
- Support re-embedding
- Maintain embedding versions
- Log embedding operations

---

## Output

- Vector Embeddings
- Vector Metadata
- Embedding Report
- Embedding Version

---

# 4. Retrieval Pipeline

## Purpose

The Retrieval Pipeline receives a user query, determines the best retrieval strategy, retrieves the most relevant knowledge, and prepares context for the Generation Pipeline.

It does not call the LLM directly.

---

## Workflow

User Query

↓

Query Validation

↓

Intent Detection

↓

Query Analysis

↓

Query Rewrite (Optional)

↓

Query Routing

↓

Metadata Filtering

↓

Retrieval Strategy Selection

↓

Vector Search

↓

Keyword Search

↓

Hybrid Search

↓

Result Fusion

↓

Reranking

↓

Context Compression

↓

Context Validation

↓

Generation Pipeline

---

## Responsibilities

- Validate user query
- Detect user intent
- Analyze query
- Rewrite query (optional)
- Route query
- Select retrieval strategy
- Perform vector search
- Perform keyword search
- Apply metadata filters
- Merge retrieval results
- Rerank results
- Compress context
- Validate final context

---

## Supported Retrieval Strategies

- Dense Vector Search
- Hybrid Search
- Metadata Filtering
- Multi-Query Retrieval
- Contextual Compression

Future Support

- HyDE
- Graph RAG
- RAPTOR
- ColBERT
- SQL Retrieval
- Web Retrieval

---

## Output

- Retrieved Chunks
- Retrieval Scores
- Reranker Scores
- Final Context

---

# 5. Generation Pipeline

## Purpose

The Generation Pipeline builds the final prompt, invokes the selected LLM and generates the final response.

It does not perform retrieval or document processing.

---

## Workflow

User Query

↓

Retrieved Context

↓

Prompt Template Selection

↓

Prompt Construction

↓

LLM Provider Selection

↓

LLM Model Selection

↓

Response Generation

↓

Citation Generation

↓

Response Formatting

↓

Evaluation Pipeline

---

## Responsibilities

- Select prompt template
- Build final prompt
- Select LLM provider
- Select LLM model
- Generate response
- Generate citations
- Format response
- Record token usage

---

## Output

- Final Response
- Prompt Used
- Input Tokens
- Output Tokens
- Citations
- Generation Report

---

# 6. Evaluation Pipeline

## Purpose

The Evaluation Pipeline measures the quality of retrieval and generated responses.

It evaluates both the retrieval process and the LLM output.

It does not modify documents, embeddings or vectors.

---

## Workflow

Retrieved Context

↓

Generated Response

↓

Groundedness Evaluation

↓

Faithfulness Evaluation

↓

Correctness Evaluation

↓

Context Precision

↓

Context Recall

↓

Response Quality Score

↓

Store Evaluation Results

↓

Analytics Pipeline

---

## Responsibilities

- Evaluate groundedness
- Evaluate faithfulness
- Evaluate correctness
- Measure context precision
- Measure context recall
- Calculate overall quality score
- Store evaluation results

---

## Output

- Evaluation Report
- Faithfulness Score
- Correctness Score
- Groundedness Score
- Context Precision
- Context Recall
- Overall Quality Score

---

# 7. Analytics Pipeline

## Purpose

The Analytics Pipeline collects, stores and analyzes platform activity for monitoring, reporting and continuous improvement.

It does not modify business data or vectors.

---

## Workflow

Platform Events

↓

Usage Collection

↓

Performance Collection

↓

Token Collection

↓

Audit Collection

↓

Error Collection

↓

Metrics Aggregation

↓

Analytics Database

↓

Optimization Pipeline

---

## Responsibilities

- Collect platform usage
- Collect token usage
- Collect performance metrics
- Collect latency metrics
- Collect audit logs
- Collect error logs
- Generate analytics reports
- Provide dashboard data

---

## Output

- Usage Reports
- Token Reports
- Performance Reports
- Audit Reports
- Analytics Dashboard Data

---

# 8. Optimization Pipeline

## Purpose

The Optimization Pipeline continuously improves platform quality using analytics, evaluation results and user feedback.

It never modifies production data directly.

All optimization actions must be executed through controlled jobs after validation.

---

## Workflow

Analytics Reports

↓

Evaluation Reports

↓

User Feedback

↓

Optimization Analysis

↓

Recommendation Generation

↓

Approval (Optional)

↓

Re-processing Job

↓

Re-chunking

↓

Re-embedding

↓

Re-indexing

↓

Validation

↓

Production Deployment

---

## Responsibilities

- Analyze retrieval quality
- Analyze chunk quality
- Analyze metadata quality
- Analyze embedding quality
- Generate optimization recommendations
- Schedule re-processing jobs
- Validate optimized knowledge
- Deploy optimized collections

---

## Output

- Optimization Report
- Optimization Recommendations
- Re-processing Jobs
- Updated Embeddings
- Updated Vector Collections