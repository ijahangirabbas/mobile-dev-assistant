import React from "react";
import { Activity, ShieldCheck, Zap, Database, Cpu, RefreshCw } from "lucide-react";

export function TelemetryDrawer({ timings, confidence, intent, retries }) {
  if (!timings) return null;

  const total = timings.totalMs || 1;

  const stages = [
    { name: "Input Guards", key: "inputGuards", icon: ShieldCheck, color: "var(--accent-teal)", ms: timings.inputGuards || 10 },
    { name: "Query Preprocessing", key: "preprocess", icon: Zap, color: "#38bdf8", ms: timings.preprocess || 15 },
    { name: "Jina Query Embedding", key: "queryEmbedding", icon: Cpu, color: "#a5b4fc", ms: timings.queryEmbedding || 45 },
    { name: "Qdrant Vector Retrieval", key: "retrieval", icon: Database, color: "var(--accent-brass)", ms: timings.retrieval || 25 },
    { name: "Candidate Reranking", key: "ranking", icon: Activity, color: "#ec4899", ms: timings.ranking || 20 },
    { name: "LLM Completion", key: "llmCompletion", icon: Cpu, color: "var(--accent-teal)", ms: timings.llmCompletion || 300 },
  ];

  return (
    <div style={{
      marginTop: 12,
      padding: 14,
      borderRadius: 10,
      background: "var(--bg)",
      border: "1px solid var(--border)",
      fontSize: "0.775rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--accent-teal)" }}>
          <Activity size={14} /> Stage Latency Diagnostics
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="font-mono" style={{ color: "var(--text-muted)" }}>
            Total: <strong style={{ color: "var(--text-primary)" }}>{total} ms</strong>
          </span>
          {retries > 0 && (
            <span className="font-mono" style={{ color: "var(--accent-brass)", display: "flex", alignItems: "center", gap: 4 }}>
              <RefreshCw size={11} /> {retries} Retries
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {stages.map((stage) => {
          const stageMs = stage.ms || 5;
          const pct = Math.min(100, Math.max(4, Math.round((stageMs / total) * 100)));
          const Icon = stage.icon;

          return (
            <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 170, display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.725rem" }}>
                <Icon size={12} color={stage.color} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stage.name}</span>
              </div>

              <div style={{ flex: 1, height: 5, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: stage.color,
                    borderRadius: 4
                  }}
                />
              </div>

              <div className="font-mono" style={{ width: 45, textAlign: "right", fontSize: "0.725rem", color: "var(--text-muted)" }}>
                {stageMs}ms
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
