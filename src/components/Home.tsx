import { useState, useEffect } from 'react';
import { Gift, Calendar, Search, Sparkles, LogIn, Clock, Lock, Heart, Shield, Globe } from 'lucide-react';
import { BirthdayPage } from '../types';
import { getAllPublicBirthdayPages } from '../lib/db';
import { motion } from 'motion/react';

interface HomeProps {
  onSignIn: () => void;
  user: any;
  onNavigateToDashboard: () => void;
  onSelectCapsule: (id: string) => void;
  lang?: 'en' | 'id';
  themeMode?: 'light' | 'dark';
}

const TEXTS = {
  en: {
    badge: "The Future Birthday Present Platform",
    title1: "Prepare a Surprising",
    title2: "Birthday Time Capsule",
    desc: "Lock digital gift cards, written wishes, voice recordings, and collective memories inside a secure vault. Pages automatically unfold into a premium birthday reveal experience when the date arrives.",
    goDashboard: "Go to Sandbox Cabinets",
    loginBuild: "Build a Time Capsule (Login with Google)",
    exploreBtn: "Explore Birthday Wall",
    feat1Title: "Realtime Countdown",
    feat1Desc: "Dynamic live digital timeline updating every single millisecond until the key unlocks.",
    feat2Title: "Secret Access Lock",
    feat2Desc: "Secure passcode protection allows creators to hand private physical envelopes to recipients.",
    feat3Title: "Friend Collections",
    feat3Desc: "Collaborative timeline support allows friends to insert custom cards and letters anonymously.",
    feat4Title: "Privacy Guard",
    feat4Desc: "Strict privacy checks keep digital surprises perfectly hidden from snooping strangers.",
    celebrateToday: "Celebrating Today",
    celebrateDesc: "These creators are receiving unlocked gifts at this exact moment. Use their shared code to inspect.",
    wallTitle: "Global Birthday Wall & Calendar",
    wallDesc: "Browse public celebrations around the world, or check specific calendar dates to leave pleasant guestbook notes.",
    searchPlaceholder: "Search birthday pages...",
    lockBox: "Secure Capsule",
    emptyTitle: "No Public Capsules Found",
    emptyDesc: "No public or semi-private capsules registered for this month yet. Be the first to configure high-fidelity present folders for close companions.",
    creator: "Creator",
    scanning: "Scanning global archives...",
  },
  id: {
    badge: "Platform Hadiah Ulang Tahun Masa Depan",
    title1: "Siapkan Kejutan Manis",
    title2: "Kapsul Waktu Ulang Tahun",
    desc: "Kunci kartu kado digital, harapan tertulis, rekaman suara, dan kenangan kolektif di dalam brankas aman. Halaman akan otomatis terbuka menjadi kejutan luar biasa saat tanggal perayaan tiba.",
    goDashboard: "Masuk ke Kabinet Sandbox",
    loginBuild: "Buat Kapsul Waktu (Masuk Google)",
    exploreBtn: "Jelajahi Dinding Ulang Tahun",
    feat1Title: "Hitung Mundur Realtime",
    feat1Desc: "Garis waktu digital langsung diperbarui setiap milidetik hingga kunci terbuka.",
    feat2Title: "Kunci Akses Rahasia",
    feat2Desc: "Sandi pengunci yang aman memungkinkan kreator menyerahkan amplop fisik pribadi kepada penerima.",
    feat3Title: "Kontribusi Teman",
    feat3Desc: "Kolaborasi bersama teman untuk menyisipkan kartu ucapan secara anonim sebelum hari H.",
    feat4Title: "Penjaga Privasi",
    feat4Desc: "Konfigurasi identitas ketat menjaga kado kejutan Anda dari tatapan orang asing.",
    celebrateToday: "Merayakan Hari Ini",
    celebrateDesc: "Para kreator ini menerima kado kejutan mereka sekarang. Gunakan kode bagikan untuk melihat.",
    wallTitle: "Dinding Ulang Tahun Global & Kalender",
    wallDesc: "Ulik perayaan publik atau periksa tanggal tertentu di kalender untuk meninggalkan pesan buku tamu.",
    searchPlaceholder: "Cari halaman ulang tahun...",
    lockBox: "Kapsul Aman",
    emptyTitle: "Kapsul Publik Tidak Ditemukan",
    emptyDesc: "Belum ada kapsul publik atau semi-privat yang terdaftar untuk bulan ini. Jadilah yang pertama membuat kejutan istimewa untuk teman terdekat!",
    creator: "Pembuat",
    scanning: "Memindai arsip global...",
  }
};

export default function Home({ onSignIn, user, onNavigateToDashboard, onSelectCapsule, lang = 'en', themeMode = 'dark' }: HomeProps) {
  const [publicCapsules, setPublicCapsules] = useState<BirthdayPage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [loading, setLoading] = useState(true);

  const t = TEXTS[lang];
  const isLight = themeMode === 'light';
  const pageBg = isLight ? 'bg-slate-50 text-slate-950' : 'bg-[#050505] text-[#E0DCD5]';
  const sectionBg = isLight ? 'bg-white/90 border border-slate-200/70 text-slate-950 shadow-sm' : 'bg-[#0B0B0B] border border-white/5 text-[#E0DCD5]';
  const cardBg = isLight ? 'bg-white/95 border border-slate-200/70 text-slate-950 shadow-sm' : 'bg-[#0F0F0F]/90 border border-white/10 text-[#E0DCD5]';
  const surfaceText = isLight ? 'text-slate-700' : 'text-[#E0DCD5]/75';
  const mutedText = isLight ? 'text-slate-600' : 'text-[#E0DCD5]/60';
  const badgeClass = isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37]';
  const primaryBtn = isLight ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.12)]' : 'bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] text-black shadow-[0_4px_30px_rgba(214,175,55,0.15)]';
  const secondaryBtn = isLight ? 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200' : 'bg-[#121212]/40 text-[#E0DCD5] border border-white/10 hover:bg-white/5';
  const monthBtnActive = isLight ? 'bg-slate-900 text-white uppercase tracking-wider font-bold shadow-md shadow-slate-900/20' : 'bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] text-black uppercase tracking-wider font-bold shadow-md shadow-yellow-950/20';
  const monthBtn = isLight ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200' : 'bg-[#0D0D0D] text-[#E0DCD5]/70 border border-white/10 hover:bg-white/5';
  const searchBar = isLight ? 'bg-slate-100/95 border border-slate-200/70 text-slate-900' : 'bg-[#111111]/90 border border-white/10 text-[#E0DCD5]';

  useEffect(() => {
    async function loadWall() {
      try {
        const pages = await getAllPublicBirthdayPages();
        setPublicCapsules(pages || []);
      } catch (err) {
        console.error("Error loading wall:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWall();
  }, []);

  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthsId = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const months = lang === 'id' ? monthsId : monthsEn;

  // Filter public capsules based on search or selected month
  const filteredCapsules = publicCapsules.filter(c => {
    const capsDate = new Date(c.birthdayDate);
    const matchesMonth = capsDate.getMonth() === selectedMonth;
    const matchesSearch = c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesSearch;
  });

  // Today's Date
  const todayStr = new Date().toISOString().substring(5, 10); // MM-DD
  const todaysBirthdays = publicCapsules.filter(c => c.birthdayDate.substring(5, 10) === todayStr);

  return (
    <div className={`${pageBg} min-h-screen relative overflow-hidden font-sans`}>
      {/* Glowing luxury backdrop lights */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-[#8E6E2D]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center gap-2 ${badgeClass} px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm`}
        >
          <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t.badge}</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-4xl md:text-6xl font-serif tracking-tight leading-tight ${isLight ? 'text-slate-950' : 'text-white'}`}
        >
          {t.title1} <br />
          <span className="bg-gradient-to-r from-white via-[#E0DCD5] to-[#D4AF37] bg-clip-text text-transparent italic font-light">
            {t.title2}
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`mt-6 text-base ${mutedText} max-w-2xl mx-auto leading-relaxed font-light font-sans`}
        >
          {t.desc}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4"
        >
          {user ? (
            <button
              onClick={onNavigateToDashboard}
              className={`${primaryBtn} hover:scale-[1.02] active:scale-[0.98] font-semibold px-8 py-3.5 rounded-full transition-all text-sm flex items-center justify-center gap-2 cursor-pointer`}
              id="hero-go-dashboard"
            >
              <Sparkles className="w-4 h-4" />
              {t.goDashboard}
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className={`${primaryBtn} hover:scale-[1.02] active:scale-[0.98] font-semibold px-8 py-3.5 rounded-full transition-all text-sm flex items-center justify-center gap-2 cursor-pointer`}
              id="hero-auth-btn"
            >
              <LogIn className="w-4 h-4" />
              {t.loginBuild}
            </button>
          )}
          <a
            href="#interactive-wall"
            className="border border-white/10 bg-[#121212]/40 hover:bg-white/5 text-[#E0DCD5] font-medium px-8 py-3.5 rounded-full transition-all text-sm flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            {t.exploreBtn}
          </a>
        </motion.div>
      </section>

      {/* Features Overview */}
      <section className={`py-16 ${sectionBg} backdrop-blur-sm relative z-20`}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-4 shadow-sm shadow-yellow-950/20">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif italic text-[#D4AF37] text-base font-semibold mt-1">{t.feat1Title}</h3>
            <p className="text-[#E0DCD5]/60 text-xs mt-2 leading-relaxed font-light">{t.feat1Desc}</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-4 shadow-sm shadow-yellow-950/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif italic text-[#D4AF37] text-base font-semibold mt-1">{t.feat2Title}</h3>
            <p className="text-[#E0DCD5]/60 text-xs mt-2 leading-relaxed font-light">{t.feat2Desc}</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-4 shadow-sm shadow-yellow-950/20">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif italic text-[#D4AF37] text-base font-semibold mt-1">{t.feat3Title}</h3>
            <p className="text-[#E0DCD5]/60 text-xs mt-2 leading-relaxed font-light">{t.feat3Desc}</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-4 shadow-sm shadow-yellow-950/20">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif italic text-[#D4AF37] text-base font-semibold mt-1">{t.feat4Title}</h3>
            <p className="text-[#E0DCD5]/60 text-xs mt-2 leading-relaxed font-light">{t.feat4Desc}</p>
          </div>
        </div>
      </section>

      {/* Today's Celebrities Quick Spotlight */}
      {todaysBirthdays.length > 0 && (
        <section className="py-16 max-w-5xl mx-auto px-4 relative z-20">
          <div className="bg-gradient-to-r from-[#D4AF37]/45 via-amber-700/10 to-[#8E6E2D]/45 rounded-3xl p-[1px] shadow-[0_10px_50px_rgba(214,175,55,0.05)]">
            <div className="bg-[#0B0B0B] rounded-[22px] p-8 text-center border border-white/5">
              <h2 className={`text-2xl font-serif italic ${isLight ? 'text-slate-900' : 'text-[#D4AF37]'} flex items-center justify-center gap-2 mb-2`}>
                {t.celebrateToday}
              </h2>
              <p className={` ${mutedText} text-sm mb-6 max-w-md mx-auto`}>
                {t.celebrateDesc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {todaysBirthdays.map(page => (
                  <div 
                    key={page.id}
                    onClick={() => onSelectCapsule(page.id)}
                    className="cursor-pointer border border-white/5 bg-[#121212]/80 hover:bg-[#161616] hover:border-[#D4AF37]/35 rounded-2xl p-5 text-left transition-all duration-300 group"
                  >
                    <span className="text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {page.theme.toUpperCase()}
                    </span>
                    <h4 className="mt-3 font-serif tracking-wide text-md text-white group-hover:text-[#D4AF37] transition-colors">
                      {page.visibility === 'semi-private' ? `${page.recipientName[0]}. ***` : page.recipientName}
                    </h4>
                    <p className="text-xs text-[#E0DCD5]/50 mt-1">{t.creator}: {page.creatorName}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Birthday Wall & Interactive Calendar Section */}
      <section id="interactive-wall" className="py-20 max-w-5xl mx-auto px-4 relative z-20 border-t border-white/5 mt-12">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-serif italic ${isLight ? 'text-slate-950' : 'text-white'} tracking-wide flex items-center justify-center gap-3`}>
            <Calendar className="w-7 h-7 text-[#D4AF37]" />
            {t.wallTitle}
          </h2>
          <p className={`mt-3 ${mutedText} text-sm max-w-xl mx-auto font-light`}>
            {t.wallDesc}
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-thin scrollbar-thumb-slate-800">
          {months.map((month, idx) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(idx)}
              className={`flex-none px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                selectedMonth === idx 
                  ? monthBtnActive 
                  : monthBtn
              }`}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className={`mt-8 flex gap-3 max-w-md mx-auto rounded-full py-2.5 pl-5 pr-2.5 ${searchBar} shadow-inner focus-within:border-[#D4AF37]/45 transition-colors`}>
          <Search className="text-[#D4AF37] w-5 h-5 self-center min-w-[20px]" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-sm outline-none bg-transparent ${isLight ? 'text-slate-950 placeholder-slate-500' : 'text-[#E0DCD5] placeholder-[#E0DCD5]/30'}`}
          />
        </div>

        {/* Capsules List Grid */}
        <div className="mt-12 min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#E0DCD5]/60">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37] mb-3" />
              <span>{t.scanning}</span>
            </div>
          ) : filteredCapsules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCapsules.map((capsule) => {
                const birthday = new Date(capsule.birthdayDate);
                const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
                const dateLabel = birthday.toLocaleDateString('en-US', formatOpts);

                return (
                  <motion.div
                    key={capsule.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => onSelectCapsule(capsule.id)}
                    className={`cursor-pointer group flex flex-col justify-between ${cardBg} hover:border-[#D4AF37]/40 rounded-2xl p-5 transition-all duration-300`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-bold uppercase bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-full tracking-wider border border-[#D4AF37]/20">
                          {capsule.theme}
                        </span>
                        <div className={`flex items-center text-[11px] ${isLight ? 'text-slate-700' : 'text-[#E0DCD5]'} font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full`}>
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500 mr-1" />
                          <span>{dateLabel}</span>
                        </div>
                      </div>

                      <h3 className={`mt-4 text-lg font-serif ${isLight ? 'text-slate-950' : 'text-white'} tracking-wide group-hover:text-[#D4AF37] transition-colors`}>
                        {capsule.visibility === 'semi-private' 
                          ? `${capsule.recipientName[0]}. ****`
                          : capsule.recipientName
                        }
                      </h3>
                      <p className={`mt-2.5 text-xs ${mutedText} font-light italic leading-relaxed`}>
                        &ldquo;{capsule.title}&rdquo;
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-[#E0DCD5]/40 font-light">
                        {lang === 'id' ? 'Oleh' : 'By'} {capsule.creatorName}
                      </span>
                      <span className="text-xs bg-[#D4AF37]/5 text-[#D4AF37] group-hover:bg-gradient-to-r group-hover:from-[#D4AF37] group-hover:to-[#8E6E2D] group-hover:text-black border border-[#D4AF37]/30 rounded-full px-4 py-1.5 transition-all font-semibold shadow-inner">
                        {t.lockBox}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-16 ${cardBg} rounded-2xl ${isLight ? 'border border-slate-200/70' : 'border border-white/5'} ${isLight ? 'text-slate-600' : 'text-[#E0DCD5]/60'}`}>
              <Gift className="w-10 h-10 stroke-[#D4AF37]/50 mx-auto opacity-55 mb-3" />
              <h4 className={`font-serif italic ${isLight ? 'text-slate-950' : 'text-white'} text-md`}>{t.emptyTitle}</h4>
              <p className={`text-xs mt-1.5 max-w-xs mx-auto ${isLight ? 'text-slate-600' : 'text-[#E0DCD5]/50'} leading-relaxed font-light`}>
                {t.emptyDesc}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
