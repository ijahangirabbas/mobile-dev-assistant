import React from "react";
import { Activity, ShieldCheck, Zap, Database, Cpu, RefreshCw, Layers } from "lucide-react";

export function ArchitectureTab({ stats }) {
  const stages = [
    { title: "1. Input Guard Pipeline", desc: "Sanitizes user input queries, validates boundaries, and screens for injection risks.", icon: ShieldCheck, color: "var(--accent-teal)" },
    { title: "2. Query Normalizer & Intent", desc: "Normalizes terms, detects query intent (factual / conceptual / conversational), expands key concepts.", icon: Zap, color: "#38bdf8" },
    { title: "3. Jina Query Embedding", desc: "Generates 1024-dim dense vector embedding using jina-embeddings-v3 with query task.", icon: Cpu, color: "#a5b4fc" },
    { title: "4. Qdrant HNSW Retrieval", desc: "Nearest-neighbour vector search in Qdrant collection 'course_chunks' (Top-50 initial match).", icon: Database, color: "var(--accent-brass)" },
    { title: "5. Cross-Encoder & Diversity Rerank", desc: "Reranks top candidate chunks using jina-reranker-v2-base + MMR diversity filter to top 5 context windows.", icon: Activity, color: "#ec4899" },
    { title: "6. Context Assembly", desc: "Formats extracted video subtitle segments, timestamps, and lesson names into context window.", icon: Layers, color: "#8b5cf6" },
    { title: "7. Groq LLM Completion", desc: "Generates grounded answers strictly using the video subtitle context as evidence.", icon: Cpu, color: "var(--accent-teal)" },
    { title: "8. Response Evaluator & Auto-Retry", desc: "Evaluates factual grounding score. Triggers automatic retry loop if confidence < 60%.", icon: RefreshCw, color: "var(--accent-brass)" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      
      {/* Title */}
      <div className="card-panel" style={{ padding: 24, marginBottom: 20 }}>
        <h2 className="font-display" style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <Layers size={22} color="var(--accent-brass)" /> Multi-Stage RAG Pipeline Architecture
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
          Complete technical lifecycle of online vector retrieval and LLM completion for video subtitles.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="card-panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-teal)", marginBottom: 6 }}>
            <Database size={18} />
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600 }}>Vector Database (Qdrant)</h4>
          </div>
          <div className="font-mono" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {stats?.vectorStore?.collectionName || "course_chunks"}
          </div>
          <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: 4 }}>
            Vector Size: {stats?.vectorStore?.vectorSize || 1024}d • Metric: {stats?.vectorStore?.distance || "Cosine"}
          </p>
        </div>

        <div className="card-panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-brass)", marginBottom: 6 }}>
            <Cpu size={18} />
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600 }}>Embedding & Reranker</h4>
          </div>
          <div className="font-mono" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {stats?.models?.embedding || "jina-embeddings-v3"}
          </div>
          <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: 4 }}>
            Reranker: {stats?.models?.reranker || "jina-reranker-v2-base"}
          </p>
        </div>

        <div className="card-panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8", marginBottom: 6 }}>
            <Zap size={18} />
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600 }}>LLM Completion</h4>
          </div>
          <div className="font-mono" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {stats?.models?.llm || "llama-3.3-70b-versatile"}
          </div>
          <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: 4 }}>
            Threshold: {stats?.pipelineConfig?.confidenceThreshold || 60}% • Retries: Max 2
          </p>
        </div>
      </div>

      {/* Stage Cards */}
      <div className="card-panel" style={{ padding: 20 }}>
        <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
          Online Pipeline Stages
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
          {stages.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="card-panel card-panel-interactive"
                style={{
                  padding: 14,
                  borderLeft: `3px solid ${st.color}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: st.color, fontWeight: 600, fontSize: "0.85rem" }}>
                  <Icon size={15} /> {st.title}
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
