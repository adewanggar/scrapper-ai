import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  FolderArchive,
  Settings,
} from "lucide-react";

export default function MobileNav({ activeTab, handleNavClick, data, files }) {
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`mobile-nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
        onClick={() => handleNavClick("dashboard")}
        aria-label="Ikhtisar"
      >
        <div className="mobile-nav-icon-wrap">
          <LayoutDashboard size={20} />
        </div>
        <span className="mobile-nav-label">Ikhtisar</span>
      </button>

      <button
        className={`mobile-nav-tab ${activeTab === "results" ? "active" : ""}`}
        onClick={() => handleNavClick("results")}
        aria-label="Komentar"
      >
        <div className="mobile-nav-icon-wrap">
          <MessageSquare size={20} />
          {data?.comments?.length ? (
            <span className="mobile-nav-badge">
              {data.comments.length > 999 ? "999+" : data.comments.length}
            </span>
          ) : null}
        </div>
        <span className="mobile-nav-label">Komentar</span>
      </button>

      <button
        className={`mobile-nav-tab ${activeTab === "ai-analysis" ? "active" : ""}`}
        onClick={() => handleNavClick("ai-analysis")}
        aria-label="Analisis"
      >
        <div className="mobile-nav-icon-wrap">
          <Brain size={20} />
          <span className="mobile-nav-badge ai">AI</span>
        </div>
        <span className="mobile-nav-label">Analisis</span>
      </button>

      <button
        className={`mobile-nav-tab ${activeTab === "files" ? "active" : ""}`}
        onClick={() => handleNavClick("files")}
        aria-label="Koleksi dataset"
      >
        <div className="mobile-nav-icon-wrap">
          <FolderArchive size={20} />
          {files.length > 0 && (
            <span className="mobile-nav-badge">{files.length}</span>
          )}
        </div>
        <span className="mobile-nav-label">Koleksi</span>
      </button>

      <button
        className={`mobile-nav-tab ${activeTab === "settings" ? "active" : ""}`}
        onClick={() => handleNavClick("settings")}
        aria-label="Pengaturan"
      >
        <div className="mobile-nav-icon-wrap">
          <Settings size={20} />
        </div>
        <span className="mobile-nav-label">Pengaturan</span>
      </button>
    </nav>
  );
}
