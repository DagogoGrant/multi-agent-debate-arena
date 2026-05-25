import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Key, Cpu, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  setConfig: (config: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, setConfig }: SettingsModalProps) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('');

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedOpenAI = localStorage.getItem('openai_api_key') || '';
    const savedAnthropic = localStorage.getItem('anthropic_api_key') || '';
    const savedGemini = localStorage.getItem('gemini_api_key') || '';
    const savedGrok = localStorage.getItem('grok_api_key') || '';
    const savedOllamaBaseUrl = localStorage.getItem('ollama_base_url') || 'http://localhost:11434';
    
    setOpenaiKey(savedOpenAI);
    setAnthropicKey(savedAnthropic);
    setGeminiKey(savedGemini);
    setGrokKey(savedGrok);
    setOllamaBaseUrl(savedOllamaBaseUrl);
  }, []);

  const saveKeys = () => {
    localStorage.setItem('openai_api_key', openaiKey);
    localStorage.setItem('anthropic_api_key', anthropicKey);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('grok_api_key', grokKey);
    localStorage.setItem('ollama_base_url', ollamaBaseUrl);
    onClose();
  };

  const handleAgentModelChange = (agentIndex: number, field: string, value: string) => {
    const newAgents = [...config.agents];
    newAgents[agentIndex] = { ...newAgents[agentIndex], [field]: value };
    
    // Automatically swap to a sane default model when the provider changes
    if (field === 'provider') {
      const defaultModels: Record<string, string> = {
        'ollama': 'llama3.2:3b',
        'openai': 'gpt-4o',
        'anthropic': 'claude-3-5-sonnet-latest',
        'gemini': 'gemini-2.5-flash',
        'grok': 'grok-2-latest'
      };
      if (defaultModels[value]) {
        newAgents[agentIndex].model = defaultModels[value];
      }
    }
    
    setConfig({ ...config, agents: newAgents });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-background border border-divider rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-divider">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-violet-500" />
            Arena Settings & Models
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 gpu-scroll">
          
          {/* API Keys Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-lg">API Keys (Local Storage)</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">Keys are stored securely in your browser's localStorage and only sent during execution.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">OpenAI API Key</label>
                <input 
                  type="password" 
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..." 
                  className="w-full bg-black/5 dark:bg-white/5 border border-divider rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Anthropic API Key</label>
                <input 
                  type="password" 
                  value={anthropicKey}
                  onChange={e => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..." 
                  className="w-full bg-black/5 dark:bg-white/5 border border-divider rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Google Gemini API Key</label>
                <input 
                  type="password" 
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIza..." 
                  className="w-full bg-black/5 dark:bg-white/5 border border-divider rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">xAI (Grok) API Key</label>
                <input 
                  type="password" 
                  value={grokKey}
                  onChange={e => setGrokKey(e.target.value)}
                  placeholder="xai-..." 
                  className="w-full bg-black/5 dark:bg-white/5 border border-divider rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div className="pt-2 border-t border-divider">
                <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider text-violet-500">Local Ollama Base URL (For ngrok/tunnels)</label>
                <input 
                  type="text" 
                  value={ollamaBaseUrl}
                  onChange={e => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434" 
                  className="w-full bg-black/5 dark:bg-white/5 border border-divider rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Agent Configuration Section */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              Agent Models
            </h3>
            <p className="text-sm text-text-muted">Configure which AI provider and model each agent uses.</p>

            <div className="grid gap-4 mt-4">
              {config.agents.map((agent: any, index: number) => (
                <div key={index} className="p-4 rounded-xl border border-divider bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <div className="font-semibold">{agent.name}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mt-1">{agent.stance} • {agent.role}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                      value={agent.provider || 'ollama'} 
                      onChange={e => handleAgentModelChange(index, 'provider', e.target.value)}
                      className="bg-background border border-divider rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="ollama">Ollama (Local)</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="grok">xAI (Grok)</option>
                    </select>
                    
                    <input 
                      type="text" 
                      value={agent.model || 'llama3.2:3b'}
                      onChange={e => handleAgentModelChange(index, 'model', e.target.value)}
                      placeholder="Model ID (e.g. gpt-4o)"
                      className="bg-background border border-divider rounded-lg px-3 py-1.5 text-sm focus:outline-none w-32 sm:w-48"
                    />
                  </div>
                </div>
              ))}
              
              {config.agents.length === 0 && (
                <div className="p-4 text-center text-sm text-text-muted border border-dashed border-divider rounded-xl">
                  Select a template from the Strategy Library first to configure agents.
                </div>
              )}
            </div>
          </section>

        </div>

        <div className="p-6 border-t border-divider bg-black/5 dark:bg-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={saveKeys} className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-sm">
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}
