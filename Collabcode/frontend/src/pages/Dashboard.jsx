import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Plus, LogOut, Hash, Clock, Code2, 
  ChevronRight, Search, LayoutGrid, 
  Activity, Terminal, Sparkles, Globe, Sun, Moon, Trash2, Command
} from 'lucide-react';
import { createRoom, getMyRooms, deleteRoom } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    getMyRooms()
      .then((res) => setRooms(res.data))
      .catch(() => setRooms([]))
      .finally(() => setRoomsLoading(false));
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const res = await createRoom({ name: newRoomName.trim() });
      navigate(`/room/${res.data.id}`);
    } catch (err) {
      setError('Initialization failed');
      setCreating(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const id = joinId.trim().includes('/room/') ? joinId.trim().split('/room/').pop() : joinId.trim();
    if (id) navigate(`/room/${id}`);
  };

  const handleDeleteRoom = async (id) => {
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete node');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-indigo-500/30 ${
      isDarkMode ? 'bg-[#030303] text-slate-200' : 'bg-[#fcfcfd] text-slate-900'
    }`}>
      
      {/* ── High-End Mesh Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] ${
            isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-200/40'
          }`} 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [0, -50, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] ${
            isDarkMode ? 'bg-fuchsia-600/10' : 'bg-pink-100/50'
          }`} 
        />
      </div>

      {/* ── Advanced Navbar ── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-2xl border-b px-8 h-20 flex items-center justify-between transition-all duration-500 ${
        isDarkMode ? 'bg-black/40 border-white/5 shadow-2xl shadow-black/50' : 'bg-white/60 border-slate-200/60 shadow-sm shadow-slate-200/50'
      }`}>
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className={`p-2.5 rounded-2xl shadow-2xl transition-all duration-500 ${
              isDarkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20' : 'bg-white text-indigo-600 border border-slate-200 shadow-xl shadow-indigo-100'
            }`}
          >
            <Command className="w-6 h-6" />
          </motion.div>
          <div className="hidden md:block">
            <span className="text-xl font-black tracking-tight leading-none">Collab<span className="text-indigo-500">Node</span></span>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">System.v2.0.4</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-2xl border transition-all duration-300 group ${
              isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-yellow-400' : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-600'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className={`hidden sm:flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-indigo-500/20">
              {user?.username?.[0]}
            </div>
            <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              @{user?.username}
            </span>
          </div>
          
          <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        
        {/* ── Advanced Bento Header ── */}
        <header className="mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl">
            <div className={`inline-flex items-center gap-2 font-bold text-[10px] uppercase tracking-[0.4em] mb-4 px-3 py-1 rounded-full border ${
              isDarkMode ? 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5' : 'text-indigo-600 border-indigo-200 bg-indigo-50'
            }`}>
              <Sparkles className="w-3 h-3" /> Core Engine Active
            </div>
            <h1 className={`text-7xl font-black tracking-tighter mb-4 leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Control <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Workspace.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-sm">Deploy high-availability coding environments in milliseconds.</p>
          </motion.div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row gap-4">
            <BentoInput 
              icon={<Plus />} 
              placeholder="New session name..." 
              value={newRoomName} 
              onChange={setNewRoomName} 
              onSubmit={handleCreateRoom} 
              label="Initialize" 
              loading={creating}
              isDarkMode={isDarkMode}
            />
            <BentoInput 
              icon={<Search />} 
              placeholder="Room ID / Link..." 
              value={joinId} 
              onChange={setJoinId} 
              onSubmit={handleJoinRoom} 
              label="Connect"
              isDarkMode={isDarkMode}
            />
          </div>
        </header>

        {/* ── Dynamic Grid ── */}
        <section>
          <div className="flex items-center gap-6 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">
              Active Repositories
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
          </div>

          <AnimatePresence mode="wait">
            {roomsLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Activity className="w-10 h-10 animate-spin text-indigo-500" />
                <span className="font-mono text-xs tracking-widest uppercase">Fetching Stream...</span>
              </motion.div>
            ) : rooms.length === 0 ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`border-2 border-dashed rounded-[4rem] p-32 text-center transition-all ${
                  isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                <Terminal className="w-16 h-16 text-slate-400 mx-auto mb-8 opacity-20" />
                <p className="text-slate-400 font-black text-2xl tracking-tighter uppercase italic">No Nodes Detected</p>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="mt-6 text-indigo-500 font-bold text-sm uppercase tracking-widest hover:underline underline-offset-8">Deploy First Node</button>
              </motion.div>
            ) : (
              <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rooms.map((room) => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      isDarkMode={isDarkMode} 
                      onClick={() => navigate(`/room/${room.id}`)} 
                      onDelete={() => handleDeleteRoom(room.id)} 
                    />
                  ))}
                </motion.div>
              </LayoutGroup>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

/* ── Helper Component: Advanced Input ── */
function BentoInput({ icon, placeholder, value, onChange, onSubmit, label, loading, isDarkMode }) {
  return (
    <div className={`p-1 rounded-[2rem] border transition-all duration-500 group min-w-[320px] ${
      isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 shadow-2xl' : 'bg-white border-slate-200 focus-within:border-indigo-400 shadow-xl shadow-slate-200/50'
    }`}>
      <form onSubmit={onSubmit} className="flex items-center">
        <div className={`p-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>{icon}</div>
        <input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none flex-1 text-sm font-medium placeholder:text-slate-500"
        />
        <button 
          disabled={loading}
          className={`mr-1 px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
            isDarkMode ? 'bg-white text-black hover:bg-indigo-500 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
          }`}
        >
          {loading ? '...' : label}
        </button>
      </form>
    </div>
  );
}

/* ── Helper Component: Advanced Room Card ── */
function RoomCard({ room, onClick, isDarkMode, onDelete }) {
  const date = new Date(room.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`group relative rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 border ${
        isDarkMode ? 'bg-[#0A0A0A] border-white/5 hover:border-indigo-500/40 shadow-black shadow-2xl' : 'bg-white border-slate-200 hover:border-indigo-400 shadow-xl shadow-slate-200/40'
      }`}
      onClick={onClick}
    >
      {/* Visual Language Accent */}
      <div className="absolute top-0 right-10 h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-b-full opacity-50" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isDarkMode ? 'bg-white/5 text-indigo-400 group-hover:scale-110' : 'bg-slate-50 text-indigo-600 group-hover:scale-110 shadow-inner'
          }`}>
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
              isDarkMode ? 'bg-indigo-400/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {room.language || 'Generic'}
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Erase node from core?')) onDelete();
          }}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            isDarkMode ? 'bg-white/0 hover:bg-red-500/10 text-slate-600 hover:text-red-500' : 'bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h4 className={`text-2xl font-black mb-1 truncate tracking-tight transition-colors ${
        isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'
      }`}>
        {room.name}
      </h4>
      
      <div className="flex items-center gap-2 text-slate-500 mb-8 font-mono text-[11px] tracking-tighter">
        <Hash className="w-3 h-3 opacity-30" />
        <span className="opacity-60">{room.id}</span>
      </div>

      <div className={`flex items-center justify-between pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
         <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 opacity-40" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{date}</span>
         </div>
         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
           isDarkMode ? 'bg-white/5 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg shadow-indigo-200'
         }`}>
           <ChevronRight className="w-5 h-5" />
         </div>
      </div>
    </motion.div>
  );
}