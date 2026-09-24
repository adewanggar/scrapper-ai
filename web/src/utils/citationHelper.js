/**
 * citationHelper.js - Utilitas Sitasi Otomatis & Kutipan Verbatim Akademik
 * Sesuai Pedoman Penulisan Karya Ilmiah & Skripsi (APA 7th, Harvard, Mendeley, BibTeX)
 */

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format tanggal ke format bahasa Indonesia formal (contoh: 25 September 2024)
 */
export function formatTanggalIndonesia(dateStr) {
  if (!dateStr) return 't.t.'; // tanpa tahun / tanpa tanggal
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const tgl = d.getDate();
    const bln = BULAN_INDONESIA[d.getMonth()];
    const thn = d.getFullYear();
    return `${tgl} ${bln} ${thn}`;
  } catch {
    return dateStr;
  }
}

/**
 * Ekstraksi tahun dari string tanggal
 */
export function extractTahun(dateStr) {
  if (!dateStr) return new Date().getFullYear().toString();
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getFullYear().toString();
  } catch {
    // fallback regex 4 digit
    const m = String(dateStr).match(/\b(20\d{2})\b/);
    if (m) return m[1];
  }
  return new Date().getFullYear().toString();
}

/**
 * Ekstraksi username pembuat konten dari URL TikTok atau Instagram jika ada
 */
export function parseCreatorFromUrl(url) {
  if (!url) return { creatorName: 'Kreator Konten', handle: 'kreator' };

  // TikTok: https://www.tiktok.com/@username/video/...
  const ttMatch = url.match(/tiktok\.com\/@([\w.-]+)/i);
  if (ttMatch) {
    return { creatorName: ttMatch[1], handle: ttMatch[1] };
  }

  // Instagram: https://www.instagram.com/reel/ID atau p/ID
  if (url.includes('instagram.com')) {
    return { creatorName: 'Kreator Instagram', handle: 'instagram_post' };
  }

  return { creatorName: 'Kreator Konten', handle: 'tiktok_creator' };
}

/**
 * 1. GENERATOR SITASI VIDEO (DAFTAR PUSTAKA)
 */
export function generateVideoCitations({
  creatorName = 'Kreator Konten',
  handle = 'username',
  caption = '',
  videoUrl = '',
  publishDate = '',
  platform = 'TikTok'
}) {
  const tahun = extractTahun(publishDate);
  const tglLengkap = formatTanggalIndonesia(publishDate);
  const tanggalAkses = formatTanggalIndonesia(new Date().toISOString());

  // Singkat caption hingga 20 kata untuk judul sitasi sesuai pedoman APA
  const cleanCaption = (caption || 'Video media sosial').replace(/[\r\n]+/g, ' ').trim();
  const words = cleanCaption.split(/\s+/);
  const shortTitle = words.length > 20 ? words.slice(0, 20).join(' ') + '...' : cleanCaption;

  const urlDisplay = videoUrl || `https://${platform.toLowerCase()}.com`;

  // A. Format APA 7th Edition (Paling umum untuk Skripsi)
  // Format: Nama Akun [@handle]. (Tahun, Tanggal Bulan). Judul caption [Video]. Platform. URL
  const apa7 = `${creatorName} [@${handle}]. (${tahun}, ${tglLengkap}). ${shortTitle} [Video]. ${platform}. ${urlDisplay}`;

  // APA In-Text Citation (Sitasi dalam teks)
  const apaInTextParenthetical = `(${creatorName}, ${tahun})`;
  const apaInTextNarrative = `Menurut ${creatorName} (${tahun})`;

  // B. Format Harvard Referencing
  // Format: Nama Akun, Tahun. Judul caption. [video online] Tersedia di: <URL> [Diakses Tanggal Bulan Tahun].
  const harvard = `${creatorName}, ${tahun}. ${shortTitle}. [video online] Tersedia di: <${urlDisplay}> [Diakses ${tanggalAkses}].`;

  // C. Format Chicago 17th Edition (Author-Date)
  // Format: Nama Akun. Tahun. "Judul caption." TikTok video, Tanggal. URL.
  const chicago = `${creatorName}. ${tahun}. "${shortTitle}." ${platform} video, ${tglLengkap}. ${urlDisplay}.`;

  // D. Format MLA 9th Edition
  // Format: "Judul caption." Platform, diunggah oleh @handle, Tanggal, URL.
  const mla = `"${shortTitle}." ${platform}, diunggah oleh @${handle}, ${tglLengkap}, ${urlDisplay}.`;

  // E. Format File Mendeley & Zotero (.RIS)
  const ris = `TY  - VIDEO
AU  - ${creatorName}
TI  - ${shortTitle}
PY  - ${tahun}
DA  - ${publishDate ? publishDate.slice(0, 10).replace(/-/g, '/') : tahun}
PB  - ${platform}
UR  - ${urlDisplay}
M3  - Media Sosial / Analisis Komentar
N1  - Data primer empiris diambil untuk penelitian skripsi akademik
ER  - 
`;

  // F. Format BibTeX (.bib) untuk LaTeX / Overleaf
  const cleanId = (handle || 'social_media').replace(/[^\w]/g, '_') + '_' + tahun;
  const bibtex = `@misc{${cleanId},
  author       = {${creatorName}},
  title        = {{${shortTitle}}},
  year         = {${tahun}},
  howpublished = {\\url{${urlDisplay}}},
  note         = {[Video ${platform}]. Diakses pada ${tanggalAkses}}
}`;

  return {
    apa7,
    apaInTextParenthetical,
    apaInTextNarrative,
    harvard,
    chicago,
    mla,
    ris,
    bibtex,
    shortTitle,
    tahun,
    tglLengkap
  };
}

/**
 * 2. GENERATOR KUTIPAN VERBATIM (UNTUK BAB 4 SKRIPSI)
 */
export function generateVerbatimQuote({
  rawComment = '',
  username = 'user',
  nickname = '',
  createTime = '',
  sentimentLabel = 'Netral',
  emotionLabel = 'Netral',
  videoTitle = '',
  videoUrl = '',
  anonymous = false,
  informantNumber = 1
}) {
  const tglKomentar = formatTanggalIndonesia(createTime);
  const tahunKomentar = extractTahun(createTime);
  const cleanText = (rawComment || '').trim().replace(/[\r\n]+/g, ' ');

  // Etika Penelitian: Opsi Anonimisasi Akun (menghindari pelanggaran privasi)
  const displayAuthor = anonymous ? `Informan #${String(informantNumber).padStart(2, '0')}` : `@${username}`;
  const displayFullName = anonymous ? `Informan #${String(informantNumber).padStart(2, '0')}` : (nickname ? `${nickname} (@${username})` : `@${username}`);

  // Format 1: Narasi Langsung Bab 4 (In-Text Direct Quote)
  const narasiLangsung = `Sebagaimana diungkapkan oleh salah satu audiens dengan akun ${displayAuthor} pada ${tglKomentar}: "${cleanText}".`;

  // Format 2: Format Parafrase / Argumentatif Ilmiah
  const narasiArgumentatif = `Salah satu responden (${displayAuthor}, ${tahunKomentar}) menyatakan bahwa "${cleanText}", yang menunjukkan adanya respon emosi ${emotionLabel.toLowerCase()} serta sentimen ${sentimentLabel.toLowerCase()} terhadap isi tayangan.`;

  // Format 3: Format Blok Kutipan (>40 kata / Indented Blockquote)
  // Sesuai kaidah skripsi: Menjorok ke dalam, spasi 1, tanpa tanda kutip di ujung
  const blokKutipan = `    ${cleanText}\n    (${displayAuthor}, ${tglKomentar})`;

  // Format 4: Format Baris Tabel Word (Tab-Separated)
  // Kolom: No | Informan | Kutipan Verbatim | Sentimen / Emosi | Tanggal
  const barisTabel = `${informantNumber}\t${displayAuthor}\t"${cleanText}"\t${sentimentLabel} / ${emotionLabel}\t${tglKomentar}`;

  // Format 5: Sitasi APA In-Text Khusus Komentar
  const sitasiKomentarAPA = `"${cleanText}" (${displayAuthor}, ${tahunKomentar})`;

  return {
    narasiLangsung,
    narasiArgumentatif,
    blokKutipan,
    barisTabel,
    sitasiKomentarAPA,
    displayAuthor,
    cleanText,
    tglKomentar,
    tahunKomentar
  };
}
