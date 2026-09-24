import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function SettingsPage({
  currentUser,
  handleLogout
}) {
  return (
    <div>
      <div className="dashboard-hero">
        <h2>Pengaturan Akun & Preferensi Riset</h2>
        <p>Kelola profil peneliti, status keamanan akun, dan preferensi workspace penelitian.</p>
      </div>

      <div className="settings-card">
        <div className="settings-group">
          <div className="settings-group-title">Profil Peneliti</div>
          <div className="settings-group-desc">
            Akun Anda terlindungi dengan privasi penuh. Seluruh data penelitian, dataset komentar, dan draf bab skripsi hanya dapat diakses oleh akun Anda.
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px' }}>
                👤 <strong>Nama Peneliti:</strong> {currentUser?.displayName || 'Peneliti'}
              </div>
              <div style={{ fontSize: '13px' }}>
                ✉️ <strong>Alamat Email:</strong> {currentUser?.email}
              </div>
              <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#16A34A" />
                <span><strong>Status Privasi:</strong> Ruang Riset Privat & Terenkripsi</span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <button
                  className="btn btn-white-bordered"
                  onClick={handleLogout}
                  style={{ color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2', padding: '7px 16px', fontSize: '12.5px' }}
                >
                  <LogOut size={13} style={{ marginRight: '6px' }} /> Keluar dari Akun (Logout)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">Mesin Analisis Kecerdasan Buatan (AI Engine)</div>
          <div className="settings-group-desc">
            Workspace riset ini ditenagai oleh model AI penalaran tingkat lanjut untuk analisis kuantitatif dan kualitatif:
            <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.7' }}>
              <li><strong>Model Penalaran:</strong> Gemini 3.8 Flash (Multimodal & Fast Reasoning)</li>
              <li><strong>Kerangka Teoretis:</strong> Framing Robert Entman (1993), Sentimen Publik, Perilaku Konsumen, Psikologi Sosial</li>
              <li><strong>Validitas Metodologis:</strong> Dilengkapi Kalkulator Reliabilitas Antar-Pengkode (Cohen's Kappa)</li>
            </ul>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">Dukungan Platform Media Sosial</div>
          <div className="settings-group-desc">
            Workspace mendukung pengumpulan data komentar dari platform:
            <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.7' }}>
              <li><strong>YouTube:</strong> Video Reguler & YouTube Shorts</li>
              <li><strong>TikTok:</strong> Video Publik, Caption & Balasan Komentar Bertingkat</li>
              <li><strong>Instagram:</strong> Postingan Feed & Reels</li>
            </ul>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">Tentang Workspace</div>
          <div className="settings-group-desc">
            Tassiori — AI Research Workspace • Dirancang khusus untuk mahasiswa dan peneliti Ilmu Komunikasi & Sosial Humaniora.
          </div>
        </div>
      </div>
    </div>
  );
}
