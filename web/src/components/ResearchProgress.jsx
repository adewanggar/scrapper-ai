import React, { useEffect, useState } from 'react';
import './progress-bar.css';

function OperationProgress({ title, description }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <section className="operation-progress" aria-label={title}>
      <div className="operation-progress__header">
        <p className="operation-progress__title" role="status">{title}</p>
        <span className="operation-progress__time" aria-label={`Waktu berjalan ${elapsed} detik`}>
          {minutes}:{seconds}
        </span>
      </div>
      <p className="operation-progress__description">{description}</p>
      <div className="operation-progress__track" role="progressbar" aria-label={title} aria-valuetext="Sedang diproses">
        <span className="operation-progress__indicator" />
      </div>
    </section>
  );
}

export function ScrapeProgressBar({ isScraping, platform = 'tiktok' }) {
  if (!isScraping) return null;
  return (
    <OperationProgress
      title="Mengambil komentar"
      description={`${platform === 'youtube' ? 'YouTube' : 'TikTok'} · Komentar akan ditampilkan setelah pengambilan selesai.`}
    />
  );
}

export function AiProgressBar({ aiLoading, framework, sampleSize }) {
  if (!aiLoading) return null;
  const sample = Number(sampleSize) === 0 ? 'Semua komentar' : `${sampleSize ?? 50} komentar`;
  return (
    <OperationProgress
      title="Menganalisis komentar"
      description={`${framework?.title || 'Kajian penelitian'} · ${sample}`}
    />
  );
}
