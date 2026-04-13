import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Plus, LogOut, Hash, Clock, Code2, 
  ChevronRight, Search, LayoutGrid, 
  Activity, Terminal, Sparkles, Globe, Sun, Moon, Trash2, Command, Shield
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
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-emerald-500/30 ${
      isDarkMode ? 'bg-[#020604] text-slate-200' : 'bg-[#f7fee7]/30 text-slate-900'
    }`}>
      
      {/* ── High-End Emerald Mesh ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[100px] ${
            isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-200/50'
          }`} 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] ${
            isDarkMode ? 'bg-lime-900/10' : 'bg-teal-100/40'
          }`} 
        />
      </div>

      {/* ── Responsive Advanced Navbar ── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-2xl border-b px-4 md:px-8 h-16 md:h-20 flex items-center justify-between transition-all duration-500 ${
        isDarkMode ? 'bg-black/40 border-emerald-500/10 shadow-2xl shadow-emerald-900/20' : 'bg-white/60 border-emerald-100 shadow-sm shadow-emerald-200/50'
      }`}>
        <div className="flex items-center gap-3 md:gap-4">
          <motion.div 
            whileHover={{ rotate: 90 }}
            className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all duration-500 ${
              isDarkMode ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20' : 'bg-white text-emerald-600 border border-emerald-200 shadow-xl shadow-emerald-100'
            }`}
          >
            <Shield className="w-5 h-5 md:w-6 md:h-6" />
          </motion.div>
          <div>
            <span className="text-lg md:text-xl font-black tracking-tight leading-none">Emerald<span className="text-emerald-500">Core</span></span>
            <p className="hidden md:block text-[9px] font-mono uppercase tracking-[0.3em] opacity-40">Node_Active: v4.2</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all ${
              isDarkMode ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-600 shadow-sm'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          <div className={`hidden sm:flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-emerald-200'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xs">
              {user?.username?.[0]}
            </div>
            <span className="text-xs font-bold tracking-tight">@{user?.username}</span>
          </div>
          
          <button onClick={logout} className="p-2 md:p-3 text-slate-400 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 relative z-10">
        
        {/* ── Advanced Bento Header ── */}
        <header className="mb-12 md:mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 font-bold text-[9px] uppercase tracking-[0.3em] mb-4 px-3 py-1 rounded-full border ${
              isDarkMode ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-emerald-700 border-emerald-200 bg-emerald-50'
            }`}>
              <Sparkles className="w-3 h-3" /> System Operational
            </div>
            <h1 className={`text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Master <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-lime-400">Stream.</span>
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-sm mx-auto lg:mx-0">Collaborative terminal nodes for high-end developers.</p>
          </motion.div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <BentoInput 
              icon={<Plus />} 
              placeholder="New node name..." 
              value={newRoomName} 
              onChange={setNewRoomName} 
              onSubmit={handleCreateRoom} 
              label="Deploy" 
              loading={creating}
              isDarkMode={isDarkMode}
            />
            <BentoInput 
              icon={<Search />} 
              placeholder="Enter node ID..." 
              value={joinId} 
              onChange={setJoinId} 
              onSubmit={handleJoinRoom} 
              label="Link"
              isDarkMode={isDarkMode}
            />
          </div>
        </header>

        {/* ── Dynamic Grid ── */}
        <section>
          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
              Active Nodes
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-500/20 via-slate-500/20 to-transparent" />
          </div>

          <AnimatePresence mode="wait">
            {roomsLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 opacity-50">
                <Activity className="w-10 h-10 animate-spin text-emerald-500" />
              </motion.div>
            ) : rooms.length === 0 ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`border-2 border-dashed rounded-[2.5rem] md:rounded-[4rem] p-16 md:p-32 text-center ${
                  isDarkMode ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-emerald-200 bg-emerald-50/50'
                }`}>
                <p className="text-emerald-500/50 font-black text-xl md:text-2xl uppercase italic">No Active Nodes</p>
              </motion.div>
            ) : (
              <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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

function BentoInput({ icon, placeholder, value, onChange, onSubmit, label, loading, isDarkMode }) {
  return (
    <div className={`p-1 rounded-2xl md:rounded-[2rem] border transition-all duration-500 group w-full lg:min-w-[340px] ${
      isDarkMode ? 'bg-white/5 border-emerald-500/10 focus-within:border-emerald-500/40 shadow-2xl' : 'bg-white border-emerald-200 focus-within:border-emerald-400 shadow-xl'
    }`}>
      <form onSubmit={onSubmit} className="flex items-center">
        <div className={`p-3 md:p-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors`}>{icon}</div>
        <input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none flex-1 text-xs md:text-sm font-medium placeholder:text-slate-500 w-full"
        />
        <button 
          disabled={loading}
          className={`mr-1 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${
            isDarkMode ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
          }`}
        >
          {loading ? '...' : label}
        </button>
      </form>
    </div>
  );
}

function RoomCard({ room, onClick, isDarkMode, onDelete }) {
  const date = new Date(room.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 cursor-pointer transition-all duration-500 border ${
        isDarkMode ? 'bg-[#080c0a] border-emerald-500/10 hover:border-emerald-500/40 shadow-black shadow-2xl' : 'bg-white border-emerald-100 hover:border-emerald-400 shadow-xl shadow-emerald-900/5'
      }`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-10 h-1 w-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-b-full opacity-30" />

      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${
            isDarkMode ? 'bg-emerald-500/5 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-inner'
          }`}>
            <Code2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
            isDarkMode ? 'bg-emerald-400/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {room.language || 'Generic'}
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Erase node from core?')) onDelete();
          }}
          className={`p-2.5 rounded-xl transition-all ${
            isDarkMode ? 'bg-white/0 hover:bg-red-500/10 text-slate-600 hover:text-red-500' : 'bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      <h4 className={`text-xl md:text-2xl font-black mb-1 truncate tracking-tight transition-colors ${
        isDarkMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-emerald-600'
      }`}>
        {room.name}
      </h4>
      
      <div className="flex items-center gap-2 text-slate-500 mb-6 md:mb-8 font-mono text-[10px] md:text-[11px] tracking-tighter">
        <Hash className="w-3 h-3 opacity-30" />
        <span className="opacity-60">{room.id}</span>
      </div>

      <div className={`flex items-center justify-between pt-5 md:pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-emerald-100'}`}>
         <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3 h-3 opacity-40" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{date}</span>
         </div>
         <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
           isDarkMode ? 'bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black' : 'bg-slate-50 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
         }`}>
           <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
         </div>
      </div>
    </motion.div>
  );
}