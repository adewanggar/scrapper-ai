import React, { useState, useMemo } from "react";
import "./analysis.css";
import {
  AlertCircle,
  Award,
  BarChart3,
  Brain,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Copy,
  Database,
  Download,
  FileSpreadsheet,
  Flame,
  Layers,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Quote,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { FRAMEWORK_CATEGORIES, FRAMEWORKS_LIST } from "../constants/frameworks";
import { normalizeAiAnalysis } from "../utils/aiNormalize";
import { AiProgressBar } from "../components/ResearchProgress";
import DatasetSwitcher from "../components/DatasetSwitcher";

export default function AnalysisPage({
  analysisType,
  handleFrameworkChange,
  aiSampleSize,
  setAiSampleSize,
  aiModel = "clario/gemini-3.7-flash",
  aiLoading,
  aiError,
  aiAnalysis: rawAiAnalysis,
  runAiAnalysis,
  selectedFile,
  files,
  loadFileContent,
  data,
  setShowCitationModal,
  setShowInterCoderModal,
  setShowExportStatsModal,
  setVerbatimModalComment,
  setVerbatimModalIndex,
}) {
  const [copiedThesisText, setCopiedThesisText] = useState(false);
  const [fwCategoryFilter, setFwCategoryFilter] = useState("all");
  const [fwSearchQuery, setFwSearchQuery] = useState("");
  const [fwStep, setFwStep] = useState("jurusan"); // 'jurusan' -> 'kerangka'
  const activeCat =
    FRAMEWORK_CATEGORIES.find((c) => c.id === fwCategoryFilter) || null;

  const aiAnalysis = useMemo(() => {
    const norm = normalizeAiAnalysis(rawAiAnalysis);
    if (!norm) return null;
    return {
      ...norm,
      result: norm.result && typeof norm.result === "object" ? norm.result : {},
    };
  }, [rawAiAnalysis]);

  const copyThesisParagraph = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedThesisText(true);
    setTimeout(() => setCopiedThesisText(false), 2000);
  };

  const fwMatchQuery = (fw, q) => {
    const catLabel =
      FRAMEWORK_CATEGORIES.find((c) => c.id === fw.category)?.label || "";
    return [
      fw.title,
      fw.desc,
      fw.badge,
      fw.theory,
      catLabel,
      ...(fw.keywords || []),
      ...(fw.indicators || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  };

  const filteredFrameworks = useMemo(() => {
    const q = fwSearchQuery.trim().toLowerCase();
    return FRAMEWORKS_LIST.filter((fw) => {
      const matchCat =
        fwCategoryFilter === "all" || fw.category === fwCategoryFilter;
      if (!matchCat) return false;
      return !q || fwMatchQuery(fw, q);
    });
  }, [fwCategoryFilter, fwSearchQuery]);

  // Pencarian lintas jurusan: kerangka yang cocok di luar bidang yang sedang dipilih
  const crossFieldFrameworks = useMemo(() => {
    const q = fwSearchQuery.trim().toLowerCase();
    if (!q || fwCategoryFilter === "all") return [];
    return FRAMEWORKS_LIST.filter(
      (fw) => fw.category !== fwCategoryFilter && fwMatchQuery(fw, q),
    );
  }, [fwCategoryFilter, fwSearchQuery]);

  const exportAiReportMarkdown = () => {
    if (!aiAnalysis) return;
    const r = aiAnalysis.result || {};
    const type =
      aiAnalysis.analysis_type || analysisType || "emotion_marketing";
    const fwMeta =
      FRAMEWORKS_LIST.find((f) => f.id === type) || FRAMEWORKS_LIST[0];

    let md = `# Laporan Analisis AI Skripsi: ${fwMeta.title}\n\n`;
    md += `**Fokus Bidang:** ${fwMeta.badge}\n`;
    md += `**File:** \`${aiAnalysis.filename || selectedFile || "dataset"}\`\n`;
    md += `**Sampel Dianalisis:** ${aiAnalysis.sample_analyzed || 0} dari ${aiAnalysis.total_comments || 0} komentar\n`;
    md += `**Landasan Teori:** ${fwMeta.theory}\n\n`;
    md += `---\n\n`;

    if (type === "public_sentiment") {
      md += `## 1. Konteks Isu & Audit Krisis Citra\n`;
      md += `- **Premis Isu:** ${r.context_summary?.issue_premise || "-"}\n`;
      md += `- **Entitas/Brand Terkait:** ${r.context_summary?.public_entity_or_brand || "-"}\n`;
      md += `- **Tingkat Ancaman Krisis:** **${r.context_summary?.crisis_threat_level || "-"}**\n`;
      md += `- **Skor Kepercayaan Publik:** **${r.reputation_audit?.trust_score_pct}%**\n`;
      md += `- **Status Persepsi:** ${r.reputation_audit?.public_perception_verdict || "-"}\n\n`;

      md += `## 2. Metrik Distribusi Sentimen Publik\n`;
      md += `- Sentimen Positif: ${r.sentiment_metrics?.positive_pct}%\n`;
      md += `- Sentimen Netral: ${r.sentiment_metrics?.neutral_pct}%\n`;
      md += `- Sentimen Negatif: ${r.sentiment_metrics?.negative_pct}%\n`;
      md += `- Sentimen Kritis/Menuntut: ${r.sentiment_metrics?.critical_pct}%\n`;
      md += `*Sentimen Dominan:* **${r.sentiment_metrics?.dominant_sentiment}**\n`;
      md += `*Dinamika Momentum:* ${r.sentiment_metrics?.sentiment_momentum}\n\n`;

      if (r.reputation_audit?.key_grievances?.length) {
        md += `### Poin Kritik & Kekecewaan Publik Terbesar:\n`;
        r.reputation_audit.key_grievances.forEach((g) => {
          md += `- ${g}\n`;
        });
        md += `\n`;
      }
      if (r.pr_crisis_recommendations) {
        md += `## 3. Rekomendasi Manajemen Krisis PR\n`;
        md += `- **Tipe Krisis:** ${r.pr_crisis_recommendations.crisis_type_detected}\n`;
        md += `- **Strategi Respons Disarankan:** ${r.pr_crisis_recommendations.recommended_response_strategy}\n`;
        if (r.pr_crisis_recommendations.holding_statement_draft) {
          md += `\n> **Draf Pernyataan Resmi / Holding Statement:**\n> "${r.pr_crisis_recommendations.holding_statement_draft}"\n\n`;
        }
      }
    } else if (type === "consumer_behavior") {
      md += `## 1. Konteks Produk & Nilai Manfaat\n`;
      md += `- **Produk / Brand:** ${r.context_summary?.product_or_brand || "-"}\n`;
      md += `- **Persepsi Nilai Manfaat:** ${r.context_summary?.value_proposition_perceived || "-"}\n`;
      md += `- **Daya Tarik Pasar:** ${r.context_summary?.market_appeal_summary || "-"}\n\n`;

      md += `## 2. Metrik Intensi Beli & Persepsi Konsumen\n`;
      md += `- Minat Beli Tinggi: **${r.purchase_intent_metrics?.high_intent_pct}%**\n`;
      md += `- Penasaran / Butuh Info Lanjut: **${r.purchase_intent_metrics?.moderate_curious_pct}%**\n`;
      md += `- Skeptis Harga: **${r.purchase_intent_metrics?.price_skeptic_pct}%**\n`;
      md += `- Menolak / Tidak Tertarik: **${r.purchase_intent_metrics?.resistant_uninterested_pct}%**\n`;
      md += `*Kesimpulan Intensi:* **${r.purchase_intent_metrics?.purchase_intent_verdict}**\n\n`;

      md += `### Persepsi Konsumen Terhadap Kualitas & Harga:\n`;
      md += `- Persepsi Kualitas: ${r.consumer_perception?.perceived_quality || "-"}\n`;
      md += `- Kewajaran Harga: ${r.consumer_perception?.price_fairness_perception || "-"}\n`;
      md += `- Kredibilitas & Kepercayaan: ${r.consumer_perception?.trust_and_credibility || "-"}\n`;
      if (r.consumer_perception?.primary_purchase_barriers?.length) {
        md += `- **Hambatan Konversi:** ${r.consumer_perception.primary_purchase_barriers.join("; ")}\n`;
      }
      md += `\n`;
    } else if (type === "digital_discourse") {
      md += `## 1. Konteks Situasi Komunikasi & Wacana\n`;
      md += `- **Situasi Komunikasi:** ${r.context_summary?.communicative_situation || "-"}\n`;
      md += `- **Wacana Sentral:** ${r.context_summary?.discourse_topic || "-"}\n`;
      md += `- **Iklim Komunikasi:** **${r.context_summary?.communication_climate || "-"}**\n\n`;

      md += `## 2. Tingkat Kesantunan & Nada Tutur Netizen\n`;
      md += `- Santun & Konstruktif: **${r.politeness_and_tone?.polite_constructive_pct}%**\n`;
      md += `- Netral / Informatif: **${r.politeness_and_tone?.neutral_informative_pct}%**\n`;
      md += `- Sarkastik / Satir: **${r.politeness_and_tone?.sarcastic_satirical_pct}%**\n`;
      md += `- Agresif / Toxic: **${r.politeness_and_tone?.aggressive_toxic_pct}%**\n`;
      md += `*Nada Dominan:* **${r.politeness_and_tone?.dominant_tone}**\n\n`;

      md += `### Karakteristik Linguistik & Netiket:\n`;
      md += `- **Tingkat Kepatuhan Netiket:** ${r.linguistic_features?.netiquette_compliance_level || "-"}\n`;
      md += `- **Risiko Flaming / Cyberbullying:** ${r.linguistic_features?.flaming_and_cyberbullying_risk || "-"}\n`;
      md += `- **Gaya Bahasa Utama:** ${r.linguistic_features?.rhetorical_devices_used || "-"}\n`;
      if (r.linguistic_features?.prominent_slang_and_jargon?.length) {
        md += `- **Slang / Kosakata Khas Netizen:** ${r.linguistic_features.prominent_slang_and_jargon.join(", ")}\n`;
      }
      md += `\n`;
    } else if (type === "social_psychology") {
      md += `## 1. Konteks Stimulus Sosial & Fenomena Massa\n`;
      md += `- **Stimulus Sosial:** ${r.context_summary?.social_stimulus || "-"}\n`;
      md += `- **Fenomena Kelompok Teramati:** ${r.context_summary?.social_phenomenon_observed || "-"}\n`;
      md += `- **Ketegangan Psikologis:** ${r.context_summary?.psychological_tension || "-"}\n\n`;

      md += `## 2. Metrik Psikologis Penonton\n`;
      md += `- Kemarahan Moral Kolektif: **${r.psychological_metrics?.moral_outrage_pct}%**\n`;
      md += `- Konformitas (Efek Ikut-ikutan): **${r.psychological_metrics?.conformity_bandwagon_pct}%**\n`;
      md += `- Empati Sosial: **${r.psychological_metrics?.social_empathy_pct}%**\n`;
      md += `- Apati / Sikap Acuh: **${r.psychological_metrics?.apathy_detachment_pct}%**\n`;
      md += `*Kondisi Psikologis Dominan:* **${r.psychological_metrics?.dominant_psychological_state}**\n\n`;

      md += `### Pola Atribusi & Bias Kognitif:\n`;
      md += `- **Target Atribusi:** ${r.attribution_and_bias?.attribution_target || "-"}\n`;
      md += `- **Bias Kognitif Terdeteksi:** ${r.attribution_and_bias?.cognitive_bias_detected || "-"}\n`;
      md += `- **Pertimbangan Moralitas:** ${r.attribution_and_bias?.moral_judgment_summary || "-"}\n\n`;
    } else if (type === "entman_framing") {
      md += `## 1. Ikhtisar Pembingkaian Wacana (Framing Overview)\n`;
      md += `- **Isu Sentral:** ${r.framing_overview?.central_issue || "-"}\n`;
      md += `- **Frame Dominan:** **${r.framing_overview?.dominant_frame_name || "-"}**\n`;
      md += `- **Intensitas Framing:** ${r.framing_overview?.framing_intensity || "-"}\n`;
      md += `> ${r.framing_overview?.framing_summary || ""}\n\n`;

      md += `## 2. Analisis 4 Dimensi Robert Entman (1993)\n\n`;
      const dims = r.entman_dimensions || {};
      if (dims.define_problems) {
        md += `### A. Define Problems (Mendefinisikan Masalah)\n`;
        md += `- **Definisi Dominan:** ${dims.define_problems.dominant_definition}\n`;
        md += `${dims.define_problems.explanation}\n`;
        (dims.define_problems.problem_aspects || []).forEach((a) => {
          md += `  - ${a.aspect} (${a.pct}%)${a.sample_quote ? ` — "${a.sample_quote}"` : ""}\n`;
        });
        md += `\n`;
      }
      if (dims.diagnose_causes) {
        md += `### B. Diagnose Causes (Mendiagnosis Penyebab & Aktor)\n`;
        md += `- **Aktor/Faktor Utama:** **${dims.diagnose_causes.primary_culprit}**\n`;
        md += `${dims.diagnose_causes.explanation}\n`;
        (dims.diagnose_causes.cause_attributions || []).forEach((c) => {
          md += `  - ${c.cause} (${c.pct}%)${c.sample_quote ? ` — "${c.sample_quote}"` : ""}\n`;
        });
        md += `\n`;
      }
      if (dims.make_moral_judgments) {
        md += `### C. Make Moral Judgments (Membuat Penilaian Moral)\n`;
        md += `- **Sikap Moral Publik:** **${dims.make_moral_judgments.moral_verdict}**\n`;
        md += `${dims.make_moral_judgments.explanation}\n`;
        (dims.make_moral_judgments.moral_evaluations || []).forEach((m) => {
          md += `  - ${m.judgment} (${m.pct}%)${m.sample_quote ? ` — "${m.sample_quote}"` : ""}\n`;
        });
        md += `\n`;
      }
      if (dims.suggest_remedies) {
        md += `### D. Suggest Remedies (Menekankan Solusi & Tuntutan)\n`;
        md += `- **Tuntutan Dominan:** **${dims.suggest_remedies.dominant_remedy}**\n`;
        md += `${dims.suggest_remedies.explanation}\n`;
        (dims.suggest_remedies.remedy_proposals || []).forEach((rp) => {
          md += `  - ${rp.proposal} (${rp.pct}%)${rp.sample_quote ? ` — "${rp.sample_quote}"` : ""}\n`;
        });
        md += `\n`;
      }

      if (r.counter_frames) {
        md += `### Frame Tandingan (Counter-Frame):\n`;
        md += `- **Nama Frame Tandingan:** ${r.counter_frames.counter_frame_name} (${r.counter_frames.counter_frame_pct}%)\n`;
        md += `> ${r.counter_frames.counter_frame_argument || ""}\n\n`;
      }
    } else if (type === "political_communication") {
      md += `## 1. Konteks Isu & Polarisasi Politik\n`;
      md += `- **Isu / Figur Politik:** ${r.context_summary?.political_issue || "-"}\n`;
      md += `- **Tingkat Polarisasi:** **${r.context_summary?.polarization_level || "-"}**\n`;
      md += `- **Narasi Dominan:** ${r.context_summary?.dominant_narrative || "-"}\n\n`;

      md += `## 2. Metrik Sikap Politik & Polarisasi Partisan\n`;
      md += `- Kubu Pro / Pendukung: **${r.political_metrics?.pro_stance_pct}%**\n`;
      md += `- Kubu Kontra / Penentang: **${r.political_metrics?.contra_stance_pct}%**\n`;
      md += `- Skeptis / Golput / Netral: **${r.political_metrics?.neutral_skeptical_pct}%**\n`;
      md += `*Stance Dominan:* **${r.political_metrics?.dominant_stance}**\n`;
      md += `*Intensitas Echo Chamber:* ${r.political_metrics?.echo_chamber_intensity}\n\n`;
    } else if (type === "audience_reception") {
      md += `## 1. Konteks Pesan & Analisis Resepsi (Stuart Hall)\n`;
      md += `- **Pesan Ter-encode:** ${r.context_summary?.encoded_message || "-"}\n`;
      md += `- **Tren Penerimaan:** **${r.context_summary?.dominant_reception_trend || "-"}**\n`;
      md += `- **Konteks Sosial Budaya:** ${r.context_summary?.cultural_context || "-"}\n\n`;

      md += `## 2. Tiga Posisi Pembacaan Stuart Hall (1973)\n`;
      md += `- Posisi Dominan-Hegemonik (Menerima): **${r.hall_reception_positions?.dominant_hegemonic_pct}%**\n`;
      md += `- Posisi Negosiasi (Kompromi): **${r.hall_reception_positions?.negotiated_pct}%**\n`;
      md += `- Posisi Oposisional (Menolak/Mendekonstruksi): **${r.hall_reception_positions?.oppositional_pct}%**\n`;
      md += `*Posisi Dominan:* **${r.hall_reception_positions?.dominant_position}**\n`;
      md += `*Kesimpulan Dekoding:* ${r.hall_reception_positions?.reception_verdict}\n\n`;
    } else if (type === "parasocial_culture") {
      md += `## 1. Konteks Persona Kreator & Dinamika Fandom\n`;
      md += `- **Persona Kreator:** ${r.context_summary?.creator_persona || "-"}\n`;
      md += `- **Kedekatan Parasosial:** **${r.context_summary?.parasocial_closeness_level || "-"}**\n`;
      md += `- **Dinamika Fandom:** ${r.context_summary?.fandom_dynamic || "-"}\n\n`;

      md += `## 2. Metrik Interaksi Parasosial (Horton & Wohl)\n`;
      md += `- Keterikatan Emosional Semu: **${r.parasocial_metrics?.parasocial_attachment_pct}%**\n`;
      md += `- Loyalitas Fandom Komunitas: **${r.parasocial_metrics?.fandom_loyalty_pct}%**\n`;
      md += `- Kritis / Lepas (Detached): **${r.parasocial_metrics?.critical_detachment_pct}%**\n`;
      md += `*Bentuk Ikatan Dominan:* **${r.parasocial_metrics?.dominant_attachment}**\n`;
      md += `*Tingkat Pembelaan Protektif:* ${r.parasocial_metrics?.protective_behavior}\n\n`;
    } else if (type === "public_policy") {
      md += `## 1. Konteks Kebijakan Publik & Pelayanan Warga\n`;
      md += `- **Isu Kebijakan / Layanan:** ${r.context_summary?.policy_or_service_issue || "-"}\n`;
      md += `- **Tingkat Keluhan Warga:** **${r.context_summary?.public_grievance_level || "-"}**\n`;
      md += `- **Kepercayaan Tata Kelola:** ${r.context_summary?.trust_in_governance || "-"}\n\n`;

      md += `## 2. Metrik Sentimen Sikap Publik\n`;
      md += `- Kritik Konstruktif & Solutif: **${r.policy_sentiment?.constructive_criticism_pct}%**\n`;
      md += `- Sinisme / Krisis Kepercayaan: **${r.policy_sentiment?.cynical_distrust_pct}%**\n`;
      md += `- Mendukung Regulasi: **${r.policy_sentiment?.supportive_pct}%**\n`;
      md += `*Sikap Dominan:* **${r.policy_sentiment?.dominant_stance}**\n\n`;
    } else if (r.indicator_analysis?.indicators) {
      // Generic: kerangka bidang penelitian tambahan (indikator teori-spesifik)
      md += `## 1. Konteks Analisis\n`;
      md += `- **Objek / Fenomena:** ${r.context_summary?.research_object || "-"}\n`;
      md += `- **Topik Diskusi Dominan:** ${r.context_summary?.main_topic || "-"}\n`;
      md += `- **Catatan Kontekstual:** ${r.context_summary?.analysis_note || "-"}\n\n`;

      md += `## 2. Distribusi Sentimen Komentar\n`;
      md += `- Positif: **${r.sentiment_distribution?.positive_pct}%**\n`;
      md += `- Netral: **${r.sentiment_distribution?.neutral_pct}%**\n`;
      md += `- Negatif: **${r.sentiment_distribution?.negative_pct}%**\n`;
      md += `*Sentimen Dominan:* **${r.sentiment_distribution?.dominant_sentiment}**\n`;
      md += `*Rangkuman:* ${r.sentiment_distribution?.sentiment_summary}\n\n`;

      md += `## 3. Distribusi Dimensi / Indikator Analisis\n`;
      (r.indicator_analysis.indicators || []).forEach((ind) => {
        md += `- **${ind.name}: ${ind.pct}%**\n`;
        md += `  - ${ind.description}\n`;
        if (ind.sample_quote) md += `  - Kutipan: "${ind.sample_quote}"\n`;
      });
      md += `\n*Insight Dimensi Dominan:* ${r.indicator_analysis?.dominant_explanation}\n\n`;
    } else {
      // Default: Emotion-driven marketing
      md += `## 1. Konteks Narasi & Strategi Pemasaran\n`;
      md += `- **Premis Video:** ${r.video_context?.premise || "-"}\n`;
      md += `- **Produk/Brand:** ${r.video_context?.product_or_brand || "-"}\n`;
      md += `- **Strategi Terdeteksi:** ${r.video_context?.marketing_strategy_detected || "-"}\n\n`;

      md += `## 2. Kesadaran Iklan (Ad-Awareness Ratio)\n`;
      md += `- Terkecoh/Terhanyut Drama: **${r.ad_awareness?.drama_engaged_pct}%**\n`;
      md += `- Sadar Iklan / Bongkar Marketing: **${r.ad_awareness?.marketing_aware_pct}%**\n`;
      md += `- Membahas Produk: **${r.ad_awareness?.product_focus_pct}%**\n`;
      md += `> ${r.ad_awareness?.analysis || ""}\n\n`;

      md += `## 3. Distribusi Emosi Penonton\n`;
      md += `- Kemarahan (Outrage): ${r.emotion_distribution?.anger_pct}%\n`;
      md += `- Simpati / Iba: ${r.emotion_distribution?.sympathy_pct}%\n`;
      md += `- Skeptis (Settingan): ${r.emotion_distribution?.skepticism_pct}%\n`;
      md += `- Sarkasme: ${r.emotion_distribution?.sarcasm_pct}%\n`;
      md += `- Netral: ${r.emotion_distribution?.neutral_pct}%\n`;
      md += `*Emosi Dominan:* **${r.emotion_distribution?.dominant_emotion}** (${r.emotion_distribution?.dominant_emotion_explanation})\n\n`;
    }

    md += `## ${type === "emotion_marketing" ? "4" : "3"}. Polarisasi Kubu (Stance Dynamics)\n`;
    md += `- ${r.stance_dynamics?.side_a_name}: ${r.stance_dynamics?.side_a_pct}%\n`;
    md += `- ${r.stance_dynamics?.side_b_name}: ${r.stance_dynamics?.side_b_pct}%\n`;
    md += `- Netral: ${r.stance_dynamics?.neutral_pct}%\n`;
    md += `- Tingkat Kontroversi: **${r.stance_dynamics?.controversy_level || "Sedang"}**\n`;
    md += `> ${r.stance_dynamics?.polarization_summary || ""}\n\n`;

    md += `## ${type === "emotion_marketing" ? "5" : "4"}. Klaster Topik Pembicaraan Netizen\n`;
    (r.topic_clusters || []).forEach((tc, i) => {
      md += `### ${i + 1}. ${tc.topic_name} (${tc.pct}%)\n`;
      md += `${tc.description}\n`;
      if (tc.sample_quote) {
        md += `> "${tc.sample_quote}"\n\n`;
      }
    });

    md += `## ${type === "emotion_marketing" ? "6" : "5"}. Ringkasan Temuan Skripsi (Academic Synthesis)\n`;
    (r.academic_insights?.key_findings || []).forEach((kf) => {
      md += `- ${kf}\n`;
    });
    if (r.academic_insights?.brand_hijack_verdict) {
      md += `\n**Verdict Brand:** ${r.academic_insights.brand_hijack_verdict}\n`;
    }
    if (r.academic_insights?.theoretical_relevance) {
      md += `\n**Relevansi Teori:** ${r.academic_insights.theoretical_relevance}\n\n`;
    }
    md += `### Paragraf Pembahasan Skripsi (Bab 4):\n`;
    md += `${r.academic_insights?.thesis_summary_paragraph}\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_skripsi_${type}_${selectedFile.replace(".json", "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentFw =
    FRAMEWORKS_LIST.find((f) => f.id === analysisType) || FRAMEWORKS_LIST[0];
  const hasMatchingAnalysis = Boolean(
    aiAnalysis && aiAnalysis.analysis_type === analysisType,
  );
  const resultType = hasMatchingAnalysis
    ? aiAnalysis.analysis_type || analysisType
    : analysisType;
  const activeResultFw =
    FRAMEWORKS_LIST.find((f) => f.id === resultType) || currentFw;

  const renderFrameworkCard = (fw) => {
    const IconComp = fw.icon;
    const isActive = analysisType === fw.id;
    return (
      <button
        key={fw.id}
        type="button"
        className={`framework-card ${isActive ? "active" : ""}`}
        style={{
          "--card-accent": fw.color,
          "--card-accent-alpha": `${fw.color}25`,
        }}
        onClick={() => handleFrameworkChange(fw.id)}
      >
        <div className="framework-card-top">
          <div
            className="framework-icon-wrap"
            style={{ background: `${fw.color}15`, color: fw.color }}
          >
            <IconComp size={18} />
          </div>
          <span
            className="framework-badge"
            style={{ background: `${fw.color}15`, color: fw.color }}
          >
            {fw.badge.split("/")[0].trim()}
          </span>
        </div>

        <div className="framework-card-body">
          <h4>{fw.title}</h4>
          <p>{fw.desc}</p>
          {fw.indicators?.length > 0 && (
            <div className="fw-indicator-chips">
              {fw.indicators.slice(0, 3).map((ind) => (
                <span key={ind} className="fw-indicator-chip">
                  {ind}
                </span>
              ))}
              {fw.indicators.length > 3 && (
                <span
                  className="fw-indicator-chip more"
                  title={fw.indicators.join(", ")}
                >
                  +{fw.indicators.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="framework-card-footer">
          <span className="framework-theory-tag" title={fw.theory}>
            {fw.theory.split(",")[0]}
          </span>
          {isActive && <div className="framework-active-indicator" />}
        </div>
      </button>
    );
  };

  return (
    <div className="analysis-workspace">
      <header className="analysis-page-heading">
        <div>
          <h1>Analisis riset</h1>
          <p>
            Pilih kerangka, tentukan sampel, lalu telaah pola dalam percakapan.
          </p>
        </div>
        {hasMatchingAnalysis && (
          <div className="analysis-status" role="status">
            <CheckCircle2 size={15} />
            <span>{aiAnalysis.sample_analyzed || 0} komentar dianalisis</span>
          </div>
        )}
      </header>
      {/* Header Card with File Picker and Controls */}
      <div className="ai-header-card">
        <div>
          <div className="analysis-current-framework">
            <span className="section-kicker">KERANGKA AKTIF</span>
            <h2>{currentFw.title}</h2>
          </div>
          <p className="analysis-current-meta">
            {currentFw.badge}
            {hasMatchingAnalysis && (
              <span>
                {" "}
                · {aiAnalysis.sample_analyzed || 0} dari{" "}
                {aiAnalysis.total_comments || 0} komentar
              </span>
            )}
          </p>
        </div>

        <div className="ai-config-controls">
          {/* Sample Size Selector */}
          <div className="sample-size-pill-group">
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                paddingLeft: "8px",
              }}
            >
              Sampel:
            </span>
            <button
              className={`sample-size-btn ${aiSampleSize === 30 ? "active" : ""}`}
              onClick={() => setAiSampleSize(30)}
              title="30 komentar teratas"
            >
              30 Cepat
            </button>
            <button
              className={`sample-size-btn ${aiSampleSize === 50 ? "active" : ""}`}
              onClick={() => setAiSampleSize(50)}
              title="50 komentar teratas"
            >
              50 Standar
            </button>
            <button
              className={`sample-size-btn ${aiSampleSize === 100 ? "active" : ""}`}
              onClick={() => setAiSampleSize(100)}
              title="100 komentar teratas"
            >
              100
            </button>
            <button
              className={`sample-size-btn ${aiSampleSize === 150 ? "active" : ""}`}
              onClick={() => setAiSampleSize(150)}
              title="150 komentar teratas"
            >
              150
            </button>
            <button
              className={`sample-size-btn ${aiSampleSize === 200 ? "active" : ""}`}
              onClick={() => setAiSampleSize(200)}
              title="200 komentar teratas"
            >
              200
            </button>
            <button
              className={`sample-size-btn ${aiSampleSize === 0 ? "active" : ""}`}
              onClick={() => setAiSampleSize(0)}
              title="Menganalisis seluruh komentar dalam dataset"
            >
              Semua {data?.comments?.length ? `(${data.comments.length})` : ""}
            </button>
          </div>

          <button
            className="btn btn-scrape-primary"
            style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}
            onClick={runAiAnalysis}
            disabled={aiLoading || !selectedFile}
          >
            {aiLoading ? (
              <>
                <div className="spinner-icon" />
                <span>Sedang menganalisis…</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>
                  {hasMatchingAnalysis ? "Analisis ulang" : "Mulai analisis"}
                </span>
              </>
            )}
          </button>

          {hasMatchingAnalysis && (
            <button
              className="btn btn-white-bordered"
              onClick={exportAiReportMarkdown}
              title="Unduh draf bab 4 skripsi format Markdown (.md)"
            >
              <Download size={14} />
              Unduh laporan
            </button>
          )}

          {data && (
            <>
              <button
                className="btn btn-white-bordered"
                onClick={() => setShowCitationModal(true)}
                title="Salin sitasi video untuk Daftar Pustaka (APA 7th, Harvard, Mendeley)"
              >
                <Quote size={14} color="#db2777" />
                <span>Buat sitasi</span>
              </button>
              <button
                className="btn btn-white-bordered"
                onClick={() => setShowInterCoderModal(true)}
                title="Kalkulator uji reliabilitas antar-pengkode (Cohen's Kappa) untuk Bab 3"
              >
                <Calculator size={14} color="#0891b2" />
                <span>Uji reliabilitas</span>
              </button>
              <button
                className="btn btn-stat-export"
                onClick={() => setShowExportStatsModal(true)}
                title="Ekspor data komentar & metrik statistik untuk SPSS, Excel, SmartPLS, JASP"
              >
                <FileSpreadsheet size={14} />
                <span>Ekspor data</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dataset Switcher Card & Search Modal */}
      <DatasetSwitcher
        files={files}
        selectedFile={selectedFile}
        onSelectDataset={(filename) => loadFileContent(filename)}
        label="Dataset aktif"
        data={data}
      />

      {/* Academic Frameworks Selector: Step 1 (Jurusan) -> Step 2 (Kerangka) */}
      <details className="ai-frameworks-section" open={!hasMatchingAnalysis}>
        <summary className="ai-frameworks-header">
          <div className="ai-frameworks-title">
            <span>Pilih kerangka analisis</span>
          </div>
          <span className="ai-frameworks-subtitle">
            {fwStep === "jurusan" && !fwSearchQuery.trim()
              ? "Pilih bidang penelitian untuk melihat kerangka yang tersedia."
              : `${activeCat ? activeCat.label : "Semua bidang"} · ${filteredFrameworks.length} kerangka`}
          </span>
          <ChevronDown size={16} className="analysis-framework-chevron" />
        </summary>

        {fwStep === "jurusan" && !fwSearchQuery.trim() ? (
          /* STEP 1: Kartu Pilihan Jurusan / Bidang Penelitian */
          <div className="jurusan-grid">
            {FRAMEWORK_CATEGORIES.map((cat) => {
              const count =
                cat.id === "all"
                  ? FRAMEWORKS_LIST.length
                  : FRAMEWORKS_LIST.filter((f) => f.category === cat.id).length;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="jurusan-card"
                  style={{
                    "--card-accent": cat.color,
                    "--card-accent-alpha": `${cat.color}15`,
                  }}
                  onClick={() => {
                    setFwCategoryFilter(cat.id);
                    setFwStep("kerangka");
                  }}
                  title={`Lihat ${count} kerangka analisis bidang ${cat.label}`}
                >
                  <div
                    className="jurusan-icon-wrap"
                    style={{ background: `${cat.color}15`, color: cat.color }}
                  >
                    <CatIcon size={22} />
                  </div>
                  <h4>{cat.label}</h4>
                  {cat.desc && <p className="jurusan-desc">{cat.desc}</p>}
                  <span
                    className="jurusan-count"
                    style={{ background: `${cat.color}15`, color: cat.color }}
                  >
                    {count} kerangka
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* STEP 2: Daftar Kerangka Analisis Bidang Terpilih */
          <>
            <div className="frameworks-filter-toolbar">
              <button
                type="button"
                className="fw-back-btn"
                onClick={() => {
                  setFwStep("jurusan");
                  setFwCategoryFilter("all");
                  setFwSearchQuery("");
                }}
                title="Kembali memilih jurusan / bidang penelitian"
              >
                <ChevronLeft size={14} />
                <span>Ganti bidang</span>
              </button>

              {activeCat && !fwSearchQuery.trim() && (
                <span className="fw-active-cat-label">
                  <activeCat.icon size={14} />
                  <span>{activeCat.label}</span>
                </span>
              )}

              <div className="frameworks-search-box">
                <Search size={14} className="fw-search-icon" />
                <input
                  type="text"
                  className="fw-search-input"
                  placeholder="Cari teori atau topik…"
                  value={fwSearchQuery}
                  onChange={(e) => setFwSearchQuery(e.target.value)}
                />
                {fwSearchQuery && (
                  <button
                    type="button"
                    className="fw-search-clear"
                    onClick={() => setFwSearchQuery("")}
                    title="Hapus pencarian"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {filteredFrameworks.length === 0 &&
            crossFieldFrameworks.length === 0 ? (
              <div className="empty-frameworks-notice">
                <p>
                  Tidak ada kerangka analisis yang cocok dengan filter "
                  <strong>{fwSearchQuery}</strong>".
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: "8px" }}
                  onClick={() => {
                    setFwStep("jurusan");
                    setFwCategoryFilter("all");
                    setFwSearchQuery("");
                  }}
                >
                  Pilih bidang lain
                </button>
              </div>
            ) : (
              <>
                {filteredFrameworks.length > 0 && (
                  <div className="ai-frameworks-grid">
                    {filteredFrameworks.map((fw) => renderFrameworkCard(fw))}
                  </div>
                )}

                {crossFieldFrameworks.length > 0 && (
                  <div className="cross-field-section">
                    <div className="cross-field-header">
                      <span className="cross-field-title">
                        Ditemukan di bidang lain ({crossFieldFrameworks.length})
                      </span>
                      <span className="cross-field-subtitle">
                        Kerangka berikut relevan dengan pencarian Anda meski
                        berasal dari jurusan lain
                      </span>
                    </div>
                    <div className="ai-frameworks-grid">
                      {crossFieldFrameworks.map((fw) =>
                        renderFrameworkCard(fw),
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </details>

      {/* Error Alert */}
      {aiError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            borderRadius: "10px",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={18} />
          <div>
            <strong>Analisis belum dapat dijalankan.</strong>
            <div>{aiError}</div>
          </div>
        </div>
      )}

      {/* AI Analysis Progress Bar */}
      {aiLoading && (
        <AiProgressBar
          aiLoading={aiLoading}
          framework={currentFw}
          sampleSize={aiSampleSize}
        />
      )}

      {/* Empty state when no analysis done yet for this framework */}
      {!hasMatchingAnalysis && !aiLoading && (
        <div className="empty-state-box">
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: `${currentFw.color}15`,
              color: currentFw.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {React.createElement(currentFw.icon, { size: 28 })}
          </div>
          <h4>Belum ada hasil analisis</h4>
          <p style={{ maxWidth: "640px", margin: "0 auto 16px" }}>
            {currentFw.desc}
            <br />
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                marginTop: "6px",
                display: "inline-block",
              }}
            >
              <strong>Landasan Teori:</strong> {currentFw.theory}
            </span>
          </p>
          <button
            className="btn btn-scrape-primary"
            onClick={runAiAnalysis}
            disabled={!selectedFile}
            style={{ height: "40px", padding: "0 20px", margin: "0 auto" }}
          >
            <Sparkles size={16} />
            Mulai analisis
          </button>
        </div>
      )}

      {/* AI Analysis Content View */}
      {hasMatchingAnalysis && !aiLoading && (
        <div>
          {/* 1. Context Banner (Perspective-Specific) */}
          <div className="ai-context-banner">
            <div className="analysis-context-heading">
              <Lightbulb size={18} />
              <strong>
                Konteks Analisis: {activeResultFw.title} ({activeResultFw.badge}
                )
              </strong>
            </div>

            <div className="ai-context-grid">
              {resultType === "public_sentiment" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Isu Utama / Topik yang Memicu Reaksi
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.issue_premise || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Tokoh / Instansi / Brand Terkait
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#1E40AF" }}
                    >
                      {aiAnalysis.result.context_summary
                        ?.public_entity_or_brand || "Tidak Terdeteksi"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Tingkat Ancaman Krisis PR
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#DC2626" }}
                    >
                      {aiAnalysis.result.context_summary?.crisis_threat_level ||
                        "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "consumer_behavior" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Produk / Merek yang Dibicarakan
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#059669" }}
                    >
                      {aiAnalysis.result.context_summary?.product_or_brand ||
                        "Tidak Terdeteksi"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Persepsi Nilai Manfaat (Value Proposition)
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.value_proposition_perceived || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Daya Tarik Pasar & Segmen Audiens
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.market_appeal_summary || "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "digital_discourse" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Situasi Interaksi Komunikasi
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.communicative_situation || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Topik Wacana Sentral
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#7C3AED" }}
                    >
                      {aiAnalysis.result.context_summary?.discourse_topic ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Iklim Komunikasi Warganet
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.communication_climate || "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "social_psychology" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Stimulus Sosial / Pemicu Perilaku
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.social_stimulus ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Fenomena Massa Teramati
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#DB2777" }}
                    >
                      {aiAnalysis.result.context_summary
                        ?.social_phenomenon_observed || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Ketegangan Psikologis Penonton
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.psychological_tension || "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "entman_framing" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Isu Sentral yang Dibingkai
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.framing_overview?.central_issue || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Frame Dominan Publik
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#0D9488" }}
                    >
                      {aiAnalysis.result.framing_overview
                        ?.dominant_frame_name || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Intensitas Pembingkaian
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.framing_overview?.framing_intensity ||
                        "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "political_communication" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Isu / Figur Politik Diperdebatkan
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#DC2626" }}
                    >
                      {aiAnalysis.result.context_summary?.political_issue ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Tingkat Polarisasi Opini
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.polarization_level ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Narasi Partisan Dominan
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.dominant_narrative ||
                        "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "audience_reception" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Pesan yang Di-encode Kreator
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.encoded_message ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Kecenderungan Resepsi Khalayak
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#D97706" }}
                    >
                      {aiAnalysis.result.context_summary
                        ?.dominant_reception_trend || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Konteks Sosial Budaya Audiens
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.cultural_context ||
                        "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "parasocial_culture" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Persona Kreator / Figur Publik
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#8B5CF6" }}
                    >
                      {aiAnalysis.result.context_summary?.creator_persona ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Tingkat Keakraban Semu (Parasosial)
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.parasocial_closeness_level || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Dinamika Komunitas Penggemar
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.fandom_dynamic || "-"}
                    </div>
                  </div>
                </>
              ) : resultType === "public_policy" ? (
                <>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Isu Kebijakan / Layanan Publik
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#0284C7" }}
                    >
                      {aiAnalysis.result.context_summary
                        ?.policy_or_service_issue || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Tingkat Keluhan / Aspirasi Warga
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary
                        ?.public_grievance_level || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Kepercayaan Tata Kelola (Governance)
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.trust_in_governance ||
                        "-"}
                    </div>
                  </div>
                </>
              ) : aiAnalysis.result.context_summary?.research_object ? (
                <>
                  {/* Generic: kerangka bidang penelitian tambahan */}
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Objek / Fenomena yang Dianalisis
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#1E40AF" }}
                    >
                      {aiAnalysis.result.context_summary?.research_object ||
                        "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Topik Diskusi Dominan
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.main_topic || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Catatan Kontekstual (
                      {activeResultFw.badge.split("/")[0]?.trim()})
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.context_summary?.analysis_note || "-"}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Default: Emotion-driven marketing */}
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Premis / Cerita yang Dimanfaatkan
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.video_context?.premise || "-"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Produk / Merek yang Dipromosikan
                    </div>
                    <div
                      className="ai-context-item-value"
                      style={{ fontWeight: 700, color: "#1E40AF" }}
                    >
                      {aiAnalysis.result.video_context?.product_or_brand ||
                        "Tidak Terdeteksi"}
                    </div>
                  </div>
                  <div className="ai-context-item">
                    <div className="ai-context-item-label">
                      Strategi Pemasaran Teridentifikasi
                    </div>
                    <div className="ai-context-item-value">
                      {aiAnalysis.result.video_context
                        ?.marketing_strategy_detected || "-"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Primary 4-Metric Grid (Perspective-Specific) */}
          <div className="stats-grid">
            {resultType === "public_sentiment" ? (
              <>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.reputation_audit?.trust_score_pct}%
                    </div>
                    <div className="stat-label">Skor Kepercayaan Publik</div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {(aiAnalysis.result.sentiment_metrics?.negative_pct ||
                        0) +
                        (aiAnalysis.result.sentiment_metrics?.critical_pct ||
                          0)}
                      %
                    </div>
                    <div className="stat-label">Sentimen Negatif & Kritis</div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <Flame size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.sentiment_metrics
                        ?.dominant_sentiment || "-"}
                    </div>
                    <div className="stat-label">Sentimen Publik Dominan</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "18px" }}>
                      {aiAnalysis.result.context_summary?.crisis_threat_level ||
                        "Sedang"}
                    </div>
                    <div className="stat-label">Tingkat Ancaman Krisis PR</div>
                  </div>
                </div>
              </>
            ) : resultType === "consumer_behavior" ? (
              <>
                <div
                  className="stat-card stat-card-emerald"
                  style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
                >
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: "#059669", color: "#FFF" }}
                  >
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ color: "#065F46" }}>
                      {
                        aiAnalysis.result.purchase_intent_metrics
                          ?.high_intent_pct
                      }
                      %
                    </div>
                    <div className="stat-label">
                      Minat Beli Tinggi (High Intent)
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.consumer_perception
                        ?.perceived_quality || "-"}
                    </div>
                    <div className="stat-label">Persepsi Kualitas Produk</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.consumer_perception
                        ?.price_fairness_perception || "-"}
                    </div>
                    <div className="stat-label">Persepsi Kewajaran Harga</div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.purchase_intent_metrics
                        ?.purchase_intent_verdict || "-"}
                    </div>
                    <div className="stat-label">Kesimpulan Potensi Pasar</div>
                  </div>
                </div>
              </>
            ) : resultType === "digital_discourse" ? (
              <>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {
                        aiAnalysis.result.politeness_and_tone
                          ?.polite_constructive_pct
                      }
                      %
                    </div>
                    <div className="stat-label">
                      Tuturan Santun & Konstruktif
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Flame size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {(aiAnalysis.result.politeness_and_tone
                        ?.sarcastic_satirical_pct || 0) +
                        (aiAnalysis.result.politeness_and_tone
                          ?.aggressive_toxic_pct || 0)}
                      %
                    </div>
                    <div className="stat-label">Sarkasme & Tuturan Keras</div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.politeness_and_tone?.dominant_tone ||
                        "-"}
                    </div>
                    <div className="stat-label">Nada Tutur Dominan</div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.linguistic_features
                        ?.netiquette_compliance_level || "-"}
                    </div>
                    <div className="stat-label">Kepatuhan Netiket Warganet</div>
                  </div>
                </div>
              </>
            ) : resultType === "social_psychology" ? (
              <>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <Flame size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {
                        aiAnalysis.result.psychological_metrics
                          ?.moral_outrage_pct
                      }
                      %
                    </div>
                    <div className="stat-label">Kemarahan Moral Kolektif</div>
                  </div>
                </div>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {
                        aiAnalysis.result.psychological_metrics
                          ?.conformity_bandwagon_pct
                      }
                      %
                    </div>
                    <div className="stat-label">Konformitas (Ikut-ikutan)</div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <Brain size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.psychological_metrics
                        ?.dominant_psychological_state || "-"}
                    </div>
                    <div className="stat-label">Respon Psikologis Massa</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.attribution_and_bias
                        ?.attribution_target || "-"}
                    </div>
                    <div className="stat-label">
                      Arah Atribusi (Menyalahkan)
                    </div>
                  </div>
                </div>
              </>
            ) : resultType === "entman_framing" ? (
              <>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.entman_dimensions?.define_problems
                        ?.problem_aspects?.[0]?.pct || 60}
                      %
                    </div>
                    <div className="stat-label">Define Problems</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.entman_dimensions?.diagnose_causes
                        ?.cause_attributions?.[0]?.pct || 55}
                      %
                    </div>
                    <div className="stat-label">Diagnose Causes</div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.entman_dimensions?.make_moral_judgments
                        ?.moral_evaluations?.[0]?.pct || 65}
                      %
                    </div>
                    <div className="stat-label">Moral Judgment</div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.entman_dimensions?.suggest_remedies
                        ?.remedy_proposals?.[0]?.pct || 50}
                      %
                    </div>
                    <div className="stat-label">Suggest Remedies</div>
                  </div>
                </div>
              </>
            ) : resultType === "political_communication" ? (
              <>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.political_metrics?.pro_stance_pct}%
                    </div>
                    <div className="stat-label">Kubu Pro / Pendukung</div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.political_metrics?.contra_stance_pct}%
                    </div>
                    <div className="stat-label">Kubu Kontra / Penentang</div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "15px" }}>
                      {aiAnalysis.result.political_metrics?.dominant_stance ||
                        "-"}
                    </div>
                    <div className="stat-label">Stance Politik Dominan</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "15px" }}>
                      {aiAnalysis.result.political_metrics
                        ?.echo_chamber_intensity || "Tinggi"}
                    </div>
                    <div className="stat-label">Intensitas Echo Chamber</div>
                  </div>
                </div>
              </>
            ) : resultType === "audience_reception" ? (
              <>
                <div
                  className="stat-card stat-card-emerald"
                  style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
                >
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: "#059669", color: "#FFF" }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ color: "#065F46" }}>
                      {aiAnalysis.result.hall_reception_positions
                        ?.dominant_hegemonic_pct ?? 0}
                      %
                    </div>
                    <div className="stat-label">
                      Dominan-Hegemonik (Menerima)
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.hall_reception_positions
                        ?.negotiated_pct ?? 0}
                      %
                    </div>
                    <div className="stat-label">
                      Posisi Negosiasi (Kompromi)
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.hall_reception_positions
                        ?.oppositional_pct ?? 0}
                      %
                    </div>
                    <div className="stat-label">
                      Posisi Oposisional (Menolak)
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "14px" }}>
                      {aiAnalysis.result.hall_reception_positions
                        ?.reception_verdict || "-"}
                    </div>
                    <div className="stat-label">Kesimpulan Resepsi Audiens</div>
                  </div>
                </div>
              </>
            ) : resultType === "parasocial_culture" ? (
              <>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {
                        aiAnalysis.result.parasocial_metrics
                          ?.parasocial_attachment_pct
                      }
                      %
                    </div>
                    <div className="stat-label">Keterikatan Parasosial</div>
                  </div>
                </div>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.parasocial_metrics?.fandom_loyalty_pct}
                      %
                    </div>
                    <div className="stat-label">Loyalitas Fandom Aktif</div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "15px" }}>
                      {aiAnalysis.result.parasocial_metrics
                        ?.protective_behavior || "Wajar"}
                    </div>
                    <div className="stat-label">Tingkat Sikap Protektif</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "13.5px" }}>
                      {aiAnalysis.result.parasocial_metrics
                        ?.dominant_attachment || "-"}
                    </div>
                    <div className="stat-label">Bentuk Relasi Dominan</div>
                  </div>
                </div>
              </>
            ) : resultType === "public_policy" ? (
              <>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {
                        aiAnalysis.result.policy_sentiment
                          ?.constructive_criticism_pct
                      }
                      %
                    </div>
                    <div className="stat-label">
                      Kritik Konstruktif & Solutif
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.policy_sentiment?.cynical_distrust_pct}
                      %
                    </div>
                    <div className="stat-label">Sinisme / Distrust Warga</div>
                  </div>
                </div>
                <div
                  className="stat-card stat-card-emerald"
                  style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
                >
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: "#059669", color: "#FFF" }}
                  >
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ color: "#065F46" }}>
                      {aiAnalysis.result.policy_sentiment?.supportive_pct}%
                    </div>
                    <div className="stat-label">Mendukung Regulasi</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "14px" }}>
                      {aiAnalysis.result.policy_sentiment?.dominant_stance ||
                        "-"}
                    </div>
                    <div className="stat-label">Sikap Publik Dominan</div>
                  </div>
                </div>
              </>
            ) : aiAnalysis.result.indicator_analysis?.indicators ? (
              <>
                {/* Generic: kerangka bidang penelitian tambahan (indikator teori-spesifik) */}
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.indicator_analysis
                        ?.dominant_indicator || "-"}
                    </div>
                    <div className="stat-label">
                      Dimensi Dominan Menurut Teori
                    </div>
                  </div>
                </div>
                <div
                  className="stat-card stat-card-emerald"
                  style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
                >
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: "#059669", color: "#FFF" }}
                  >
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ color: "#065F46" }}>
                      {aiAnalysis.result.sentiment_distribution?.positive_pct}%
                    </div>
                    <div className="stat-label">Komentar Bernada Positif</div>
                  </div>
                </div>
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.sentiment_distribution?.negative_pct}%
                    </div>
                    <div className="stat-label">Komentar Bernada Negatif</div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "16px" }}>
                      {aiAnalysis.result.sentiment_distribution
                        ?.dominant_sentiment || "-"}
                    </div>
                    <div className="stat-label">Sentimen Dominan</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Default: Emotion-driven marketing */}
                <div className="stat-card stat-card-rose">
                  <div className="stat-icon-wrapper">
                    <Target size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.ad_awareness?.drama_engaged_pct}%
                    </div>
                    <div className="stat-label">Terkecoh / Terhanyut Drama</div>
                  </div>
                </div>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrapper">
                    <Flame size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.ad_awareness?.marketing_aware_pct}%
                    </div>
                    <div className="stat-label">
                      Sadar Iklan / Bongkar Marketing
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-violet">
                  <div className="stat-icon-wrapper">
                    <Brain size={18} />
                  </div>
                  <div>
                    <div className="stat-number" style={{ fontSize: "18px" }}>
                      {aiAnalysis.result.emotion_distribution
                        ?.dominant_emotion || "-"}
                    </div>
                    <div className="stat-label">
                      Emosi Penonton Paling Dominan
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon-wrapper">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="stat-number">
                      {aiAnalysis.result.stance_dynamics?.controversy_level ||
                        "Tinggi"}
                    </div>
                    <div className="stat-label">
                      Tingkat Kontroversi & Debat
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Analytics Charts Grid */}
          <div className="ai-analytics-grid">
            {/* Left Card: Progress Breakdown */}
            <div className="ai-card">
              {resultType === "public_sentiment" ? (
                <>
                  <div className="ai-card-title">
                    <span>Distribusi Sentimen Publik</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#DBEAFE", color: "#1E40AF" }}
                    >
                      Audit Reputasi SCCT
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Positif / Apresiasi
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.sentiment_metrics?.positive_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-green"
                        style={{
                          width: `${aiAnalysis.result.sentiment_metrics?.positive_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Netral / Pengamat
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.sentiment_metrics?.neutral_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-gray"
                        style={{
                          width: `${aiAnalysis.result.sentiment_metrics?.neutral_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Negatif / Kecewa
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.sentiment_metrics?.negative_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-amber"
                        style={{
                          width: `${aiAnalysis.result.sentiment_metrics?.negative_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Kritis & Menuntut Pertanggungjawaban
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.sentiment_metrics?.critical_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.sentiment_metrics?.critical_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {aiAnalysis.result.reputation_audit?.key_grievances?.length >
                    0 && (
                    <div
                      style={{
                        marginTop: "14px",
                        fontSize: "12px",
                        background: "#FEF2F2",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #FECACA",
                      }}
                    >
                      <strong style={{ color: "#DC2626" }}>
                        Poin Kekecewaan Publik Terbesar:
                      </strong>
                      <ul
                        style={{
                          paddingLeft: "18px",
                          marginTop: "4px",
                          color: "#991B1B",
                        }}
                      >
                        {aiAnalysis.result.reputation_audit.key_grievances.map(
                          (g, i) => (
                            <li key={i}>{g}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </>
              ) : resultType === "consumer_behavior" ? (
                <>
                  <div className="ai-card-title">
                    <span>Intensi Pembelian Konsumen (TPB)</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      E-Commerce & Perilaku
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Minat Beli Tinggi (Siap Checkout)
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.purchase_intent_metrics
                            ?.high_intent_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-green"
                        style={{
                          width: `${aiAnalysis.result.purchase_intent_metrics?.high_intent_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Tertarik / Penasaran Detail
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.purchase_intent_metrics
                            ?.moderate_curious_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.purchase_intent_metrics?.moderate_curious_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Skeptis Terhadap Harga
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.purchase_intent_metrics
                            ?.price_skeptic_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-amber"
                        style={{
                          width: `${aiAnalysis.result.purchase_intent_metrics?.price_skeptic_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Menolak / Tidak Berminat
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.purchase_intent_metrics
                            ?.resistant_uninterested_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.purchase_intent_metrics?.resistant_uninterested_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {aiAnalysis.result.consumer_perception
                    ?.primary_purchase_barriers?.length > 0 && (
                    <div
                      style={{
                        marginTop: "14px",
                        fontSize: "12px",
                        background: "#FFFBEB",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <strong style={{ color: "#B45309" }}>
                        Hambatan Konversi Pembeli:
                      </strong>
                      <ul
                        style={{
                          paddingLeft: "18px",
                          marginTop: "4px",
                          color: "#92400E",
                        }}
                      >
                        {aiAnalysis.result.consumer_perception.primary_purchase_barriers.map(
                          (b, i) => (
                            <li key={i}>{b}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </>
              ) : resultType === "digital_discourse" ? (
                <>
                  <div className="ai-card-title">
                    <span>Tingkat Kesantunan Bahasa (Politeness)</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#EDE9FE", color: "#7C3AED" }}
                    >
                      Brown & Levinson Model
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Santun, Hormat & Konstruktif
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.politeness_and_tone
                            ?.polite_constructive_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-green"
                        style={{
                          width: `${aiAnalysis.result.politeness_and_tone?.polite_constructive_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Netral / Informatif Santai
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.politeness_and_tone
                            ?.neutral_informative_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.politeness_and_tone?.neutral_informative_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Sarkasme, Ironi & Sindiran
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.politeness_and_tone
                            ?.sarcastic_satirical_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-purple"
                        style={{
                          width: `${aiAnalysis.result.politeness_and_tone?.sarcastic_satirical_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Agresif / Menyerang (Toxic)
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.politeness_and_tone
                            ?.aggressive_toxic_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.politeness_and_tone?.aggressive_toxic_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {aiAnalysis.result.linguistic_features
                    ?.prominent_slang_and_jargon?.length > 0 && (
                    <div
                      style={{
                        marginTop: "14px",
                        fontSize: "12px",
                        background: "#F5F3FF",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #DDD6FE",
                      }}
                    >
                      <strong style={{ color: "#6D28D9" }}>
                        Slang & Kosakata Dominan Netizen:
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginTop: "6px",
                        }}
                      >
                        {aiAnalysis.result.linguistic_features.prominent_slang_and_jargon.map(
                          (s, i) => (
                            <span
                              key={i}
                              style={{
                                background: "#EDE9FE",
                                color: "#5B21B6",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              {s}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : resultType === "social_psychology" ? (
                <>
                  <div className="ai-card-title">
                    <span>Reaksi Psikologis & Dinamika Kelompok</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#FCE7F3", color: "#BE185D" }}
                    >
                      Social Identity & Morality
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Kemarahan Moral Kolektif (Outrage)
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.psychological_metrics
                            ?.moral_outrage_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.psychological_metrics?.moral_outrage_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Konformitas (Efek Ikut-ikutan)
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.psychological_metrics
                            ?.conformity_bandwagon_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-amber"
                        style={{
                          width: `${aiAnalysis.result.psychological_metrics?.conformity_bandwagon_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Empati & Solidaritas Sosial
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.psychological_metrics
                            ?.social_empathy_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.psychological_metrics?.social_empathy_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Apati / Ketidakpedulian
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.psychological_metrics
                            ?.apathy_detachment_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-gray"
                        style={{
                          width: `${aiAnalysis.result.psychological_metrics?.apathy_detachment_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {aiAnalysis.result.attribution_and_bias
                    ?.cognitive_bias_detected && (
                    <div
                      style={{
                        marginTop: "14px",
                        fontSize: "12px",
                        background: "#FDF2F8",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #FBCFE8",
                      }}
                    >
                      <strong style={{ color: "#BE185D" }}>
                        Bias Kognitif Teridentifikasi:
                      </strong>
                      <p style={{ margin: "4px 0 0", color: "#9D174D" }}>
                        {
                          aiAnalysis.result.attribution_and_bias
                            .cognitive_bias_detected
                        }
                      </p>
                    </div>
                  )}
                </>
              ) : resultType === "political_communication" ? (
                <>
                  <div className="ai-card-title">
                    <span>Distribusi Sikap & Polarisasi Politik</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#FEE2E2", color: "#DC2626" }}
                    >
                      Selective Exposure & Echo Chamber
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Kubu Pro / Pendukung Narasi
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.political_metrics?.pro_stance_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.political_metrics?.pro_stance_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Kubu Kontra / Penentang Narasi
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.political_metrics?.contra_stance_pct}
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.political_metrics?.contra_stance_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Netral / Skeptis Golput
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.political_metrics
                            ?.neutral_skeptical_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-gray"
                        style={{
                          width: `${aiAnalysis.result.political_metrics?.neutral_skeptical_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {aiAnalysis.result.political_metrics
                    ?.echo_chamber_intensity && (
                    <div
                      style={{
                        marginTop: "14px",
                        fontSize: "12px",
                        background: "#FEF2F2",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #FECACA",
                      }}
                    >
                      <strong style={{ color: "#DC2626" }}>
                        Indikasi Echo Chamber:
                      </strong>
                      <p style={{ margin: "4px 0 0", color: "#991B1B" }}>
                        {
                          aiAnalysis.result.political_metrics
                            .echo_chamber_intensity
                        }
                      </p>
                    </div>
                  )}
                </>
              ) : resultType === "audience_reception" ? (
                <>
                  <div className="ai-card-title">
                    <span>Tiga Posisi Pembacaan Stuart Hall (1973)</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#FEF3C7", color: "#D97706" }}
                    >
                      Encoding / Decoding Model
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Dominan-Hegemonik (Menerima Pesan)
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.hall_reception_positions
                          ?.dominant_hegemonic_pct ?? 0}
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-green"
                        style={{
                          width: `${aiAnalysis.result.hall_reception_positions?.dominant_hegemonic_pct ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Posisi Negosiasi (Kompromi / Syarat)
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.hall_reception_positions
                          ?.negotiated_pct ?? 0}
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-amber"
                        style={{
                          width: `${aiAnalysis.result.hall_reception_positions?.negotiated_pct ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Posisi Oposisional (Mendekonstruksi/Menolak)
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.hall_reception_positions
                          ?.oppositional_pct ?? 0}
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.hall_reception_positions?.oppositional_pct ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      background: "#FFFBEB",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    <strong style={{ color: "#B45309" }}>
                      Kesimpulan Dekoding:
                    </strong>{" "}
                    {
                      aiAnalysis.result.hall_reception_positions
                        ?.reception_verdict
                    }
                  </div>
                </>
              ) : resultType === "parasocial_culture" ? (
                <>
                  <div className="ai-card-title">
                    <span>Derajat Keterikatan Parasosial & Fandom</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#EDE9FE", color: "#7C3AED" }}
                    >
                      Horton & Wohl / Jenkins (1992)
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Ikatan Afektif Parasosial
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.parasocial_metrics
                            ?.parasocial_attachment_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-purple"
                        style={{
                          width: `${aiAnalysis.result.parasocial_metrics?.parasocial_attachment_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Loyalitas Fandom Komunitas
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.parasocial_metrics
                            ?.fandom_loyalty_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.parasocial_metrics?.fandom_loyalty_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Pengamat Kasual / Kritis Lepas
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.parasocial_metrics
                            ?.critical_detachment_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-gray"
                        style={{
                          width: `${aiAnalysis.result.parasocial_metrics?.critical_detachment_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "12px",
                      background: "#F5F3FF",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #DDD6FE",
                    }}
                  >
                    <strong style={{ color: "#6D28D9" }}>
                      Karakter Relasi Parasosial:
                    </strong>
                    <p style={{ margin: "4px 0 0", color: "#5B21B6" }}>
                      {
                        aiAnalysis.result.parasocial_metrics
                          ?.dominant_attachment
                      }
                    </p>
                  </div>
                </>
              ) : resultType === "public_policy" ? (
                <>
                  <div className="ai-card-title">
                    <span>Sentimen Aspirasi & Kebijakan Publik</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#E0F2FE", color: "#0369A1" }}
                    >
                      Deliberative Democracy & Akuntabilitas
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Kritik Konstruktif & Tuntutan Layanan
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.policy_sentiment
                            ?.constructive_criticism_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.policy_sentiment?.constructive_criticism_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Sinisme & Krisis Kepercayaan
                      </span>
                      <span className="progress-stat-pct">
                        {
                          aiAnalysis.result.policy_sentiment
                            ?.cynical_distrust_pct
                        }
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.policy_sentiment?.cynical_distrust_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Mendukung / Apresiasi Kebijakan
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.policy_sentiment?.supportive_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-green"
                        style={{
                          width: `${aiAnalysis.result.policy_sentiment?.supportive_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "12px",
                      background: "#F0F9FF",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #BAE6FD",
                    }}
                  >
                    <strong style={{ color: "#0369A1" }}>
                      Sikap Kolektif Warga:
                    </strong>
                    <p style={{ margin: "4px 0 0", color: "#075985" }}>
                      {aiAnalysis.result.policy_sentiment?.dominant_stance}
                    </p>
                  </div>
                </>
              ) : aiAnalysis.result.indicator_analysis?.indicators ? (
                <>
                  {/* Generic: distribusi indikator teori-spesifik kerangka bidang penelitian */}
                  <div className="ai-card-title">
                    <span>Distribusi Dimensi / Indikator Analisis</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#EDE9FE", color: "#6D28D9" }}
                    >
                      {activeResultFw.badge.split("/")[0]?.trim() ||
                        "Klasifikasi Teori"}
                    </span>
                  </div>

                  {(aiAnalysis.result.indicator_analysis.indicators || []).map(
                    (ind, idx) => (
                      <div className="progress-stat-row" key={ind.name || idx}>
                        <div className="progress-stat-header">
                          <span className="progress-stat-name">{ind.name}</span>
                          <span className="progress-stat-pct">{ind.pct}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${idx % 4 === 0 ? "fill-blue" : idx % 4 === 1 ? "fill-rose" : idx % 4 === 2 ? "fill-purple" : "fill-amber"}`}
                            style={{ width: `${ind.pct || 0}%` }}
                          />
                        </div>
                        {ind.sample_quote && (
                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: "11.5px",
                              color: "var(--color-text-muted)",
                              fontStyle: "italic",
                            }}
                          >
                            "{ind.sample_quote}"
                          </p>
                        )}
                      </div>
                    ),
                  )}

                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "12px",
                      background: "#F5F3FF",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #DDD6FE",
                    }}
                  >
                    <strong style={{ color: "#6D28D9" }}>
                      Insight Dimensi Dominan:
                    </strong>
                    <p style={{ margin: "4px 0 0", color: "#5B21B6" }}>
                      {
                        aiAnalysis.result.indicator_analysis
                          ?.dominant_explanation
                      }
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Default: Emotion-driven marketing */}
                  <div className="ai-card-title">
                    <span>Klasifikasi Emosi Penonton (RQ1)</span>
                    <span
                      className="ai-card-badge"
                      style={{ background: "#EDE9FE", color: "#7C3AED" }}
                    >
                      Model Ekman / Plutchik
                    </span>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Kemarahan / Outrage
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.emotion_distribution?.anger_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-rose"
                        style={{
                          width: `${aiAnalysis.result.emotion_distribution?.anger_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Rasa Iba / Simpati / Empati
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.emotion_distribution?.sympathy_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-blue"
                        style={{
                          width: `${aiAnalysis.result.emotion_distribution?.sympathy_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Skeptis / Curiga Settingan
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.emotion_distribution?.skepticism_pct}
                        %
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-amber"
                        style={{
                          width: `${aiAnalysis.result.emotion_distribution?.skepticism_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Ejekan / Sarkasme
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.emotion_distribution?.sarcasm_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-purple"
                        style={{
                          width: `${aiAnalysis.result.emotion_distribution?.sarcasm_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-stat-row">
                    <div className="progress-stat-header">
                      <span className="progress-stat-name">
                        Netral / Lainnya
                      </span>
                      <span className="progress-stat-pct">
                        {aiAnalysis.result.emotion_distribution?.neutral_pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-gray"
                        style={{
                          width: `${aiAnalysis.result.emotion_distribution?.neutral_pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      background: "#F9FAFB",
                      padding: "10px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <strong>Insight Emosi:</strong>{" "}
                    {
                      aiAnalysis.result.emotion_distribution
                        ?.dominant_emotion_explanation
                    }
                  </div>
                </>
              )}
            </div>

            {/* Right Card: Stance Dynamics & Perspective-Specific Synthesis */}
            <div className="ai-card">
              <div className="ai-card-title">
                <span>Polarisasi & Stance Dynamics</span>
                <span
                  className="ai-card-badge"
                  style={{ background: "#FEF3C7", color: "#D97706" }}
                >
                  Dinamika Kubu
                </span>
              </div>

              {/* Stance Dual Meter */}
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Dua Kubu Utama yang Terbelah di Komentar:
              </div>

              <div className="stance-meter-container">
                <div className="stance-meter-bar">
                  <div
                    className="stance-side-a"
                    style={{
                      width: `${aiAnalysis.result.stance_dynamics?.side_a_pct || 45}%`,
                    }}
                    title={aiAnalysis.result.stance_dynamics?.side_a_name}
                  >
                    {aiAnalysis.result.stance_dynamics?.side_a_pct}%
                  </div>
                  <div
                    className="stance-side-b"
                    style={{
                      width: `${aiAnalysis.result.stance_dynamics?.side_b_pct || 40}%`,
                    }}
                    title={aiAnalysis.result.stance_dynamics?.side_b_name}
                  >
                    {aiAnalysis.result.stance_dynamics?.side_b_pct}%
                  </div>
                  <div
                    className="stance-side-neutral"
                    style={{
                      width: `${aiAnalysis.result.stance_dynamics?.neutral_pct || 15}%`,
                    }}
                    title="Netral"
                  >
                    {aiAnalysis.result.stance_dynamics?.neutral_pct}%
                  </div>
                </div>

                <div className="stance-legend-row">
                  <span style={{ color: "#2563EB", fontWeight: 600 }}>
                    ● {aiAnalysis.result.stance_dynamics?.side_a_name}
                  </span>
                  <span style={{ color: "#DC2626", fontWeight: 600 }}>
                    ● {aiAnalysis.result.stance_dynamics?.side_b_name}
                  </span>
                  <span style={{ color: "#6B7280" }}>● Netral</span>
                </div>
              </div>

              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--color-text-secondary)",
                  lineHeight: "1.5",
                  marginTop: "12px",
                }}
              >
                {aiAnalysis.result.stance_dynamics?.polarization_summary}
              </p>

              {/* Perspective-Specific Bottom Evaluation */}
              {resultType === "public_sentiment" &&
                aiAnalysis.result.pr_crisis_recommendations && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1E40AF",
                        marginBottom: "4px",
                      }}
                    >
                      Rekomendasi Respons Krisis PR:
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.5",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>Strategi Disarankan:</strong>{" "}
                      {
                        aiAnalysis.result.pr_crisis_recommendations
                          .recommended_response_strategy
                      }
                    </p>
                    {aiAnalysis.result.pr_crisis_recommendations
                      .holding_statement_draft && (
                      <div
                        style={{
                          background: "#F8FAFC",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontStyle: "italic",
                          borderLeft: "3px solid #3B82F6",
                        }}
                      >
                        "
                        {
                          aiAnalysis.result.pr_crisis_recommendations
                            .holding_statement_draft
                        }
                        "
                      </div>
                    )}
                  </div>
                )}

              {resultType === "consumer_behavior" &&
                aiAnalysis.result.ewom_dynamics && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#059669",
                        marginBottom: "4px",
                      }}
                    >
                      Dinamika eWOM (Word of Mouth):
                    </div>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      {aiAnalysis.result.ewom_dynamics.ewom_influence_summary}
                    </p>
                  </div>
                )}

              {resultType === "digital_discourse" &&
                aiAnalysis.result.linguistic_features && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#7C3AED",
                        marginBottom: "4px",
                      }}
                    >
                      Gaya Bahasa & Risiko Flaming:
                    </div>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      Gaya Utama:{" "}
                      <strong>
                        {
                          aiAnalysis.result.linguistic_features
                            .rhetorical_devices_used
                        }
                      </strong>{" "}
                      • Risiko Cyberbullying:{" "}
                      <strong>
                        {
                          aiAnalysis.result.linguistic_features
                            .flaming_and_cyberbullying_risk
                        }
                      </strong>
                    </p>
                  </div>
                )}

              {resultType === "social_psychology" &&
                aiAnalysis.result.attribution_and_bias && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#DB2777",
                        marginBottom: "4px",
                      }}
                    >
                      Pertimbangan Moralitas Kelompok:
                    </div>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      {
                        aiAnalysis.result.attribution_and_bias
                          .moral_judgment_summary
                      }
                    </p>
                  </div>
                )}

              {resultType === "emotion_marketing" &&
                aiAnalysis.result.ad_awareness && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        marginBottom: "4px",
                      }}
                    >
                      Evaluasi Ad-Awareness:
                    </div>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      {aiAnalysis.result.ad_awareness.analysis}
                    </p>
                  </div>
                )}

              {resultType === "political_communication" && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#DC2626",
                      marginBottom: "4px",
                    }}
                  >
                    Dinamika Komunikasi Politik:
                  </div>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    {aiAnalysis.result.political_metrics?.echo_chamber_intensity
                      ? `Indikasi Echo Chamber: ${aiAnalysis.result.political_metrics.echo_chamber_intensity}. `
                      : ""}
                    Dinamika pembelahan opini partisipan mencerminkan polarisasi
                    identitas politik dalam ruang publik digital.
                  </p>
                </div>
              )}

              {resultType === "audience_reception" && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#D97706",
                      marginBottom: "4px",
                    }}
                  >
                    Analisis Dekoding Khalayak (Stuart Hall):
                  </div>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    {aiAnalysis.result.hall_reception_positions
                      ?.reception_verdict
                      ? `Kesimpulan: ${aiAnalysis.result.hall_reception_positions.reception_verdict}. `
                      : ""}
                    Pola pembacaan menunjukkan bagaimana audiens aktif
                    menegosiasikan atau mengkritisi pesan dominan pembuat
                    konten.
                  </p>
                </div>
              )}

              {resultType === "parasocial_culture" && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#8B5CF6",
                      marginBottom: "4px",
                    }}
                  >
                    Dinamika Relasi Parasosial & Fandom:
                  </div>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    {aiAnalysis.result.parasocial_metrics?.dominant_attachment
                      ? `Karakter Relasi: ${aiAnalysis.result.parasocial_metrics.dominant_attachment}. `
                      : ""}
                    Kedekatan semu mendorong keterlibatan emosional tinggi dan
                    kecenderungan loyalitas protektif dalam pembelaan citra
                    figur publik.
                  </p>
                </div>
              )}

              {resultType === "public_policy" && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0284C7",
                      marginBottom: "4px",
                    }}
                  >
                    Evaluasi Respons Kebijakan Publik:
                  </div>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    {aiAnalysis.result.policy_sentiment?.dominant_stance
                      ? `Sikap Warga: ${aiAnalysis.result.policy_sentiment.dominant_stance}. `
                      : ""}
                    Kritik dan aspirasi warganet mencerminkan ekspektasi
                    transparansi dan kebutuhan reformasi layanan publik.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Entman Framing 4 Quadrant Display (Khusus S2 Ilmu Komunikasi) */}
          {resultType === "entman_framing" &&
            aiAnalysis.result.entman_dimensions && (
              <div className="ai-card" style={{ marginBottom: "22px" }}>
                <div className="ai-card-title">
                  <span>Matriks 4 Dimensi Framing Robert Entman (1993)</span>
                  <span
                    className="ai-card-badge"
                    style={{ background: "#CCFBF1", color: "#0F766E" }}
                  >
                    Model Analisis Tesis S2
                  </span>
                </div>

                <div className="entman-quadrant-grid">
                  {/* 1. Define Problems */}
                  <div className="entman-quadrant-card q-problem">
                    <div className="quadrant-head">
                      <span className="quadrant-badge">1. Define Problems</span>
                      <span
                        className="stat-pill-sm"
                        style={{ background: "#E0F2FE", color: "#0369A1" }}
                      >
                        Masalah
                      </span>
                    </div>
                    <div className="quadrant-main-highlight">
                      <strong>Definisi Dominan:</strong>
                      {
                        aiAnalysis.result.entman_dimensions.define_problems
                          ?.dominant_definition
                      }
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.4",
                      }}
                    >
                      {
                        aiAnalysis.result.entman_dimensions.define_problems
                          ?.explanation
                      }
                    </p>
                    <div className="quadrant-items-list">
                      {(
                        aiAnalysis.result.entman_dimensions.define_problems
                          ?.problem_aspects || []
                      ).map((item, idx) => (
                        <div key={idx} className="quadrant-sub-item">
                          <div className="quadrant-sub-item-header">
                            <span>{item.aspect}</span>
                            <span>{item.pct}%</span>
                          </div>
                          {item.sample_quote && (
                            <span className="quadrant-quote">
                              "{item.sample_quote}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Diagnose Causes */}
                  <div className="entman-quadrant-card q-cause">
                    <div className="quadrant-head">
                      <span className="quadrant-badge">2. Diagnose Causes</span>
                      <span
                        className="stat-pill-sm"
                        style={{ background: "#FEF3C7", color: "#B45309" }}
                      >
                        Penyebab
                      </span>
                    </div>
                    <div className="quadrant-main-highlight">
                      <strong>Aktor / Faktor Kunci:</strong>
                      {
                        aiAnalysis.result.entman_dimensions.diagnose_causes
                          ?.primary_culprit
                      }
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.4",
                      }}
                    >
                      {
                        aiAnalysis.result.entman_dimensions.diagnose_causes
                          ?.explanation
                      }
                    </p>
                    <div className="quadrant-items-list">
                      {(
                        aiAnalysis.result.entman_dimensions.diagnose_causes
                          ?.cause_attributions || []
                      ).map((item, idx) => (
                        <div key={idx} className="quadrant-sub-item">
                          <div className="quadrant-sub-item-header">
                            <span>{item.cause}</span>
                            <span>{item.pct}%</span>
                          </div>
                          {item.sample_quote && (
                            <span className="quadrant-quote">
                              "{item.sample_quote}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Make Moral Judgments */}
                  <div className="entman-quadrant-card q-moral">
                    <div className="quadrant-head">
                      <span className="quadrant-badge">
                        3. Make Moral Judgments
                      </span>
                      <span
                        className="stat-pill-sm"
                        style={{ background: "#FFE4E6", color: "#BE123C" }}
                      >
                        Sikap Moral
                      </span>
                    </div>
                    <div className="quadrant-main-highlight">
                      <strong>Penilaian Moral:</strong>
                      {
                        aiAnalysis.result.entman_dimensions.make_moral_judgments
                          ?.moral_verdict
                      }
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.4",
                      }}
                    >
                      {
                        aiAnalysis.result.entman_dimensions.make_moral_judgments
                          ?.explanation
                      }
                    </p>
                    <div className="quadrant-items-list">
                      {(
                        aiAnalysis.result.entman_dimensions.make_moral_judgments
                          ?.moral_evaluations || []
                      ).map((item, idx) => (
                        <div key={idx} className="quadrant-sub-item">
                          <div className="quadrant-sub-item-header">
                            <span>{item.judgment}</span>
                            <span>{item.pct}%</span>
                          </div>
                          {item.sample_quote && (
                            <span className="quadrant-quote">
                              "{item.sample_quote}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Suggest Remedies */}
                  <div className="entman-quadrant-card q-remedy">
                    <div className="quadrant-head">
                      <span className="quadrant-badge">
                        4. Suggest Remedies
                      </span>
                      <span
                        className="stat-pill-sm"
                        style={{ background: "#DCFCE7", color: "#15803D" }}
                      >
                        Solusi
                      </span>
                    </div>
                    <div className="quadrant-main-highlight">
                      <strong>Tuntutan Utama:</strong>
                      {
                        aiAnalysis.result.entman_dimensions.suggest_remedies
                          ?.dominant_remedy
                      }
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        lineHeight: "1.4",
                      }}
                    >
                      {
                        aiAnalysis.result.entman_dimensions.suggest_remedies
                          ?.explanation
                      }
                    </p>
                    <div className="quadrant-items-list">
                      {(
                        aiAnalysis.result.entman_dimensions.suggest_remedies
                          ?.remedy_proposals || []
                      ).map((item, idx) => (
                        <div key={idx} className="quadrant-sub-item">
                          <div className="quadrant-sub-item-header">
                            <span>{item.proposal}</span>
                            <span>{item.pct}%</span>
                          </div>
                          {item.sample_quote && (
                            <span className="quadrant-quote">
                              "{item.sample_quote}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {aiAnalysis.result.counter_frames?.has_counter_frame && (
                  <div className="entman-counter-frame-card">
                    <div className="counter-frame-head">
                      <span>
                        Frame Tandingan (Counter-Frame):{" "}
                        {aiAnalysis.result.counter_frames.counter_frame_name} (
                        {aiAnalysis.result.counter_frames.counter_frame_pct}%)
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "#92400e",
                        lineHeight: "1.45",
                      }}
                    >
                      {aiAnalysis.result.counter_frames.counter_frame_argument}
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* 4. Topic Clusters */}
          <div className="ai-card" style={{ marginBottom: "22px" }}>
            <div className="ai-card-title">
              <span>Klaster Topik Pembicaraan Netizen (Topic Modeling)</span>
              <span
                className="ai-card-badge"
                style={{ background: "#DBEAFE", color: "#1E40AF" }}
              >
                {aiAnalysis.result.topic_clusters?.length || 0} Klaster
                Ditemukan
              </span>
            </div>

            <div className="topic-clusters-grid">
              {(aiAnalysis.result.topic_clusters || []).map((cluster, idx) => (
                <div key={idx} className="topic-cluster-item">
                  <div>
                    <div className="topic-cluster-header">
                      <span className="topic-cluster-name">
                        {cluster.topic_name}
                      </span>
                      <span className="topic-cluster-pct">{cluster.pct}%</span>
                    </div>
                    <p className="topic-cluster-desc">{cluster.description}</p>
                  </div>
                  {cluster.sample_quote && (
                    <div className="topic-quote-bubble">
                      "{cluster.sample_quote}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Academic Synthesis Card (Ready for Skripsi Chapter 4) */}
          <div className="thesis-synthesis-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Sparkles size={20} color="var(--color-primary)" />
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Sintesis Analisis Akademik (Draf Bab 4 Skripsi -{" "}
                  {activeResultFw.title})
                </h3>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn btn-white-bordered"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={() =>
                    copyThesisParagraph(
                      aiAnalysis.result.academic_insights
                        ?.thesis_summary_paragraph,
                    )
                  }
                >
                  {copiedThesisText ? (
                    <>
                      <Check size={14} color="#16A34A" />
                      <span style={{ color: "#16A34A" }}>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Salin Paragraf Skripsi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verdict Tag & Theoretical Grounding */}
            <div
              style={{
                margin: "10px 0",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {aiAnalysis.result.academic_insights?.brand_hijack_verdict && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  {aiAnalysis.result.academic_insights.brand_hijack_verdict}
                </span>
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                }}
              >
                Relevansi Teori:{" "}
                <strong>
                  {aiAnalysis.result.academic_insights?.theoretical_relevance ||
                    activeResultFw.theory}
                </strong>
              </span>
            </div>

            {/* Bullet Points */}
            <ul className="thesis-findings-list">
              {(aiAnalysis.result.academic_insights?.key_findings || []).map(
                (finding, idx) => (
                  <li key={idx} className="thesis-finding-item">
                    <CheckCircle2
                      size={16}
                      color="#2563EB"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span>{finding}</span>
                  </li>
                ),
              )}
            </ul>

            {/* Paragraph */}
            <div className="thesis-paragraph-box">
              {aiAnalysis.result.academic_insights?.thesis_summary_paragraph}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
