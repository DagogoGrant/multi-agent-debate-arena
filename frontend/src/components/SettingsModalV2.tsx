import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Key, Cloud, Check, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  setConfig: (config: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, setConfig }: SettingsModalProps) {
  const { token } = useAuth();
  
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  const [hasOpenAI, setHasOpenAI] = useState(false);
  const [hasAnthropic, setHasAnthropic] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCreds = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
      const res = await fetch(`${apiUrl}/auth/credentials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHasOpenAI(data.has_openai);
        setHasAnthropic(data.has_anthropic);
        setHasGemini(data.has_gemini);
        setIsGoogleLinked(data.is_google_linked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCreds();
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
      await fetch(`${apiUrl}/auth/credentials`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          openai_api_key: openaiKey || null,
          anthropic_api_key: anthropicKey || null,
          gemini_api_key: geminiKey || null
        })
      });
      await fetchCreds();
      setOpenaiKey('');
      setAnthropicKey('');
      setGeminiKey('');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectVertex = () => {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
    window.location.href = `${apiUrl}/auth/vertex/login`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Integrations</h2>
            <p className="text-sm text-slate-400 mt-1">Connect your LLM providers securely.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Vertex AI Section */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Cloud className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-200">Google Cloud Vertex AI</h3>
                    {isGoogleLinked && (
                      <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-6 max-w-md">
                    Connect your Google Cloud account securely via OAuth to unlock powerful enterprise models like Gemini Pro without manually managing API keys.
                  </p>
                  
                  <button 
                    onClick={handleConnectVertex}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isGoogleLinked ? "Reconnect Google Cloud" : "Connect Google Cloud"}
                  </button>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="space-y-5">
                <h3 className="text-[15px] font-semibold text-slate-200">Standard API Keys</h3>
                <p className="text-sm text-slate-400">Keys are stored securely in your database instance.</p>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  {/* OpenAI */}
                  <div>
                    <label className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
                      OpenAI API Key
                      {hasOpenAI && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-slate-500" />
                      </div>
                      <input 
                        type="password" 
                        value={openaiKey}
                        onChange={e => setOpenaiKey(e.target.value)}
                        placeholder={hasOpenAI ? "••••••••••••••••••••••••" : "sk-..."}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Anthropic */}
                  <div>
                    <label className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
                      Anthropic API Key
                      {hasAnthropic && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-slate-500" />
                      </div>
                      <input 
                        type="password" 
                        value={anthropicKey}
                        onChange={e => setAnthropicKey(e.target.value)}
                        placeholder={hasAnthropic ? "••••••••••••••••••••••••" : "sk-ant-..."}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Gemini */}
                  <div>
                    <label className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
                      Gemini API Key
                      {hasGemini && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-slate-500" />
                      </div>
                      <input 
                        type="password" 
                        value={geminiKey}
                        onChange={e => setGeminiKey(e.target.value)}
                        placeholder={hasGemini ? "••••••••••••••••••••••••" : "AIzaSy..."}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 items-center pt-6 border-t border-white/10">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors">
              Close
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-sm flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Keys
            </button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}

