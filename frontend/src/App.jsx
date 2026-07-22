import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ChatTab } from "./components/ChatTab";
import { CatalogTab } from "./components/CatalogTab";
import { ArchitectureTab } from "./components/ArchitectureTab";
import { SubtitleModal } from "./components/SubtitleModal";
import { API } from "./config/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [stats, setStats] = useState(null);
  const [activeModalSource, setActiveModalSource] = useState(null);

  useEffect(() => {
    fetch(API.stats)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load backend stats:", err));
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onNewChat={() => setActiveTab("chat")}
      />

      {/* Main Container (Handles Scrolling when content overflows) */}
      <main style={{ flex: 1, overflowY: "auto", position: "relative", padding: "16px" }}>
        {activeTab === "chat" && (
          <ChatTab onOpenTranscript={(source) => setActiveModalSource(source)} />
        )}

        {activeTab === "catalog" && (
          <CatalogTab onOpenTranscript={(source) => setActiveModalSource(source)} />
        )}

        {activeTab === "architecture" && (
          <ArchitectureTab stats={stats} />
        )}
      </main>

      {/* Transcript Subtitle Modal */}
      {activeModalSource && (
        <SubtitleModal
          source={activeModalSource}
          onClose={() => setActiveModalSource(null)}
        />
      )}
    </div>
  );
}
