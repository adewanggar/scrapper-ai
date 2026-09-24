/**
 * statExporter.js - Utility Pemroses Data & Generator Multi-Format Statistik
 * Khusus Mahasiswa & Peneliti Skripsi / Tugas Akhir
 * Mendukung: Microsoft Excel, IBM SPSS Statistics, SmartPLS, JASP
 */

// Kamus leksikon sentimen & emosi bahasa Indonesia (bahasa gaul & media sosial)
const POSITIVE_WORDS = new Set([
  'lucu', 'bagus', 'cantik', 'suka', 'keren', 'mantap', 'terbaik', 'love', 'sayang',
  'semangat', 'bangga', 'gemas', 'manis', 'senang', 'bahagia', 'terharu', 'setuju',
  'top', 'asik', 'cakep', 'ganteng', 'rapi', 'gokil', 'salut', 'makasih', 'terimakasih',
  'terima kasih', 'alhamdulillah', 'masyaallah', 'kocak', 'adem', 'sukses', 'berkah',
  'hebat', 'puas', 'rekomen', 'worth', 'worthit', 'rekomendasi', 'juara', 'idola',
  'kece', 'jos', 'mantul', 'keren bgt', 'lucu bgt', 'favorit', 'ciamik', 'respect'
]);

const NEGATIVE_WORDS = new Set([
  'jelek', 'parah', 'rusak', 'kecewa', 'benci', 'marah', 'jahat', 'bohong', 'penipu',
  'nipu', 'settingan', 'kasar', 'gaje', 'sampah', 'rugi', 'aneh', 'norak', 'najis',
  'mual', 'muak', 'dosa', 'bego', 'goblok', 'tolol', 'kampungan', 'kampret', 'payah',
  'batal', 'boikot', 'kapok', 'curang', 'zalim', 'dzalim', 'palsu', 'hoax', 'fitnah',
  'ribet', 'busuk', 'lebay', 'jijik', 'pansos', 'hina', 'bodoh', 'cacat', 'manipulasi'
]);

const EMOTION_PATTERNS = {
  anger: ['marah', 'emosi', 'kesal', 'geram', 'benci', 'jahat', 'kurang ajar', 'ngamuk', 'zalim', 'dosa', 'hukum', 'laporkan', 'tangkap', 'parah', 'goblok', 'bego', 'tolol'],
  sympathy: ['kasihan', 'kesian', 'iba', 'terharu', 'sabar', 'semangat', 'nangis', 'sedih', 'tega', 'doakan', 'berkah', 'kasih sayang', 'tabah', 'peluk', 'semoga kuat'],
  skepticism: ['settingan', 'akting', 'skrip', 'bohong', 'paling', 'mencurigakan', 'gimmick', 'pura-pura', 'rekayasa', 'marketing', 's3 marketing', 'konten', 'pansos', 'beneran ga', 'masa sih', 'modus'],
  sarcasm: ['wkwk', 'wkwkwk', 'lawak', 'dagelan', 'ytta', 'badut', 'hilih', 'prettt', 'cih', 'ya kali', 'palingan', 'hebat banget dah', 'tumben']
};

// Regex pendeteksi emoji Unicode
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;

/**
 * Pembersihan teks komentar (preprocessing)
 */
export function preprocessText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/https?:\/\/\S+/gi, '') // hapus URL
    .replace(/@[\w.]+/g, '')        // hapus mention @user
    .replace(/[^\w\s\d.,!?-]/g, ' ') // rapikan karakter aneh kecuali tanda baca esensial
    .replace(/\s+/g, ' ')           // normalkan multiple spaces
    .trim()
    .toLowerCase();
}

/**
 * Ekstraksi metrik & klasifikasi leksikon
 */
export function analyzeCommentMetrics(rawComment) {
  const text = (rawComment || '').trim();
  const clean = preprocessText(text);

  // Hitung karakter & kata
  const charLen = text.length;
  const wordTokens = clean.length > 0 ? clean.split(/\s+/) : [];
  const wordCnt = wordTokens.length;

  // Deteksi emoji
  const emojiMatches = text.match(EMOJI_REGEX) || [];
  const emojiCnt = emojiMatches.length;
  const hasEmoji = emojiCnt > 0 ? 1 : 0;

  // Deteksi tanda tanya & seru
  const qmarkCnt = (text.match(/\?/g) || []).length;
  const hasQmark = qmarkCnt > 0 ? 1 : 0;
  const exclamCnt = (text.match(/!/g) || []).length;
  const hasExclam = exclamCnt > 0 ? 1 : 0;

  // Leksikon Sentimen
  let posScore = 0;
  let negScore = 0;

  wordTokens.forEach((w) => {
    if (POSITIVE_WORDS.has(w)) posScore += 1;
    if (NEGATIVE_WORDS.has(w)) negScore += 1;
  });

  // Emoticon bonus
  if (/[:;=][\-)D)pP3]|\b(wkwk|hehe|haha)\b/i.test(text)) posScore += 0.5;
  if (/[:;=][\-(/\\|]|\b(huhu|sedih)\b/i.test(text)) negScore += 0.5;

  let sentimentLabel = 'Netral';
  let sentimentCode = 2; // 1: Negatif, 2: Netral, 3: Positif (Likert scale standard)
  let sentimentScore = 0; // range -1.0 s/d +1.0

  if (posScore > negScore) {
    sentimentLabel = 'Positif';
    sentimentCode = 3;
    sentimentScore = Math.min(1.0, +(0.2 + (posScore - negScore) * 0.25).toFixed(2));
  } else if (negScore > posScore) {
    sentimentLabel = 'Negatif';
    sentimentCode = 1;
    sentimentScore = Math.max(-1.0, +(-0.2 - (negScore - posScore) * 0.25).toFixed(2));
  } else {
    sentimentLabel = 'Netral';
    sentimentCode = 2;
    sentimentScore = 0.0;
  }

  // Leksikon Emosi
  let emotionLabel = 'Netral';
  let emotionCode = 5; // 1: Marah, 2: Simpati, 3: Skeptis, 4: Sarkasme, 5: Netral / Lainnya

  const lowerRaw = text.toLowerCase();
  if (EMOTION_PATTERNS.anger.some((kw) => lowerRaw.includes(kw))) {
    emotionLabel = 'Marah (Anger)';
    emotionCode = 1;
  } else if (EMOTION_PATTERNS.sympathy.some((kw) => lowerRaw.includes(kw))) {
    emotionLabel = 'Simpati (Sympathy)';
    emotionCode = 2;
  } else if (EMOTION_PATTERNS.skepticism.some((kw) => lowerRaw.includes(kw))) {
    emotionLabel = 'Skeptis (Skepticism)';
    emotionCode = 3;
  } else if (EMOTION_PATTERNS.sarcasm.some((kw) => lowerRaw.includes(kw))) {
    emotionLabel = 'Sarkasme (Sarcasm)';
    emotionCode = 4;
  }

  return {
    cleanText: clean,
    charLen,
    wordCnt,
    emojiCnt,
    hasEmoji,
    qmarkCnt,
    hasQmark,
    exclamCnt,
    hasExclam,
    sentimentLabel,
    sentimentCode,
    sentimentScore,
    emotionLabel,
    emotionCode
  };
}

/**
 * Membangun dataset terstandarisasi untuk olah data skripsi
 */
export function buildStatisticalDataset(comments, { includeReplies = true } = {}) {
  const records = [];
  let seqId = 1;

  (comments || []).forEach((c) => {
    const parentMetrics = analyzeCommentMetrics(c.comment);
    const replyCount = c.total_reply || (c.replies ? c.replies.length : 0);

    // Engagement level: 1 = Rendah, 2 = Sedang, 3 = Tinggi
    let engageLevel = 1;
    if (replyCount >= 5 || parentMetrics.charLen > 80) engageLevel = 3;
    else if (replyCount >= 1 || parentMetrics.charLen > 30) engageLevel = 2;

    let hourPost = 12;
    if (c.create_time) {
      try {
        const d = new Date(c.create_time);
        if (!isNaN(d.getTime())) hourPost = d.getHours();
      } catch {
        hourPost = 12;
      }
    }

    records.push({
      id: seqId++,
      comment_id: c.comment_id || `C_${seqId}`,
      parent_id: '',
      is_reply: 0,
      comment_type: 'Komentar Utama',
      username: c.username || 'user',
      nickname: c.nickname || c.username || 'user',
      create_time: c.create_time || '',
      hour_post: hourPost,
      raw_comment: c.comment || '',
      clean_text: parentMetrics.cleanText,
      char_len: parentMetrics.charLen,
      word_cnt: parentMetrics.wordCnt,
      reply_cnt: replyCount,
      emoji_cnt: parentMetrics.emojiCnt,
      has_emoji: parentMetrics.hasEmoji,
      qmark_cnt: parentMetrics.qmarkCnt,
      has_qmark: parentMetrics.hasQmark,
      exclam_cnt: parentMetrics.exclamCnt,
      has_exclam: parentMetrics.hasExclam,
      sent_label: parentMetrics.sentimentLabel,
      sent_code: parentMetrics.sentimentCode,
      sent_score: parentMetrics.sentimentScore,
      emot_label: parentMetrics.emotionLabel,
      emot_code: parentMetrics.emotionCode,
      engage_lvl: engageLevel
    });

    if (includeReplies && c.replies && c.replies.length > 0) {
      c.replies.forEach((r) => {
        const replyMetrics = analyzeCommentMetrics(r.comment);
        let rHour = hourPost;
        if (r.create_time) {
          try {
            const rd = new Date(r.create_time);
            if (!isNaN(rd.getTime())) rHour = rd.getHours();
          } catch {
            rHour = hourPost;
          }
        }

        let rEngage = 1;
        if (replyMetrics.charLen > 80) rEngage = 3;
        else if (replyMetrics.charLen > 30) rEngage = 2;

        records.push({
          id: seqId++,
          comment_id: r.comment_id || `R_${seqId}`,
          parent_id: c.comment_id || '',
          is_reply: 1,
          comment_type: 'Balasan',
          username: r.username || 'user',
          nickname: r.nickname || r.username || 'user',
          create_time: r.create_time || '',
          hour_post: rHour,
          raw_comment: r.comment || '',
          clean_text: replyMetrics.cleanText,
          char_len: replyMetrics.charLen,
          word_cnt: replyMetrics.wordCnt,
          reply_cnt: 0,
          emoji_cnt: replyMetrics.emojiCnt,
          has_emoji: replyMetrics.hasEmoji,
          qmark_cnt: replyMetrics.qmarkCnt,
          has_qmark: replyMetrics.hasQmark,
          exclam_cnt: replyMetrics.exclamCnt,
          has_exclam: replyMetrics.hasExclam,
          sent_label: replyMetrics.sentimentLabel,
          sent_code: replyMetrics.sentimentCode,
          sent_score: replyMetrics.sentimentScore,
          emot_label: replyMetrics.emotionLabel,
          emot_code: replyMetrics.emotionCode,
          engage_lvl: rEngage
        });
      });
    }
  });

  return records;
}

/**
 * Escaper CSV untuk mengamankan tanda kutip, koma, dan enter
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
  return `"${str}"`;
}

/**
 * 1. GENERATOR EXCEL CSV (UTF-8 BOM siap buka di Microsoft Excel)
 */
export function generateExcelCSV(dataset) {
  const headers = [
    'No',
    'ID_Komentar',
    'Parent_ID',
    'Tipe_Komentar',
    'Username',
    'Nickname',
    'Tanggal_Waktu',
    'Jam_Posting',
    'Teks_Komentar_Asli',
    'Teks_Bersih_Preprocessed',
    'Jumlah_Karakter',
    'Jumlah_Kata',
    'Jumlah_Balasan',
    'Jumlah_Emoji',
    'Ada_Emoji',
    'Ada_Tanda_Tanya',
    'Ada_Tanda_Seru',
    'Kategori_Sentimen',
    'Kode_Sentimen_1_3',
    'Skor_Sentimen_Polaritas',
    'Kategori_Emosi',
    'Kode_Emosi_1_5',
    'Tingkat_Keterlibatan'
  ];

  const rows = dataset.map((d) => [
    d.id,
    escapeCSV(d.comment_id),
    escapeCSV(d.parent_id),
    escapeCSV(d.comment_type),
    escapeCSV(d.username),
    escapeCSV(d.nickname),
    escapeCSV(d.create_time),
    d.hour_post,
    escapeCSV(d.raw_comment),
    escapeCSV(d.clean_text),
    d.char_len,
    d.word_cnt,
    d.reply_cnt,
    d.emoji_cnt,
    d.has_emoji,
    d.has_qmark,
    d.has_exclam,
    escapeCSV(d.sent_label),
    d.sent_code,
    d.sent_score,
    escapeCSV(d.emot_label),
    d.emot_code,
    escapeCSV(d.engage_lvl === 3 ? 'Tinggi' : d.engage_lvl === 2 ? 'Sedang' : 'Rendah')
  ]);

  // \uFEFF adalah UTF-8 Byte Order Mark agar Excel otomatis mendeteksi encoding UTF-8
  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Salin Tab-Separated Values (TSV) untuk paste langsung ke Excel / Google Sheets
 */
export function generateExcelTSV(dataset) {
  const headers = [
    'No',
    'ID_Komentar',
    'Tipe',
    'Username',
    'Waktu',
    'Komentar',
    'Karakter',
    'Kata',
    'Balasan',
    'Sentimen',
    'Kode_Sentimen',
    'Emosi',
    'Kode_Emosi'
  ];

  const rows = dataset.map((d) => [
    d.id,
    d.comment_id,
    d.comment_type,
    d.username,
    d.create_time,
    (d.raw_comment || '').replace(/[\t\r\n]+/g, ' '),
    d.char_len,
    d.word_cnt,
    d.reply_cnt,
    d.sent_label,
    d.sent_code,
    d.emot_label,
    d.emot_code
  ]);

  return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\r\n');
}

/**
 * 2. GENERATOR IBM SPSS STATISTICS (Data CSV terstandarisasi)
 */
export function generateSPSSCSV(dataset) {
  // Nama kolom harus mematuhi standar nama variabel SPSS (<= 64 char, huruf depan, hanya underscore)
  const headers = [
    'id',
    'is_reply',
    'char_len',
    'word_cnt',
    'reply_cnt',
    'emoji_cnt',
    'has_emoji',
    'has_qmark',
    'has_exclam',
    'sent_code',
    'sent_label',
    'sent_score',
    'emot_code',
    'emot_label',
    'engage_lvl',
    'hour_post',
    'comment_id',
    'user_handle',
    'comment_text'
  ];

  const rows = dataset.map((d) => [
    d.id,
    d.is_reply,
    d.char_len,
    d.word_cnt,
    d.reply_cnt,
    d.emoji_cnt,
    d.has_emoji,
    d.has_qmark,
    d.has_exclam,
    d.sent_code,
    escapeCSV(d.sent_label),
    d.sent_score,
    d.emot_code,
    escapeCSV(d.emot_label),
    d.engage_lvl,
    d.hour_post,
    escapeCSV(d.comment_id),
    escapeCSV(d.username),
    escapeCSV(d.raw_comment)
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * GENERATOR SINTAKS SPSS (.sps)
 * Memberikan mahasiswa script 1-klik untuk impor otomatis, label variabel,
 * value labels, dan analisis frekuensi & crosstab bab 4 skripsi.
 */
export function generateSPSSSyntax(dataset, filename = 'dataset_spss.csv') {
  return `* ====================================================================.
* SINTAKS OTOMATIS IBM SPSS STATISTICS (SKRIPSI / RISET MEDIA SOSIAL).
* Dihasilkan oleh Social Scraper Hub v2.1.
* Waktu Generate: ${new Date().toLocaleString('id-ID')}.
* Total Responden/Komentar: ${dataset.length}.
* ====================================================================.

* 1. MEMBACA FILE DATASET CSV KE DALAM SPSS.
* Catatan: Sesuaikan path lokasi file dataset_spss.csv pada baris /FILE bila perlu.
GET DATA /TYPE=TXT
  /FILE="dataset_spss.csv"
  /DELCASE=LINE
  /DELIMITERS=","
  /QUALIFIER='"'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=2
  /VARIABLES=
    id F8.0
    is_reply F1.0
    char_len F8.0
    word_cnt F8.0
    reply_cnt F8.0
    emoji_cnt F8.0
    has_emoji F1.0
    has_qmark F1.0
    has_exclam F1.0
    sent_code F1.0
    sent_label A15
    sent_score F5.2
    emot_code F1.0
    emot_label A25
    engage_lvl F1.0
    hour_post F2.0
    comment_id A30
    user_handle A60
    comment_text A1000.
CACHE.
EXECUTE.

* 2. MEMBERIKAN LABEL VARIABEL (VARIABLE LABELS).
VARIABLE LABELS
  id "Nomor Urut Komentar"
  is_reply "Tipe Komentar (0=Utama, 1=Balasan)"
  char_len "Panjang Karakter Teks Komentar"
  word_cnt "Jumlah Kata dalam Komentar"
  reply_cnt "Jumlah Balasan / Respon Audiens"
  emoji_cnt "Jumlah Simbol Emoji Digunakan"
  has_emoji "Mengandung Emoji (0=Tidak, 1=Ya)"
  has_qmark "Mengandung Tanda Tanya / Inkuiri (0=Tidak, 1=Ya)"
  has_exclam "Mengandung Tanda Seru / Intensitas (0=Tidak, 1=Ya)"
  sent_code "Kode Sentimen Audiens (1=Negatif, 2=Netral, 3=Positif)"
  sent_label "Kategori Sentimen Audiens"
  sent_score "Skor Kontinu Polaritas Sentimen (-1.0 s/d +1.0)"
  emot_code "Kode Emosi Dominan (1=Marah, 2=Simpati, 3=Skeptis, 4=Sarkasme, 5=Netral)"
  emot_label "Kategori Emosi Dominan Audiens"
  engage_lvl "Tingkat Keterlibatan Responden (1=Rendah, 2=Sedang, 3=Tinggi)"
  hour_post "Waktu Jam Pembuatan Komentar (0-23)".
EXECUTE.

* 3. MEMBERIKAN LABEL NILAI (VALUE LABELS) UNTUK VARIABEL KATEGORIKAL.
VALUE LABELS is_reply
  0 "Komentar Utama"
  1 "Balasan Thread".

VALUE LABELS sent_code
  1 "Negatif"
  2 "Netral"
  3 "Positif".

VALUE LABELS emot_code
  1 "Marah (Anger)"
  2 "Simpati (Sympathy)"
  3 "Skeptis (Skepticism)"
  4 "Sarkasme (Sarcasm)"
  5 "Netral / Lainnya".

VALUE LABELS engage_lvl
  1 "Rendah"
  2 "Sedang"
  3 "Tinggi".

VALUE LABELS has_emoji has_qmark has_exclam
  0 "Tidak Ada"
  1 "Ada".
EXECUTE.

* 4. ANALISIS STATISTIK DESKRIPTIF (UNTUK TABEL & PEMBAHASAN BAB 4).
FREQUENCIES VARIABLES=is_reply sent_code emot_code engage_lvl has_emoji has_qmark
  /STATISTICS=STDDEV MINIMUM MAXIMUM MEAN MEDIAN
  /BARCHART PERCENT
  /ORDER=ANALYSIS.

DESCRIPTIVES VARIABLES=char_len word_cnt reply_cnt sent_score
  /STATISTICS=MEAN STDDEV MIN MAX KURTOSIS SKEWNESS.

* 5. UJI TABULASI SILANG (CROSSTABS & CHI-SQUARE INDEPENDENCE TEST).
* Menguji apakah terdapat hubungan signifikan antara sentimen dengan jenis komentar.
CROSSTABS
  /TABLES=sent_code BY is_reply engage_lvl
  /FORMAT=AVALUE TABLES
  /STATISTICS=CHISQ PHI CC
  /CELLS=COUNT ROW COLUMN TOTAL
  /COUNT ROUND CELL.

* 6. UJI BEDA RATA-RATA (ONE-WAY ANOVA).
* Menguji perbedaan panjang kata / karakter berdasarkan kategori sentimen.
ONEWAY char_len word_cnt BY sent_code
  /STATISTICS DESCRIPTIVES HOMOGENEITY
  /PLOT MEANS
  /MISSING ANALYSIS.
EXECUTE.
`;
}

/**
 * 3. GENERATOR SMARTPLS (v3 & v4)
 * Format Matriks CSV murni angka / indikator SEM tanpa string rusak
 */
export function generateSmartPLSCSV(dataset) {
  // Hanya kolom indikator numerik bersih yang diizinkan untuk pemodelan PLS-SEM
  const headers = [
    'ID',
    'IS_REPLY',
    'CHAR_LEN',
    'WORD_CNT',
    'REPLY_CNT',
    'EMOJI_CNT',
    'HAS_EMOJI',
    'QMARK_CNT',
    'HAS_QMARK',
    'EXCLAM_CNT',
    'HAS_EXCLAM',
    'SENT_CODE',
    'SENT_SCORE',
    'EMOT_CODE',
    'ENGAGE_LVL',
    'HOUR_POST'
  ];

  const rows = dataset.map((d) => [
    d.id,
    d.is_reply,
    d.char_len,
    d.word_cnt,
    d.reply_cnt,
    d.emoji_cnt,
    d.has_emoji,
    d.qmark_cnt,
    d.has_qmark,
    d.exclam_cnt,
    d.has_exclam,
    d.sent_code,
    d.sent_score,
    d.emot_code,
    d.engage_lvl,
    d.hour_post
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * 4. GENERATOR JASP (University of Amsterdam Standard)
 * Dataset CSV siap pakai dengan tipe variabel Nominal, Ordinal, dan Scale
 */
export function generateJASPCSV(dataset) {
  const headers = [
    'ID',
    'Comment_Type',
    'Is_Reply',
    'Character_Length',
    'Word_Count',
    'Reply_Count',
    'Emoji_Count',
    'Has_Emoji',
    'Question_Mark_Count',
    'Has_Question',
    'Exclamation_Count',
    'Has_Exclamation',
    'Sentiment_Label',
    'Sentiment_Code',
    'Sentiment_Score',
    'Emotion_Label',
    'Emotion_Code',
    'Engagement_Level',
    'Hour_Of_Day',
    'Author_Username',
    'Clean_Text'
  ];

  const rows = dataset.map((d) => [
    d.id,
    escapeCSV(d.comment_type),
    d.is_reply,
    d.char_len,
    d.word_cnt,
    d.reply_cnt,
    d.emoji_cnt,
    d.has_emoji,
    d.qmark_cnt,
    d.has_qmark,
    d.exclam_cnt,
    d.has_exclam,
    escapeCSV(d.sent_label),
    d.sent_code,
    d.sent_score,
    escapeCSV(d.emot_label),
    d.emot_code,
    d.engage_lvl,
    d.hour_post,
    escapeCSV(d.username),
    escapeCSV(d.clean_text)
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Helper untuk mengunduh file teks/blob langsung dari peramban
 */
export function downloadFile(content, fileName, mimeType = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
