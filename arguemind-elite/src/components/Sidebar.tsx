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
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const navIcons = [
  { icon: LayoutGrid, active: true },
  { icon: Network },
  { icon: Search },
  { icon: Briefcase },
  { icon: Beaker },
  { icon: Calendar },
  { icon: Database },
];

interface SidebarProps {
  onClose?: () => void;
  config: any;
  setConfig: (config: any) => void;
  currentAgent: string;
}

export default function Sidebar({ onClose, config, setConfig, currentAgent }: SidebarProps) {
  const agentsList = [
    { name: 'Moderator', role: 'Neutral Facilitator', color: 'text-violet-400', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { name: 'Agent A (PRO)', role: 'Affirmative Advocate', color: 'text-green-400', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { name: 'Agent B (CONTRA)', role: 'Negative Advocate', color: 'text-red-400', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { name: 'Fact-Checker', role: 'Evidence Verifier', color: 'text-blue-400', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop' },
    { name: 'Judge', role: 'Impartial Arbiter', color: 'text-emerald-400', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
    { name: 'Strategic Analyst', role: 'Meta-Analysis', color: 'text-amber-400', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  ];

  return (
    <aside className="w-80 flex h-full border-r border-white/5 bg-[#05070a] lg:bg-[#05070a]/80 backdrop-blur-md shrink-0">
      {/* Mini Rail - Hidden on mobile */}
      <div className="w-16 hidden sm:flex flex-col items-center py-6 border-r border-white/5 gap-6">
        <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <Zap className="w-6 h-6 text-white fill-current" />
        </div>
        {navIcons.map((nav, i) => (
          <button 
            key={i} 
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              nav.active ? "bg-violet-600/10 text-violet-400" : "text-slate-500 hover:text-slate-200"
            )}
          >
            <nav.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Main Sidebar Content */}
      <div className="flex-1 flex flex-col p-5 gap-8 overflow-y-auto hide-scrollbar">
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-400 self-end">
            Close
          </button>
        )}
        {/* Agents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Agents</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400 font-mono">6/6</span>
              <Plus className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-200 transition-colors" />
            </div>
          </div>
          <div className="space-y-1.5">
            {agentsList.map((agent) => {
              const isThinking = currentAgent === agent.name;
              return (
                <div key={agent.name} className="group p-2.5 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer flex items-center gap-3 border border-transparent hover:border-white/5">
                  <div className="relative">
                    <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full border border-white/10" />
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#05070a]",
                      isThinking ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-200 truncate">{agent.name}</span>
                      {agent.name === 'Moderator' && <Zap className="w-3 h-3 text-violet-400 fill-current opacity-70" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 truncate">{agent.role}</span>
                      <span className={cn("text-[7px] font-black uppercase tracking-tighter", agent.color)}>
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
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Debate Controls</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-medium">Research Rounds</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400" /> Depth
                </div>
                <select 
                  value={config.rounds}
                  onChange={(e) => setConfig({ ...config, rounds: parseInt(e.target.value) })}
                  className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-200 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Rounds</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-medium">Model Selection (PRO)</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <select 
                  value={config.pro_model}
                  onChange={(e) => setConfig({ ...config, pro_model: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-slate-200"
                >
                  <option value="llama3.2:3b">Llama 3.2 (3B)</option>
                  <option value="llama3:8b">Llama 3 (8B)</option>
                  <option value="phi3">Phi-3 Mini</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-[11px] font-medium text-slate-400">Auto Fact-Check</span>
              <div 
                onClick={() => setConfig({ ...config, web_grounding: !config.web_grounding })}
                className={cn(
                  "w-9 h-5 rounded-full relative cursor-pointer transition-colors shadow-inner",
                  config.web_grounding ? "bg-violet-600" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all",
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
