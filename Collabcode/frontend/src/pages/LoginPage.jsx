import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Mail, Lock, User, Terminal, Sparkles } from 'lucide-react';
import { registerUser, loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'register'
        ? await registerUser({ username, email, password })
        : await loginUser({ email, password });
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden text-slate-200 selection:bg-[#00FF9D]/30">
      
      {/* ── Left branding panel ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#080808] border-r border-white/5 relative overflow-hidden px-12"
      >
        {/* Animated Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,157,0.05),transparent_70%)]" />
        
        {/* Premium Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative z-10 max-w-md text-center lg:text-left">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="inline-flex items-center justify-center p-3 mb-8 rounded-2xl bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 shadow-2xl"
          >
            <Terminal className="w-10 h-10 text-[#00FF9D]" />
          </motion.div>
          
          <h1 className="text-6xl font-black tracking-tight mb-6 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            Build at the <br/> speed of <span className="text-[#00FF9D]">thought.</span>
          </h1>
          
          <p className="font-medium text-slate-400 text-lg mb-12 leading-relaxed">
            Experience the world's most advanced <br/> collaborative coding environment.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {[
              { text: 'Sub-millisecond synchronization', icon: Sparkles },
              { text: 'Enterprise-grade security', icon: Lock },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                className="flex items-center gap-3 text-sm font-medium text-slate-500"
              >
                <item.icon className="w-4 h-4 text-[#00FF9D]/60" />
                {item.text}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[550px] bg-[#050505] px-8 py-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-500 text-sm">
              Start your journey with CollabCode today.
            </p>
          </div>

          {/* Premium Selector */}
          <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl mb-8 border border-white/5 shadow-inner">
            {['login', 'register'].map((key) => (
              <button
                key={key}
                onClick={() => { setMode(key); setError(''); }}
                className={`relative flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  mode === key ? 'text-[#00FF9D]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode === key && (
                  <motion.div
                    layoutId="premiumTab"
                    className="absolute inset-0 bg-[#111] border border-white/10 rounded-xl shadow-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{key}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#00FF9D] transition-colors" />
                    <input
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#00FF9D]/30 focus:ring-1 focus:ring-[#00FF9D]/20 transition-all placeholder:text-slate-700"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={mode === 'register'}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#00FF9D] transition-colors" />
                <input
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#00FF9D]/30 focus:ring-1 focus:ring-[#00FF9D]/20 transition-all placeholder:text-slate-700"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#00FF9D] transition-colors" />
                <input
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#00FF9D]/30 focus:ring-1 focus:ring-[#00FF9D]/20 transition-all placeholder:text-slate-700"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3"
              >
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-white text-black hover:bg-[#00FF9D] font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">
                    {mode === 'login' ? 'Authenticate' : 'Initialize Account'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-6">
            <span className="h-px w-12 bg-white/5" />
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
              Secure Environment
            </p>
            <span className="h-px w-12 bg-white/5" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}