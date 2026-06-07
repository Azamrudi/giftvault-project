import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Lock, 
  Unlock, 
  Heart, 
  Calendar, 
  Music, 
  Volume2, 
  VolumeX, 
  Send, 
  Check, 
  AlertCircle, 
  FileText, 
  Gift, 
  ChevronRight, 
  UserPlus, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { BirthdayPage, FriendContribution, GuestbookEntry } from '../types';
import { THEMES, formatBirthdayDate } from './ThemeConfig';
import { 
  getFriendContributions, 
  addFriendContribution, 
  getGuestbookEntries, 
  addGuestbookEntry,
  incrementOpenedCount 
} from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

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
    bg: "bg-slate-105 border-slate-250 text-slate-900",
    borderColor: "rgba(148, 163, 184, 0.4)",
    sealBg: "bg-slate-900",
    sealColor: "text-slate-100",
    sealBorder: "border-slate-700",
    titleColor: "text-slate-950",
    descColor: "text-slate-500",
    decorations: (
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: "radial-gradient(#005 1.2px, transparent 1.2px)",
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

const TRANSLATIONS = {
  en: {
    decrypting: "Decrypting Vault Cabinets...",
    notFoundTitle: "Capsule Not Found",
    notFoundDesc: "The capsule folder ID provided may be draft or deleted.",
    returnHub: "Digital Present Hub",
    silenceMusic: "Silence Music",
    playMusic: "Tender Celebration Tune",
    lockedEnvelope: "Locked Envelope Surprise",
    lockedEnvelopeDesc: "A digital gift has been assembled for {name}! Enter the secret access passcode to unlock the card.",
    passcodePIN: "Gift Passcode PIN",
    enterPasscode: "ENTER SECRET VAULT PIN",
    decryptBtn: "Decrypt Time Capsule",
    byDeepmind: "SECURE SECRETS ENGINE BY DEEPMIND",
    timeSealed: "Time Sealed Time Capsule",
    surpriseWaiting: "Surprise waiting for {name}!",
    unfoldAuto: "The envelope unfolds automatically on birthday midnight. Leave friend memory snippets below while counting down!",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    unlocksOn: "Unlocks on:",
    happyBirthday: "HAPPY BIRTHDAY!",
    openEnvelope: "Open Birthday Envelope",
    clickWaxSeal: "Click the wax heart seal to open your birthday card from {name}!",
    toMyDear: "To My Dear Companion",
    from: "From:",
    date: "Date:",
    warmestGreetings: "Warmest Companion Greetings,",
    memoriesTimeline: "Friends' Memories Timeline ({count})",
    anonymousDrawer: "Anonymous Card Contribution Drawer",
    yourFriendName: "Your Name (Friend)",
    memoryPlaceholder: "Type a favorite memory, custom joke, or sweet birthday wish card...",
    insertCapsule: "Insert into Capsule",
    noMemories: "No friend contributions cataloged in this timeline yet. Be the first to add sweet memories!",
    guestbookTitle: "Unlocked Celebration Guestbook ({count})",
    guestbookDrawer: "Leave Unlocked Birthday Greeting Entry",
    guestNamePlaceholder: "Your Guest Name",
    guestMsgPlaceholder: "Write your wishes on the giant wall greeting cards...",
    postToWall: "Post to Wall",
    guestbookLocked: "The guestbook wishes feed unlocks automatically once the countdown has reached midnight!",
    noGuestbook: "No guestbook greeting posted yet. Leave an entry when the portal unlocks!"
  },
  id: {
    decrypting: "Mendekripsikan Brankas Kabinet...",
    notFoundTitle: "Kapsul Tidak Ditemukan",
    notFoundDesc: "ID folder kapsul yang dimasukkan mungkin berupa draf atau telah dihapus.",
    returnHub: "Kembali ke Beranda",
    silenceMusic: "Matikan Musik",
    playMusic: "Putar Melodi Kejutan",
    lockedEnvelope: "Brankas Surat Terkunci",
    lockedEnvelopeDesc: "Sebuah kado digital spesial telah dikunci untuk {name}! Masukkan kode PIN akses untuk membukanya.",
    passcodePIN: "KODE PIN AKSES BRANKAS",
    enterPasscode: "MASUKKAN PIN SURAT",
    decryptBtn: "Buka Brankas Kapsul",
    byDeepmind: "SISTEM BRANKAS AMAN OLEH DEEPMIND",
    timeSealed: "Kapsul Terkunci Waktu",
    surpriseWaiting: "Kejutan menanti {name}!",
    unfoldAuto: "Amplop surat akan terbuka otomatis saat hari rilis tiba. Anda juga dapat meninggalkan kenangan indah di bawah selagi menunggu!",
    days: "Hari",
    hours: "Jam",
    minutes: "Menit",
    seconds: "Detik",
    unlocksOn: "Terbuka pada:",
    happyBirthday: "SELAMAT HARI LAHIR! 🎂",
    openEnvelope: "Buka Amplop Hari Lahir",
    clickWaxSeal: "Klik segel lilin hati untuk membuka kartu ucapan ulang tahun spesial dari {name}!",
    toMyDear: "Untuk Sahabat Tersayang",
    from: "Dari:",
    date: "Tanggal:",
    warmestGreetings: "Salam Hangat Penuh Kasih,",
    memoriesTimeline: "Lini Masa Kenangan Sahabat ({count})",
    anonymousDrawer: "Kotak Kontribusi Memoar Rahasia",
    yourFriendName: "Nama Anda (Sahabat)",
    memoryPlaceholder: "Ketik memori favorit, lelucon seru, atau kartu ucapan ulang tahun yang manis...",
    insertCapsule: "Masukkan ke Dalam Kapsul",
    noMemories: "Belum ada kontribusi kenangan di kabinet lini masa ini. Jadi yang pertama mengirim ucapan manis!",
    guestbookTitle: "Buku Tamu Perayaan ({count})",
    guestbookDrawer: "Tulis Ucapan Selamat di Buku Tamu",
    guestNamePlaceholder: "Nama Anda",
    guestMsgPlaceholder: "Tulis doa terbaik Anda pada lembaran papan kartu ucapan perayaan...",
    postToWall: "Kirim ke Buku Tamu",
    guestbookLocked: "Kolom buku tamu ucapan akan terbuka otomatis jika penghitungan waktu mundur telah selesai!",
    noGuestbook: "Belum ada ucapan tertulis di buku tamu. Berikan ucapan saat portal perayaan terbuka!"
  }
};

interface CapsuleViewProps {
  capsuleId: string;
  onBackToHome: () => void;
  preview?: boolean;
  lang?: 'en' | 'id';
}

export default function CapsuleView({ capsuleId, onBackToHome, preview = false, lang = 'en' }: CapsuleViewProps) {
  const [capsule, setCapsule] = useState<BirthdayPage | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Security locks
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isFormUnlocked, setIsFormUnlocked] = useState(false);
  const [lockError, setLockError] = useState("");

  // Countdown clock states
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimeUnlocked, setIsTimeUnlocked] = useState(false);

  // Social sections
  const [contributions, setContributions] = useState<FriendContribution[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [friendName, setFriendName] = useState("");
  const [friendContent, setFriendContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [msgSubmitting, setMsgSubmitting] = useState(false);

  // Unfolding surprise animations
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorIntervalRef = useRef<any>(null);

  // Canvas Confetti ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const t = TRANSLATIONS[lang];

  // Load Capsule details
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const docRef = await import('../lib/db').then(m => m.getBirthdayPage(capsuleId));
        if (docRef) {
          setCapsule(docRef);
          
          if (preview) {
            setIsFormUnlocked(true);
            setIsTimeUnlocked(true);
          } else {
            // Check if passcode matches any cached session
            const cachedCode = localStorage.getItem(`vault_passcode_${capsuleId}`);
            if (cachedCode === docRef.accessCode) {
              setIsFormUnlocked(true);
              incrementOpenedCount(docRef.id, docRef.openedCount);
            }
          }
        }
      } catch (err) {
        console.error("Error loading capsule metadata:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [capsuleId, preview]);

  // Load contributions & guestbooks
  useEffect(() => {
    if (isFormUnlocked && capsule) {
      loadSocialFeeds();
    }
  }, [isFormUnlocked, capsule?.id]);

  async function loadSocialFeeds() {
    if (!capsule) return;
    try {
      const contrs = await getFriendContributions(capsule.id);
      setContributions(contrs || []);
      const entries = await getGuestbookEntries(capsule.id);
      setGuestbook(entries || []);
    } catch (err) {
      console.error("Error loading feeds:", err);
    }
  }

  // Ticking time countdown
  useEffect(() => {
    if (!capsule) return;

    let monthNum = 1;
    let dayNum = 1;
    const birthdayDateStr = capsule.birthdayDate;
    if (birthdayDateStr && birthdayDateStr.includes('-')) {
      const parts = birthdayDateStr.split('-');
      if (parts.length === 3) {
        monthNum = parseInt(parts[1], 10);
        dayNum = parseInt(parts[2], 10);
      } else if (parts.length === 2) {
        monthNum = parseInt(parts[0], 10);
        dayNum = parseInt(parts[1], 10);
      }
    }

    const interval = setInterval(() => {
      const nowInst = new Date();
      const currentYear = nowInst.getFullYear();
      
      // Local midnight target has occurred or is pending for this year
      const targetThisYear = new Date(currentYear, monthNum - 1, dayNum, 0, 0, 0);
      const difference = targetThisYear.getTime() - nowInst.getTime();

      if (difference <= 0) {
        // Unlocked for the rest of this year
        setIsTimeUnlocked(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        // Locked: count down to that anniversary of the current year
        setIsTimeUnlocked(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [capsule]);

  // Responsive Confetti simulation loop
  useEffect(() => {
    if (!canvasRef.current || !isTimeUnlocked || !isFormUnlocked) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles matching capsule themes
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#f43f5e', '#818cf8', '#fbbf24', '#34d399', '#ec4899', '#a78bfa', '#ffd700'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 2 + 1.5,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 - 1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTimeUnlocked, isFormUnlocked]);

  // Passcode login verification
  function handleVaultUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!capsule) return;
    const formattedCode = passcodeInput.toUpperCase().trim();
    if (formattedCode === capsule.accessCode) {
      setIsFormUnlocked(true);
      setLockError("");
      localStorage.setItem(`vault_passcode_${capsule.id}`, capsule.accessCode);
      incrementOpenedCount(capsule.id, capsule.openedCount);
    } else {
      setLockError("Passcode invalid. Please check your invitation card or consult the creator!");
    }
  }

  // Tender retro celebration melodies
  function playCelebrationTune() {
    if (audioPlaying) {
      stopCelebrationTune();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setAudioPlaying(true);

      // Simple retro synth sequencer playing happy notes
      let index = 0;
      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25]; // C, E, G, High C, G, High C, High E
      
      oscillatorIntervalRef.current = setInterval(() => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[index % notes.length], ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        
        index++;
      }, 500);

    } catch (e) {
      console.error("Audio Context Init Failed:", e);
    }
  }

  function stopCelebrationTune() {
    setAudioPlaying(false);
    if (oscillatorIntervalRef.current) {
      clearInterval(oscillatorIntervalRef.current);
      oscillatorIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }

  function handleOpenEnvelope() {
    setIsEnvelopeOpened(true);
    if (!audioPlaying) {
      playCelebrationTune();
    }
    try {
      const runConfetti = confetti as any;
      if (typeof runConfetti === 'function') {
        // Burst 1 centered
        runConfetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 }
        });
        // Side bursts
        setTimeout(() => {
          runConfetti({
            particleCount: 80,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 }
          });
        }, 200);
        setTimeout(() => {
          runConfetti({
            particleCount: 80,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 }
          });
        }, 350);
      }
    } catch (e) {
      console.error("Confetti trigger failed:", e);
    }
  }

  // Cleanup Tune
  useEffect(() => {
    return () => stopCelebrationTune();
  }, []);

  // Submit Pre-birthday memory contribution
  async function submitContribution(e: React.FormEvent) {
    e.preventDefault();
    if (!capsule || !friendName || !friendContent) return;
    setMsgSubmitting(true);
    try {
      const newContr: FriendContribution = {
        id: "contr_" + Math.random().toString(36).substring(2, 11),
        pageId: capsule.id,
        author: friendName.trim(),
        content: friendContent.trim(),
        createdAt: new Date().toISOString()
      };
      await addFriendContribution(newContr);
      setFriendName("");
      setFriendContent("");
      await loadSocialFeeds();
    } catch (err) {
      console.error(err);
    } finally {
      setMsgSubmitting(false);
    }
  }

  // Submit unlocked guestbook wish
  async function submitGuestbook(e: React.FormEvent) {
    e.preventDefault();
    if (!capsule || !guestName || !guestMsg) return;
    setMsgSubmitting(true);
    try {
      const newEntry: GuestbookEntry = {
        id: "guest_" + Math.random().toString(36).substring(2, 11),
        pageId: capsule.id,
        author: guestName.trim(),
        message: guestMsg.trim(),
        createdAt: new Date().toISOString()
      };
      await addGuestbookEntry(newEntry);
      setGuestName("");
      setGuestMsg("");
      await loadSocialFeeds();
    } catch (err) {
      console.error(err);
    } finally {
      setMsgSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
        <span>{t.decrypting}</span>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">{t.notFoundTitle}</h3>
        <p className="text-slate-500 text-sm mt-2">{t.notFoundDesc}</p>
        <button onClick={onBackToHome} className="mt-6 bg-indigo-600 text-white rounded-full px-6 py-2 text-xs font-semibold shadow cursor-pointer">
          {t.returnHub}
        </button>
      </div>
    );
  }

  const activeTheme = THEMES[capsule.theme] || THEMES.minimalist;
  const isVaultFullyVisible = preview ? true : isFormUnlocked; // Unlocks code check
  const isTimeArrived = preview ? true : isTimeUnlocked;

  return (
    <div className={`min-h-screen ${activeTheme.bgClass} flex flex-col justify-between py-10 px-4 relative transition-colors duration-1000 overflow-hidden`}>
      {/* Absolute floating canvas particles for confetti */}
      {isTimeUnlocked && isFormUnlocked && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-40" />
      )}

      {/* Outer Glow elements for Cosmic/Luxury themes */}
      {capsule.theme === 'galaxy' && (
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      )}

      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center">
        {/* Top Floating back navigation */}
        <div className="mb-6 flex items-center justify-between z-30">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.returnHub}</span>
          </button>

          {isVaultFullyVisible && isTimeArrived && (
            <button
              onClick={playCelebrationTune}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border shadow-sm transition-all cursor-pointer ${
                audioPlaying 
                  ? "bg-rose-50 border-rose-200 text-rose-600" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {audioPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioPlaying ? t.silenceMusic : t.playMusic}</span>
            </button>
          )}
        </div>

        {/* Dynamic high-fidelity Bypass Preview Banner */}
        {preview && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/30 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left z-30 shadow-[0_4px_20px_rgba(214,175,55,0.1)]">
            <div>
              <h4 className="text-[#D4AF37] font-serif italic text-base font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-5 h-5 animate-pulse" />
                {lang === 'id' ? 'Tampilan Pratinjau Desain Kapsul' : 'Capsule Layout Preview Mode'}
              </h4>
              <p className="text-[#E0DCD5]/60 text-xs mt-1 font-light">
                {lang === 'id' 
                  ? 'Anda sedang melihat hasil akhir desain kapsul ini dengan bypass sandi pengunci dan hitung mundur tanggal rilis.'
                  : 'You are viewing the final assembled design of this capsule with locks and timing restrictions bypassed.'}
              </p>
            </div>
            <div className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35 text-[10px] font-mono uppercase tracking-widest px-3.5 py-1.5 rounded-full font-bold">
              {lang === 'id' ? 'BYPASS AKTIF' : 'BYPASS ACTIVE'}
            </div>
          </div>
        )}

        {/* --- VIEW GATE 1: PASSCODE LOCKED STAGE --- */}
        {!isVaultFullyVisible ? (
          <div className="max-w-md mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 ${activeTheme.cardClass} relative overflow-hidden`}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-50/80 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-5 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.lockedEnvelope}</h2>
                <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                  {t.lockedEnvelopeDesc.replace('{name}', capsule.recipientName)}
                </p>
              </div>

              <form onSubmit={handleVaultUnlock} className="mt-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t.passcodePIN}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={t.enterPasscode}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full text-center border-2 border-slate-150 rounded-xl py-3 px-4 outline-none text-slate-800 font-mono text-lg font-bold tracking-widest focus:border-indigo-500 uppercase bg-slate-50 focus:bg-white"
                  />
                </div>

                {lockError && (
                  <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-xl text-rose-500 text-xs font-semibold flex items-center gap-1.5 leading-snug">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{lockError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-tight shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTheme.buttonClass}`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>{t.decryptBtn}</span>
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                  {t.byDeepmind}
                </span>
              </div>
            </motion.div>
          </div>
        ) : (
          /* --- VIEW GATE 2: VERIFIED UNLOCKED ACCESS STAGE --- */
          <div className="space-y-10 z-10">
            
            {/* Countdown Screen if not yet birthday date */}
            {!isTimeArrived ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 text-center ${activeTheme.cardClass}`}
              >
                <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest leading-loose">
                  {t.timeSealed}
                </span>
                
                <h1 className="mt-4 text-3xl font-black text-slate-850 tracking-tight">
                  {t.surpriseWaiting.replace('{name}', capsule.recipientName)}
                </h1>
                
                <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto">
                  {t.unfoldAuto}
                </p>

                {/* Clock Grid UI */}
                <div className="mt-8 grid grid-cols-4 gap-3 max-w-sm mx-auto">
                  {[
                    { label: t.days, val: timeLeft.days },
                    { label: t.hours, val: timeLeft.hours },
                    { label: t.minutes, val: timeLeft.minutes },
                    { label: t.seconds, val: timeLeft.seconds }
                  ].map((cell, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-2xl py-3 px-2 shadow-inner text-center">
                      <span className="block text-xl md:text-2xl font-black text-slate-850 font-mono tracking-tight leading-none">
                        {String(cell.val).padStart(2, '0')}
                      </span>
                      <span className="block text-[8px] md:text-[9px] uppercase font-bold text-slate-400 mt-2 tracking-wider">
                        {cell.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.unlocksOn} {formatBirthdayDate(capsule.birthdayDate, lang === 'id')} {new Date().getFullYear()}</span>
                </div>
              </motion.div>
            ) : (
              /* --- VIEW GATE 3: UNLOCKED CELEBRATION PRESENT EXPERIENCE --- */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: 'spring', stiffness: 100 }}
                     className="inline-flex items-center gap-1.5 bg-rose-100 border border-rose-200 text-rose-700 font-bold px-4 py-1.5 rounded-full text-xs animate-bounce"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600 animate-pulse" />
                    <span>{t.happyBirthday}</span>
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mt-4">
                    {lang === 'id' ? 'Selamat Ulang Tahun' : 'Happy Birthday'} <br className="sm:hidden" />
                    <span className="text-indigo-600"> {capsule.recipientName}!</span>
                  </h1>
                </div>

                {/* Animated Unfolding Envelope Envelope/Letter component */}
                <div className="max-w-xl mx-auto perspective-1000">
                  <AnimatePresence mode="wait">
                    {!isEnvelopeOpened ? (
                      (() => {
                        const envStyle = ENVELOPE_THEME_STYLES[capsule.theme] || ENVELOPE_THEME_STYLES.minimalist;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={handleOpenEnvelope}
                            className={`cursor-pointer group relative rounded-3xl p-10 shadow-2xl text-center transform hover:-translate-y-2 active:scale-98 transition-all flex flex-col justify-center items-center h-80 overflow-hidden border-2 space-y-3 ${envStyle.bg}`}
                            style={{
                              borderColor: envStyle.borderColor
                            }}
                          >
                            {/* Theme visual cute decorations */}
                            {envStyle.decorations}

                            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-white font-mono">
                              {lang === 'id' ? 'KARTU UCAPAN RAHASIA' : 'SECRET CELEBRATION CARD'}
                            </div>

                            {/* Interactive Wax Seal lock */}
                            <div className={`w-20 h-20 ${envStyle.sealBg} rounded-full border-4 ${envStyle.sealBorder} shadow-lg flex items-center justify-center group-hover:scale-115 transition-transform duration-300`}>
                              <Heart className={`w-8 h-8 fill-current ${envStyle.sealColor}`} />
                            </div>

                            <h3 className={`mt-6 text-xl font-extrabold ${envStyle.titleColor}`}>{t.openEnvelope}</h3>
                            <p className={`text-xs ${envStyle.descColor} mt-2 max-w-xs leading-relaxed font-semibold`}>
                              {t.clickWaxSeal.replace('{name}', capsule.isAnonymous ? (lang === 'id' ? 'Pengirim Misterius' : 'Anonymous Sender') : capsule.creatorName)}
                            </p>
                          </motion.div>
                        );
                      })()
                    ) : (
                      // Unfolded Letter Container
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-cream-white text-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-amber-100/60 leading-relaxed font-serif"
                        style={{
                          backgroundImage: 'radial-gradient(#f7e8cf 0.5px, transparent 0.5px), radial-gradient(#f7e8cf 0.5px, #fdfbf7 0.5px)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 0, 5px 5px'
                        }}
                      >
                        {/* Letter Header */}
                        <div className="flex justify-between items-start border-b border-amber-200/80 pb-4 mb-6">
                          <div>
                            <span className="text-[10px] font-sans font-bold text-amber-800 uppercase tracking-widest">
                              {t.toMyDear}
                            </span>
                            <h2 className="text-3xl font-black font-sans text-slate-900 mt-1">
                              {capsule.recipientName}
                            </h2>
                          </div>
                          <div className="text-right text-xs font-sans font-medium text-slate-500">
                            <div>{t.from} {capsule.isAnonymous ? (lang === 'id' ? 'Sahabat Misterius Anda' : 'Your Anonymous Friend') : capsule.creatorName}</div>
                            <div>{t.date} {formatBirthdayDate(capsule.birthdayDate, lang === 'id')}</div>
                          </div>
                        </div>

                        {/* Letter Message */}
                        <div className="prose prose-amber font-sans text-slate-800 leading-relaxed text-sm md:text-base space-y-4">
                          <h4 className="font-bold text-slate-900 text-lg">&ldquo; {capsule.title} &rdquo;</h4>
                          <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                            {capsule.message}
                          </p>
                        </div>

                        {/* Signature */}
                        <div className="mt-10 pt-6 border-t border-amber-200/80 text-right font-sans">
                          <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                            {t.warmestGreetings}
                          </span>
                          <span className="text-bold text-slate-950 font-serif text-lg tracking-wide italic mt-1 block">
                            {capsule.isAnonymous ? (lang === 'id' ? 'Sahabat Misterius Anda' : 'Your Anonymous Friend') : capsule.creatorName}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* --- CORE DOUBLE SEGMENT: FRIEND MEMORIES WORKSPACE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200/50">
              
              {/* Box A: Friend Contributions/Memories (Polaroid cards style) */}
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  {t.memoriesTimeline.replace('{count}', String(contributions.length))}
                </h3>

                {/* Contribution entry write form before birthday unlock */}
                <form onSubmit={submitContribution} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-6 space-y-3">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    <span>{t.anonymousDrawer}</span>
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      required
                      placeholder={t.yourFriendName}
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white outline-none text-slate-800 shadow-inner"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder={t.memoryPlaceholder}
                      value={friendContent}
                      onChange={(e) => setFriendContent(e.target.value)}
                      className="border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white outline-none text-slate-800 shadow-inner resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={msgSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 text-xs font-bold shadow flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.insertCapsule}</span>
                  </button>
                </form>

                {/* Display Feed */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {contributions.length > 0 ? (
                    contributions.map((contr) => (
                      <div 
                        key={contr.id} 
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                        style={{
                          fontFamily: 'sans-serif'
                        }}
                      >
                        <p className="text-slate-700 text-xs leading-relaxed italic">
                          &ldquo;{contr.content}&rdquo;
                        </p>
                        <div className="mt-3 text-right text-[10px] font-bold text-rose-500">
                          — {contr.author}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-white/45 border border-dashed rounded-xl text-slate-400 text-xs">
                      {t.noMemories}
                    </div>
                  )}
                </div>
              </div>


              {/* Box B: public Unlocked Guestbook Greetings */}
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {t.guestbookTitle.replace('{count}', String(guestbook.length))}
                </h3>

                {/* Guestbook Submission Drawer (Only enabled when time unlocked!) */}
                {isTimeArrived ? (
                  <form onSubmit={submitGuestbook} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-6 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.guestbookDrawer}</span>
                    </span>

                    <div className="grid grid-cols-1 gap-2">
                       <input
                         type="text"
                         required
                         placeholder={t.guestNamePlaceholder}
                         value={guestName}
                         onChange={(e) => setGuestName(e.target.value)}
                         className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:bg-white outline-none text-slate-800"
                       />
                       <textarea
                         required
                         rows={2}
                         placeholder={t.guestMsgPlaceholder}
                         value={guestMsg}
                         onChange={(e) => setGuestMsg(e.target.value)}
                         className="border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white outline-none text-slate-800 resize-none leading-relaxed"
                       />
                    </div>

                    <button
                      type="submit"
                      disabled={msgSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl py-2 text-xs shadow flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.postToWall}</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-500 border border-slate-250 mb-6 font-medium">
                    {t.guestbookLocked}
                  </div>
                )}

                {/* Display feed */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {guestbook.length > 0 ? (
                    guestbook.map((entry) => (
                      <div key={entry.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 shadow-inner">
                        <p className="text-slate-755 text-xs font-sans select-all font-medium leading-relaxed">
                          {entry.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400">
                          <span>{new Date(entry.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
                          <span className="font-extrabold text-slate-600">— By {entry.author}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50/45 border border-dashed rounded-xl text-slate-400 text-xs">
                      {t.noGuestbook}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <footer className="mt-16 text-center text-slate-400 text-[10px] font-sans tracking-tight">
        <span>GIFTVAULT DIGITAL BIRTHDAY TIME CAPSULE PLATFORM</span>
      </footer>
    </div>
  );
}
