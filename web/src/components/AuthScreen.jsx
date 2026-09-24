import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const { user, error } = await loginWithGoogle();
    setIsLoading(false);
    if (error) {
      setErrorMsg(error);
    } else if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Harap isi email dan kata sandi.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    if (mode === 'login') {
      const { user, error } = await loginWithEmail(email.trim(), password);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error);
      } else if (user) {
        if (onAuthSuccess) onAuthSuccess(user);
      }
    } else {
      const { user, error } = await registerWithEmail(email.trim(), password, displayName.trim());
      setIsLoading(false);
      if (error) {
        setErrorMsg(error);
      } else if (user) {
        if (onAuthSuccess) onAuthSuccess(user);
      }
    }
  };

  return (
    <div className="auth-screen-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo-wrap">
            <img src="/logo.png" alt="Tassiori Logo" />
          </div>
          <h1 className="auth-brand-title">Tassiori</h1>
          <p className="auth-brand-sub">AI RESEARCH WORKSPACE</p>
        </div>

        {/* Title & Desc */}
        <div className="auth-welcome-text">
          <h2>{mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Peneliti'}</h2>
          <p>
            {mode === 'login'
              ? 'Masuk untuk mengakses riwayat scrape, analisis framing, dan dataset privat Anda.'
              : 'Daftarkan akun Anda agar semua hasil scraping dan analisis tersimpan aman di cloud.'}
          </p>
        </div>

        {/* Google One-Click Login Button */}
        <button
          type="button"
          className="btn-google-auth"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="google-icon-svg" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>atau dengan email</span>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="auth-tab-toggle">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
          >
            <LogIn size={15} />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
          >
            <UserPlus size={15} />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-input-group">
              <label>Nama Lengkap</label>
              <div className="auth-input-box">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Nama Peneliti / Mahasiswa"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label>Alamat Email</label>
            <div className="auth-input-box">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label>Kata Sandi</label>
              {mode === 'register' && (
                <span className="auth-hint-min">Min. 6 karakter</span>
              )}
            </div>
            <div className="auth-input-box">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="auth-spinner" />
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Masuk ke Akun</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Buat Akun Baru</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Privacy Footer Note */}
        <div className="auth-privacy-note">
          <ShieldCheck size={14} color="#16A34A" />
          <span>Seluruh dataset dan analisis riset bersifat <strong>100% privat</strong> dan hanya dapat diakses oleh akun Anda.</span>
        </div>
      </div>
    </div>
  );
}
