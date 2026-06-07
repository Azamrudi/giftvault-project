export interface ThemeStyle {
  name: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentClass: string;
  buttonClass: string;
  fontClass: string;
  borderClass: string;
  starsColor?: string;
}

export function formatBirthdayDate(dateStr: string, isIndonesian: boolean): string {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  
  const MONTHS_EN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const MONTHS_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  let monthIdx = 0;
  let dayVal = 1;

  if (parts.length === 3) {
    // YYYY-MM-DD format
    monthIdx = parseInt(parts[1], 10) - 1;
    dayVal = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    // MM-DD format
    monthIdx = parseInt(parts[0], 10) - 1;
    dayVal = parseInt(parts[1], 10);
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      monthIdx = d.getMonth();
      dayVal = d.getDate();
    } else {
      return dateStr;
    }
  }

  const mName = isIndonesian ? (MONTHS_ID[monthIdx] || "") : (MONTHS_EN[monthIdx] || "");
  return isIndonesian ? `${dayVal} ${mName}` : `${mName} ${dayVal}`;
}

export const THEMES: { [key: string]: ThemeStyle } = {
  minimalist: {
    name: "Classic Minimalist (Apple-Inspired)",
    bgClass: "bg-slate-50 text-slate-900 border-slate-200/60",
    cardClass: "bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/80 rounded-2xl",
    textClass: "text-slate-850",
    accentClass: "text-slate-950",
    buttonClass: "bg-slate-950 text-white hover:bg-slate-800 focus:ring-slate-300",
    fontClass: "font-sans tracking-tight",
    borderClass: "border-slate-200/80",
  },
  galaxy: {
    name: "Midnight Galaxy (Cosmic Blue)",
    bgClass: "bg-slate-950 text-indigo-100 border-indigo-900/50",
    cardClass: "bg-indigo-950/40 backdrop-blur-xl shadow-2xl border border-indigo-500/20 rounded-2xl shadow-indigo-500/10",
    textClass: "text-indigo-200",
    accentClass: "text-indigo-400",
    buttonClass: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-800",
    fontClass: "font-sans tracking-wide",
    borderClass: "border-indigo-500/30",
    starsColor: "#818cf8",
  },
  romantic: {
    name: "Sunset Romantic (Coral Warmth)",
    bgClass: "bg-orange-50 text-red-950 border-red-200",
    cardClass: "bg-white/90 backdrop-blur-md shadow-xl border border-red-100 rounded-2xl shadow-red-100/30",
    textClass: "text-red-900/90",
    accentClass: "text-rose-600",
    buttonClass: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-200",
    fontClass: "font-sans tracking-tight",
    borderClass: "border-rose-100",
  },
  cute: {
    name: "Pastel Cute (Candy Pink & Lavender)",
    bgClass: "bg-pink-50 text-purple-950 border-pink-100",
    cardClass: "bg-white/95 backdrop-blur-md shadow-md border-2 border-pink-100 rounded-2xl shadow-pink-150/45",
    textClass: "text-purple-900/80",
    accentClass: "text-pink-500",
    buttonClass: "bg-pink-400 text-white hover:bg-pink-500 focus:ring-pink-100",
    fontClass: "font-sans",
    borderClass: "border-pink-100",
  },
  luxury: {
    name: "Obsidian Gold (Gold Luxury)",
    bgClass: "bg-neutral-950 text-amber-150 border-amber-900/40",
    cardClass: "bg-neutral-900/80 backdrop-blur-lg shadow-2xl border border-amber-500/20 rounded-2xl shadow-yellow-950/20",
    textClass: "text-amber-100/70",
    accentClass: "text-amber-400",
    buttonClass: "bg-gradient-to-r from-amber-500 to-yellow-600 text-neutral-950 font-semibold hover:from-amber-400 hover:to-yellow-500 focus:ring-amber-800",
    fontClass: "font-sans tracking-wide",
    borderClass: "border-amber-500/25",
  },
};
