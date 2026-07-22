import React from "react";
import { Star, Award, User, Calendar, Globe, Sparkles, Code, Smartphone } from "lucide-react";

export function CourseHeroCard({ onSelectPrompt }) {
  const suggestedPrompts = [
    "How do I setup navigation in React Native & Expo?",
    "Explain building an AI story-generator project with APIs",
    "How do I integrate camera and sensors in Expo?",
    "What is the difference between Expo Go and EAS Builds?",
    "How to implement authentication & secure storage in React Native?",
    "Explain state management with Context API and custom hooks"
  ];

  return (
    <div className="card-panel" style={{ padding: "24px 32px", width: "100%", borderRadius: 14, border: "1px solid var(--border)" }}>
      
      {/* Top Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span className="badge badge-brass" style={{ fontSize: "0.75rem", padding: "4px 10px", fontWeight: 700 }}>
          <Award size={13} /> Bestseller
        </span>
        <span className="badge badge-teal" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
          <Smartphone size={13} /> React Native & Expo
        </span>
        <span className="badge badge-muted" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
          Role Play
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display" style={{ fontSize: "1.75rem", fontWeight: 600, color: "#fff", lineHeight: 1.25, marginBottom: 8 }}>
        Complete Mobile Developer course with AI Projects
      </h2>

      {/* Subtitle */}
      <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16, maxWidth: 900 }}>
        Build real React Native & Expo apps | APIs, sensors, camera, maps, auth, EAS builds & an AI story-generator project.
      </p>

      {/* Metadata Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", fontSize: "0.825rem", color: "var(--text-muted)", paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontWeight: 700, color: "var(--accent-brass)", fontSize: "0.925rem" }}>4.9</span>
          <div style={{ display: "flex", gap: 2, color: "var(--accent-brass)" }}>
            <Star size={13} fill="currentColor" />
            <Star size={13} fill="currentColor" />
            <Star size={13} fill="currentColor" />
            <Star size={13} fill="currentColor" />
            <Star size={13} fill="currentColor" />
          </div>
          <span style={{ color: "var(--text-dim)" }}>(25 ratings)</span>
        </div>

        {/* Authors */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <User size={14} color="var(--accent-teal)" />
          <span>Created by <strong style={{ color: "var(--text-primary)" }}>Hitesh Choudhary</strong>, <strong style={{ color: "var(--text-primary)" }}>Suraj Jha</strong></span>
        </div>

        {/* Last Updated */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Calendar size={14} color="var(--text-dim)" />
          <span>Last updated 7/2026</span>
        </div>

        {/* Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Globe size={14} color="var(--text-dim)" />
          <span>English</span>
        </div>
      </div>

      {/* Suggested Prompts Section */}
      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: "0.775rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={13} color="var(--accent-brass)" /> Suggested Queries:
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt)}
              className="card-panel card-panel-interactive"
              style={{
                padding: "10px 14px",
                textAlign: "left",
                color: "var(--text-primary)",
                fontSize: "0.825rem",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                whiteSpace: "normal"
              }}
            >
              <span>{prompt}</span>
              <Code size={14} color="var(--text-dim)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
