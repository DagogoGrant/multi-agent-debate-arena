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
  TrendingUp,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  topic: string;
  setTopic: (topic: string) => void;
  onLaunch: () => void;
  isStreaming: boolean;
  theme: string;
  toggleTheme: () => void;
}

export default function Header({ onMenuClick, onSettingsClick, topic, setTopic, onLaunch, isStreaming, theme, toggleTheme }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-divider bg-background/80 backdrop-blur-md z-20">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-2xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-lg lg:text-xl font-display font-bold tracking-tight text-text-main flex items-center gap-2">
          Strategic Intelligence <span className="text-violet-500 font-light hidden xs:inline">Workspace</span>
        </div>
        
        <div className="flex-1 relative group hidden sm:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-violet-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter strategy topic or directive..."
            className="w-full h-10 bg-black/5 dark:bg-white/5 border border-divider rounded-xl pl-10 pr-4 text-sm text-text-main focus:outline-none focus:border-violet-500/50 transition-all focus:bg-black/10 dark:focus:bg-white/[0.07]"
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
            isStreaming ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500 shadow-sm"
          )}
        >
          {isStreaming ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isStreaming ? "Executing..." : "Execute Strategy"}
        </button>

        <button onClick={toggleTheme} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button onClick={onSettingsClick} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:gap-3 border-l border-divider pl-2 lg:pl-4 text-text-muted">
          <Bell className="w-5 h-5 cursor-pointer hover:text-text-main transition-colors hidden xs:block" />
          <div className="w-8 h-8 rounded-full border border-divider overflow-hidden cursor-pointer hover:border-violet-500/50 transition-colors flex items-center justify-center bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main">
            <User className="w-4 h-4" />
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
