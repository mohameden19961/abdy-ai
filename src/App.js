import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const OWNER_NAME = "Abdy Mohameden";
const SYSTEM_PROMPT = `Tu es un assistant IA personnel et dévoué, créé exclusivement pour ${OWNER_NAME}.
Tu t'adresses toujours directement à ${OWNER_NAME} par son prénom.
Tu réponds en français par défaut, mais tu peux aussi répondre en arabe ou en anglais si ${OWNER_NAME} le souhaite.
Tu es intelligent, chaleureux, précis et toujours disponible pour aider ${OWNER_NAME}.
Tu te souviens qu'il habite à Nouakchott, Mauritanie, et tu adaptes tes réponses à son contexte.`;

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const FREE_MODEL = "google/gemini-2.0-flash-001";

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function newConversation() { return { id: generateId(), title: "Nouvelle conversation", messages: [], createdAt: Date.now() }; }
function formatTime(ts) { return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
function formatDate(ts) {
  const d = new Date(ts), today = new Date(), yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0,1,2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
        ${isUser ? "bg-violet-600 text-white" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"}`}>
        {isUser ? "A" : "✦"}
      </div>
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser ? "bg-violet-600 text-white rounded-tr-sm" : "bg-[#1a1a2e] border border-white/10 text-gray-100 rounded-tl-sm"}`}>
          {isUser
            ? <p className="whitespace-pre-wrap">{msg.content}</p>
            : <div className="msg-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
          }
        </div>
        <span className="text-xs text-gray-600 px-1">{formatTime(msg.time)}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("abdy_or_key") || "");
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // mobile: hidden by default

  const [conversations, setConversations] = useState(() => {
    try { const s = localStorage.getItem("abdy_convs_v3"); return s ? JSON.parse(s) : [newConversation()]; }
    catch { return [newConversation()]; }
  });
  const [activeId, setActiveId] = useState(() => {
    try { const s = localStorage.getItem("abdy_convs_v3"); if (s) return JSON.parse(s)[0]?.id; }
    catch {} return null;
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeId) || conversations[0];

  useEffect(() => { if (!activeId && conversations.length > 0) setActiveId(conversations[0].id); }, []);
  useEffect(() => { localStorage.setItem("abdy_convs_v3", JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv?.messages, loading]);

  const saveKey = () => { localStorage.setItem("abdy_or_key", keyInput); setApiKey(keyInput); setShowSettings(false); setError(""); };

  const createConversation = () => {
    const conv = newConversation();
    setConversations(prev => [conv, ...prev]);
    setActiveId(conv.id);
    setInput(""); setError("");
    setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const deleteConversation = (id) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) { const f = newConversation(); setActiveId(f.id); return [f]; }
      if (activeId === id) setActiveId(updated[0].id);
      return updated;
    });
  };

  const selectConversation = (id) => {
    setActiveId(id);
    setShowSidebar(false);
    setError("");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeConv) return;
    if (!apiKey) { setError("⚠️ Configure ta clé API dans ⚙️"); return; }

    const userMsg = { role: "user", content: input.trim(), time: Date.now() };
    const updatedMessages = [...activeConv.messages, userMsg];
    const isFirst = activeConv.messages.length === 0;
    const autoTitle = isFirst ? input.trim().slice(0, 35) + (input.length > 35 ? "…" : "") : activeConv.title;

    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: updatedMessages, title: autoTitle } : c));
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    setLoading(true); setError("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://abdy-ai.vercel.app", "X-Title": "Abdy AI" },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...updatedMessages.map(({ role, content }) => ({ role, content }))],
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Erreur ${res.status}`); }
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "Désolé, pas de réponse.";
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...updatedMessages, { role: "assistant", content: aiText, time: Date.now() }] } : c));
    } catch (e) {
      setError(`❌ ${e.message}`);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const grouped = conversations.reduce((acc, conv) => {
    const label = formatDate(conv.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-[#080810] text-white overflow-hidden relative">

      {/* ══ SIDEBAR OVERLAY (mobile) ══ */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          {/* Drawer */}
          <div className="relative z-50 w-72 max-w-[85vw] h-full bg-[#0d0d1c] border-r border-white/10 flex flex-col shadow-2xl">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg">✦</div>
                <div>
                  <p className="font-bold text-sm text-white leading-none">Abdy AI</p>
                  <p className="text-xs text-violet-400 mt-0.5">Assistant personnel</p>
                </div>
              </div>
              <button onClick={() => setShowSidebar(false)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white text-lg">×</button>
            </div>

            {/* New chat button */}
            <div className="px-3 pt-3 pb-2">
              <button onClick={createConversation}
                className="w-full flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-900/30">
                <span className="text-lg leading-none">+</span>
                Nouveau chat
              </button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-3">
              {Object.entries(grouped).map(([label, convs]) => (
                <div key={label}>
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-3 py-1">{label}</p>
                  {convs.map(conv => (
                    <div key={conv.id} onClick={() => selectConversation(conv.id)}
                      className={`group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer mb-0.5 transition
                        ${activeId === conv.id ? "bg-violet-600/20 border border-violet-500/30" : "hover:bg-white/5 border border-transparent"}`}>
                      <div className="flex-1 min-w-0">
                        {editingId === conv.id ? (
                          <input autoFocus value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onBlur={() => { setConversations(p => p.map(c => c.id === conv.id ? { ...c, title: editTitle || "Sans titre" } : c)); setEditingId(null); }}
                            onKeyDown={e => { if (e.key === "Enter") { setConversations(p => p.map(c => c.id === conv.id ? { ...c, title: editTitle || "Sans titre" } : c)); setEditingId(null); } }}
                            onClick={e => e.stopPropagation()}
                            className="w-full bg-black/40 border border-violet-500/60 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" />
                        ) : (
                          <>
                            <p className="text-sm font-medium truncate text-gray-200 leading-tight">{conv.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{conv.messages.length} message{conv.messages.length !== 1 ? "s" : ""}</p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditingId(conv.id); setEditTitle(conv.title); }}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white text-xs">✏️</button>
                        <button onClick={() => deleteConversation(conv.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-900/40 flex items-center justify-center text-gray-500 hover:text-red-400 text-xs">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <p className="text-xs text-gray-500">Gemini 2.0 Flash · {conversations.length} chat{conversations.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN AREA ══ */}
      <div className="flex flex-col flex-1 min-w-0 w-full">

        {/* ── TOP HEADER ── */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0d0d1c]/95 backdrop-blur-md sticky top-0 z-30">
          {/* Menu button */}
          <button onClick={() => setShowSidebar(true)}
            className="w-9 h-9 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-gray-300 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm text-white truncate leading-tight">
              {activeConv?.title || "Nouvelle conversation"}
            </h1>
            <p className="text-xs text-gray-500">{activeConv?.messages.length || 0} messages · Gemini 2.0</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={createConversation}
              className="w-9 h-9 rounded-xl bg-violet-600/80 active:bg-violet-500 flex items-center justify-center text-white text-xl font-bold">
              +
            </button>
            <button onClick={() => setShowSettings(!showSettings)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition text-base
                ${showSettings ? "bg-violet-600 text-white" : "bg-white/5 active:bg-white/15 text-gray-300"}`}>
              ⚙️
            </button>
          </div>
        </header>

        {/* ── SETTINGS PANEL ── */}
        {showSettings && (
          <div className="bg-[#0f0f20] border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <p className="text-xs text-green-400 font-semibold">Gemini 2.0 Flash (OpenRouter)</p>
            </div>
            <div className="flex gap-2">
              <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveKey()}
                placeholder="sk-or-v1-..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 font-mono min-w-0" />
              <button onClick={saveKey}
                className="px-4 py-2.5 bg-violet-600 active:bg-violet-500 text-white rounded-xl text-sm font-bold transition flex-shrink-0">
                ✓
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Clé gratuite : <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-violet-400">openrouter.ai/keys</a></p>
          </div>
        )}

        {/* ── MESSAGES ── */}
        <main className="flex-1 overflow-y-auto px-4 py-4 overscroll-none">
          {(!activeConv || activeConv.messages.length === 0) && (
            <div className="flex flex-col items-center justify-center min-h-full gap-5 text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center text-2xl shadow-2xl shadow-violet-900/50">✦</div>
              <div>
                <h2 className="text-xl font-bold text-white">Bonjour, Abdy ! 👋</h2>
                <p className="text-gray-500 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">Ton assistant IA personnel est prêt à t'aider !</p>
              </div>
              {!apiKey && (
                <button onClick={() => setShowSettings(true)}
                  className="px-5 py-3 bg-violet-600 active:bg-violet-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-violet-900/30">
                  ⚙️ Configurer la clé API
                </button>
              )}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {["Explique-moi React hooks", "Aide-moi à apprendre l'arabe", "Recette mauritanienne traditionnelle", "Quelle heure à Nouakchott ?"].map(q => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="w-full px-4 py-3 bg-white/5 active:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 text-left transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConv?.messages.map((msg, i) => <Message key={i} msg={msg} />)}

          {loading && (
            <div className="flex gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs flex-shrink-0">✦</div>
              <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl rounded-tl-sm"><TypingDots /></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2 mb-4">
              <span className="flex-shrink-0">⚠️</span><span>{error}</span>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </main>

        {/* ── INPUT BAR ── */}
        <footer className="px-3 pb-4 pt-2 border-t border-white/10 bg-[#0d0d1c]/95 backdrop-blur-md">
          <div className="flex gap-2 items-end">
            <textarea
              ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKey}
              placeholder="Pose ta question, Abdy…"
              rows={1}
              className="flex-1 resize-none bg-white/5 border border-white/10 focus:border-violet-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition overflow-hidden"
              style={{ lineHeight: "1.6", minHeight: "44px", maxHeight: "120px" }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition text-base
                ${loading || !input.trim()
                  ? "bg-white/5 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-br from-violet-600 to-indigo-600 active:scale-95 text-white shadow-lg shadow-violet-900/40"}`}>
              {loading ? "⏳" : "➤"}
            </button>
          </div>
          <p className="text-center text-xs text-gray-700 mt-1.5">Entrée envoyer · Shift+Entrée nouvelle ligne</p>
        </footer>
      </div>
    </div>
  );
}
