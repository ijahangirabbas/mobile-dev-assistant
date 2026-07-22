# Mobile Dev Assistant – Video Subtitle Intelligence RAG System

An intelligent, multi-stage Retrieval-Augmented Generation (RAG) system designed to answer student queries using video course subtitle transcripts. The platform leverages high-dimensional vector search, cross-encoder reranking, and grounded Large Language Model (LLM) generation to provide precise explanations backed by exact video timestamp citations.

---

## 📚 Course & Instructor Overview

- **Course Title**: Complete Mobile Developer course with AI Projects
- **Instructors**: **Hitesh Choudhary**, **Suraj Jha**
- **Rating & Metadata**: 4.9 ★★★★★ (25 ratings) • English • Bestseller
- **Topics Covered**:
  - React Native & Expo core concepts (Expo Go vs. EAS Builds, Expo Router)
  - Mobile device integrations (Camera, Location, Sensors, Maps, Storage)
  - Navigation patterns (React Navigation Native Stack, Drawer, Bottom Tabs)
  - Authentication (Better Auth, OAuth, Credential Management, Secure Storage)
  - State management (Context API, Custom Hooks, Redux Toolkit)
  - Hands-on AI Projects (AI Story-Generator app with external API integrations)

---

## 🏗️ System Architecture & 8-Stage RAG Pipeline

The backend implements an end-to-end multi-stage RAG pipeline designed to maximize retrieval recall and eliminate LLM hallucinations by enforcing strict grounding against video subtitle transcripts.

```
[User Query]
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Input Guard Pipeline                                      │
│    Sanitizes user input, screens for injection risks        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Query Normalizer & Intent Detector                       │
│    Normalizes terms, detects query intent, expands terms   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Jina Dense Vector Embedding                              │
│    Converts query into 1024-dim dense vector representation │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Qdrant HNSW Vector Search                                │
│    Approximate Nearest Neighbor search in 'course_chunks'   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Cross-Encoder & Diversity Reranking                      │
│    Jina Reranker v2 cross-attention + MMR diversity filter  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Context Assembly & Grounding                             │
│    Formats top subtitle excerpts with exact timeline bounds │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Groq LLM Completion (Llama 3.3 70B)                      │
│    Synthesizes concise answer strictly anchored in context  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Response Evaluator & Auto-Retry Loop                     │
│    Evaluates grounding score & expands search if needed     │
└─────────────────────────────────────────────────────────────┘
```

### Stage Details

1. **Input Guard Pipeline**:
   Validates query length, strips malicious patterns, and screens for prompt injection risks to safeguard system integrity.

2. **Query Normalizer & Intent Detector**:
   Cleans user query strings, identifies the query intent (*factual*, *conceptual*, or *conversational*), expands domain terms (e.g. mapping "navigation" to "React Navigation stack navigator"), and optionally rewrites queries for optimal retrieval.

3. **Jina Dense Vector Embedding**:
   Generates 1024-dimensional dense semantic embeddings using `jina-embeddings-v3` tuned for retrieval task passages.

4. **Qdrant Vector Database Retrieval**:
   Executes Cosine similarity search over indexed course chunks stored in the Qdrant `course_chunks` collection using Hierarchical Navigable Small World (HNSW) indexing.

5. **Cross-Encoder Reranking & Diversity Filtering**:
   Re-scores candidate chunks with `jina-reranker-v2-base-multilingual` computing deep query-document cross-attention scores. Applies token Jaccard similarity and Maximum Marginal Relevance (MMR) to eliminate redundant content.

6. **Context Assembly**:
   Structures top-ranked video subtitle excerpts, lesson folder metadata, module titles, and start/end timestamps into a clean context window.

7. **Grounded LLM Completion**:
   Feeds the assembled context to `llama-3.3-70b-versatile` via Groq. The system prompt strictly restricts the LLM to context facts and mandates inline timestamp citations.

8. **Response Evaluator & Adaptive Retry**:
   Computes confidence scores based on retrieval relevance, grounding ratio, citation validity, and hallucination risk. If confidence falls below 60%, an adaptive retry loop automatically expands the retrieval window.

---

## 🎨 Web Frontend Features

- **Mobile Dev Assistant Chat Interface**: Modern, dark-mode glassmorphism interface featuring quick-select prompt cards, confidence badges, and response streams.
- **Interactive Timestamp Citations & Tooltips**: Answers contain inline timestamp badges (e.g., `📌 00:03:19 - 00:03:35`). Hovering over any badge reveals a sleek tooltip displaying the exact formatted lesson title.
- **Video Subtitle Citations & SRT Viewer**: Every answer lists source cards linking directly to the corresponding video lesson. Clicking any card opens a modal displaying parsed subtitle cues with highlighted timelines.
- **Indexed Course Subtitles Catalog**: A searchable catalog listing all 91 lessons across 18 course modules, allowing students to explore transcript files directly.
- **System Architecture & Telemetry Drawer**: Displays live status for vector database connectivity, active models, pipeline parameters, and detailed stage-by-stage latency breakdowns (in milliseconds).

---

## 🗂️ Project Structure Overview

- **`src/`**: Core RAG pipeline architecture.
  - **`scanner/`**: Directory walker (`CourseScanner.js`) that scans SRT files and extracts module/lesson metadata.
  - **`parser/`**: Subtitle parser (`SrtParser.js`) that converts raw SRT contents into structured subtitle entries.
  - **`chunking/`**: Sliding-window chunk builder (`ChunkBuilder.js`) that groups subtitles into timed 15-second windows.
  - **`embeddings/`**: Service integration for Jina Embeddings API.
  - **`vector/`**: Vector store interface (`QdrantVectorStore.js`) handling collection setup and point upserts/searches.
  - **`query/`**: Full online retrieval pipeline including guards, normalizer, reranker, prompt builder, LLM client, evaluator, and formatter.
- **`frontend/`**: Single-Page Web Application built with React and Vite.
  - **`src/components/`**: UI components (`ChatTab`, `CatalogTab`, `ArchitectureTab`, `CourseHeroCard`, `SourceCard`, `SubtitleModal`, `TelemetryDrawer`).
  - **`src/config/api.js`**: Centralized API endpoint configuration for frontend-backend communication.
- **`server.js`**: Express backend server providing REST API endpoints (`/api/chat`, `/api/stats`, `/api/lessons`, `/api/transcript`) and serving static web assets.

---

## 📄 License & Attribution

This application is built for educational intelligence on subtitle data from the **Complete Mobile Developer course with AI Projects**, created by **Hitesh Choudhary** and **Suraj Jha**.
