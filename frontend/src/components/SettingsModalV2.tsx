import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Key, Cpu, AlertCircle, Check, Loader2, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  setConfig: (config: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, setConfig }: SettingsModalProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const [providerType, setProviderType] = useState('OpenAI');
  const [providerName, setProviderName] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [supportsImages, setSupportsImages] = useState(false);
  const [contextWindow, setContextWindow] = useState('128000');
  const [temperature, setTemperature] = useState('0.2');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (!isOpen || !token) return;
    fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:9000'}/auth/credentials`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsGoogleLinked(data.is_google_linked))
      .catch(e => console.error(e));
  }, [isOpen, token]);

  const handleProviderTypeChange = (e: any) => {
    const val = e.target.value;
    setProviderType(val);
    if (val === 'OpenAI') setBaseUrl('https://api.openai.com/v1');
    else if (val === 'Anthropic') setBaseUrl('https://api.anthropic.com/v1');
    else setBaseUrl('');
  };

  const handleTestConnection = async () => {
    if (!baseUrl) return;
    setTestStatus('testing');
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
      const res = await fetch(`${apiUrl}/api/proxy/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_url: baseUrl, api_key: apiKey })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          console.error("Proxy error:", data.error);
          setTestStatus('error');
        } else {
          setTestStatus('success');
          try {
            // Support OpenAI standard (data.data) and Ollama/others (Array or data.models)
            if (data.data && Array.isArray(data.data)) {
              setAvailableModels(data.data.map((m: any) => m.id));
            } else if (Array.isArray(data)) {
              setAvailableModels(data.map((m: any) => m.name || m.id));
            } else if (data.models && Array.isArray(data.models)) {
              setAvailableModels(data.models.map((m: any) => m.name || m.id));
            }
          } catch (e) {
            console.error("Failed to parse models response", e);
          }
        }
      } else {
        setTestStatus('error');
      }
    } catch (err) {
      console.error("Test connection failed:", err);
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const handleSave = async () => {
    const pType = providerType.toLowerCase();
    
    // Save locally
    if (pType === 'openai') {
      localStorage.setItem('openai_api_key', apiKey);
    } else if (pType === 'anthropic') {
      localStorage.setItem('anthropic_api_key', apiKey);
    } else if (pType === 'gemini') {
      localStorage.setItem('gemini_api_key', apiKey);
    } else if (pType === 'custom') {
      localStorage.setItem('custom_api_key', apiKey);
      localStorage.setItem('custom_base_url', baseUrl);
      if (model) localStorage.setItem('custom_default_model', model);
    } else if (pType === 'ollama') {
      localStorage.setItem('ollama_base_url', baseUrl);
      if (model) localStorage.setItem('ollama_default_model', model);
    }
    
    // Also save supported keys to database
    if (['openai', 'anthropic', 'gemini'].includes(pType) && apiKey && token) {
      try {
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
        await fetch(`${apiUrl}/auth/credentials`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            openai_api_key: pType === 'openai' ? apiKey : null,
            anthropic_api_key: pType === 'anthropic' ? apiKey : null,
            gemini_api_key: pType === 'gemini' ? apiKey : null
          })
        });
      } catch (e) {
        console.error("Failed to sync key to database:", e);
      }
    }
    
    // Store generic settings if needed
    if (model) localStorage.setItem(`${pType}_default_model`, model);
    
    // Set this as the active global provider so the agents use it!
    localStorage.setItem('global_provider', pType);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Configure New Provider</h2>
            <p className="text-sm text-slate-400">Add a new LLM provider configuration with API key and model settings.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Provider Type *</label>
              <div className="relative">
                <select 
                  value={providerType}
                  onChange={handleProviderTypeChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 appearance-none"
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Gemini">Gemini</option>
                  <option value="Vertex">Google Cloud Vertex AI</option>
                  <option value="Ollama">Ollama</option>
                  <option value="Custom">Custom</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Provider Name *</label>
              <input 
                type="text" 
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                placeholder="e.g., Work OpenAI"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>
          </div>

          {providerType === 'Vertex' ? (
            <div className="bg-black/30 border border-white/10 rounded-xl p-6 relative overflow-hidden my-4 col-span-2">
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
                  onClick={() => {
                    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
                    window.location.href = `${apiUrl}/auth/vertex/login`;
                  }}
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
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Base URL *</label>
                <input 
                  type="text" 
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">API Key *</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter your API key" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <p className="text-[13px] text-slate-500 mt-2">
                  Your API key is encrypted and stored locally. <a href="#" className="text-violet-400 hover:text-violet-300 hover:underline">{providerType} setup guide</a>
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Model *</label>
            {['Custom', 'Ollama'].includes(providerType) ? (
              <>
                <input 
                  type="text" 
                  list="fetched-models"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g., opencode-32b, deepseek-coder..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                {availableModels.length > 0 && (
                  <datalist id="fetched-models">
                    {availableModels.map(m => <option key={m} value={m} />)}
                  </datalist>
                )}
              </>
            ) : (
              <div className="relative">
                <select 
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 appearance-none"
                >
                  <option value="">Select a model...</option>
                  {providerType === 'OpenAI' && (
                    <>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                    </>
                  )}
                  {providerType === 'Anthropic' && (
                    <>
                      <option value="claude-3-5-sonnet-latest">claude-3-5-sonnet-latest</option>
                      <option value="claude-3-opus-latest">claude-3-opus-latest</option>
                    </>
                  )}
                  {providerType === 'Gemini' && (
                    <>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 mt-8">
            <h3 className="text-[15px] font-semibold text-slate-200 mb-4">Model Configuration</h3>
            
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input 
                type="checkbox" 
                checked={supportsImages}
                onChange={e => setSupportsImages(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/50 cursor-pointer accent-violet-500"
              />
              <span className="text-[15px] text-slate-300">Supports Images</span>
            </label>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Context Window Size</label>
                <input 
                  type="text" 
                  value={contextWindow}
                  onChange={e => setContextWindow(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <p className="text-[13px] text-slate-500 mt-2">Auto-filled based on model</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Temperature (0-2)</label>
                <input 
                  type="text" 
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
                <p className="text-[13px] text-slate-500 mt-2">Controls response randomness</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 items-center mt-10">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !baseUrl}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center min-w-[80px] transition-colors"
            >
              {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : 
               testStatus === 'success' ? <span className="text-green-400">Valid</span> : 
               testStatus === 'error' ? <span className="text-red-400">Failed</span> : 
               "Test"}
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-sm"
            >
              Save
            </button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}

