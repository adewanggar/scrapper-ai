import React from 'react';
import {
  Menu,
  Upload,
  ChevronDown,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export default function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  fileInputRef,
  handleFileUpload,
  userMenuRef,
  showUserDropdown,
  setShowUserDropdown,
  currentUser,
  handleLogout
}) {
  return (
    <header className="top-navbar-clean">
      <div className="navbar-left">
        <span className="workspace-breadcrumb">Tassiori <span>/ Ruang riset</span></span>
        <button
          className="btn-mobile-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Toggle Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="navbar-right">
        <button
          className="btn-pill-header"
          onClick={() => fileInputRef.current?.click()}
          title="Unggah dataset penelitian dari komputer ke akun Anda"
        >
          <Upload size={14} />
          <span>Unggah Dataset</span>
        </button>

        {/* User Profile Menu with Google / Email Dropdown */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button
            className="btn-pill-user"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            title={`Akun: ${currentUser?.email}`}
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="user-avatar-img" />
            ) : (
              <div className="user-avatar-placeholder">
                {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span>
              {currentUser?.displayName
                ? currentUser.displayName.split(' ')[0]
                : (currentUser?.email || 'User').split('@')[0]}
            </span>
            <ChevronDown size={13} style={{ opacity: 0.6 }} />
          </button>

          {showUserDropdown && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <div className="user-dropdown-name">
                  {currentUser?.displayName || 'Peneliti'}
                </div>
                <div className="user-dropdown-email">{currentUser?.email}</div>
                <div className="user-dropdown-badge">
                  <ShieldCheck size={12} />
                  <span>Ruang Riset Privat</span>
                </div>
              </div>
              <button
                className="user-dropdown-action"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>
    </header>
  );
}
