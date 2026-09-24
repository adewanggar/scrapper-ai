import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  FolderArchive,
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  handleNavClick,
  isMobileMenuOpen,
  data,
  files
}) {
  return (
    <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon-square brand-icon-tesisori">
          <img
            src="/logo.png"
            alt="Tassiori Logo"
            style={{ width: '34px', height: '34px', objectFit: 'contain' }}
          />
        </div>
        <div className="brand-title-wrap">
          <h1 className="brand-tesisori-title">Tassiori</h1>
          <p className="brand-tesisori-sub">AI RESEARCH WORKSPACE</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => handleNavClick('results')}
        >
          <MessageSquare size={18} />
          <span>Hasil Komentar</span>
          {data?.comments?.length ? (
            <span className="nav-badge-pill">{data.comments.length}</span>
          ) : files.length > 0 && files[0]?.comments_count ? (
            <span className="nav-badge-pill">{files[0].comments_count}</span>
          ) : (
            <span className="nav-badge-pill">0</span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'ai-analysis' ? 'active' : ''}`}
          onClick={() => handleNavClick('ai-analysis')}
        >
          <Brain size={18} />
          <span>Analisis AI (Skripsi)</span>
          <span className="nav-badge-pill badge-ai">AI</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => handleNavClick('files')}
        >
          <FolderArchive size={18} />
          <span>Riwayat File</span>
          <span className="nav-badge-pill">{files.length}</span>
        </button>

        <div className="nav-section-title">SISTEM</div>

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
        >
          <Settings size={18} />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <span className="sidebar-server-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#16A34A" /> Ruang Riset Privat
          </span>
          <span className="badge-status-pill online">
            <span className="status-dot" /> Aktif
          </span>
        </div>
      </div>
    </aside>
  );
}
