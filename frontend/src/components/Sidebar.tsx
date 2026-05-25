import React from 'react';
import { 
  LayoutGrid, 
  Network, 
  Search, 
  Briefcase, 
  Beaker, 
  Calendar, 
  Database,
  Plus,
  Users,
  ChevronDown,
  Timer,
  Eye,
  Zap,
  Bot,
  Brain,
  Shield,
  Activity,
  Gavel,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const navIcons = [
  { icon: LayoutGrid, id: 'canvas' },
  { icon: Network, id: 'network' },
  { icon: Database, id: 'database' },
  { icon: Briefcase, id: 'briefcase' },
  { icon: Search, id: 'search' },
  { icon: Beaker, id: 'beaker' },
  { icon: Calendar, id: 'calendar' },
];

interface SidebarProps {
  onClose?: () => void;
  config: any;
  setConfig: (config: any) => void;
  currentAgent: string;
  templates: any[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ onClose, config, setConfig, currentAgent, templates, selectedTemplateId, setSelectedTemplateId, activeView, setActiveView }: SidebarProps) {
  const getAvatar = (stance: string) => {
    switch(stance) {
      case 'NEUTRAL': return <Bot className="w-5 h-5 text-violet-400" />;
      case 'PRO': return <Activity className="w-5 h-5 text-green-400" />;
      case 'CONTRA': return <Brain className="w-5 h-5 text-red-400" />;
      case 'AUDITOR': return <Eye className="w-5 h-5 text-blue-400" />;
      case 'EXEC': return <Gavel className="w-5 h-5 text-emerald-400" />;
      case 'ANALYST': return <Layers className="w-5 h-5 text-amber-400" />;
      default: return <Bot className="w-5 h-5 text-slate-400" />;
    }
  };

  const getColor = (stance: string) => {
    switch(stance) {
      case 'NEUTRAL': return 'text-violet-400';
      case 'PRO': return 'text-green-400';
      case 'CONTRA': return 'text-red-400';
      case 'AUDITOR': return 'text-blue-400';
      case 'EXEC': return 'text-emerald-400';
      case 'ANALYST': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <aside className="w-80 flex h-full border-r border-divider bg-background lg:bg-background/80 backdrop-blur-md shrink-0">
      {/* Mini Rail - Hidden on mobile */}
      <div className="w-16 hidden sm:flex flex-col items-center py-6 border-r border-divider gap-6">
        <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center mb-4 shadow-sm">
          <Zap className="w-6 h-6 text-white fill-current" />
        </div>
        {navIcons.map((nav, i) => (
          <button 
            key={i} 
            onClick={() => setActiveView(nav.id)}
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              activeView === nav.id ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-text-muted hover:text-text-main"
            )}
          >
            <nav.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Main Sidebar Content */}
      <div className="flex-1 flex flex-col p-5 gap-8 overflow-y-auto hide-scrollbar">
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg bg-black/5 dark:bg-white/5 text-text-muted self-end hover:bg-black/10 dark:hover:bg-white/10">
            Close
          </button>
        )}
        {/* Agents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Agents</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-text-muted">6/6</span>
              <Plus className="w-3.5 h-3.5 text-text-muted cursor-pointer hover:text-text-main transition-colors" />
            </div>
          </div>
          <div className="space-y-1.5">
            {config.agents?.map((agent: any) => {
              const isThinking = currentAgent.includes(agent.name);
              return (
                <div key={agent.name} className="group p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all cursor-pointer flex items-center gap-3 border border-transparent hover:border-divider">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border border-divider bg-card flex items-center justify-center shadow-sm">
                      {getAvatar(agent.stance)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                      isThinking ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-text-main truncate">{agent.name}</span>
                      {agent.stance === 'NEUTRAL' && <Zap className="w-3 h-3 text-violet-500 fill-current opacity-70" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted truncate">{agent.role}</span>
                      <span className={cn("text-[7px] font-black uppercase tracking-tighter", getColor(agent.stance))}>
                        {isThinking ? 'Thinking' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Debate Controls */}
        <div className="space-y-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Strategy Controls</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] text-text-muted font-medium">Strategy Template</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-divider">
                <select 
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-text-main"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id} className="text-text-main">{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-text-muted font-medium">Analysis Depth</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-divider hover:bg-black/10 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2.5 text-[11px] text-text-muted">
                  <LayoutGrid className="w-3.5 h-3.5 text-text-muted group-hover:text-violet-500" /> Depth
                </div>
                <select 
                  value={config.rounds}
                  onChange={(e) => setConfig({ ...config, rounds: parseInt(e.target.value) })}
                  className="bg-transparent border-none outline-none text-[11px] font-bold text-text-main cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r} className="bg-background">{r} Rounds</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-text-muted font-medium">Primary LLM Engine</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-divider">
                <select 
                  value={config.pro_model}
                  onChange={(e) => setConfig({ ...config, pro_model: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-text-main"
                >
                  <option value="llama3.2:3b" className="bg-background">Llama 3.2 (3B)</option>
                  <option value="llama3:8b" className="bg-background">Llama 3 (8B)</option>
                  <option value="phi3" className="bg-background">Phi-3 Mini</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-[11px] font-medium text-text-muted">Live Source Verification</span>
              <div 
                onClick={() => setConfig({ ...config, web_grounding: !config.web_grounding })}
                className={cn(
                  "w-9 h-5 rounded-full relative cursor-pointer transition-colors shadow-inner",
                  config.web_grounding ? "bg-violet-600" : "bg-black/20 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all",
                  config.web_grounding ? "right-0.5" : "left-0.5"
                )} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
