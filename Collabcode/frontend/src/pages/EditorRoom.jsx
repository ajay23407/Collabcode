import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MonacoEditor from '@monaco-editor/react';
import { 
  Play, ChevronLeft, Users, Share2, 
  MessageSquare, Terminal, Settings, 
  Send, X, Sun, Moon, Zap, Globe, Copy, Check
} from 'lucide-react';
import { getRoom, updateRoomLanguage } from '../api';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useYjs } from '../hooks/useYjs';
import OutputPanel from '../components/Outputpanel';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'html', 'css'];

const usernameToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 75%, 60%)`;
};

export default function EditorRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [editorInstance, setEditorInstance] = useState(null);
  const [monacoInstance, setMonacoInstance] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [running, setRunning] = useState(false);
  const [outputResult, setOutputResult] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  const { synced: yjsSynced, connected: yjsConnected } = useYjs({
    roomId,
    username: user?.username,
    editor: editorInstance,
    monaco: monacoInstance,
  });

  // --- Share Logic ---
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    getRoom(roomId)
      .then((res) => { setRoom(res.data); setLanguage(res.data.language); })
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!socket || !room) return;
    socket.emit('join-room', { roomId, username: user.username, color: usernameToColor(user.username) });

    socket.on('room-joined', ({ language: lang, members: m }) => { setLanguage(lang); setMembers(m || []); });
    socket.on('user-joined', ({ username, members: m }) => {
      setMembers(m || []);
      setMessages((p) => [...p, { type: 'system', text: `${username} synced to stream` }]);
    });
    socket.on('user-left', ({ username, members: m }) => {
      setMembers(m || []);
      setMessages((p) => [...p, { type: 'system', text: `${username} disconnected` }]);
    });
    socket.on('language-updated', ({ language: lang }) => setLanguage(lang));
    socket.on('new-message', (msg) => setMessages((p) => [...p, msg]));
    
    socket.on('execution-started', () => { setRunning(true); setShowOutput(true); setOutputResult(null); });
    socket.on('execution-result', (result) => { setRunning(false); setOutputResult(result); setShowOutput(true); });

    return () => {
      socket.off('room-joined'); socket.off('user-joined');
      socket.off('user-left'); socket.off('language-updated');
      socket.off('new-message'); socket.off('execution-started');
      socket.off('execution-result');
    };
  }, [socket, room, roomId, user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleEditorMount = useCallback((editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
  }, []);

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    socket?.emit('language-change', { roomId, language: lang });
    await updateRoomLanguage(roomId, lang).catch(console.error);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket?.emit('send-message', { roomId, text: chatInput.trim() });
    setChatInput('');
  };

  const handleRunCode = async () => {
    if (running) return;
    const code = editorInstance?.getValue();
    if (!code?.trim()) return;
    if (['html', 'css'].includes(language)) {
      setOutputResult({ stdout: '', stderr: `Markup engine cannot execute ${language.toUpperCase()}.`, exitCode: 1 });
      setShowOutput(true); return;
    }
    socket?.emit('execution-started', { roomId, username: user.username });
    setRunning(true); setShowOutput(true); setOutputResult(null);
    const startTime = Date.now();
    try {
      const res = await api.post('/api/execute', { code, language, roomId });
      const result = { ...res.data, duration: Date.now() - startTime };
      socket?.emit('execution-result', { roomId, result });
      setOutputResult(result);
    } catch (err) {
      const errorResult = { stdout: '', stderr: 'Execution Failed.', exitCode: 1, duration: 0 };
      socket?.emit('execution-result', { roomId, result: errorResult });
      setOutputResult(errorResult);
    } finally { setRunning(false); }
  };

  if (loading) return (
    <div className={`h-screen flex flex-col items-center justify-center font-mono transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div className={`w-12 h-12 border-2 rounded-full animate-spin mb-4 ${isDarkMode ? 'border-emerald-500/20 border-t-emerald-500' : 'border-indigo-200 border-t-indigo-600'}`} />
      <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>LOADING_SESSION...</span>
    </div>
  );

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#050505] text-slate-300' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* --- Top Command Bar --- */}
      <header className={`h-14 min-h-[56px] border-b flex items-center justify-between px-4 z-40 transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        
        {/* Left Section: Added flex-1 and min-w-0 for truncation */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 mr-2">
          <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-lg transition-all shrink-0 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className={`h-8 w-px hidden md:block shrink-0 ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`} />
          <div className="flex flex-col min-w-0">
            <h1 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{room?.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${yjsSynced ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
              <span className="text-[10px] font-mono uppercase tracking-tighter opacity-60 truncate">{language} // {yjsSynced ? 'Ready' : 'Syncing'}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Added shrink-0 to prevent button squishing */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Share Button */}
          <button 
            onClick={() => setShowShare(true)}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-2 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-indigo-600'}`}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Share</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-indigo-600'}`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className={`hidden lg:flex items-center rounded-xl p-1 border transition-colors ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-[11px] font-bold uppercase tracking-wider px-3 outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l} value={l} className={isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'}>{l}</option>)}
            </select>
          </div>

          <button onClick={() => setShowChat(!showChat)} className={`p-2 sm:p-2.5 rounded-xl border transition-all ${showChat ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-indigo-50 border-indigo-200 text-indigo-600') : (isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')}`}>
            <MessageSquare className="w-4 h-4" />
          </button>

          <button onClick={handleRunCode} disabled={running} className={`ml-1 sm:ml-2 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.15em] transition-all ${running ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : (isDarkMode ? 'bg-emerald-500 text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700')}`}>
            {running ? <Zap className="w-3 h-3 animate-bounce" /> : <Play className="fill-current w-3 h-3" />}
            <span className="hidden xs:inline">{running ? '...' : 'Run'}</span>
          </button>
        </div>
      </header>

      {/* Share Modal Overlay */}
      <AnimatePresence>
        {showShare && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowShare(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-500" /> Share Room
                </h3>
                <button onClick={() => setShowShare(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-6">Invite others to collaborate in real-time by sharing this unique link.</p>
              
              <div className="flex gap-2 relative">
                <input 
                  readOnly 
                  value={window.location.href}
                  className={`flex-1 text-xs font-mono p-4 rounded-xl border outline-none ${isDarkMode ? 'bg-black border-white/10 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-600'}`}
                />
                <button 
                  onClick={handleCopyLink}
                  className={`px-4 rounded-xl border flex items-center gap-2 transition-all ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : (isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50')}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-[10px] font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Workspace --- */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={language}
              theme={isDarkMode ? 'vs-dark' : 'light'}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 20 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all"
              }}
            />
          </div>

          <AnimatePresence>
            {showOutput && (
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className={`absolute bottom-0 left-0 right-0 h-1/3 z-30 shadow-2xl ${isDarkMode ? 'bg-[#080808]' : 'bg-white'}`}>
                <OutputPanel result={outputResult} running={running} onClose={() => setShowOutput(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className={`w-80 border-l flex flex-col z-20 transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="p-5 border-b border-inherit flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                  <Users className="w-3 h-3" /> Live Session
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>{members.length}</span>
              </div>

              <div className="p-4 flex flex-wrap gap-2 overflow-y-auto max-h-[120px]">
                {members.map((m) => (
                  <div key={m.socketId} className={`flex items-center gap-2 border px-2 py-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-black border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: usernameToColor(m.username) }} />
                    <span className="text-[11px] font-bold opacity-80">{m.username}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col min-h-0 border-t border-inherit">
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.type === 'system' ? 'items-center opacity-40' : ''}`}>
                      {msg.type !== 'system' && <span className="text-[10px] font-bold mb-1" style={{ color: usernameToColor(msg.username) }}>{msg.username}</span>}
                      <p className={`text-[12px] leading-relaxed p-3 rounded-2xl rounded-tl-none ${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className={`p-4 ${isDarkMode ? 'bg-[#080808]' : 'bg-slate-50'}`}>
                  <div className="relative">
                    <input
                      className={`w-full border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none transition-all ${isDarkMode ? 'bg-black border-white/10 focus:border-emerald-500/50' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 ${isDarkMode ? 'text-slate-500 hover:text-emerald-500' : 'text-slate-400 hover:text-indigo-600'}`}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}