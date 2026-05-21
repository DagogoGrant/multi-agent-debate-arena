import React from 'react';
import { 
  Play, 
  Pause, 
  FileText, 
  Paperclip, 
  Send,
  MoreVertical,
  Maximize2,
  Minimize2,
  Calendar,
  Layers,
  Search,
  MessageSquare,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { Message } from '../App';
import LogicMap from './LogicMap';

const steps = [
  { label: 'Opening', active: true, completed: false },
  { label: 'Rebuttal', active: false, completed: false },
  { label: 'Cross-Examination', active: false, completed: false },
  { label: 'Closing', active: false, completed: false },
  { label: 'Verdict', active: false, completed: false },
];

interface MainCanvasProps {
  messages: Message[];
  isStreaming: boolean;
  currentAgent: string;
  onContinue: () => void;
}

export default function MainCanvas({ messages, isStreaming, currentAgent, onContinue }: MainCanvasProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05070a] overflow-hidden">
      {/* Stepper */}
      <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          <span>Debate Canvas</span>
          <div className="flex items-center gap-2 text-green-400">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full bg-green-500",
              isStreaming ? "animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "opacity-50"
            )} /> 
            {isStreaming ? `Live: ${currentAgent}` : 'Idle'}
          </div>
        </div>

        <div className="flex items-center justify-between relative max-w-4xl mx-auto w-full px-4 sm:px-12 overflow-x-auto hide-scrollbar scroll-smooth">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-4 sm:left-12 w-[50%] h-[1px] bg-violet-500 -translate-y-1/2 transition-all"
          />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative z-10 shrink-0 min-w-[60px] sm:min-w-0">
              <div className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all",
                step.completed ? "bg-violet-600 border-violet-600 text-white" : 
                step.active ? "bg-[#05070a] border-violet-500 text-violet-400 scale-110 sm:scale-125 glow-violet" :
                "bg-[#05070a] border-slate-700 text-slate-500"
              )}>
                {step.completed ? (
                  <svg className="w-3.5 h-3.5 sm:w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="text-[10px] sm:text-xs">{i + 1}</span>
                )}
              </div>
              <span className={cn(
                "text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em] absolute -bottom-6 sm:-bottom-8 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all whitespace-nowrap",
                step.active ? "text-violet-400 bg-violet-400/5" : "text-slate-700"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row px-4 sm:px-6 gap-6 lg:gap-8 min-h-0 overflow-y-auto lg:overflow-hidden gpu-scroll hide-scrollbar">
        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 lg:flex-[0.6] flex flex-col gap-4 overflow-y-auto gpu-scroll hide-scrollbar lg:pr-4 py-4 min-h-[400px] lg:min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 font-display italic">
              Awaiting induction of argumentation stream...
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                key={i} 
                className={cn(
                  "p-5 rounded-3xl border bg-white/[0.015] backdrop-blur-md group hover:bg-white/[0.04] transition-all",
                  msg.color
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <img 
                    src={
                      msg.agent === 'Moderator' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' :
                      msg.agent.includes('PRO') ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' :
                      msg.agent.includes('CONTRA') ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' :
                      'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop'
                    } 
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/10 shadow-lg" alt={msg.agent} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">{msg.agent}</span>
                        <span className={cn("text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-black tracking-[0.1em]", msg.tagColor)}>{msg.tag}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-600 font-mono tracking-tighter">{msg.time}</span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal selection:bg-violet-500/30 whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 hidden sm:flex flex-col gap-3 transition-opacity">
                    <Quote className="w-4 h-4 text-slate-600 hover:text-violet-400 cursor-pointer transition-colors" />
                    <Paperclip className="w-4 h-4 text-slate-600 hover:text-violet-400 cursor-pointer transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Argument Visualizer */}
        <div className="flex-1 lg:flex-[0.4] flex flex-col gap-4 py-4 min-h-[350px] lg:min-h-0">
          <div className="flex-1 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden group">
            {/* Visualizer Mock Content */}
            <div className="absolute inset-0">
              {/* Dynamic Logic Map */}
              <LogicMap messages={messages} />
            </div>

            {/* Overlay UI */}
             <div className="absolute bottom-4 left-4 flex items-center gap-2">
               <button className="px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold flex items-center gap-2 hover:bg-violet-600/30 transition-all cursor-pointer">
                 <Network className="w-3 h-3" /> View: Logic Map
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 mt-auto">
        <div className="glass-dark rounded-2xl sm:rounded-3xl border border-white/10 p-1.5 sm:p-2 flex flex-col gap-1.5 sm:gap-2 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border-b border-white/5">
             <MessageSquare className="w-3.5 h-3.5 sm:w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Provide steering instructions..."
               className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-200 placeholder:text-slate-600"
               disabled={isStreaming}
             />
             <div className="flex items-center gap-2">
               <Paperclip className="w-3.5 h-3.5 sm:w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
               <Send className="w-4 h-4 sm:w-5 h-5 text-violet-400 cursor-pointer hover:text-violet-300" />
             </div>
          </div>
          <div className="flex flex-wrap items-center justify-between px-1.5 sm:px-2 py-1 gap-3">
             <div className="flex items-center gap-2">
               <button 
                 onClick={onContinue}
                 disabled={isStreaming}
                 className="px-4 sm:px-6 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-violet-600 text-white text-[11px] sm:text-sm font-bold flex items-center gap-2 hover:bg-violet-500 active:scale-95 transition-all shadow-lg shadow-violet-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isStreaming ? (
                   <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                 ) : (
                   <><Play className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" /> Initiate Debate</>
                 )}
               </button>
               <button className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors">
                 <Pause className="w-4 h-4 sm:w-5 h-5" />
               </button>
             </div>
             <button 
               onClick={() => {
                 const content = `# ArgueMind Research Brief\n\n` + 
                   messages.map(m => `### ${m.agent} (${m.tag})\n${m.text}\n\n---\n\n`).join('');
                 const blob = new Blob([content], { type: 'text/markdown' });
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `ArgueMind_Brief_${new Date().toISOString().slice(0,10)}.md`;
                 a.click();
               }}
               className="px-3 sm:px-4 h-8 sm:h-10 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 text-[10px] sm:text-xs font-bold text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-colors"
             >
               <FileText className="w-3.5 h-3.5 sm:w-4 h-4" /> Generate Brief
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Network({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
