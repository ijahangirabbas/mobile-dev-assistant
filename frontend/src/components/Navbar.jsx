import React from "react";
import { MessageSquare, BookOpen, Cpu, Database, Layers } from "lucide-react";

export function Navbar({ activeTab, setActiveTab, stats, onNewChat }) {
  const isConnected = stats?.vectorStore?.connected;

  return (
    <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "14px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        
        {/* Brand Name (Mobile Dev Assistant) */}
        <div
          onClick={onNewChat}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb"
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Mobile Dev Assistant
            </h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Indexed Video Subtitle Intelligence • Qdrant + Jina + Groq
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display: "flex", gap: 6, background: "var(--bg)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("chat")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "chat" ? "var(--surface-2)" : "transparent",
              color: activeTab === "chat" ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "chat" ? 600 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <MessageSquare size={16} color={activeTab === "chat" ? "#2563eb" : "currentColor"} /> Chat Assistant
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "catalog" ? "var(--surface-2)" : "transparent",
              color: activeTab === "catalog" ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "catalog" ? 600 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <BookOpen size={16} color={activeTab === "catalog" ? "var(--accent-teal)" : "currentColor"} /> Course Subtitles ({stats?.totalLessons || 91})
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "architecture" ? "var(--surface-2)" : "transparent",
              color: activeTab === "architecture" ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "architecture" ? 600 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <Layers size={16} /> System Architecture
          </button>
        </nav>

        {/* System Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-teal font-mono" style={{ fontSize: "0.7rem" }}>
            <Database size={12} /> {isConnected ? "Qdrant Ready" : "Vector Store"}
          </span>
          <span className="badge font-mono" style={{ fontSize: "0.7rem", background: "rgba(37, 99, 235, 0.15)", color: "#3b82f6", border: "1px solid rgba(37, 99, 235, 0.3)" }}>
            <Cpu size={12} /> {stats?.models?.llm ? "LLM Ready" : "Llama-3.3"}
          </span>
        </div>

      </div>
    </header>
  );
}
