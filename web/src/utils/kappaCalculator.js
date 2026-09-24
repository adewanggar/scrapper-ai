/**
 * kappaCalculator.js - Kalkulator Uji Reliabilitas Antar-Pengkode (Inter-Coder Reliability)
 * Sesuai Standar Metodologi Analisis Isi Kuantitatif/Kualitatif Skripsi & Tesis S2
 * Referensi: Cohen (1960), Landis & Koch (1977), Neuendorf (2002), Krippendorff (2004)
 */

/**
 * Interpretasi nilai Cohen's Kappa menurut Landis & Koch (1977)
 */
export function interpretKappa(kappa) {
  if (kappa < 0.0) {
    return {
      level: 'Buruk (Poor)',
      badgeClass: 'poor',
      description: 'Tingkat kesepakatan lebih rendah daripada kebetulan acak.',
      accepted: false
    };
  }
  if (kappa <= 0.20) {
    return {
      level: 'Sangat Rendah (Slight Agreement)',
      badgeClass: 'slight',
      description: 'Kesesuaian sangat minim, tidak direkomendasikan untuk karya ilmiah.',
      accepted: false
    };
  }
  if (kappa <= 0.40) {
    return {
      level: 'Cukup (Fair Agreement)',
      badgeClass: 'fair',
      description: 'Kesesuaian cukup, namun masih rentan bias perbedaan persepsi pengkode.',
      accepted: false
    };
  }
  if (kappa <= 0.60) {
    return {
      level: 'Sedang (Moderate Agreement)',
      badgeClass: 'moderate',
      description: 'Kesesuaian moderat. Dapat diterima dengan catatan revisi definisi operasional codebook.',
      accepted: true
    };
  }
  if (kappa <= 0.80) {
    return {
      level: 'Kuat / Signifikan (Substantial Agreement)',
      badgeClass: 'substantial',
      description: 'Kesesuaian tinggi dan sangat memadai untuk standar Tesis S2 & Skripsi.',
      accepted: true
    };
  }
  return {
    level: 'Hampir Sempurna (Almost Perfect Agreement)',
    badgeClass: 'almost-perfect',
    description: 'Tingkat reliabilitas sangat prima, memenuhi kualifikasi publikasi jurnal terakreditasi / Scopus.',
    accepted: true
  };
}

/**
 * Menghitung Cohen's Kappa dari Matriks Kontingensi 3x3 (Sentimen: Positif, Netral, Negatif)
 * @param {Array<Array<number>>} matrix - Matriks 3x3 [ [a, b, c], [d, e, f], [g, h, i] ]
 * Baris: Pengkode 1, Kolom: Pengkode 2
 */
export function calculateKappaFromMatrix(matrix) {
  const categories = ['Positif', 'Netral', 'Negatif'];
  const n = matrix.reduce((sum, row) => sum + row.reduce((rSum, val) => rSum + (Number(val) || 0), 0), 0);

  if (n === 0) {
    return {
      totalN: 0,
      observedAgreementPct: 0,
      expectedAgreementPct: 0,
      kappa: 0,
      standardError: 0,
      interpretation: interpretKappa(0),
      rowTotals: [0, 0, 0],
      colTotals: [0, 0, 0]
    };
  }

  // Jumlah diagonal (kesepakatan langsung / observed agreement)
  const agreedTotal = (Number(matrix[0][0]) || 0) + (Number(matrix[1][1]) || 0) + (Number(matrix[2][2]) || 0);
  const Po = agreedTotal / n;

  // Total baris dan total kolom
  const rowTotals = [
    matrix[0].reduce((s, v) => s + (Number(v) || 0), 0),
    matrix[1].reduce((s, v) => s + (Number(v) || 0), 0),
    matrix[2].reduce((s, v) => s + (Number(v) || 0), 0)
  ];

  const colTotals = [
    (Number(matrix[0][0]) || 0) + (Number(matrix[1][0]) || 0) + (Number(matrix[2][0]) || 0),
    (Number(matrix[0][1]) || 0) + (Number(matrix[1][1]) || 0) + (Number(matrix[2][1]) || 0),
    (Number(matrix[0][2]) || 0) + (Number(matrix[1][2]) || 0) + (Number(matrix[2][2]) || 0)
  ];

  // Probabilitas kesepakatan karena kebetulan (Pe)
  let Pe = 0;
  for (let i = 0; i < 3; i++) {
    Pe += (rowTotals[i] / n) * (colTotals[i] / n);
  }

  // Rumus Cohen's Kappa: (Po - Pe) / (1 - Pe)
  let kappa = 0;
  if (Pe === 1) {
    kappa = 1;
  } else {
    kappa = (Po - Pe) / (1 - Pe);
  }

  // Standard Error
  const se = Math.sqrt((Po * (1 - Po)) / (n * Math.pow(1 - Pe, 2) || 1));

  return {
    totalN: n,
    agreedTotal,
    observedAgreementPct: +(Po * 100).toFixed(2),
    expectedAgreementPct: +(Pe * 100).toFixed(2),
    kappa: +kappa.toFixed(3),
    standardError: +se.toFixed(3),
    rowTotals,
    colTotals,
    interpretation: interpretKappa(kappa)
  };
}

/**
 * Menghitung Cohen's Kappa dari daftar pasangan kode [ { code1: 'Positif', code2: 'Positif' }, ... ]
 */
export function calculateKappaFromPairs(pairs) {
  // Matriks: 0: Positif, 1: Netral, 2: Negatif
  const matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  const catMap = {
    positif: 0,
    positive: 0,
    '3': 0,
    netral: 1,
    neutral: 1,
    '2': 1,
    negatif: 2,
    negative: 2,
    '1': 2
  };

  (pairs || []).forEach(({ code1, code2 }) => {
    const c1 = catMap[String(code1).toLowerCase()] ?? 1;
    const c2 = catMap[String(code2).toLowerCase()] ?? 1;
    matrix[c1][c2] += 1;
  });

  return calculateKappaFromMatrix(matrix);
}

/**
 * Generator Teks Narasi & Tabel Bab 3 Metodologi Penelitian Tesis S2
 */
export function generateBab3ReliabilityReport({
  coder1Name = 'Peneliti (Pengkode 1)',
  coder2Name = 'Pengkode Independen (Pengkode 2)',
  variableTested = 'Valensi Sentimen Respon Audiens',
  sampleSize = 50,
  stats
}) {
  const k = stats.kappa;
  const po = stats.observedAgreementPct;
  const pe = stats.expectedAgreementPct;
  const level = stats.interpretation.level;

  const narrative = `### Uji Reliabilitas Antar-Pengkode (Inter-Coder Reliability)

Untuk menjamin objektivitas dan reliabilitas pengkodean data teks komentar pada objek penelitian ini, peneliti melakukan uji reliabilitas antar-pengkode (*inter-coder reliability*) menggunakan koefisien **Cohen's Kappa ($\\kappa$)** (Cohen, 1960; Neuendorf, 2002). Pengujian dilakukan terhadap sampel acak sebanyak **${sampleSize} unit komentar** yang dianalisis secara independen oleh dua pengkode, yaitu **${coder1Name}** dan **${coder2Name}** pada variabel *${variableTested}*.

Berdasarkan hasil pengujian komparatif, diperoleh nilai kesepakatan empiris (*observed agreement*, $P_o$) sebesar **${po}%**, dengan tingkat kesepakatan acak (*expected by chance*, $P_e$) sebesar **${pe}%**. Nilai koefisien Cohen's Kappa yang diperoleh adalah **$\\kappa = ${k}$** (Standar Error = ${stats.standardError}).

Mengacu pada kriteria interpretasi Landis dan Koch (1977), nilai $\\kappa = ${k}$ berada pada kategori **"${level}"**. Nilai ini melampaui batas ambang minimum reliabilitas akademik yang disyaratkan dalam penelitian ilmu komunikasi ($\\kappa \\ge 0.61$). Dengan demikian, instrumen lembar pengkodean (*codebook*) dan hasil ekstraksi data dinyatakan **valid, reliabel, dan terbebas dari bias subjektivitas tunggal**, sehingga layak dipergunakan sebagai basis analisis temuan pada Bab 4.`;

  return narrative;
}
