import { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { saveUserProfile, testFirestoreConnection } from './lib/db';
import { UserProfile } from './types';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import CapsuleView from './components/CapsuleView';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, LogIn, LogOut, LayoutDashboard, Globe, Compass, Grid } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>('home');
  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Language selector state: 'en' (English) or 'id' (Indonesian)
  const [lang, setLang] = useState<'en' | 'id'>(() => {
    return (localStorage.getItem('giftvault_lang') as 'en' | 'id') || 'en';
  });

  const toggleLang = () => {
    const next = lang === 'en' ? 'id' : 'en';
    setLang(next);
    localStorage.setItem('giftvault_lang', next);
  };

  // Parse URL parameter on initial load for direct time-capsule link shares
  useEffect(() => {
    testFirestoreConnection();
    
    const params = new URLSearchParams(window.location.search);
    const vault = params.get('vault');
    const preview = params.get('preview') === 'true';
    if (vault) {
      setActiveVaultId(vault);
      setIsPreviewMode(preview);
    }
  }, []);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Persist profile to Firestore users database
        const profile: UserProfile = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || "Anonymous Creator",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || undefined,
          createdAt: new Date().toISOString()
        };
        try {
          await saveUserProfile(profile);
        } catch (err) {
          console.error("Failed to auto-save user registration profile:", err);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In trigger
  async function handleGoogleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-in popup failed:", error);
    }
  }

  // Log Out trigger
  async function handleSignOut() {
    try {
      await signOut(auth);
      setUser(null);
      setActiveTab('home');
    } catch (error) {
      console.error("Log out failed:", error);
    }
  }

  // Navigate back to the home hub
  function handleBackToHome() {
    setActiveVaultId(null);
    setIsPreviewMode(false);
    window.history.pushState({}, '', window.location.origin);
  }

  // Navigate directly to a capsule
  function handleSelectCapsule(id: string, preview = false) {
    setActiveVaultId(id);
    setIsPreviewMode(preview);
    const url = preview 
      ? `${window.location.origin}/?vault=${id}&preview=true` 
      : `${window.location.origin}/?vault=${id}`;
    window.history.pushState({}, '', url);
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#E0DCD5] min-h-screen bg-[#050505] font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37] mb-4" />
        <span className="font-serif italic tracking-wider text-md">Withdrawing records from Vault...</span>
      </div>
    );
  }

  // Display Capsule directly if a share link is loaded
  if (activeVaultId) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E0DCD5]">
        <CapsuleView 
          capsuleId={activeVaultId} 
          onBackToHome={handleBackToHome} 
          preview={isPreviewMode}
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0DCD5] flex flex-col justify-between font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Header Panel */}
      <header className="bg-[#0B0B0B]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center h-16">
          <div 
            onClick={handleBackToHome}
            className="cursor-pointer flex items-center gap-2.5 select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] over-amber-500 to-[#8E6E2D] flex items-center justify-center text-black shadow-md shadow-amber-950/20 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-serif text-lg text-[#D4AF37] tracking-widest uppercase italic font-bold group-hover:opacity-90 transition-opacity">GiftVault</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="bg-[#121212] border border-white/10 hover:bg-[#1C1C1C] text-[#E0DCD5] text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={lang === "en" ? "Switch to Indonesian" : "Ubah ke Bahasa Inggris"}
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{lang === "en" ? "EN" : "ID"}</span>
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 bg-[#121212] p-1 rounded-full border border-white/5">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'home' 
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/35 shadow-sm" 
                    : "text-[#E0DCD5]/70 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Celebration Hub</span>
              </button>

              {user && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'dashboard' 
                      ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/35 shadow-sm" 
                      : "text-[#E0DCD5]/70 hover:text-white"
                  }`}
                  id="header-nav-dashboard"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Sandbox Cabinets</span>
                </button>
              )}
            </nav>

            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "Avatar"} 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-[#D4AF37]/45 shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}

                <button
                  onClick={handleSignOut}
                  className="bg-[#121212] border border-white/10 hover:bg-[#1C1C1C] text-[#E0DCD5] text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="bg-gradient-to-r from-[#D4AF37] to-[#8E6E2D] hover:scale-[1.02] active:scale-[0.98] text-black text-xs px-4 py-2 rounded-full font-bold shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex items-center gap-1.5 transition-all border border-[#D4AF37]/35 cursor-pointer"
                id="header-login-btn"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {user && (
          <div className="sm:hidden flex items-center justify-center border-t border-white/10 bg-[#080808]/95 py-2.5 px-4 gap-4 text-xs font-bold font-sans">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1 py-1 px-3.5 rounded-full border transition-all ${
                activeTab === 'home' 
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' 
                  : 'text-[#E0DCD5]/60 border-transparent'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Wall</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1 py-1 px-3.5 rounded-full border transition-all ${
                activeTab === 'dashboard' 
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' 
                  : 'text-[#E0DCD5]/60 border-transparent'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Cabinets</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Screens Container */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Home 
                onSignIn={handleGoogleLogin} 
                user={user} 
                onNavigateToDashboard={() => setActiveTab('dashboard')} 
                onSelectCapsule={handleSelectCapsule}
                lang={lang}
              />
            </motion.div>
          ) : (
            user && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard 
                  user={{
                    uid: user.uid,
                    displayName: user.displayName || "Anonymous Creator",
                    email: user.email || "",
                    photoURL: user.photoURL || undefined
                  }} 
                  onSelectCapsule={handleSelectCapsule}
                  lang={lang}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* Persistent App Footer */}
      <footer className="bg-[#0B0B0B] text-[#E0DCD5]/60 py-10 mt-auto text-center border-t border-white/10">
        <p className="text-xs font-serif font-semibold tracking-widest text-[#D4AF37] uppercase italic">GIFTVAULT — SECURED TIME CAPSULES © 2026</p>
        <p className="text-[10px] text-[#E0DCD5]/40 mt-2 max-w-sm mx-auto px-4 leading-relaxed font-sans">
          Lock surprises, anniversary gifts, digital greeting cards, and birthday present folders. Released automatically in perfect luxury custom templates.
        </p>
      </footer>
    </div>
  );
}
