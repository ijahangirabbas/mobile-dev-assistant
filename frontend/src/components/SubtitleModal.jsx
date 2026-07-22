import React, { useEffect, useState } from "react";
import { X, FileText, Clock, Search, Loader2 } from "lucide-react";
import { API } from "../config/api";

export function SubtitleModal({ source, onClose }) {
  const [cues, setCues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!source || !source.filePath) return;

    setLoading(true);
    setError(null);

    fetch(API.transcript(source.filePath))
      .then((res) => res.json())
      .then((data) => {
        if (data.cues) {
          setCues(data.cues);
        } else {
          setError(data.error || "Failed to load subtitle transcript.");
        }
      })
      .catch((err) => {
        setError(`Failed to fetch transcript: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [source]);

  if (!source) return null;

  const filteredCues = cues.filter((cue) =>
    cue.text.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(14, 21, 38, 0.85)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div className="card-panel" style={{
        width: "100%",
        maxWidth: 780,
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 14,
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface-2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} color="var(--accent-teal)" />
            <div>
              <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {source.lesson}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Timeline: {source.timeline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              borderRadius: 6,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search transcript lines..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "var(--text-muted)" }}>
              <Loader2 size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 10, color: "var(--accent-teal)" }} />
              <p style={{ fontSize: "0.875rem" }}>Parsing subtitle timestamps...</p>
            </div>
          ) : error ? (
            <div style={{ color: "var(--danger)", textAlign: "center", padding: 20 }}>{error}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredCues.map((cue) => {
                const isMatchingTimeline = source.timeline && (
                  cue.start.includes(source.timeline.split("-")[0]?.trim() || "____")
                );

                return (
                  <div
                    key={cue.id}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: 10,
                      borderRadius: 8,
                      background: isMatchingTimeline ? "var(--accent-brass-soft)" : "var(--surface)",
                      border: `1px solid ${isMatchingTimeline ? "rgba(201, 162, 39, 0.4)" : "var(--border)"}`
                    }}
                  >
                    <div className="font-mono" style={{
                      fontSize: "0.725rem",
                      color: isMatchingTimeline ? "var(--accent-brass)" : "var(--text-dim)",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0
                    }}>
                      <Clock size={11} /> {cue.start} ➔ {cue.end}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: isMatchingTimeline ? "#fff" : "var(--text-primary)", lineHeight: 1.5 }}>
                      {cue.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
