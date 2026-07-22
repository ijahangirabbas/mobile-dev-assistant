import React, { useState, useEffect } from "react";
import { BookOpen, Folder, PlayCircle, FileText, Search, ChevronRight } from "lucide-react";
import { API } from "../config/api";

export function CatalogTab({ onOpenTranscript }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetch(API.lessons)
      .then((res) => res.json())
      .then((data) => {
        if (data.modules) {
          setModules(data.modules);
          if (data.modules.length > 0) {
            setSelectedModule(data.modules[0].name);
          }
        }
      })
      .catch((err) => console.error("Failed to load catalog:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeModuleData = modules.find((m) => m.name === selectedModule);

  const filteredLessons = (activeModuleData?.lessons || []).filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      
      {/* Header */}
      <div className="card-panel" style={{ padding: 24, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={20} color="var(--accent-teal)" /> Indexed Video Course Subtitles
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 2 }}>
            Complete Mobile Developer Course with AI Projects • Subtitle Transcript Repository
          </p>
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", width: 260 }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              width: "100%"
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        
        {/* Sidebar Modules */}
        <div className="card-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, height: "fit-content" }}>
          <h3 className="font-mono" style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", padding: "4px 8px" }}>
            Modules ({modules.length})
          </h3>

          {loading ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: 8 }}>Loading modules...</p>
          ) : (
            modules.map((mod) => (
              <button
                key={mod.name}
                onClick={() => setSelectedModule(mod.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: selectedModule === mod.name ? "var(--surface-2)" : "transparent",
                  color: selectedModule === mod.name ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: selectedModule === mod.name ? 600 : 500,
                  fontSize: "0.825rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Folder size={15} color={selectedModule === mod.name ? "var(--accent-brass)" : "currentColor"} />
                  <span style={{ textTransform: "capitalize" }}>{mod.name}</span>
                </div>
                <span className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  {mod.lessons.length}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Lessons List */}
        <div className="card-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 8 }}>
            <Folder size={18} color="var(--accent-brass)" /> {selectedModule || "Select a module"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredLessons.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: 14 }}>No lessons found matching search filter.</p>
            ) : (
              filteredLessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="card-panel card-panel-interactive"
                  style={{
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <PlayCircle size={20} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {lesson.title}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                        Subtitle File: <code style={{ fontSize: "0.7rem" }}>{lesson.fileName}</code>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenTranscript({
                      lesson: lesson.title,
                      module: selectedModule,
                      filePath: lesson.filePath,
                      timeline: "Full Transcript"
                    })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: "0.775rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <FileText size={13} /> View SRT <ChevronRight size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
