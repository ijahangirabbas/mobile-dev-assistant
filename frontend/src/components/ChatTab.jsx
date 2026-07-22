import React, { useState, useRef, useEffect } from "react";
import { Bot, User, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, PlusCircle, ArrowUp } from "lucide-react";
import { CourseHeroCard } from "./CourseHeroCard";
import { SourceCard } from "./SourceCard";
import { TelemetryDrawer } from "./TelemetryDrawer";
import { API } from "../config/api";

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

function FormattedMessageText({ text, sources }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  if (!text) return null;

  const citationRegex = /\[(?:([^\]|]+)\|)?\s*(\d{2}:\d{2}(?::\d{2})?(?:\s*-\s*\d{2}:\d{2}(?::\d{2})?)?(?:\s*,\s*\d{2}:\d{2}(?::\d{2})?(?:\s*-\s*\d{2}:\d{2}(?::\d{2})?)?)*)\]/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    const [fullMatch, titleMatch, timeMatch] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push({ type: "text", content: text.substring(lastIndex, matchIndex) });
    }

    parts.push({
      type: "citation",
      raw: fullMatch,
      title: titleMatch ? titleMatch.trim() : "",
      time: timeMatch.trim()
    });

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  if (parts.length === 1 && parts[0].type === "text") {
    return <div style={{ fontSize: "0.925rem", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{text}</div>;
  }

  return (
    <div style={{ fontSize: "0.925rem", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
      {parts.map((part, idx) => {
        if (part.type === "text") {
          return <span key={idx}>{part.content}</span>;
        }

        const matchedSource = sources?.find((s) => {
          const lTitle = (s.lessonTitle || s.lesson || s.fileName || "").toLowerCase();
          const pTitle = part.title.toLowerCase();
          const firstTime = part.time.split(",")[0].split("-")[0].trim();
          return (
            (pTitle && lTitle.includes(pTitle)) ||
            (pTitle && pTitle.includes(lTitle)) ||
            (s.timeline && s.timeline.includes(firstTime))
          );
        });

        const rawLessonName = matchedSource?.lessonTitle || matchedSource?.lesson || matchedSource?.fileName || part.title || "Lesson Source";
        const displayLessonName = formatTitle(rawLessonName);

        return (
          <span
            key={idx}
            style={{ position: "relative", display: "inline-block", margin: "0 3px" }}
            onMouseEnter={() => setActiveTooltip(idx)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 7px",
                borderRadius: 6,
                background: "rgba(37, 99, 235, 0.18)",
                border: "1px solid rgba(37, 99, 235, 0.4)",
                color: "#60a5fa",
                fontSize: "0.76rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                cursor: "pointer",
                verticalAlign: "middle"
              }}
            >
              📌 {part.time}
            </span>

            {activeTooltip === idx && (
              <div
                style={{
                  position: "absolute",
                  bottom: "130%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  minWidth: 230,
                  maxWidth: 340,
                  background: "#0f172a",
                  border: "1px solid #2563eb",
                  borderRadius: 10,
                  padding: "10px 14px",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.6)",
                  zIndex: 9999,
                  pointerEvents: "none",
                  color: "#ffffff"
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                  📖 Lesson Source Title
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", lineHeight: 1.35, wordBreak: "break-word" }}>
                  {displayLessonName}
                </div>
                <div style={{ fontSize: "0.725rem", color: "#60a5fa", marginTop: 5, fontFamily: "var(--font-mono)" }}>
                  ⏱️ {part.time}
                </div>
              </div>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function ChatTab({ onOpenTranscript }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openTelemetryId, setOpenTelemetryId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend.trim() })
      });

      const data = await res.json();

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.answer || "No answer returned.",
        confidence: data.confidence || 75,
        intent: data.intent || "factual",
        timings: data.timings,
        retries: data.retries || 0,
        sources: data.sources || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: `⚠️ **Connection Error**: ${err.message}. Please ensure the backend server is running at \`http://localhost:3001\`.`,
          confidence: 0,
          intent: "error",
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 130px)", position: "relative" }}>
      
      {/* Top Header Control (when in conversation) */}
      {messages.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
          <button
            onClick={() => setMessages([])}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-muted)",
              fontSize: "0.775rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "#2563eb";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <PlusCircle size={13} /> New Chat / Course Overview
          </button>
          
          <span style={{ fontSize: "0.725rem", color: "var(--text-dim)" }}>
            Mobile Dev Assistant
          </span>
        </div>
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, paddingBottom: 90 }}>
        {messages.length === 0 ? (
          /* INITIAL HERO VIEW: Stretches fully across page without scroll */
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 160px)", width: "100%" }}>
            <CourseHeroCard onSelectPrompt={(prompt) => handleSend(prompt)} />
          </div>
        ) : (
          /* CHAT MESSAGES THREAD */
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: 12,
                flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                alignItems: "flex-start"
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: msg.sender === "user" ? "#2563eb" : "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                flexShrink: 0,
                fontWeight: 700
              }}>
                {msg.sender === "user" ? <User size={16} /> : <Bot size={16} color="var(--accent-teal)" />}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: "88%",
                background: msg.sender === "user" ? "var(--surface-2)" : "var(--surface)",
                border: "1px solid var(--border)",
                padding: "14px 18px",
                borderRadius: 12,
                color: "var(--text-primary)"
              }}>
                {/* Badges */}
                {msg.sender === "assistant" && msg.confidence !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="badge badge-teal font-mono">
                      <CheckCircle2 size={11} /> {msg.confidence}% Confidence
                    </span>

                    {msg.intent && (
                      <span className="badge badge-muted font-mono" style={{ textTransform: "lowercase" }}>
                        intent: {msg.intent}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Text */}
                {msg.sender === "assistant" ? (
                  <FormattedMessageText text={msg.text} sources={msg.sources} />
                ) : (
                  <div style={{ fontSize: "0.925rem", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                    {msg.text}
                  </div>
                )}

                {/* Grounding Video Subtitle Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      📚 Video Subtitle Citations ({msg.sources.length}):
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                      {msg.sources.map((src, idx) => (
                        <SourceCard key={idx} source={src} onOpenTranscript={onOpenTranscript} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Telemetry Toggle */}
                {msg.timings && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={() => setOpenTelemetryId(openTelemetryId === msg.id ? null : msg.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "0.725rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: 0
                      }}
                    >
                      {openTelemetryId === msg.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {openTelemetryId === msg.id ? "Hide RAG Stage Latency Breakdown" : "Inspect RAG Latency Breakdown (ms)"}
                    </button>

                    {openTelemetryId === msg.id && (
                      <TelemetryDrawer
                        timings={msg.timings}
                        confidence={msg.confidence}
                        intent={msg.intent}
                        retries={msg.retries}
                      />
                    )}
                  </div>
                )}

              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-teal)"
            }}>
              <Bot size={16} />
            </div>
            <div className="card-panel" style={{ padding: "10px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
              <span>Searching & reranking subtitle vectors...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CENTERED CHATGPT STYLE INPUT PILL WITH SOLID BLUE BUTTON */}
      <div className="chat-input-wrapper">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="chat-input-box"
        >
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything about the Complete Mobile Developer course..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="send-btn-blue"
            title="Send message"
          >
            <ArrowUp size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
