import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { CORRECT_PIN } from '../constants/frameworks';

export default function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submitPin = (candidatePin) => {
    if (candidatePin === CORRECT_PIN) {
      setIsSuccess(true);
      setIsError(false);
      setErrorMessage('');
      setTimeout(() => {
        onUnlock(CORRECT_PIN);
      }, 400);
    } else {
      setIsError(true);
      setErrorMessage('PIN salah! Silakan coba lagi.');
      setTimeout(() => {
        setPin('');
        setIsError(false);
      }, 750);
    }
  };

  const handleDigit = (digit) => {
    if (isSuccess || isError || pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      submitPin(next);
    }
  };

  const handleDelete = () => {
    if (isSuccess || isError) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    if (isSuccess || isError) return;
    setPin('');
    setErrorMessage('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess, isError]);

  return (
    <div className="pin-screen-wrapper">
      <div className={`pin-card ${isError ? 'shake' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <img src="/logo.png" alt="TesisOri" style={{ width: '52px', height: '52px', objectFit: 'contain', marginBottom: '6px' }} />
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#F97316', letterSpacing: '-0.02em', lineHeight: 1.1 }}>TesisOri</span>
          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#EA580C' }}>AI Research Workspace</span>
        </div>

        <h2 className="pin-title">
          {isSuccess ? 'Akses Diterima' : 'Masukkan PIN Akses'}
        </h2>
        <p className="pin-subtitle">
          {isSuccess
            ? 'Membuka dashboard TesisOri...'
            : 'Sistem dilindungi keamanan. Masukkan PIN 6-digit untuk membuka aplikasi.'}
        </p>

        {/* 6 Dots Indicator */}
        <div className="pin-dots-container">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = pin.length > index;
            let dotClass = 'pin-dot';
            if (isSuccess) dotClass += ' success';
            else if (isError) dotClass += ' error';
            else if (isFilled) dotClass += ' filled';

            return <div key={index} className={dotClass} />;
          })}
        </div>

        {/* Feedback message */}
        <div className={`pin-feedback ${isError ? 'error' : isSuccess ? 'success' : 'idle'}`}>
          {errorMessage ? (
            <>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={15} />
              <span>PIN Benar! Membuka dashboard...</span>
            </>
          ) : (
            <span>Ketik PIN langsung atau gunakan keypad</span>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="pin-key-btn"
              onClick={() => handleDigit(String(num))}
              disabled={isSuccess || isError}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="pin-key-btn action"
            onClick={handleClear}
            disabled={isSuccess || isError}
            title="Reset"
          >
            Hapus
          </button>
          <button
            type="button"
            className="pin-key-btn"
            onClick={() => handleDigit('0')}
            disabled={isSuccess || isError}
          >
            0
          </button>
          <button
            type="button"
            className="pin-key-btn action"
            onClick={handleDelete}
            disabled={isSuccess || isError}
            title="Backspace"
          >
            ⌫
          </button>
        </div>

        <div className="pin-helper-note">
          🔒 Sesi akan tersimpan aman di browser Anda
        </div>
      </div>
    </div>
  );
}
