import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, LogOut, Hash, Clock, Code2, 
  ChevronRight, Search, LayoutGrid, 
  Activity, Terminal, Sparkles, Globe, Sun, Moon
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

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    setError('');
    try {
      const res = await createRoom({ name: newRoomName.trim() });
      navigate(`/room/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Initialization failed');
      setCreating(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const raw = joinId.trim();
    const id = raw.includes('/room/') ? raw.split('/room/').pop() : raw;
    if (id) navigate(`/room/${id}`);
  };
  const handleDeleteRoom = async (id) => {
  try {
    await deleteRoom(id)
    setRooms((prev) => prev.filter((r) => r.id !== id))
  } catch (err) {
    alert('Failed to delete room')
  }
}

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans relative overflow-hidden ${
      isDarkMode ? 'bg-[#050505] text-slate-200' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* ── Dynamic Background Mesh ── */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-opacity duration-700 ${
        isDarkMode ? 'bg-indigo-900/20 opacity-40' : 'bg-indigo-200/40 opacity-100'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 ${
        isDarkMode ? 'bg-pink-900/10 opacity-30' : 'bg-pink-200/30 opacity-100'
      }`} />

      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 h-16 flex items-center justify-between shadow-sm transition-all duration-500 ${
        isDarkMode ? 'bg-black/60 border-white/5 shadow-2xl' : 'bg-white/70 border-slate-200/60'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shadow-lg transition-all ${
            isDarkMode ? 'bg-white text-black shadow-white/5' : 'bg-indigo-600 text-white shadow-indigo-200'
          }`}>
            <Terminal className="w-5 h-5" />
          </div>
          <span className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Collab<span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>Code</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-yellow-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-600'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
            <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {user?.username}
            </span>
          </div>
          
          <button onClick={logout} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* ── Hero Section ── */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em] mb-2 ${
              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              <Sparkles className="w-4 h-4" /> Node Active
            </div>
            <h1 className={`text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Welcome back.
            </h1>
          </motion.div>
          <div className="flex gap-4">
             <div className={`border p-4 rounded-2xl shadow-sm transition-all ${
               isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
             }`}>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Rooms</p>
                <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{rooms.length}</p>
             </div>
          </div>
        </header>

        {/* ── Action Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Create Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className={`border rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl transition-all duration-500 ${
              isDarkMode ? 'bg-[#0A0A0A] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${
                isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Plus className="w-6 h-6" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Initialize Room</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Start a new secure environment for real-time collaboration.</p>
              
              <form onSubmit={handleCreateRoom} className="relative">
                <input
                  className={`w-full border rounded-2xl pl-5 pr-32 py-4 text-sm focus:outline-none focus:ring-4 transition-all ${
                    isDarkMode ? 'bg-black border-white/10 text-white focus:border-indigo-400 focus:ring-indigo-400/5' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                  }`}
                  placeholder="Deployment name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <button
                  disabled={creating || !newRoomName.trim()}
                  className={`absolute right-2 top-2 bottom-2 text-white font-bold text-xs uppercase tracking-wider px-6 rounded-xl disabled:opacity-50 transition-all ${
                    isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100'
                  }`}
                >
                  {creating ? 'Wait' : 'Create'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Join Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className={`border rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl transition-all duration-500 ${
              isDarkMode ? 'bg-[#0A0A0A] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${
                isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'
              }`}>
                <Globe className="w-6 h-6" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Connect to Node</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Join an existing session via unique hash ID or link.</p>
              
              <form onSubmit={handleJoinRoom} className="relative">
                <input
                  className={`w-full border rounded-2xl pl-5 pr-32 py-4 text-sm focus:outline-none focus:ring-4 transition-all ${
                    isDarkMode ? 'bg-black border-white/10 text-white focus:border-pink-400 focus:ring-pink-400/5' : 'bg-slate-50 border-slate-200 focus:border-pink-500 focus:ring-pink-500/5'
                  }`}
                  placeholder="Enter Link or Hash..."
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                />
                <button
                  disabled={!joinId.trim()}
                  className={`absolute right-2 top-2 bottom-2 text-white font-bold text-xs uppercase tracking-wider px-6 rounded-xl transition-all ${
                    isDarkMode ? 'bg-pink-500 hover:bg-pink-400' : 'bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-100'
                  }`}
                >
                  Connect
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* ── Rooms List ── */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">
              Deployments
            </h3>
            <div className={`h-px w-full transition-colors duration-500 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
          </div>

          <AnimatePresence mode="wait">
            {roomsLoading ? (
              <div className={`flex items-center gap-3 font-bold text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                <Activity className="w-5 h-5 animate-spin" />
                Syncing with Database...
              </div>
            ) : rooms.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`border-2 border-dashed rounded-[3rem] p-20 text-center transition-all ${
                  isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200'
                }`}
              >
                <Code2 className="w-12 h-12 text-slate-400 mx-auto mb-6" />
                <p className="text-slate-500 font-bold text-lg">No active nodes.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial="hidden" animate="show"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
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
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function RoomCard({ room, onClick, isDarkMode, onDelete }) {
  const date = new Date(room.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      onClick={onClick}
      className={`group border rounded-[2rem] p-6 cursor-pointer transition-all shadow-sm hover:shadow-xl relative overflow-hidden ${
        isDarkMode ? 'bg-[#0A0A0A] border-white/5 hover:border-indigo-500/50 shadow-black' : 'bg-white border-slate-200 hover:border-indigo-400 shadow-indigo-500/5'
      }`}
    >

      {/* ✅ DELETE BUTTON ADDED */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Delete this room?')) onDelete()
        }}
        className="absolute top-3 right-3 text-red-500 hover:text-red-600 text-xs z-10"
      >
        Delete
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isDarkMode ? 'bg-white/5 text-slate-400 group-hover:text-indigo-400' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-600'
          }`}>
            <Code2 className="w-5 h-5" />
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
            isDarkMode ? 'bg-white/5 text-slate-500 group-hover:text-indigo-400' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50'
          }`}>
            {room.language || 'text'}
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {date}
        </span>
      </div>

      <h4 className={`text-lg font-bold mb-2 truncate transition-colors ${
        isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'
      }`}>
        {room.name}
      </h4>

      <div className="flex items-center gap-1.5 text-slate-500 mb-6">
        <Hash className="w-3.5 h-3.5" />
        <span className="text-[11px] font-mono tracking-tighter truncate">{room.id}</span>
      </div>

      <div className={`flex items-center justify-between pt-5 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex -space-x-2">
          {[1, 2].map(i => (
            <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
              isDarkMode ? 'bg-slate-800 border-black text-slate-500' : 'bg-slate-100 border-white text-slate-400'
            }`}>U</div>
          ))}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isDarkMode ? 'bg-white/5 group-hover:bg-indigo-500 text-slate-500 group-hover:text-black' : 'bg-slate-50 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white'
        }`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

    </motion.div>
  );
}