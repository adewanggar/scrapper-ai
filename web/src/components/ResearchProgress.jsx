import React, { useState, useEffect } from 'react';
import './progress-bar.css';
import {
  DownloadCloud,
  Brain,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  Lightbulb
} from 'lucide-react';

const SCRAPE_STEPS = [
  { label: 'Validasi Tautan', desc: 'Menghubungkan ke platform & memverifikasi video...' },
  { label: 'Komentar Utama', desc: 'Mengambil data komentar, username, dan timestamp...' },
  { label: 'Thread Balasan', desc: 'Mengurai percakapan bersarang (nested replies)...' },
  { label: 'Finalisasi Cloud', desc: 'Menyusun dataset & sinkronisasi ke ruang riset privat...' }
];

const AI_STEPS = [
  { label: 'Persiapan Sampel', desc: 'Menyiapkan sampel percakapan & parameter riset...' },
  { label: 'Konstruksi Prompt', desc: 'Membangun kerangka epistemologi sesuai teori...' },
  { label: 'Penalaran LLM', desc: 'Model AI membedah makna kualitatif & pola audiens...' },
  { label: 'Sintesis Bab 4', desc: 'Menyusun metrik, kutipan verbatim, dan narasi skripsi...' }
];

export function ScrapeProgressBar({ isScraping, platform = 'tiktok' }) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isScraping) {
      if (progress > 0 && progress < 100) {
        setProgress(100);
        const timer = setTimeout(() => {
          setProgress(0);
          setElapsed(0);
        }, 1200);
        return () => clearTimeout(timer);
      }
      return;
    }

    setProgress(8);
    setElapsed(0);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const seconds = Math.floor((now - startTime) / 1000);
      setElapsed(seconds);

      setProgress((prev) => {
        if (prev < 30) return Math.min(prev + 2.5, 30);
        if (prev < 65) return Math.min(prev + 1.4, 65);
        if (prev < 85) return Math.min(prev + 0.7, 85);
        if (prev < 95) return Math.min(prev + 0.2, 95);
        return prev;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isScraping]);

  if (!isScraping && progress === 0) return null;

  // Determine active step index (0 to 3)
  const activeStepIdx = progress < 25 ? 0 : progress < 55 ? 1 : progress < 85 ? 2 : 3;
  const currentStep = SCRAPE_STEPS[activeStepIdx];
  const roundedPct = Math.min(100, Math.round(progress));

  return (
    <div className="research-progress-card scrape-theme" role="status" aria-live="polite">
      <div className="progress-header">
        <div className="progress-title-wrap">
          <div className="progress-icon-badge scrape">
            {progress >= 100 ? (
              <CheckCircle2 size={22} color="#16A34A" />
            ) : (
              <DownloadCloud size={20} className="pulse-icon" />
            )}
          </div>
          <div className="progress-title-text">
            <h4>
              {progress >= 100
                ? 'Pengumpulan Selesai!'
                : `Mengumpulkan Komentar ${platform === 'youtube' ? 'YouTube' : 'TikTok'}...`}
            </h4>
            <p>Dataset sedang diproses secara metodologis ke akun Anda</p>
          </div>
        </div>

        <div className="progress-meta-stats">
          <div className="progress-timer-pill" title="Waktu berjalan">
            <Clock size={13} />
            <span>{elapsed}d</span>
          </div>
          <div className="progress-percentage">{roundedPct}%</div>
        </div>
      </div>

      {/* Bar Track */}
      <div className="progress-track">
        <div className="progress-fill scrape-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Active Stage Indicator */}
      <div className="progress-active-stage">
        <span className="progress-stage-dot" />
        <span>
          <strong>Tahap {activeStepIdx + 1}/4:</strong> {currentStep.desc}
        </span>
      </div>

      {/* Micro-steps Checklist */}
      <div className="progress-steps-list">
        {SCRAPE_STEPS.map((step, idx) => {
          const isDone = progress >= 100 || idx < activeStepIdx;
          const isActive = idx === activeStepIdx && progress < 100;
          return (
            <div
              key={step.label}
              className={`progress-step-item ${isDone ? 'completed' : isActive ? 'active' : ''}`}
            >
              {isDone ? (
                <CheckCircle2 size={13} color="#16A34A" style={{ flexShrink: 0 }} />
              ) : isActive ? (
                <span className="progress-stage-dot" style={{ width: '6px', height: '6px' }} />
              ) : (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
              )}
              <span className="progress-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Scientific Note */}
      <div className="progress-tip-box">
        <Lightbulb size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
        <span>
          <strong>Tips Riset:</strong> Proses ekstraksi menyaring teks, username, dan balasan bersarang 
          sehingga dataset siap dianalisis untuk Bab 4 atau diekspor ke SPSS/SmartPLS.
        </span>
      </div>
    </div>
  );
}

export function AiProgressBar({ aiLoading, framework, model, sampleSize }) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!aiLoading) {
      if (progress > 0 && progress < 100) {
        setProgress(100);
        const timer = setTimeout(() => {
          setProgress(0);
          setElapsed(0);
        }, 1200);
        return () => clearTimeout(timer);
      }
      return;
    }

    setProgress(6);
    setElapsed(0);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const seconds = Math.floor((now - startTime) / 1000);
      setElapsed(seconds);

      setProgress((prev) => {
        if (prev < 25) return Math.min(prev + 2.2, 25);
        if (prev < 60) return Math.min(prev + 1.1, 60);
        if (prev < 80) return Math.min(prev + 0.6, 80);
        if (prev < 94) return Math.min(prev + 0.18, 94);
        return prev;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [aiLoading]);

  if (!aiLoading && progress === 0) return null;

  const activeStepIdx = progress < 25 ? 0 : progress < 50 ? 1 : progress < 80 ? 2 : 3;
  const currentStep = AI_STEPS[activeStepIdx];
  const roundedPct = Math.min(100, Math.round(progress));

  return (
    <div className="research-progress-card ai-theme" role="status" aria-live="polite">
      <div className="progress-header">
        <div className="progress-title-wrap">
          <div className="progress-icon-badge ai">
            {progress >= 100 ? (
              <CheckCircle2 size={22} color="#16A34A" />
            ) : (
              <Brain size={20} className="pulse-icon" />
            )}
          </div>
          <div className="progress-title-text">
            <h4>
              {progress >= 100
                ? 'Analisis Selesai!'
                : `Menganalisis: ${framework?.title || 'Riset Akademik'}`}
            </h4>
            <p>
              Model: <strong>{model || 'AI Model'}</strong> • Sampel: <strong>{sampleSize || 50} komentar</strong>
            </p>
          </div>
        </div>

        <div className="progress-meta-stats">
          <div className="progress-timer-pill" title="Waktu pemrosesan">
            <Clock size={13} />
            <span>{elapsed}d</span>
          </div>
          <div className="progress-percentage ai-pct">{roundedPct}%</div>
        </div>
      </div>

      {/* Bar Track */}
      <div className="progress-track">
        <div className="progress-fill ai-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Active Stage Indicator */}
      <div className="progress-active-stage">
        <span className="progress-stage-dot ai-dot" />
        <span>
          <strong>Tahap {activeStepIdx + 1}/4:</strong> {currentStep.desc}
        </span>
      </div>

      {/* Micro-steps Checklist */}
      <div className="progress-steps-list">
        {AI_STEPS.map((step, idx) => {
          const isDone = progress >= 100 || idx < activeStepIdx;
          const isActive = idx === activeStepIdx && progress < 100;
          return (
            <div
              key={step.label}
              className={`progress-step-item ${isDone ? 'completed' : isActive ? 'active' : ''}`}
            >
              {isDone ? (
                <CheckCircle2 size={13} color="#16A34A" style={{ flexShrink: 0 }} />
              ) : isActive ? (
                <span className="progress-stage-dot ai-dot" style={{ width: '6px', height: '6px' }} />
              ) : (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />
              )}
              <span className="progress-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Scientific Theory Context */}
      <div className="progress-tip-box">
        <Sparkles size={15} color="#7C3AED" style={{ flexShrink: 0, marginTop: '1px' }} />
        <span>
          <strong>Landasan Teori:</strong> {framework?.theory || 'Analisis kualitatif berbasis AI'}.
          Sistem sedang mengekstraksi kutipan verbatim dan sintesis narasi untuk draf Bab 4.
        </span>
      </div>
    </div>
  );
}
