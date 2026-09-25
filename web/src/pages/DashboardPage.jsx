import React from "react";
import {
  ArrowRight,
  Link2,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  FolderOpen,
  MessageSquare,
  Music2,
  Video,
  ShieldCheck,
} from "lucide-react";
import { ScrapeProgressBar } from "../components/ResearchProgress";

export default function DashboardPage({
  selectedPlatform,
  setSelectedPlatform,
  scrapeInput,
  setScrapeInput,
  isScraping,
  scrapeError,
  scrapeSuccess,
  handleScrapeSubmit,
  switchTab,
  totalScrapedStats,
  files,
  formatDate,
  loadFileContent,
}) {
  return (
    <div className="research-dashboard">
      <div className="research-intro">
        <div>
          <div className="section-kicker">RUANG KERJA / IKHTISAR</div>
          <h1>
            Dari percakapan,
            <br />
            <em>menjadi pemahaman.</em>
          </h1>
          <p>Kumpulkan komentar. Temukan pola. Bangun riset Anda.</p>
        </div>
        <div className="intro-index" aria-hidden="true">
          <span>TESISORI</span>
          <strong>01</strong>
          <span>RESEARCH NOTES</span>
        </div>
      </div>

      <div className="collection-layout">
        <section
          className="collection-panel"
          aria-labelledby="collection-title"
        >
          <div className="collection-heading">
            <span className="section-kicker">01 — PENGUMPULAN DATA</span>
            <span className="small-note">TikTok & YouTube</span>
          </div>
          <h2 id="collection-title">Mulai dari satu video.</h2>
          <p className="panel-description">
            Tempel tautan untuk mengambil komentar dan balasannya.
          </p>
          <div className="source-tabs" role="group" aria-label="Pilih platform">
            {[
              ["tiktok", "TikTok", Music2],
              ["youtube", "YouTube", Video],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                aria-pressed={selectedPlatform === id}
                disabled={isScraping}
                className={selectedPlatform === id ? "selected" : ""}
                onClick={() => setSelectedPlatform(id)}
              >
                <Icon size={18} />
                {label}
                {selectedPlatform === id && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
          <form onSubmit={handleScrapeSubmit} className="collection-form">
            <label htmlFor="video-source">
              Tautan video{" "}
              {selectedPlatform === "youtube" ? "YouTube" : "TikTok"}
            </label>
            <div className="source-input">
              <Link2 size={18} />
              <input
                id="video-source"
                type="text"
                value={scrapeInput}
                placeholder={
                  selectedPlatform === "youtube"
                    ? "https://www.youtube.com/watch?v=…"
                    : "https://www.tiktok.com/@user/video/…"
                }
                disabled={isScraping}
                onChange={(e) => {
                  const value = e.target.value;
                  setScrapeInput(value);
                  if (/youtube.com|youtu.be/.test(value))
                    setSelectedPlatform("youtube");
                  else if (value.includes("tiktok.com"))
                    setSelectedPlatform("tiktok");
                }}
              />
            </div>
            <div className="collection-submit-row">
              <span className="small-note">
                Mendukung tautan pendek dan ID video.
              </span>
              <button
                className="collect-button"
                disabled={isScraping || !scrapeInput.trim()}
              >
                {isScraping ? (
                  <LoaderCircle size={16} className="is-spinning" />
                ) : (
                  <ArrowRight size={17} />
                )}
                <span>
                  {isScraping ? "Mengambil komentar…" : "Ambil komentar"}
                </span>
              </button>
            </div>
          </form>
          <ScrapeProgressBar
            isScraping={isScraping}
            platform={selectedPlatform}
          />
          {scrapeError && (
            <div className="collection-feedback error" role="alert">
              <AlertCircle size={18} />
              <span>{scrapeError}</span>
            </div>
          )}
          {scrapeSuccess && (
            <div className="collection-feedback success" role="status">
              <CheckCircle2 size={18} />
              <span>
                {scrapeSuccess.commentsCount} komentar berhasil disimpan.
              </span>
              <button onClick={() => switchTab("results")}>
                Lihat hasil <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
        <aside className="field-notes">
          <span className="section-kicker">CATATAN RISET</span>
          <h2>
            Data yang baik.
            <br />{" "}
            Riset yang berarti.
          </h2>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Kumpulkan</strong>
                <p>Ambil percakapan dari video yang relevan.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Telusuri</strong>
                <p>Baca, saring, dan pilih komentar penting.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Analisis</strong>
                <p>Jelajahi temuan dengan kerangka penelitian.</p>
              </div>
            </li>
          </ol>
          <div className="notes-footer">
            <ShieldCheck size={15} /> Dataset tersimpan di akun Anda.
          </div>
        </aside>
      </div>

      <section className="research-metrics" aria-label="Ringkasan riset">
        <div>
          <span>Konten terkumpul</span>
          <strong>
            {totalScrapedStats.totalVideos.toLocaleString("id-ID")}
          </strong>
          <small>Video dalam ruang riset</small>
        </div>
        <div>
          <span>Komentar tersimpan</span>
          <strong>
            {totalScrapedStats.totalStoredComments.toLocaleString("id-ID")}
          </strong>
          <small>Percakapan untuk ditelusuri</small>
        </div>
        <button onClick={() => switchTab("files")}>
          <span>
            Arsip dataset <ArrowUpRight size={16} />
          </span>
          <strong>{files.length.toLocaleString("id-ID")}</strong>
          <small>Buka koleksi penelitian</small>
        </button>
      </section>

      <section className="research-archive" aria-labelledby="archive-title">
        <div className="archive-heading">
          <div>
            <span className="section-kicker">02 — KOLEKSI ANDA</span>
            <h2 id="archive-title">Terakhir dikumpulkan</h2>
          </div>
          <button className="text-link" onClick={() => switchTab("files")}>
            Semua dataset <ArrowUpRight size={16} />
          </button>
        </div>
        {files.length ? (
          <div className="archive-table-wrap">
            <table className="archive-table">
              <thead>
                <tr>
                  <th>SUMBER / DATASET</th>
                  <th>KOMENTAR</th>
                  <th>DIKUMPULKAN</th>
                  <th>
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.slice(0, 5).map((f) => (
                  <tr key={f.filename}>
                    <td>
                      <div className="archive-source">
                        <span className="source-symbol">
                          {f.platform === "youtube" ||
                          f.filename.startsWith("yt_") ? (
                            <Video size={19} />
                          ) : (
                            <Music2 size={19} />
                          )}
                        </span>
                        <div>
                          <strong title={f.caption || f.filename}>
                            {f.caption || f.filename.replace(/\.json$/i, "")}
                          </strong>
                          <small>{f.filename}</small>
                        </div>
                      </div>
                    </td>
                    <td>{(f.comments_count || 0).toLocaleString("id-ID")}</td>
                    <td>{formatDate(f.modified)}</td>
                    <td>
                      <button
                        className="archive-open"
                        aria-label={`Buka dataset ${f.filename}`}
                        onClick={() => loadFileContent(f.filename, true)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="archive-empty">
            <FolderOpen size={28} strokeWidth={1.3} />
            <div>
              <h3>Koleksi Anda dimulai di sini.</h3>
              <p>
                Ambil komentar dari video pertama, atau unggah dataset melalui
                menu di atas.
              </p>
            </div>
            <MessageSquare size={42} strokeWidth={1} aria-hidden="true" />
          </div>
        )}
      </section>
      <footer className="workspace-footnote">
        <span>TesisOri — ruang untuk rasa ingin tahu.</span>
        <span>KUMPULKAN / PAHAMI / TEMUKAN</span>
      </footer>
    </div>
  );
}
