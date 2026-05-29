import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import IntelligenceLab from './components/IntelligenceLab';
import RecentDebates from './components/RecentDebates';
import LogicMap from './components/LogicMap';
import SettingsModal from './components/SettingsModalV2';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Database, Briefcase, Zap, Cpu, ArrowRight } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';

export interface Message {
  agent: string;
  tag: string;
  text: string;
  time: string;
  color: string;
  tagColor: string;
}

const getAgentStyle = (stance: string) => {
  switch (stance) {
    case 'NEUTRAL': return { tag: 'LEAD', color: 'border-violet-500/30', tagColor: 'bg-violet-500/20 text-violet-300' };
    case 'PRO': return { tag: 'PRO', color: 'border-green-500/30', tagColor: 'bg-green-500/20 text-green-300' };
    case 'CONTRA': return { tag: 'CONTRA', color: 'border-red-500/30', tagColor: 'bg-red-500/20 text-red-300' };
    case 'AUDITOR': return { tag: 'AUDIT', color: 'border-blue-400/30', tagColor: 'bg-blue-400/20 text-blue-300' };
    case 'EXEC': return { tag: 'EXEC', color: 'border-emerald-500/30', tagColor: 'bg-emerald-500/20 text-emerald-300' };
    case 'ANALYST': return { tag: 'SYNTH', color: 'border-amber-500/30', tagColor: 'bg-amber-500/20 text-amber-300' };
    default: return { tag: 'AI', color: 'border-slate-500/30', tagColor: 'bg-slate-500/20 text-slate-300' };
  }
};

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, token, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [topic, setTopic] = useState('Acquire AI Startup Alpha for $500M.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [activeView, setActiveView] = useState('canvas');
  const [canvasTab, setCanvasTab] = useState('arena');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [config, setConfig] = useState({
    rounds: 2,
    web_grounding: true,
    pro_model: 'llama3.2:3b',
    agents: [] as any[]
  });

  React.useEffect(() => {
    fetch(`${API_BASE}/api/templates`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
        }
      }).catch(err => console.error("Failed to load templates", err));
  }, []);

  React.useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
        setConfig(prev => ({ ...prev, agents: template.agents }));
        if (template.default_topic) {
          setTopic(template.default_topic);
        }
    }
  }, [selectedTemplateId, templates]);

  const [metrics, setMetrics] = useState({
    persuasion: { pro: 50, contra: 50 },
    sentimentHistory: [] as any[],
    factChecks: [] as any[],
    summary: null as any,
    logicMap: [] as any[]
  });

  const handleStartDebate = useCallback(async () => {
    setMessages([]);
    setIsStreaming(true);
    setCurrentAgent('Strategy Lead');

    try {
      // Inject API keys into the agents config dynamically before sending to backend
      const openaiKey = localStorage.getItem('openai_api_key');
      const anthropicKey = localStorage.getItem('anthropic_api_key');
      const geminiKey = localStorage.getItem('gemini_api_key');
      const grokKey = localStorage.getItem('grok_api_key');
      const customKey = localStorage.getItem('custom_api_key');
      const customBaseUrl = localStorage.getItem('custom_base_url');
      const ollamaBaseUrl = localStorage.getItem('ollama_base_url') || 'http://localhost:11434';
      
      const configuredAgents = config.agents.map((agent: any) => {
         let key = "";
         let baseUrl = null;
         let provider = agent.provider || localStorage.getItem('global_provider') || 'ollama';
         let model = agent.model || localStorage.getItem(`${provider}_default_model`) || 'llama3.2:3b';
         
         if (provider === 'openai') key = openaiKey || "";
         if (provider === 'anthropic') key = anthropicKey || "";
         if (provider === 'gemini') key = geminiKey || "";
         if (provider === 'grok') key = grokKey || "";
         
         if (provider === 'custom') {
             provider = 'openai'; // LiteLLM handles OpenAI compatible under openai provider
             key = customKey || "";
             baseUrl = customBaseUrl || null;
         } else if (provider === 'ollama') {
             baseUrl = ollamaBaseUrl;
         }
         
         return { ...agent, provider, model, api_key: key, base_url: baseUrl };
      });

      const response = await fetch(`${API_BASE}/api/debate`, {
        method: 'POST',
        headers: { 
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          rounds: config.rounds,
          web_grounding: config.web_grounding,
          agents: configuredAgents
        }),
        cache: 'no-cache'
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        throw new Error(`Server Status ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) throw new Error("Could not initialize stream reader.");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Split by the standard SSE double-newline delimiter
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split(/\r?\n/);
          let event = "message"; // Default SSE event
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              event = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              data = line.replace("data:", "").trim();
            }
          }

          if (!data || data === 'keep-alive') continue;

          try {
            switch (event) {
              case 'status':
                setCurrentAgent(data);
                break;
              case 'agent_start':
                setCurrentAgent(data);
                break;
              case 'delta':
                try {
                  const payload = JSON.parse(data);
                  updateMessage(payload.agent, payload.text);
                } catch (e) {
                  // If not JSON, try treating as raw text (safety fallback)
                  updateMessage(currentAgent, data);
                }
                break;
              case 'agent_end':
                try {
                  const payload = JSON.parse(data);
                  setMetrics(prev => {
                      const isPro = payload.agent.includes('(PRO)');
                      const isCon = payload.agent.includes('(CONTRA)');
                      const isFact = payload.agent === config.agents.find((a:any) => a.stance==='AUDITOR')?.name;
                      const isAnalyst = payload.agent === config.agents.find((a:any) => a.stance==='ANALYST')?.name;

                      let sentiment = Number(payload.metadata?.sentiment);
                      if (isNaN(sentiment) || sentiment === 0) {
                         const positiveWords = ['good', 'great', 'excellent', 'agree', 'support', 'pro', 'benefit', 'positive', 'strong', 'yes', 'essential', 'crucial'];
                         const negativeWords = ['bad', 'poor', 'disagree', 'oppose', 'con', 'drawback', 'negative', 'weak', 'no', 'flaw', 'harm', 'risk'];
                         const textLower = (payload.full_text || '').toLowerCase();
                         const posCount = positiveWords.reduce((acc, w) => acc + (textLower.split(w).length - 1), 0);
                         const negCount = negativeWords.reduce((acc, w) => acc + (textLower.split(w).length - 1), 0);
                         const totalWords = textLower.split(' ').length || 1;
                         sentiment = 50 + ((posCount - negCount) / totalWords) * 1000;
                         sentiment = Math.max(10, Math.min(90, sentiment + (Math.random() * 20 - 10)));
                      }
                      
                      const newHistory = [...prev.sentimentHistory];
                      
                      if ((isPro || isCon) && (newHistory.length === 0 || (isPro && newHistory[newHistory.length-1].Pro !== undefined && newHistory[newHistory.length-1].Contra !== undefined))) {
                        newHistory.push({ R: `R${newHistory.length + 1}`, Pro: isPro ? sentiment : 50, Contra: isCon ? sentiment : 50 });
                      } else if (isPro || isCon) {
                        const lastIdx = newHistory.length - 1;
                        newHistory[lastIdx] = { 
                          ...newHistory[lastIdx], 
                          Pro: isPro ? sentiment : newHistory[lastIdx].Pro, 
                          Contra: isCon ? sentiment : newHistory[lastIdx].Contra 
                        };
                      }

                      const nextPro = (isPro || isCon) 
                        ? Number(isPro ? Math.min(100, (prev.persuasion.pro || 50) + 5) : Math.max(0, (prev.persuasion.pro || 50) - 2))
                        : prev.persuasion.pro;
                      
                      const nextCon = (isPro || isCon)
                        ? Number(isCon ? Math.min(100, (prev.persuasion.contra || 50) + 5) : Math.max(0, (prev.persuasion.contra || 50) - 2))
                        : prev.persuasion.contra;

                      let factChecks = prev.factChecks;
                      let radarData = prev.radarData || [
                        { subject: 'Regulation', score: 50 },
                        { subject: 'Market', score: 50 },
                        { subject: 'Risks', score: 50 },
                        { subject: 'Legal', score: 50 },
                        { subject: 'Competition', score: 50 },
                      ];

                      const textLower = payload.full_text?.toLowerCase() || '';
                      radarData = radarData.map((d: any) => {
                        let boost = 0;
                        if (d.subject === 'Regulation' && textLower.match(/regulation|policy|government|compliance|law/i)) boost = 5 + Math.random() * 10;
                        if (d.subject === 'Market' && textLower.match(/market|economy|price|consumer|demand/i)) boost = 5 + Math.random() * 10;
                        if (d.subject === 'Risks' && textLower.match(/risk|threat|danger|vulnerability|failure/i)) boost = 5 + Math.random() * 10;
                        if (d.subject === 'Legal' && textLower.match(/legal|court|lawsuit|ip|copyright/i)) boost = 5 + Math.random() * 10;
                        if (d.subject === 'Competition' && textLower.match(/competition|rival|monopoly|startup|industry/i)) boost = 5 + Math.random() * 10;
                        return { ...d, score: Math.min(100, d.score + boost) };
                      });

                      if (isFact) {
                        const text = payload.full_text;
                        // 1. Try to find strictly formatted fact items
                        let factLines = text.split('\n').filter((l: string) => l.includes('FACT_ITEM') || l.includes('| STATUS'));
                        // 2. Fallback: bullet points containing keywords
                        if (factLines.length === 0) {
                          factLines = text.split('\n').filter((l: string) => /^[*+\-•\d.]/i.test(l.trim()) && (l.toLowerCase().includes('fact') || l.toLowerCase().includes('verified')));
                        }
                        // 3. Fallback: Split by sentences
                        if (factLines.length === 0) {
                          factLines = text.split(/[.!?]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 20 && s.length < 150).slice(0, 10);
                        }
                        
                        factChecks = factLines.slice(0, 10).map((l: string) => {
                          const cleanLine = l.replace(/^[*+\-•\d.]+|FACT_ITEM:|\*\*|Fact:|-/gi, '').trim();
                          const parts = cleanLine.split('|');
                          const item = parts[0];
                          const status = parts.length > 1 ? parts[1] : undefined;
                          return {
                            item: item?.replace('STATUS:', '').trim().substring(0, 120) || "Data point analyzed",
                            status: status?.replace('STATUS:', '').trim() || (l.toLowerCase().includes('weak') ? 'Weak Logic' : l.toLowerCase().includes('verified') ? 'Verified' : 'Unverified')
                          };
                        });
                      }

                      let summary = prev.summary;
                      if (isAnalyst) {
                        const text = payload.full_text;
                        const sections = text.split('\n\n');
                        summary = {
                          proStrong: text.match(/PRO_STRONG:\s*(.*)|Strongest Argument:\s*(.*)|PRO:\s*(.*)/i)?.[1] || sections.find(s => s.toLowerCase().includes('pro'))?.substring(0, 120) || "Comprehensive evidence base",
                          conWeak: text.match(/CON_WEAK:\s*(.*)|Weakest Link:\s*(.*)|CONTRA:\s*(.*)/i)?.[1] || sections.find(s => s.toLowerCase().includes('contra'))?.substring(0, 120) || "Nuance and emotional depth gap",
                          insight: text.match(/INSIGHT:\s*(.*)|Final Thoughts:\s*(.*)|Conclusion:\s*(.*)/i)?.[1] || sections.find(s => s.toLowerCase().includes('conclusion'))?.substring(0, 120) || "Balanced synthesis achieved"
                        };
                      }

                      let logicMap = [...prev.logicMap];
                      if (isPro || isCon) {
                        const text = payload.full_text;
                        let claim = text.match(/CLAIM:\s*(.*)/i)?.[1];
                        let attack = text.match(/ATTACK:\s*(.*)/i)?.[1];
                        
                        if (!claim && !attack) {
                           const sentences = text.split(/[.!?]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 30);
                           if (sentences.length > 0) claim = sentences[0];
                           if (sentences.length > 1 && Math.random() > 0.5) attack = sentences[1];
                        }
                        
                        if (claim) {
                          logicMap.push({ 
                            type: isPro ? 'pro' : 'con', 
                            label: 'Claim', 
                            text: claim.replace(/\[|\]/g, '').substring(0, 50) + '...' 
                          });
                        }
                        if (attack) {
                          logicMap.push({ 
                            type: 'attack', 
                            label: 'Attack', 
                            text: attack.replace(/\[|\]/g, '').substring(0, 100) 
                          });
                        }
                        if (logicMap.length > 10) logicMap = logicMap.slice(-10);
                      }

                      return {
                        ...prev,
                        sentimentHistory: newHistory,
                        factChecks,
                        summary,
                        logicMap,
                        radarData,
                        persuasion: {
                          pro: isNaN(nextPro) ? 50 : nextPro,
                          contra: isNaN(nextCon) ? 50 : nextCon
                        }
                    };
                  });
                } catch (e) {
                  console.error("Failed to parse agent_end metadata:", e);
                }
                break;
              case 'complete':
                setIsStreaming(false);
                break;
              case 'error':
                console.error("SSE Error:", data);
                setIsStreaming(false);
                break;
            }
          } catch (e) {
            console.error("Error processing event:", e);
          }
        }
      }
    } catch (err: any) {
      console.error("Debate Stream Failure:", err);
      alert("Stream Error: " + err.message);
      setIsStreaming(false);
    }
  }, [topic, config]);

  const updateMessage = (agent: string, delta: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      let stance = 'NEUTRAL';
      if (agent.includes('(PRO)')) stance = 'PRO';
      else if (agent.includes('(CONTRA)')) stance = 'CONTRA';
      else {
         const foundAgent = config.agents.find((a:any) => a.name === agent);
         if (foundAgent) stance = foundAgent.stance;
      }
      const agentConfig = getAgentStyle(stance);
      
      if (last && last.agent === agent) {
        const updated = { ...last, text: last.text + delta };
        return [...prev.slice(0, -1), updated];
      }
      
      const newMessage: Message = {
        agent,
        text: delta,
        tag: agentConfig.tag,
        color: agentConfig.color,
        tagColor: agentConfig.tagColor,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      return [...prev, newMessage];
    });
  };

  const loadDebate = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/history/${id}`);
      const data = await res.json();
      setTopic(data.topic);
      setMessages(data.transcript.map((t: any) => ({
        agent: t[0],
        text: t[1],
        time: new Date().toLocaleTimeString(),
        tag: 'ARCHIVE',
        color: t[0].includes('PRO') ? 'border-green-500/20' : 'border-red-500/20',
        tagColor: 'bg-slate-800 text-slate-400'
      })));

      // Reconstruct intelligence metrics from historical text to fix legacy formatting bugs
      let newMetrics = {
        persuasion: { pro: 50, contra: 50 },
        sentimentHistory: [] as any[],
        factChecks: [] as any[],
        summary: null as any,
        logicMap: [] as any[],
        radarData: [
          { subject: 'Regulation', score: 50 },
          { subject: 'Market', score: 50 },
          { subject: 'Risks', score: 50 },
          { subject: 'Legal', score: 50 },
          { subject: 'Competition', score: 50 },
        ]
      };

      let currentPro = 50;
      let currentCon = 50;

      data.transcript.forEach((t: any) => {
         const agent = t[0] || '';
         const text = t[1] || '';
         const isPro = agent.includes('PRO');
         const isCon = agent.includes('CONTRA');
         const isFact = agent.toLowerCase().includes('fact') || agent.toLowerCase().includes('auditor');
         const isAnalyst = agent.toLowerCase().includes('sentiment') || agent.toLowerCase().includes('analyst');

         if (isPro || isCon) {
            const positiveWords = ['good', 'great', 'excellent', 'agree', 'support', 'pro', 'benefit', 'positive', 'strong', 'yes', 'essential', 'crucial'];
            const negativeWords = ['bad', 'poor', 'disagree', 'oppose', 'con', 'drawback', 'negative', 'weak', 'no', 'flaw', 'harm', 'risk'];
            const textLower = text.toLowerCase();
            const posCount = positiveWords.reduce((acc, w) => acc + (textLower.split(w).length - 1), 0);
            const negCount = negativeWords.reduce((acc, w) => acc + (textLower.split(w).length - 1), 0);
            const totalWords = textLower.split(' ').length || 1;
            let sentiment = 50 + ((posCount - negCount) / totalWords) * 1000;
            sentiment = Math.max(10, Math.min(90, sentiment + (Math.random() * 20 - 10)));

            newMetrics.sentimentHistory.push({
               R: `R${newMetrics.sentimentHistory.length + 1}`,
               Pro: isPro ? sentiment : 50,
               Contra: isCon ? sentiment : 50
            });

            currentPro = isPro ? Math.min(100, currentPro + 5) : currentPro;
            currentCon = isCon ? Math.min(100, currentCon + 5) : currentCon;


            newMetrics.radarData = newMetrics.radarData.map((d: any) => {
               let boost = 0;
               if (d.subject === 'Regulation' && textLower.match(/regulation|policy|government|compliance|law/i)) boost = 5 + Math.random() * 10;
               if (d.subject === 'Market' && textLower.match(/market|economy|price|consumer|demand/i)) boost = 5 + Math.random() * 10;
               if (d.subject === 'Risks' && textLower.match(/risk|threat|danger|vulnerability|failure/i)) boost = 5 + Math.random() * 10;
               if (d.subject === 'Legal' && textLower.match(/legal|court|lawsuit|ip|copyright/i)) boost = 5 + Math.random() * 10;
               if (d.subject === 'Competition' && textLower.match(/competition|rival|monopoly|startup|industry/i)) boost = 5 + Math.random() * 10;
               return { ...d, score: Math.min(100, d.score + boost) };
            });

            let claim = text.match(/CLAIM:\s*(.*)/i)?.[1];
            let attack = text.match(/ATTACK:\s*(.*)/i)?.[1];
            if (!claim && !attack) {
               const sentences = text.split(/[.!?]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 30);
               if (sentences.length > 0) claim = sentences[0];
               if (sentences.length > 1 && Math.random() > 0.5) attack = sentences[1];
            }
            if (claim) newMetrics.logicMap.push({ type: isPro ? 'pro' : 'con', label: 'Claim', text: claim.replace(/\[|\]/g, '').substring(0, 50) + '...' });
            if (attack) newMetrics.logicMap.push({ type: 'attack', label: 'Attack', text: attack.replace(/\[|\]/g, '').substring(0, 100) });
         }

         if (isFact) {
            let factLines = text.split('\n').filter((l: string) => l.includes('FACT_ITEM') || l.includes('| STATUS'));
            if (factLines.length === 0) {
              factLines = text.split('\n').filter((l: string) => /^[*+\-•\d.]/i.test(l.trim()) && (l.toLowerCase().includes('fact') || l.toLowerCase().includes('verified')));
            }
            if (factLines.length === 0) {
              factLines = text.split(/[.!?]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 20 && s.length < 150).slice(0, 10);
            }
            newMetrics.factChecks = factLines.slice(0, 10).map((l: string) => {
              const cleanLine = l.replace(/^[*+\-•\d.]+|FACT_ITEM:|\*\*|Fact:|-/gi, '').trim();
              const parts = cleanLine.split('|');
              const item = parts[0];
              const status = parts.length > 1 ? parts[1] : undefined;
              return {
                item: item?.replace('STATUS:', '').trim().substring(0, 120) || "Data point analyzed",
                status: status?.replace('STATUS:', '').trim() || (l.toLowerCase().includes('weak') ? 'Weak Logic' : l.toLowerCase().includes('verified') ? 'Verified' : 'Unverified')
              };
            });
         }

         if (isAnalyst) {
            const sections = text.split('\n\n');
            newMetrics.summary = {
              proStrong: text.match(/PRO_STRONG:\s*(.*)|Strongest Argument:\s*(.*)|PRO:\s*(.*)/i)?.[1] || sections.find((s:string) => s.toLowerCase().includes('pro'))?.substring(0, 120) || "Comprehensive evidence base",
              conWeak: text.match(/CON_WEAK:\s*(.*)|Weakest Link:\s*(.*)|CONTRA:\s*(.*)/i)?.[1] || sections.find((s:string) => s.toLowerCase().includes('contra'))?.substring(0, 120) || "Nuance and emotional depth gap",
              insight: text.match(/INSIGHT:\s*(.*)|Final Thoughts:\s*(.*)|Conclusion:\s*(.*)/i)?.[1] || sections.find((s:string) => s.toLowerCase().includes('conclusion'))?.substring(0, 120) || "Balanced synthesis achieved"
            };
         }
      });

      newMetrics.persuasion = { pro: currentPro, contra: currentCon };
      setMetrics(newMetrics);
      setActiveView('canvas');
      setCanvasTab('arena');

    } catch (err) {
      console.error("Failed to load debate:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-text-main">
      <Header 
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
        onSettingsClick={() => setSettingsOpen(true)}
        topic={topic}
        setTopic={setTopic}
        onLaunch={handleStartDebate}
        isStreaming={isStreaming}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        config={config} 
        setConfig={setConfig} 
      />
      <div className="flex-1 flex min-h-0 relative">
        <div className={cn(
          "fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:flex transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="absolute inset-0 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <Sidebar 
            onClose={() => setSidebarOpen(false)} 
            config={config}
            setConfig={setConfig}
            currentAgent={currentAgent}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>

        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === 'canvas' && (
              <motion.div 
                key="canvas"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <button 
                    onClick={() => setCanvasTab('arena')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm", canvasTab === 'arena' ? "bg-violet-600 text-white" : "bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main")}
                  >
                    Live Arena
                  </button>
                  <button 
                    onClick={() => setCanvasTab('lab')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm", canvasTab === 'lab' ? "bg-violet-600 text-white" : "bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main")}
                  >
                    Intelligence Lab
                  </button>
                  <button 
                    onClick={() => setCanvasTab('network')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm", canvasTab === 'network' ? "bg-violet-600 text-white" : "bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main")}
                  >
                    Logic Network
                  </button>
                </div>

                <div className="flex-1 flex min-h-0 overflow-hidden mt-16 relative">
                  {canvasTab === 'arena' ? (
                     <MainCanvas 
                      messages={messages} 
                      isStreaming={isStreaming}
                      currentAgent={currentAgent}
                      onContinue={handleStartDebate}
                    />
                  ) : canvasTab === 'lab' ? (
                     <IntelligenceLab metrics={metrics} />
                  ) : (
                     <LogicMap messages={messages} topic={topic} />
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'network' && (
              <motion.div 
                key="network"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col p-6 sm:p-8 gap-6 overflow-hidden bg-background"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight">
                      <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                        <Network className="w-6 h-6 text-violet-500" />
                      </div>
                      Logic Network
                    </h2>
                    <p className="text-text-muted text-sm mt-1">High-fidelity visualization of argument nodes and counter-attacks.</p>
                  </div>
                </div>
                
                <div className="flex-1 rounded-3xl border border-divider bg-card overflow-hidden relative p-4 shadow-sm">
                   {/* Background Grid Pattern */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 mix-blend-overlay pointer-events-none" />
                   <LogicMap messages={messages} topic={topic} />
                </div>
              </motion.div>
            )}

            {activeView === 'database' && (
              <motion.div 
                key="database"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col p-6 sm:p-8 overflow-y-auto gpu-scroll hide-scrollbar bg-background"
              >
                <div className="max-w-6xl w-full mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight">
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                        <Database className="w-6 h-6 text-emerald-500" />
                      </div>
                      Archive Database
                    </h2>
                    <p className="text-text-muted text-sm mt-1">Review historical sessions and completed strategic plans.</p>
                  </div>
                  <RecentDebates onLoadDebate={loadDebate} fullView={true} />
                </div>
              </motion.div>
            )}

            {activeView === 'briefcase' && (
              <motion.div 
                key="briefcase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col p-6 sm:p-10 overflow-y-auto gpu-scroll hide-scrollbar bg-background"
              >
                <div className="max-w-7xl w-full mx-auto">
                  <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 shadow-sm">
                      <Briefcase className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black text-text-main tracking-tight">Strategy Template Library</h2>
                    <p className="text-text-muted text-base mt-2 max-w-2xl mx-auto">Select a dynamic template to instantly configure the AI personas, rules of engagement, and strategic goals for your session.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {templates.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedTemplateId(t.id); setActiveView('canvas'); }} 
                        className="group relative p-8 rounded-3xl border border-divider bg-card hover:bg-black/5 dark:hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden shadow-sm"
                      >
                        
                        <h3 className="text-xl font-bold text-text-main mb-3 group-hover:text-violet-500 flex items-center justify-between">
                          {t.name}
                          <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-violet-500" />
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed mb-8">{t.description}</p>
                        
                        <div className="flex flex-col gap-3">
                           <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Agent Roster</div>
                           <div className="flex flex-wrap gap-2">
                              {t.agents?.slice(0, 4).map((a:any, i:number) => (
                                <span key={i} className="text-[9px] uppercase font-bold px-2.5 py-1 bg-black/5 dark:bg-white/5 text-text-main rounded-lg">
                                  {a.name}
                                </span>
                              ))}
                              {t.agents?.length > 4 && (
                                <span className="text-[9px] uppercase font-bold px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-300 rounded-lg">
                                  +{t.agents.length - 4} More
                                </span>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {['search', 'beaker', 'calendar'].includes(activeView) && (
              <motion.div 
                key="coming-soon"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center flex-col gap-6 bg-background"
              >
                 <div className="w-24 h-24 rounded-[2rem] bg-black/5 dark:bg-white/5 flex items-center justify-center border border-divider shadow-xl">
                   <Zap className="w-10 h-10 text-text-muted animate-pulse" />
                 </div>
                 <div className="text-text-muted font-display text-2xl tracking-tight text-center">
                   <span className="font-bold text-text-main">Module offline.</span><br/>
                   <span className="text-lg opacity-60">Initialization protocol pending...</span>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
