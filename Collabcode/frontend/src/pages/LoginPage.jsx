import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ArrowRight, Mail, Lock, User, Terminal, 
  Sparkles, Sun, Moon, Eye, EyeOff, 
} from 'lucide-react';
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { registerUser, loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
      setError(err.response?.data?.error || 'Access denied. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const socialLogins = [
  { name: 'Github', icon: <FaGithub size={20} /> },
  { name: 'Google', icon: <FcGoogle size={20} /> },
];

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-700 relative font-sans ${
      isDarkMode ? 'bg-[#030303] text-slate-200' : 'bg-[#fcfcfd] text-slate-900'
    }`}>
      
      {/* ── Background Mesh (High Fidelity) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-40 -left-20 w-[70%] h-[70%] rounded-full blur-[140px] opacity-40 ${
            isDarkMode ? 'bg-indigo-600/30' : 'bg-indigo-400/40'
          }`} 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -bottom-40 -right-20 w-[60%] h-[60%] rounded-full blur-[140px] opacity-30 ${
            isDarkMode ? 'bg-[#00FF9D]/20' : 'bg-purple-300/50'
          }`} 
        />
      </div>

      {/* --- Adaptive Theme Toggle --- */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-8 right-8 z-[100] p-3 rounded-xl border backdrop-blur-xl transition-all shadow-2xl ${
          isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-white/80 border-slate-200 text-indigo-600 hover:shadow-indigo-100'
        }`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      {/* ── Branding Panel (Linear UI Style) ── */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 flex-col items-center justify-center relative z-10 px-12"
      >
        <div className="max-w-md">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8 text-[10px] font-bold uppercase tracking-[0.2em] ${
            isDarkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <Sparkles size={12} className="text-indigo-500" /> Now in Public Beta
          </div>
          
          <h1 className="text-7xl font-black tracking-tighter mb-6 leading-none">
            Architect <br/> your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-500 to-green-500">workflow.</span>
          </h1>
          
          <p className="text-slate-500 font-medium text-xl mb-12 leading-relaxed">
            The intelligent collaborative engine for high-performance engineering teams.
          </p>

          <div className="grid grid-cols-2 gap-6 opacity-60">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Security</p>
                <p className="text-xs font-mono">AES-256 Encrypted</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Real-time</p>
                <p className="text-xs font-mono">12ms Latency</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Form Panel (Premium Glassmorphism) ── */}
      <div className="flex flex-1 items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md"
        >
          {/* Animated Gradient Border/Glow Effect */}
          <div className={`absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-white to-green-500 opacity-20 blur-sm group-hover:opacity-40 transition duration-1000 animate-pulse`} />

          <div className={`relative w-full backdrop-blur-3xl p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
            isDarkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/90 border-slate-200'
          }`}>
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{mode === 'login' ? 'Sign in' : 'Register'}</h2>
                <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>To continue to CollabNode Core</p>
              </div>
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                <Terminal size={20} className="text-indigo-500" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative">
                    <User className="absolute left-4 top-4 text-slate-500" size={18} />
                    <input
                      className={`w-full bg-transparent border-2 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none transition-all ${
                        isDarkMode ? 'border-white/5 focus:border-indigo-500/50 focus:bg-white/5' : 'border-slate-100 focus:border-indigo-500/50 focus:bg-slate-50'
                      }`}
                      placeholder="Display Name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-500" size={18} />
                <input
                  className={`w-full bg-transparent border-2 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none transition-all ${
                    isDarkMode ? 'border-white/5 focus:border-indigo-500/50 focus:bg-white/5' : 'border-slate-100 focus:border-indigo-500/50 focus:bg-slate-50'
                  }`}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
                <input
                  className={`w-full bg-transparent border-2 rounded-2xl pl-12 pr-12 py-3.5 text-sm outline-none transition-all ${
                    isDarkMode ? 'border-white/5 focus:border-indigo-500/50 focus:bg-white/5' : 'border-slate-100 focus:border-indigo-500/50 focus:bg-slate-50'
                  }`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-500 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                   <input type="checkbox" className="w-3.5 h-3.5 rounded border-2 border-slate-300 accent-indigo-600" />
                   <span className="group-hover:text-slate-400 transition-colors">Remember Me</span>
                </label>
                <button type="button" className="hover:text-indigo-500 transition-colors">Forgot Password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-green-400 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span className="uppercase tracking-widest text-xs">{mode === 'login' ? 'Continue' : 'Create Account'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className={`w-full h-px ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                <span className={`absolute px-4 text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'bg-[#0a0a0a] text-slate-600' : 'bg-white text-slate-400'}`}>Or Login With</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {socialLogins.map((social) => (
                  <button key={social.name} className={`flex items-center justify-center gap-3 py-3 rounded-xl border-2 transition-all font-bold text-xs ${
                    isDarkMode ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}>
                    {social.icon} {social.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs font-bold text-slate-500 hover:text-indigo-500 transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}