import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import IntelligenceLab from './components/IntelligenceLab';
import RecentDebates from './components/RecentDebates';
import { cn } from './lib/utils';

export interface Message {
  agent: string;
  tag: string;
  text: string;
  time: string;
  color: string;
  tagColor: string;
}

const AGENT_MAP: Record<string, { tag: string; color: string; tagColor: string }> = {
  'Moderator': { tag: 'MOD', color: 'border-violet-500/30', tagColor: 'bg-violet-500/20 text-violet-300' },
  'Agent A (PRO)': { tag: 'PRO', color: 'border-green-500/30', tagColor: 'bg-green-500/20 text-green-300' },
  'Agent B (CONTRA)': { tag: 'CONTRA', color: 'border-red-500/30', tagColor: 'bg-red-500/20 text-red-300' },
  'Fact-Checker': { tag: 'FACT', color: 'border-blue-400/30', tagColor: 'bg-blue-400/20 text-blue-300' },
  'Judge': { tag: 'JUDGE', color: 'border-emerald-500/30', tagColor: 'bg-emerald-500/20 text-emerald-300' },
  'Strategic Analyst': { tag: 'ANALYST', color: 'border-amber-500/30', tagColor: 'bg-amber-500/20 text-amber-300' },
};

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLabOpen, setLabOpen] = useState(false);
  const [topic, setTopic] = useState('AI should replace teachers in schools.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [config, setConfig] = useState({
    rounds: 2,
    web_grounding: true,
    pro_traits: { aggressiveness: 0.5, formality: 0.8 },
    con_traits: { aggressiveness: 0.7, formality: 0.6 },
    pro_model: 'llama3.2:3b',
    con_model: 'llama3.2:3b'
  });

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
    setCurrentAgent('Moderator');

    try {
      const url = new URL('http://localhost:9000/api/debate');
      url.searchParams.append('topic', topic);
      url.searchParams.append('rounds', config.rounds.toString());
      url.searchParams.append('web_grounding', config.web_grounding ? 'true' : 'false');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
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
                      const isPro = payload.agent.includes('PRO');
                      const isCon = payload.agent.includes('CONTRA');
                      const isFact = payload.agent.includes('Fact-Checker');
                      const isAnalyst = payload.agent.includes('Analyst');

                      let sentiment = Number(payload.metadata?.sentiment);
                      if (isNaN(sentiment)) sentiment = 50;
                      
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
                      if (isFact) {
                        const text = payload.full_text;
                        // Extremely robust parsing: Look for bullet points, numbered lists, or lines starting with Fact/Claim/Note
                        let factLines = text.split('\n').filter((l: string) => 
                          /^[*-•\d.]|^Fact:|^Note:|^Claim:/i.test(l.trim()) || l.toLowerCase().includes('verified')
                        );
                        // Fallback: Just take the first 3 non-empty lines
                        if (factLines.length === 0) {
                          factLines = text.split('\n').filter(l => l.trim().length > 20).slice(0, 3);
                        }
                        
                        factChecks = factLines.slice(0, 3).map((l: string) => {
                          const cleanLine = l.replace(/^[*-•]|FACT_ITEM:|\*\*|Fact:|-/gi, '').trim();
                          const [item, status] = cleanLine.split('|');
                          return {
                            item: item?.trim().substring(0, 80) || "Data point analyzed",
                            status: status?.trim() || (l.toLowerCase().includes('weak') ? 'Weak Logic' : l.toLowerCase().includes('needs') ? 'Needs Evidence' : 'Verified')
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
                        const claim = text.match(/CLAIM:\s*(.*)/i)?.[1];
                        const attack = text.match(/ATTACK:\s*(.*)/i)?.[1];
                        
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
      const fallbackConfig = { tag: 'AI', color: 'border-slate-500/30', tagColor: 'bg-slate-500/20 text-slate-300' };
      const agentConfig = AGENT_MAP[agent] || AGENT_MAP['Moderator'] || fallbackConfig;
      
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
      const res = await fetch(`http://localhost:9000/api/history/${id}`);
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
    } catch (err) {
      console.error("Failed to load debate:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header 
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
        onLabClick={() => setLabOpen(!isLabOpen)} 
        topic={topic}
        setTopic={setTopic}
        onLaunch={handleStartDebate}
        isStreaming={isStreaming}
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
          />
        </div>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <MainCanvas 
              messages={messages} 
              isStreaming={isStreaming}
              currentAgent={currentAgent}
              onContinue={handleStartDebate}
            />
            <div className={cn(
              "fixed inset-y-0 right-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:flex transition-transform duration-300",
              isLabOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            )}>
              <div className="absolute inset-0 bg-black/60 lg:hidden -left-full w-[200%]" onClick={() => setLabOpen(false)} />
              <IntelligenceLab metrics={metrics} onClose={() => setLabOpen(false)} />
            </div>
          </div>
          <div className="hidden lg:block">
            <RecentDebates onLoadDebate={loadDebate} />
          </div>
        </main>
      </div>
    </div>
  );
}
