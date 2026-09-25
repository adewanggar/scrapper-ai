import React from "react";
import { LogOut, User, SlidersHorizontal, Info } from "lucide-react";
import "./settings.css";
export default function SettingsPage({
  currentUser,
  handleLogout,
  pageSize,
  setPageSize,
  sortBy,
  setSortBy,
}) {
  const provider = currentUser?.providerData?.some(
    (item) => item.providerId === "google.com",
  )
    ? "Google"
    : "Email dan kata sandi";
  return (
    <div className="settings-workspace">
      <header className="settings-heading">
        <h1>Pengaturan</h1>
        <p>Kelola akun dan cara Anda bekerja dengan data.</p>
      </header>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Bagian pengaturan">
          <a href="#settings-account">
            <User size={16} />
            Akun
          </a>
          <a href="#settings-preferences">
            <SlidersHorizontal size={16} />
            Preferensi
          </a>
          <a href="#settings-about">
            <Info size={16} />
            Tentang
          </a>
        </nav>
        <div className="settings-sections">
          <section id="settings-account" className="settings-panel">
            <div className="settings-panel-heading">
              <h2>Akun</h2>
              <p>Informasi akun yang sedang digunakan.</p>
            </div>
            <div className="settings-profile">
              <div className="settings-avatar">
                {(currentUser?.displayName || currentUser?.email || "P")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <strong>{currentUser?.displayName || "Peneliti"}</strong>
                <span>{currentUser?.email || "Email belum tersedia"}</span>
              </div>
            </div>
            <dl className="settings-details">
              <div>
                <dt>Nama</dt>
                <dd>{currentUser?.displayName || "Belum diatur"}</dd>
              </div>
              <div>
                <dt>Alamat email</dt>
                <dd>{currentUser?.email || "Belum tersedia"}</dd>
              </div>
              <div>
                <dt>Metode masuk</dt>
                <dd>{provider}</dd>
              </div>
              <div>
                <dt>Verifikasi email</dt>
                <dd>
                  {currentUser?.emailVerified
                    ? "Terverifikasi"
                    : "Belum terverifikasi"}
                </dd>
              </div>
            </dl>
            <div className="settings-signout">
              <div>
                <h3>Keluar dari akun</h3>
                <p>Anda perlu masuk kembali untuk mengakses dataset.</p>
              </div>
              <button onClick={handleLogout}>
                <LogOut size={15} />
                Keluar
              </button>
            </div>
          </section>
          <section id="settings-preferences" className="settings-panel">
            <div className="settings-panel-heading">
              <h2>Preferensi komentar</h2>
              <p>Perubahan langsung diterapkan dan disimpan di browser ini.</p>
            </div>
            <div className="setting-row">
              <div>
                <label htmlFor="setting-page-size">Komentar per halaman</label>
                <p>Jumlah komentar yang ditampilkan dalam satu halaman.</p>
              </div>
              <select
                id="setting-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option value={n} key={n}>
                    {n} komentar
                  </option>
                ))}
              </select>
            </div>
            <div className="setting-row">
              <div>
                <label htmlFor="setting-sort">Urutan komentar</label>
                <p>Urutan yang digunakan saat menelusuri percakapan.</p>
              </div>
              <select
                id="setting-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="most_replies">Balasan terbanyak</option>
              </select>
            </div>
            <div className="settings-reset">
              <button
                className="btn btn-white-bordered"
                onClick={() => {
                  setPageSize(20);
                  setSortBy("newest");
                }}
              >
                Kembalikan ke bawaan
              </button>
            </div>
          </section>
          <section id="settings-about" className="settings-panel">
            <div className="settings-panel-heading">
              <h2>Tentang Tassiori</h2>
              <p>Ruang kerja untuk pengumpulan dan analisis komentar.</p>
            </div>
            <dl className="settings-details">
              <div>
                <dt>Platform</dt>
                <dd>TikTok dan YouTube</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>Komentar, balasan, dan caption video</dd>
              </div>
              <div>
                <dt>Alat penelitian</dt>
                <dd>Analisis, sitasi, kutipan, dan uji reliabilitas</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
