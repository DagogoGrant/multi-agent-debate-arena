import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Key, Cpu, AlertCircle, Check, Loader2, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  setConfig: (config: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, setConfig }: SettingsModalProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const [providerType, setProviderType] = useState('OpenAI');
  const [providerName, setProviderName] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [supportsImages, setSupportsImages] = useState(false);
  const [contextWindow, setContextWindow] = useState('128000');
  const [temperature, setTemperature] = useState('0.2');

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
      const res = await fetch(`${baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.ok) setTestStatus('success');
      else setTestStatus('error');
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#f9fafb] border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans"
      >
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Configure New Provider</h2>
            <p className="text-sm text-gray-500">Add a new LLM provider configuration with API key and model settings.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Provider Type *</label>
              <div className="relative">
                <select 
                  value={providerType}
                  onChange={handleProviderTypeChange}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none"
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Gemini">Gemini</option>
                  <option value="Ollama">Ollama</option>
                  <option value="Custom">Custom</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Provider Name *</label>
              <input 
                type="text" 
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                placeholder="e.g., Work OpenAI"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Base URL *</label>
            <input 
              type="text" 
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">API Key *</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key" 
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
            />
            <p className="text-[13px] text-gray-500 mt-2">
              Your API key is encrypted and stored locally. <a href="#" className="text-[#ea580c] hover:underline">{providerType} setup guide</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Model *</label>
            <div className="relative">
              <select 
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none"
              >
                <option value="">Select a model...</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 mt-8">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Model Configuration</h3>
            
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input 
                type="checkbox" 
                checked={supportsImages}
                onChange={e => setSupportsImages(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#ea580c] focus:ring-[#ea580c] cursor-pointer accent-[#ea580c]"
              />
              <span className="text-[15px] text-gray-900">Supports Images</span>
            </label>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Context Window Size</label>
                <input 
                  type="text" 
                  value={contextWindow}
                  onChange={e => setContextWindow(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                />
                <p className="text-[13px] text-gray-500 mt-2">Auto-filled based on model</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Temperature (0-2)</label>
                <input 
                  type="text" 
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                />
                <p className="text-[13px] text-gray-500 mt-2">Controls response randomness</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 items-center mt-10">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !baseUrl}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-400 flex items-center justify-center min-w-[80px] transition-colors"
            >
              {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : 
               testStatus === 'success' ? <span className="text-green-500">Valid</span> : 
               testStatus === 'error' ? <span className="text-red-500">Failed</span> : 
               "Test"}
            </button>
            <button className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#ea580c] text-white hover:bg-[#d04e0a] transition-colors shadow-sm">
              Save
            </button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}

