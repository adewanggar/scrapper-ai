import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  ScanText,
  FolderArchive,
  Settings,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
const navigation = [
  ["dashboard", "Ikhtisar", LayoutDashboard],
  ["results", "Komentar", MessageSquare],
  ["ai-analysis", "Analisis riset", ScanText],
  ["research-titles", "Generator ide judul", ScanText],
  ["research-theories", "Rekomendasi teori", ScanText],
  ["files", "Koleksi dataset", FolderArchive],
];
export default function Sidebar({
  activeTab,
  handleNavClick,
  isMobileMenuOpen,
  data,
  files,
}) {
  return (
    <aside className={`app-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon-square">
          <img src="/logo.png" alt="" width="34" height="34" />
        </div>
        <div className="brand-title-wrap">
          <h1>
            TesisOri<span className="brand-period">.</span>
          </h1>
          <p>Ruang riset digital</p>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Navigasi utama">
        <div className="nav-section-title">WORKSPACE</div>
        {navigation.map(([id, label, Icon]) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? "active" : ""}`}
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => handleNavClick(id)}
          >
            <Icon size={18} strokeWidth={1.6} />
            <span>{label}</span>
            {id === "results" && (
              <span className="nav-badge-pill">
                {data?.comments?.length || 0}
              </span>
            )}
            {id === "files" && (
              <span className="nav-badge-pill">{files.length}</span>
            )}
          </button>
        ))}
        <div className="sidebar-nav-divider" />
        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          aria-current={activeTab === "settings" ? "page" : undefined}
          onClick={() => handleNavClick("settings")}
        >
          <Settings size={18} strokeWidth={1.6} />
          <span>Pengaturan</span>
        </button>
      </nav>
      <div className="sidebar-note">
        <span className="section-kicker">DARI DATA KE MAKNA</span>
        <p>
          Setiap percakapan
          <br />
          punya cerita.
        </p>
        <button onClick={() => handleNavClick("ai-analysis")}>
          Jelajahi analisis <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="sidebar-footer">
        <ShieldCheck size={15} />
        <span>Ruang riset privat</span>
      </div>
    </aside>
  );
}
