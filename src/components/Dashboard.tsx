import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  Heart, 
  Grid, 
  History, 
  ChevronRight 
} from 'lucide-react';
import { BirthdayPage, VisibilityType } from '../types';
import { createBirthdayPage, getCreatorBirthdayPages, deleteBirthdayPageDocument } from '../lib/db';
import { generateAIWish } from '../lib/ai';
import { motion, AnimatePresence } from 'motion/react';
import { THEMES, formatBirthdayDate } from './ThemeConfig';
import CapsuleView from './CapsuleView';

export const ENVELOPE_THEME_STYLES: { [key: string]: {
  bg: string;
  borderColor: string;
  sealBg: string;
  sealColor: string;
  sealBorder: string;
  titleColor: string;
  descColor: string;
  decorations: React.ReactNode;
}} = {
  minimalist: {
    bg: "bg-slate-100 border-slate-250 text-slate-900",
    borderColor: "rgba(148, 163, 184, 0.4)",
    sealBg: "bg-slate-900",
    sealColor: "text-slate-100",
    sealBorder: "border-slate-700",
    titleColor: "text-slate-950",
    descColor: "text-slate-500",
    decorations: (
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)",
        backgroundSize: "20px 20px"
      }} />
    )
  },
  galaxy: {
    bg: "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-indigo-100",
    borderColor: "rgba(129, 140, 248, 0.45)",
    sealBg: "bg-indigo-600",
    sealColor: "text-yellow-250",
    sealBorder: "border-indigo-400",
    titleColor: "text-white",
    descColor: "text-indigo-200/85",
    decorations: (
      <>
        <div className="absolute top-4 left-10 w-2.5 h-2.5 rounded-full bg-indigo-400 opacity-70 animate-pulse" />
        <div className="absolute bottom-6 right-12 w-3 h-3 rounded-full bg-purple-300 opacity-70 animate-bounce" />
        <div className="absolute top-1/2 right-4 w-1.5 h-1.5 rounded-full bg-indigo-300 opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-64 h-64 border border-indigo-400 rounded-full absolute -top-12 -left-12 animate-spin" style={{ animationDuration: '40s' }} />
        </div>
      </>
    )
  },
  romantic: {
    bg: "bg-gradient-to-br from-rose-500 via-pink-600 to-amber-500 text-white",
    borderColor: "rgba(251, 113, 133, 0.5)",
    sealBg: "bg-amber-400 animate-pulse",
    sealColor: "text-red-950",
    sealBorder: "border-amber-200",
    titleColor: "text-white",
    descColor: "text-rose-100",
    decorations: (
      <>
        <div className="absolute top-5 right-10 w-3 h-3 rounded-full bg-rose-200 opacity-60 animate-pulse" />
        <div className="absolute bottom-5 left-10 w-3 h-3 rounded-full bg-rose-200 opacity-55 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 left-4 w-2 h-2 rounded-full bg-rose-100 opacity-60 animate-bounce" />
        <div className="absolute bottom-12 right-6 w-1.5 h-1.5 rounded-full bg-rose-200 opacity-60" />
      </>
    )
  },
  cute: {
    bg: "bg-gradient-to-br from-pink-200 via-pink-300 to-purple-200 text-purple-950 border-pink-300",
    borderColor: "rgba(244, 114, 182, 0.5)",
    sealBg: "bg-white",
    sealColor: "text-pink-500",
    sealBorder: "border-pink-300",
    titleColor: "text-purple-950 font-black",
    descColor: "text-purple-800/85",
    decorations: (
      <>
        <div className="absolute top-5 left-6 w-3 h-3 rounded-full bg-white opacity-65 animate-pulse" />
        <div className="absolute bottom-6 left-12 w-3 h-3 rounded-full bg-[#FBCFE8] opacity-70 animate-bounce" style={{ animationDuration: '1.2s' }} />
        <div className="absolute top-12 right-8 w-3 h-3 rounded-full bg-[#C4B5FD] opacity-70 animate-bounce" style={{ animationDuration: '2.2s' }} />
        <div className="absolute bottom-4 right-10 w-4 h-1 rounded-full bg-[#F9A8D4] opacity-70 animate-pulse" style={{ animationDuration: '10s' }} />
      </>
    )
  },
  luxury: {
    bg: "bg-gradient-to-br from-neutral-950 via-[#1A150F] to-neutral-900 text-amber-200 border-amber-500",
    borderColor: "rgba(212, 175, 55, 0.5)",
    sealBg: "bg-gradient-to-r from-amber-400 to-yellow-500",
    sealColor: "text-neutral-950",
    sealBorder: "border-amber-350",
    titleColor: "text-[#D4AF37] font-serif font-black",
    descColor: "text-amber-100/70",
    decorations: (
      <>
        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-amber-500/50" />
        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-amber-500/50" />
        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-amber-500/50" />
        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-amber-500/50" />
      </>
    )
  }
};

interface DashboardProps {
  user: {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
  onSelectCapsule: (id: string, preview?: boolean) => void;
  lang?: 'en' | 'id';
  themeMode?: 'light' | 'dark';
}

const TEXTS = {
  en: {
    assemblyRoom: "Sandbox Cabinets & Creator Room",
    assemblyDesc: "Assemble bespoke digital presents, set release dates, and lock elements in secure vault folders.",
    newCapsule: "Configure Future Gift Box",
    formTitle: "Assemble New Digital Gift Box",
    recipient: "Recipient Name",
    birthday: "Birthday Date",
    theme: "Visual Theme Template",
    visibility: "Discovery Privacy",
    public: "Public - visible to World",
    semiPrivate: "Semi-Private - masked name on wall",
    private: "Private - only viewable with shared link",
    accessCode: "Vault Lock Passcode (required for recipient to open)",
    titlePlaceholder: "Birthday Page Header Title (e.g. Happy 21st Birthday, Alex!)",
    mainMessage: "Personalized Birthday Letters & Surprises",
    textareaPlaceholder: "Write the personalized message that unfolds when unlocked... supports standard markdown",
    cancel: "Cancel",
    lockBox: "Lock Box Capsule",
    locking: "Locking in Vault...",
    assembling: "Assembling new digital container...",
    syncing: "Synchronizing records...",
    yourAssembled: "Your Assembled Locked Gifts",
    emptyTitle: "Empty Surprise Folders",
    emptyDesc: "You haven't configured any locked presets yet. Launch your first custom capsule folder using the creator editor above!",
    shareLink: "Share Link",
    copied: "Copied!",
    preview: "Preview",
    unlocked: "Unlocked",
    locked: "Time Locked",
    revealsOn: "Reveals On:",
    code: "Code:",
    views: "Views:",
    aiTitle: "Message Drafting Assistant",
    aiSubtitle: "Need help finding the right words? Use the assistant to draft a thoughtful birthday note.",
    relationship: "Relationship",
    vibe: "Tone",
    extraDetails: "Anecdotes / Favorite memories / Inside jokes",
    generateAiWish: "Generate a Letter Draft",
    writingText: "Drafting text...",
    friend: "Friend",
    sibling: "Sibling / Family",
    partner: "Partner",
    parent: "Parent / Guardian",
    colleague: "Colleague",
    funny: "Humorous / Fun",
    sentimental: "Sentimental / Emotional",
    poetic: "Poetic / Artistic",
    formal: "Formal / Professional",
    aiDetailsPlaceholder: "e.g. loves matcha lattes, remember that time we got lost in Kyoto...",
    livePreview: "Live Preview Sandbox",
    previewEnvelope: "Envelope Preview",
    previewLetter: "Letter Preview",
    clickSeal: "Click the wax seal below to preview opening sequence",
    clickToClose: "Fold / Close Letter",
    recipientPlaceholder: "Recipient Name",
    titleHeadlinePlaceholder: "Headline Title",
    messagePlaceholder: "Your custom greeting will render here in real-time as you compose your present letter..."
  },
  id: {
    assemblyRoom: "Kabinet Sandbox & Ruang Pembuat",
    assemblyDesc: "Rakit hadiah digital khusus, tetapkan tanggal rilis, dan kunci setiap elemen di dalam brankas.",
    newCapsule: "Buat Kotak Kado Baru",
    formTitle: "Rakit Kotak Kado Digital Baru",
    recipient: "Nama Penerima",
    birthday: "Tanggal Ulang Tahun",
    theme: "Templat Tema Visual",
    visibility: "Privasi Penemuan",
    public: "Publik - terlihat oleh semua orang",
    semiPrivate: "Semi-Privat - nama disamarkan pada dinding",
    private: "Privat - hanya dapat dilihat dengan tautan langsung",
    accessCode: "Kode Sandi Brankas (wajib untuk membuka kado)",
    titlePlaceholder: "Judul Halaman Ulang Tahun (mis. Selamat Ulang Tahun ke-21, Alex!)",
    mainMessage: "Surat & Kejutan Ulang Tahun Personalisasi",
    textareaPlaceholder: "Tulis ucapan personalisasi yang akan terbuka saat hari H... mendukung markdown standar",
    cancel: "Batal",
    lockBox: "Kunci Kapsul Kotak Kado",
    locking: "Mengunci di Brankas...",
    assembling: "Merakit wadah hadiah digital baru...",
    syncing: "Menyelaraskan data...",
    yourAssembled: "Kapsul Kejutan Anda",
    emptyTitle: "Kabinet Kado Masih Kosong",
    emptyDesc: "Anda belum merakit kado kejutan apa pun. Buat kapsul baru menggunakan editor pembuatan di atas!",
    shareLink: "Salin Link",
    copied: "Tersalin!",
    preview: "Pratinjau",
    unlocked: "Terbuka",
    locked: "Terkunci",
    revealsOn: "Terbuka Pada:",
    code: "Sandi:",
    views: "Dilihat:",
    aiTitle: "Message Drafting Assistant",
    aiSubtitle: "Kesulitan menyusun kalimat puitis? Gunakan asisten ini untuk merancang surat ucapan yang hangat.",
    relationship: "Hubungan",
    vibe: "Nada Bicara",
    extraDetails: "Kisah menarik / Kenangan berharga / Lelucon candaan",
    generateAiWish: "Buat Draf Surat",
    writingText: "Menyusun surat...",
    friend: "Teman Terdekat",
    sibling: "Saudara / Keluarga",
    partner: "Pasangan",
    parent: "Orang Tua / Wali",
    colleague: "Rekan Kerja",
    funny: "Lucu / Humoris",
    sentimental: "Sentimental / Emosional",
    poetic: "Puitis / Artistik",
    formal: "Formal / Profesional",
    aiDetailsPlaceholder: "mis. sangat suka matcha latte, ingatkan saat tersesat di Kyoto bersama...",
    livePreview: "Kotak Pratinjau Langsung",
    previewEnvelope: "Pratinjau Sampul Amplop",
    previewLetter: "Pratinjau Surat",
    clickSeal: "Klik segel lilin di bawah untuk membuka surat",
    clickToClose: "Tutup / Lipat Surat",
    recipientPlaceholder: "Nama Penerima",
    titleHeadlinePlaceholder: "Judul Ucapan",
    messagePlaceholder: "Pesan ucapan hangat Anda akan terurai di sini secara langsung saat Anda mulai mengetik..."
  }
};

export default function Dashboard({ user, onSelectCapsule, lang = 'en', themeMode = 'dark' }: DashboardProps) {
  const [capsules, setCapsules] = useState<BirthdayPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = TEXTS[lang];
  const isLight = themeMode === 'light';
  const pageBg = isLight ? 'bg-slate-50 text-slate-950' : 'bg-[#050505] text-[#E0DCD5]';
  const cardBg = isLight ? 'bg-white/95 border border-slate-200/70 text-slate-950 shadow-sm' : 'bg-[#0B0B0B] border border-white/5 text-[#E0DCD5] shadow-xl';
  const inputBg = isLight ? 'bg-slate-100/95 border border-slate-200/70 text-slate-900 placeholder-slate-500' : 'bg-[#121212]/90 border border-white/10 text-[#E0DCD5] placeholder-[#E0DCD5]/50';
  const selectBg = isLight ? 'bg-slate-100/95 border border-slate-200/70 text-slate-900' : 'bg-[#121212]/90 border border-white/10 text-[#E0DCD5]';
  const mutedText = isLight ? 'text-slate-600' : 'text-[#E0DCD5]/60';
  const headingText = isLight ? 'text-slate-950' : 'text-white';
  const subtleBg = isLight ? 'bg-slate-100/95' : 'bg-[#121212]/90';
  const sectionBorder = isLight ? 'border-slate-200/70' : 'border-white/5';
  
  // New Capsule Fields
  const [recipientName, setRecipientName] = useState("");
  const [birthdayMonth, setBirthdayMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [birthdayDay, setBirthdayDay] = useState<string>(String(new Date().getDate()).padStart(2, '0'));
  const birthdayDate = `${birthdayMonth}-${birthdayDay}`;
  const [theme, setTheme] = useState("minimalist");
  const [visibility, setVisibility] = useState<VisibilityType>("public");
  const [accessCode, setAccessCode] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Load draft fields from localStorage on mount
  useEffect(() => {
    try {
      const savedRecipientName = localStorage.getItem("draft_recipientName");
      if (savedRecipientName) setRecipientName(savedRecipientName);

      const savedBirthdayMonth = localStorage.getItem("draft_birthdayMonth");
      if (savedBirthdayMonth) setBirthdayMonth(savedBirthdayMonth);

      const savedBirthdayDay = localStorage.getItem("draft_birthdayDay");
      if (savedBirthdayDay) setBirthdayDay(savedBirthdayDay);

      const savedTheme = localStorage.getItem("draft_theme");
      if (savedTheme) setTheme(savedTheme);

      const savedVisibility = localStorage.getItem("draft_visibility");
      if (savedVisibility) setVisibility(savedVisibility as VisibilityType);

      const savedAccessCode = localStorage.getItem("draft_accessCode");
      if (savedAccessCode) setAccessCode(savedAccessCode);

      const savedTitle = localStorage.getItem("draft_title");
      if (savedTitle) setTitle(savedTitle);

      const savedMessage = localStorage.getItem("draft_message");
      if (savedMessage) setMessage(savedMessage);

      const savedIsAnonymous = localStorage.getItem("draft_isAnonymous");
      if (savedIsAnonymous) setIsAnonymous(savedIsAnonymous === "true");
    } catch (e) {
      console.error("Failed to restore drafts", e);
    }
  }, []);

  // Autosave to localStorage when fields change
  useEffect(() => {
    try {
      localStorage.setItem("draft_recipientName", recipientName);
      localStorage.setItem("draft_birthdayMonth", birthdayMonth);
      localStorage.setItem("draft_birthdayDay", birthdayDay);
      localStorage.setItem("draft_theme", theme);
      localStorage.setItem("draft_visibility", visibility);
      localStorage.setItem("draft_accessCode", accessCode);
      localStorage.setItem("draft_title", title);
      localStorage.setItem("draft_message", message);
      localStorage.setItem("draft_isAnonymous", String(isAnonymous));
    } catch (e) {
      console.error("Failed to save draft field to localStorage", e);
    }
  }, [recipientName, birthdayMonth, birthdayDay, theme, visibility, accessCode, title, message, isAnonymous]);

  // Clear draft localStorage function
  function clearDraftLocalStorage() {
    try {
      localStorage.removeItem("draft_recipientName");
      localStorage.removeItem("draft_birthdayMonth");
      localStorage.removeItem("draft_birthdayDay");
      localStorage.removeItem("draft_theme");
      localStorage.removeItem("draft_visibility");
      localStorage.removeItem("draft_accessCode");
      localStorage.removeItem("draft_title");
      localStorage.removeItem("draft_message");
      localStorage.removeItem("draft_isAnonymous");
    } catch (e) {
      console.error("Failed to clear drafts", e);
    }
  }
  
  // message assistant states
  const [relationship, setRelationship] = useState("friend");
  const [vibe, setVibe] = useState("funny");
  const [extraDetails, setExtraDetails] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCapsuleId, setPreviewCapsuleId] = useState<string | null>(null);
  const [previewEnvelopeOpen, setPreviewEnvelopeOpen] = useState(false);

  useEffect(() => {
    loadCapsules();
  }, [user.uid]);

  async function loadCapsules() {
    setLoading(true);
    try {
      const data = await getCreatorBirthdayPages(user.uid);
      setCapsules(data || []);
    } catch (err) {
      console.error("Failed to load user capsules:", err);
    } finally {
      setLoading(false);
    }
  }

  // draft generator triggers
  async function triggerAiDraft(e: React.MouseEvent) {
    e.preventDefault();
    if (!recipientName) {
      setAiError("Please fill in the Recipient's Name first so the assistant can personalize the message.");
      return;
    }
    setAiError("");
    setAiGenerating(true);
    try {
      const result = await generateAIWish({
        recipientName,
        relationship,
        vibe,
        extraDetails
      });
      if (result && result.text) {
        setMessage(result.text);
      }
    } catch (err: any) {
      setAiError(err?.message || "Failed to generate content. Make sure your local integration is configured correctly.");
    } finally {
      setAiGenerating(false);
    }
  }

  // Form submission handler
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName || !birthdayDate || !title || !message || !accessCode) {
      alert("All fields are required to assemble an airtight gift card container.");
      return;
    }

    setFormSubmitting(true);
    try {
      const randomId = "capsule_" + Math.random().toString(36).substring(2, 11);
      
      // Calculate unlock timestamp at midnight client's timezone on that selected date (yearless recurrence logic)
      const monthNum = parseInt(birthdayMonth, 10);
      const dayNum = parseInt(birthdayDay, 10);
      const nowInst = new Date();
      const currentYear = nowInst.getFullYear();

      // Create local midnight target date
      const localTarget = new Date(currentYear, monthNum - 1, dayNum, 0, 0, 0);

      // If that local midnight has already passed in the current year, target the next year!
      if (localTarget.getTime() < nowInst.getTime()) {
        localTarget.setFullYear(currentYear + 1);
      }

      const unlockDateTimeUTC = localTarget.toISOString();

      const creatorName = (user.displayName || "Anonymous Creator").trim();
      const creatorEmail = (user.email || "").trim();

      const newPage: BirthdayPage = {
        id: randomId,
        creatorUid: user.uid,
        creatorEmail,
        creatorName,
        recipientName,
        birthdayDate,
        unlockDateTimeUTC,
        accessCode: accessCode.toUpperCase().trim(),
        visibility,
        theme,
        title,
        message,
        createdAt: new Date().toISOString(),
        openedCount: 0,
        isAnonymous
      };

      await createBirthdayPage(newPage);
      
      // Reset Form fields
      setRecipientName("");
      setBirthdayMonth(String(new Date().getMonth() + 1).padStart(2, '0'));
      setBirthdayDay(String(new Date().getDate()).padStart(2, '0'));
      setTheme("minimalist");
      setVisibility("public");
      setAccessCode("");
      setTitle("");
      setMessage("");
      setExtraDetails("");
      setIsAnonymous(false);
      clearDraftLocalStorage();

      setShowForm(false);
      await loadCapsules();
    } catch (err) {
      console.error("Error creating birthday page:", err);
      alert("Database serialization error. Confirm authorization variables.");
    } finally {
      setFormSubmitting(false);
    }
  }

  // Delete Page document
  async function handleDelete(id: string) {
    try {
      await deleteBirthdayPageDocument(id);
      await loadCapsules();
    } catch (err) {
      console.error("Failed to delete capsule:", err);
    }
  }

  // Copy share link
  function copyShareLink(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/?vault=${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 relative z-20 ${pageBg}`}>
      {/* Header bar */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${sectionBorder} pb-6 mb-8`}>
        <div>
          <h1 className={`text-3xl font-serif ${headingText} tracking-tight flex items-center gap-2`}>
            <span className="text-[#D4AF37] italic font-light">GiftVault</span> {lang === 'id' ? 'Kabinet' : 'Cabinets'}
          </h1>
          <p className={`${mutedText} text-sm mt-1 font-light`}>
            {t.assemblyDesc}
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] hover:scale-[1.02] active:scale-[0.98] text-black font-semibold px-5 py-2.5 rounded-full shadow-[0_4px_25px_rgba(214,175,55,0.15)] text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          id="dashboard-toggle-form"
        >
          {showForm ? (
            <span>{lang === 'id' ? 'Tutup Editor' : 'Close Editor'}</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{t.newCapsule}</span>
            </>
          )}
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-2xl p-6 mb-8 relative z-20`}
        >
          <div className={`flex items-center gap-2 mb-4 border-b ${sectionBorder} pb-3`}>
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className={`text-lg font-serif italic ${headingText} font-semibold`}>{t.formTitle}</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
              {/* Left Column: Form Controls */}
              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recipient's Name */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                  {t.recipient}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Johnson"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={`w-full ${inputBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-2.5 outline-none text-sm`}
                />
              </div>

              {/* Celebration Target Month & Day (Yearless Recurrent) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                    {lang === 'id' ? 'Bulan Rilis' : 'Release Month'}
                  </label>
                  <select
                    value={birthdayMonth}
                    onChange={(e) => setBirthdayMonth(e.target.value)}
                    className={`w-full ${selectBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 outline-none text-xs font-mono cursor-pointer`}
                  >
                    <option value="01">01 - {lang === 'id' ? 'Januari' : 'January'}</option>
                    <option value="02">02 - {lang === 'id' ? 'Februari' : 'February'}</option>
                    <option value="03">03 - {lang === 'id' ? 'Maret' : 'March'}</option>
                    <option value="04">04 - {lang === 'id' ? 'April' : 'April'}</option>
                    <option value="05">05 - {lang === 'id' ? 'Mei' : 'May'}</option>
                    <option value="06">06 - {lang === 'id' ? 'Juni' : 'June'}</option>
                    <option value="07">07 - {lang === 'id' ? 'Juli' : 'July'}</option>
                    <option value="08">08 - {lang === 'id' ? 'Agustus' : 'August'}</option>
                    <option value="09">09 - {lang === 'id' ? 'September' : 'September'}</option>
                    <option value="10">10 - {lang === 'id' ? 'Oktober' : 'October'}</option>
                    <option value="11">11 - {lang === 'id' ? 'November' : 'November'}</option>
                    <option value="12">12 - {lang === 'id' ? 'Desember' : 'December'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                    {lang === 'id' ? 'Tanggal Rilis' : 'Release Day'}
                  </label>
                  <select
                    value={birthdayDay}
                    onChange={(e) => setBirthdayDay(e.target.value)}
                    className={`w-full ${selectBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 outline-none text-xs font-mono cursor-pointer`}
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secure Passcode */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                  <span>{lang === 'id' ? 'Sandi Penyelamat' : 'Secret Passcode'}</span>
                  <span className="text-[10px] text-[#E0DCD5]/40 lowercase font-normal font-sans">{lang === 'id' ? 'huruf & angka' : 'Alphanumeric'}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SARAH2026"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className={`w-full ${inputBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-2.5 outline-none text-sm font-mono tracking-wider`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                  {t.theme}
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={`w-full ${selectBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 outline-none text-sm`}
                >
                  <option value="minimalist" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{lang === 'id' ? 'Minimalis Klasik' : 'Classic Minimalist'}</option>
                  <option value="galaxy" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{lang === 'id' ? 'Galaksi Tengah Malam (Biru)' : 'Midnight Galaxy'}</option>
                  <option value="romantic" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{lang === 'id' ? 'Sunset Romantis (Hangat)' : 'Sunset Romantic'}</option>
                  <option value="cute" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{lang === 'id' ? 'Warna Pastel Imut' : 'Pastel Cute'}</option>
                  <option value="luxury" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{lang === 'id' ? 'Obsidian Emas Mewah' : 'Obsidian Gold'}</option>
                </select>
              </div>

              {/* Visibility Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                  {t.visibility}
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as VisibilityType)}
                  className={`w-full ${selectBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 outline-none text-sm`}
                >
                  <option value="public" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{t.public}</option>
                  <option value="semi-private" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{t.semiPrivate}</option>
                  <option value="private" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212] text-[#E0DCD5]'}>{t.private}</option>
                </select>
              </div>

              {/* Capsule Card Title */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                  {lang === 'id' ? 'Judul Sampul Utama Kartu' : 'Card Headline / Cover Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wishing you the goldest chapters!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full ${inputBg} focus:border-[#D4AF37]/50 rounded-xl px-4 py-2.5 outline-none text-sm`}
                />
              </div>
            </div>

            {/* Sender Anonymity Toggle */}
            <div className="flex items-center gap-3 bg-[#121212]/30 border border-white/5 rounded-xl p-4">
              <input
                id="isAnonymousCheckbox"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]/50 bg-[#121212] border-white/20 select-none cursor-pointer"
              />
              <label htmlFor="isAnonymousCheckbox" className="text-xs text-[#E0DCD5] font-semibold cursor-pointer select-none">
                {lang === 'id' 
                  ? 'Kirim secara anonim / rahasiakan identitas Anda (Sembunyikan nama asli Anda)' 
                  : 'Send anonymously / hide your identity (Hide your real name from the envelope & letter)'}
              </label>
            </div>

            {/* Message Draft Assistant Panel */}
            <div className={`rounded-2xl p-5 ${subtleBg} border ${sectionBorder}`}>
              <div className="flex items-center gap-1.5 mb-3 text-[#D4AF37] font-bold text-xs uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{lang === 'id' ? 'Asisten Penyusunan Pesan (Opsional)' : 'Optional Message Draft Assistant'}</span>
              </div>
               <p className="text-[#E0DCD5]/55 text-xs mb-4 leading-relaxed font-light">
                {lang === 'id' 
                  ? 'Gunakan bantuan penulisan untuk menyusun surat, puisi ulang tahun, atau catatan hangat yang kemudian dimasukkan ke editor di bawah.'
                  : 'Use the message assistant to draft letters, birthday notes, and thoughtful messages that sync directly into your editor below.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#D4AF37]/80 tracking-wider mb-1.5 font-mono">
                    {lang === 'id' ? 'Gaya Ucapan' : 'Creative Vibe'}
                  </label>
                  <select
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className={`w-full ${selectBg} rounded-lg px-3 py-1.5 text-xs`}
                  >
                    <option value="funny" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Kocak & Jenaka' : 'Hilarious / Teasing'}</option>
                    <option value="romantic" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Romantis & Penuh Kasih' : 'Highly Romantic & Devoted'}</option>
                    <option value="sentimental" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Sentimental / Hangat' : 'Sentimental / Emotional'}</option>
                    <option value="poetic" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Puitis & Bersajak Indah' : 'Cinematic & Poetic Verse'}</option>
                    <option value="inspirational" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Inspirasional & Motivasi' : 'Inspirational Life Milestones'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#D4AF37]/80 tracking-wider mb-1.5 font-mono">
                    {lang === 'id' ? 'Hubungan Anda' : 'Your Relationship'}
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className={`w-full ${selectBg} rounded-lg px-3 py-1.5 text-xs`}
                  >
                    <option value="best friend" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Teman Baik / Sahabat' : 'Best Friend'}</option>
                    <option value="partner / spouse" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Pasangan Kekasih / Istri / Suami' : 'Partner / Spouse'}</option>
                    <option value="sibling" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Saudara Kandung' : 'Sibling'}</option>
                    <option value="parent" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Orang Tua' : 'Parent'}</option>
                    <option value="colleague" className={isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#121212]' }>{lang === 'id' ? 'Rekan Kerja' : 'Team Member / Colleague'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#D4AF37]/80 tracking-wider mb-1.5 font-mono">
                    {lang === 'id' ? 'Memoar khusus / candaan (opsional)' : 'Special memories or inside jokes (optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'id' ? 'mis. suka ngopi, kenangan masa sekolah, suka naik gunung' : 'e.g. loves cookies, graduation milestone, roadtrip member'}
                    value={extraDetails}
                    onChange={(e) => setExtraDetails(e.target.value)}
                    className="w-full bg-[#121212]/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#E0DCD5]"
                  />
                </div>
              </div>

              {aiError && (
                <p className="mt-3 text-rose-450 text-xs font-medium">
                  {lang === 'id' ? 'Catatan:' : 'Note:'} {aiError}
                </p>
              )}

              <button
                type="button"
                onClick={triggerAiDraft}
                disabled={aiGenerating}
                className="mt-4 bg-[#D4AF37]/5 border border-[#D4AF37]/25 hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#D4AF37]" />
                    <span>{lang === 'id' ? 'Sedang menyusun draf...' : 'Generating your draft...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Buat Draf Surat' : 'Generate Letter Draft'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom card letter message */}
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                {lang === 'id' ? 'Isi Surat Ulang Tahun Utama' : 'Unfolded Anniversary / Birthday Letter Text'}
              </label>
              <textarea
                required
                rows={6}
                placeholder={t.textareaPlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#121212]/90 border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 outline-none text-[#E0DCD5] text-sm leading-relaxed"
              />
            </div>

                {/* Submit */}
                <div className="pt-2 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="border border-white/10 hover:bg-white/5 text-[#E0DCD5]/70 font-semibold px-5 py-2.5 rounded-full text-xs transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] text-black font-semibold px-6 py-2.5 rounded-full text-xs shadow-md transition-all cursor-pointer font-bold"
                  >
                    {formSubmitting ? t.locking : t.lockBox}
                  </button>
                </div>
              </div>

              {/* Real-time Live Sandbox Preview Sidebar */}
              <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24 bg-[#0B0B0B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#D4AF37] font-mono animate-pulse">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t.livePreview}</span>
                  </div>
                  <div className="bg-[#D4AF37]/15 text-[#D4AF37] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-[#D4AF37]/35 font-bold">
                    {lang === 'id' ? 'DRAF AKTIF' : 'ACTIVE DRAFT'}
                  </div>
                </div>

                {/* Sub-toggle View controls */}
                <div className="flex bg-[#121212]/90 border border-white/5 rounded-full p-1 text-center font-bold text-[9px] uppercase font-sans">
                  <button
                    type="button"
                    onClick={() => setPreviewEnvelopeOpen(false)}
                    className={`flex-1 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
                      !previewEnvelopeOpen 
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] text-black shadow font-bold' 
                        : 'text-[#E0DCD5]/60 hover:text-white'
                    }`}
                  >
                    {t.previewEnvelope}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewEnvelopeOpen(true)}
                    className={`flex-1 py-1 px-2.5 rounded-full transition-all cursor-pointer ${
                      previewEnvelopeOpen 
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] text-black shadow font-bold' 
                        : 'text-[#E0DCD5]/60 hover:text-white'
                    }`}
                  >
                    {t.previewLetter}
                  </button>
                </div>

                {/* Scoped Mockup Frame */}
                {(() => {
                  const activeStyle = THEMES[theme] || THEMES.minimalist;
                  return (
                    <div className="perspective-1000">
                      <AnimatePresence mode="wait">
                        {!previewEnvelopeOpen ? (
                          /* Envelope Closed Cover Mockup with dynamic thematic styles & animations */
                          <motion.div
                            key="envelope-mock"
                            initial={{ opacity: 0, rotateY: -15, scale: 0.98 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            exit={{ opacity: 0, rotateY: 15, scale: 0.98 }}
                            onClick={() => setPreviewEnvelopeOpen(true)}
                            className={`w-full h-80 rounded-2xl relative p-6 text-center shadow-2xl flex flex-col justify-center items-center cursor-pointer transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] border-2 select-none group font-sans overflow-hidden ${(() => {
                              const envStyle = ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist;
                              return envStyle.bg;
                            })()}`}
                            style={{
                              borderColor: (ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).borderColor
                            }}
                          >
                            {/* Render cool/cute animated theme decorations */}
                            {(ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).decorations}

                            <div className="absolute top-3 left-3 bg-black/25 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 text-[8px] uppercase font-bold tracking-widest text-white font-mono">
                              {lang === 'id' ? 'SEGEL KADO' : 'SECRET SEAL'}
                            </div>

                            {/* Sealed heart wax indicator with theme colours */}
                            <div className={`w-14 h-14 ${(ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).sealBg} rounded-full border-4 ${(ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).sealBorder} shadow-lg flex items-center justify-center animate-pulse group-hover:scale-115 transition-transform duration-300`}>
                              <Heart className={`w-6 h-6 fill-current ${(ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).sealColor}`} />
                            </div>

                            <h3 className={`mt-4 ${(ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).titleColor} text-base font-black tracking-tight leading-snug`}>
                              {lang === 'id' ? 'Amplop Milik' : 'Gift For'} <br />
                              <span className="underline decoration-current font-extrabold max-w-[200px] truncate block mx-auto mt-1">
                                {recipientName || (lang === 'id' ? '[Nama Penerima]' : '[Name]')}
                              </span>
                            </h3>

                            <p className={`text-[10px] ${(ENVELOPE_THEME_STYLES[theme] || ENVELOPE_THEME_STYLES.minimalist).descColor} mt-3 max-w-xs px-2 leading-relaxed font-semibold`}>
                              {t.clickSeal}
                            </p>
                          </motion.div>
                        ) : (
                          /* Unfolded Custom Card Design Mockup */
                          <motion.div
                            key="card-mock"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className={`w-full h-80 rounded-xl p-5 shadow-xl relative border overflow-y-auto leading-relaxed transition-colors duration-500 ${activeStyle.bgClass} flex flex-col justify-between font-sans`}
                            style={theme === 'minimalist' ? {
                              backgroundImage: 'radial-gradient(#e2e8f0 0.5px, transparent 0.5px), radial-gradient(#e2e8f0 0.5px, #f8fafc 0.5px)',
                              backgroundSize: '8px 8px',
                              backgroundPosition: '0 0, 4px 4px'
                            } : theme === 'romantic' ? {
                              backgroundImage: 'radial-gradient(#fecdd3 0.5px, transparent 0.5px), radial-gradient(#fecdd3 0.5px, #fffafb 0.5px)',
                              backgroundSize: '8px 8px',
                              backgroundPosition: '0 0, 4px 4px'
                            } : undefined}
                          >
                            <div>
                              {/* Header details */}
                              <div className="flex justify-between items-start border-b border-dashed pb-2.5 mb-3" style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
                                <div className="text-left">
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold block opacity-50 font-sans">
                                    {lang === 'id' ? 'Untuk Penerima' : 'To My Dear Companion'}
                                  </span>
                                  <span className="text-xs font-black font-sans tracking-tight block mt-0.5 text-slate-900 truncate max-w-[125px]">
                                    {recipientName || t.recipientPlaceholder}
                                  </span>
                                </div>
                                <div className="text-right text-[8px] opacity-65 font-mono leading-tight">
                                  <div>{lang === 'id' ? 'Dari:' : 'From:'} {isAnonymous ? (lang === 'id' ? 'Pengirim Misterius' : 'Anonymous Sender') : user.displayName}</div>
                                  <div>{lang === 'id' ? 'Rilis:' : 'Date:'} {formatBirthdayDate(birthdayDate, lang === 'id') || (lang === 'id' ? '[Tgl Rilis]' : 'MM-DD')}</div>
                                </div>
                              </div>

                              {/* Card headline */}
                              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight leading-snug">
                                &ldquo; {title || t.titleHeadlinePlaceholder} &rdquo;
                              </h4>

                              {/* Body letter text */}
                              <p className="text-[10px] text-slate-700 font-serif mt-2 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto pr-1">
                                {message || t.messagePlaceholder}
                              </p>
                            </div>

                            {/* Footer Signature */}
                            <div className="mt-4 pt-2 border-t border-dashed flex justify-between items-center" style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
                              <button
                                type="button"
                                onClick={() => setPreviewEnvelopeOpen(false)}
                                className="bg-slate-950/5 hover:bg-slate-950/10 text-slate-700 text-[8px] font-bold px-2 py-1 rounded-full transition-all cursor-pointer font-sans"
                              >
                                ↩ {t.clickToClose}
                              </button>

                              <div className="text-right font-sans">
                                <span className="text-[7px] text-slate-400 font-bold block uppercase tracking-wider font-semibold">
                                  {lang === 'id' ? 'Salam Hangat,' : 'Warmest Greetings,'}
                                </span>
                                <span className="text-[10px] text-slate-930 font-serif italic tracking-wide font-extrabold block mt-0.5">
                                  {isAnonymous ? (lang === 'id' ? 'Sahabat Misterius Anda' : 'Your Anonymous Friend') : user.displayName}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {/* Instruction help text */}
                <p className="text-[9px] text-[#E0DCD5]/40 leading-relaxed font-light text-center px-1 font-sans">
                  {lang === 'id' 
                    ? 'Sandbox ini dirender secara langsung dan responsif untuk membantu visualisasi kado ulang tahun Anda.' 
                    : 'This live sandbox mockup is fully interactive and updates instantly as you customize visual elements.'}
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* User's Created Capsules Listing */}
      <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-[#D4AF37]" />
        {t.yourAssembled} ({capsules.length})
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#E0DCD5]/60">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37] mb-2" />
          <span>{t.syncing}</span>
        </div>
      ) : capsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((capsule) => {
            const unlocksOn = new Date(capsule.unlockDateTimeUTC);
            const isUnlocked = new Date() >= unlocksOn;

            return (
              <div
                key={capsule.id}
                onClick={() => onSelectCapsule(capsule.id)}
                className="cursor-pointer group relative bg-[#0F0F0F] border border-white/10 hover:border-[#D4AF37]/35 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/15 px-2 py-0.5 rounded">
                      {capsule.theme}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      isUnlocked 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-500/10 text-[#D4AF37] border-[#D4AF37]/20"
                    }`}>
                      {isUnlocked ? (lang === 'id' ? "Terbuka" : "Unlocked") : (lang === 'id' ? "Terkunci" : "Time Locked")}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-serif tracking-wide text-white group-hover:text-[#D4AF37] transition-colors">
                    {capsule.recipientName}
                  </h3>
                  <p className="text-xs text-[#E0DCD5]/50 mt-1">
                    {t.revealsOn} {formatBirthdayDate(capsule.birthdayDate, lang === 'id')}
                  </p>

                  <div className="mt-4 flex gap-4 text-xs font-mono text-[#E0DCD5]/60 bg-[#121212]/80 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t.code} {capsule.accessCode}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t.views} {capsule.openedCount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2 text-xs relative z-25">
                  <button
                    onClick={(e) => copyShareLink(capsule.id, e)}
                    className="flex-1 bg-white/5 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border border-white/10 rounded-lg py-2 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === capsule.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.shareLink}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewCapsuleId(capsule.id);
                    }}
                    className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/35 text-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] rounded-lg px-3.5 py-2 transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    title={lang === "id" ? "Pratinjau Kapsul" : "Preview Layout"}
                  >
                    <Eye className="w-4 h-4 text-[#D4AF37]" />
                    <span>{lang === 'id' ? 'Pratinjau' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deleteConfirmId === capsule.id) {
                        handleDelete(capsule.id);
                        setDeleteConfirmId(null);
                      } else {
                        setDeleteConfirmId(capsule.id);
                        // Auto-reset after 4 seconds
                        setTimeout(() => {
                          setDeleteConfirmId(prev => prev === capsule.id ? null : prev);
                        }, 4000);
                      }
                    }}
                    className={`border transition-all duration-300 rounded-lg p-2 flex items-center gap-1.5 cursor-pointer text-xs ${
                      deleteConfirmId === capsule.id
                        ? "bg-rose-600/90 hover:bg-rose-700/90 border-rose-500 text-white animate-pulse"
                        : "bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border-white/10"
                    }`}
                    title={
                      deleteConfirmId === capsule.id
                        ? (lang === 'id' ? "Klik lagi untuk menghapus" : "Click again to confirm delete")
                        : (lang === 'id' ? "Hapus halaman" : "Delete page")
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleteConfirmId === capsule.id && (
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                        {lang === 'id' ? 'Yakin?' : 'Sure?'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0B0B0B] border border-white/5 rounded-2xl text-[#E0DCD5]/50">
          <Clock className="w-10 h-10 stroke-[#D4AF37]/40 mx-auto opacity-55 mb-3" />
          <h4 className="font-serif italic text-white text-md">{t.emptyTitle}</h4>
          <p className="text-xs mt-1.5 max-w-xs mx-auto text-[#E0DCD5]/40 leading-relaxed font-light">
            {t.emptyDesc}
          </p>
        </div>
      )}

      {/* Time Capsule Live Preview Overlay Modal */}
      {previewCapsuleId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
          <div className="bg-[#0B0B0B] border border-white/10 rounded-3xl w-full max-w-5xl h-[88vh] overflow-hidden flex flex-col shadow-2xl relative">
            {/* Modal Close Header */}
            <div className="bg-[#121212] border-b border-white/10 px-6 py-4 flex justify-between items-center z-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8E6E2D] flex items-center justify-center text-black shadow-md shadow-amber-950/20">
                  <Eye className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="text-left font-sans">
                  <h3 className="text-white font-serif italic text-sm md:text-base font-bold">
                    {lang === 'id' ? 'Pratinjau Kapsul Kado Ulang Tahun' : 'Birthday Surprise Gift Capsule Live Preview'}
                  </h3>
                  <p className="text-[#E0DCD5]/55 text-[10px] md:text-xs font-light">
                    {lang === 'id' ? 'Melihat visualisasi kartu ucapan & buku tamu persis seperti penerima kado.' : 'Viewing full greeting cards, timelines, and guestbook exactly as the recipient will.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewCapsuleId(null)}
                className="text-black bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] hover:opacity-95 text-xs px-4 py-2 rounded-full font-extrabold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 font-sans"
              >
                <span>{lang === 'id' ? 'Tutup Kontrol' : 'Close Preview'}</span>
              </button>
            </div>
            
            {/* Scrollable Frame containing CapsuleView */}
            <div className="flex-1 overflow-y-auto bg-[#050505]">
              <CapsuleView 
                capsuleId={previewCapsuleId} 
                onBackToHome={() => setPreviewCapsuleId(null)}
                preview={true}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
