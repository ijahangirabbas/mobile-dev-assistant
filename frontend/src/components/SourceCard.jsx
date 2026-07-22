import React from "react";
import { PlayCircle, Clock, Award, FileText, ChevronRight } from "lucide-react";

function formatTitle(raw) {
  if (!raw) return "Lesson Subtitle";
  let str = raw
    .replace(/\.srt$/i, "")
    .replace(/^\d+[-_\s]*/, "")
    .replace(/_epm|_ch\d*|\bepm\b|\bch\d*\b/gi, "")
    .replace(/[_-]+/g, " ")
    .trim();

  const titleStr = str || raw.replace(/[_-]+/g, " ").trim();

  return titleStr
    .split(" ")
    .filter(Boolean)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && ["vs", "and", "or", "in", "of", "to", "for", "a", "an", "the", "with", "on", "at"].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function SourceCard({ source, onOpenTranscript }) {
  const scoreNum = parseFloat(source.relevanceScore || "0.85");
  const scorePercent = Math.round(scoreNum > 1 ? scoreNum : scoreNum * 100);

  const rawName = source.lessonTitle || source.lesson || source.title || source.fileName || (source.filePath ? source.filePath.split(/[/\\]/).pop() : "");
  const formattedTitle = formatTitle(rawName);

  return (
    <div className="card-panel card-panel-interactive" style={{ padding: 14, borderRadius: 10, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: "var(--surface-2)",
            color: "var(--accent-teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <PlayCircle size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, wordBreak: "break-word", margin: 0 }}>
              {formattedTitle}
            </h4>
            {source.module && (
              <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: 2 }}>
                {source.module}
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <span className="badge badge-brass font-mono" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
          <Award size={11} /> {scorePercent}% Match
        </span>
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span className="font-mono" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 6px",
          borderRadius: 4,
          background: "var(--surface-2)",
          color: "var(--accent-teal)",
          fontSize: "0.725rem",
          fontWeight: 500,
          border: "1px solid var(--border)"
        }}>
          <Clock size={11} /> {source.timeline || "00:00 - 00:15"}
        </span>
      </div>

      {/* Excerpt */}
      {source.context && (
        <p style={{
          fontSize: "0.775rem",
          color: "var(--text-muted)",
          background: "var(--bg)",
          padding: "8px 10px",
          borderRadius: 6,
          borderLeft: "2px solid var(--accent-brass)",
          marginBottom: 10,
          fontStyle: "italic",
          lineHeight: 1.4
        }}>
          "{source.context.length > 120 ? source.context.slice(0, 120) + '...' : source.context}"
        </p>
      )}

      {/* Action */}
      {source.filePath && (
        <button
          onClick={() => onOpenTranscript(source)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 6,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <FileText size={12} /> View Subtitle Segment <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}
