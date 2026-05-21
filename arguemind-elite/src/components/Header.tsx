import React from 'react';
import { 
  Search, 
  ChevronDown, 
  Globe, 
  Play, 
  Settings, 
  Bell, 
  Command,
  Menu,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  onLabClick: () => void;
  topic: string;
  setTopic: (topic: string) => void;
  onLaunch: () => void;
  isStreaming: boolean;
}

export default function Header({ onMenuClick, onLabClick, topic, setTopic, onLaunch, isStreaming }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-md z-20">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-2xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-lg lg:text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
          ArgueMind <span className="text-violet-400 font-light hidden xs:inline">Elite</span>
        </div>
        
        <div className="flex-1 relative group hidden sm:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Research topic..."
            className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-all focus:bg-white/[0.07]"
            disabled={isStreaming}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button 
          onClick={onLaunch}
          disabled={isStreaming}
          className={cn(
            "hidden lg:flex h-10 px-6 rounded-xl text-white text-sm font-semibold items-center gap-2 transition-all active:scale-95",
            isStreaming ? "bg-slate-800 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/20"
          )}
        >
          {isStreaming ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isStreaming ? "Running..." : "Launch Debate"}
        </button>

        <button 
          onClick={onLabClick}
          className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
        >
          <TrendingUp className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:gap-3 border-l border-white/5 pl-2 lg:pl-4 text-slate-400">
          <Bell className="w-5 h-5 cursor-pointer hover:text-slate-200 transition-colors hidden xs:block" />
          <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-violet-500/50 transition-colors">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Timer({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
