import React from 'react';
import ReactMarkdown from 'react-markdown';
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
  Quote,
  Bot,
  Brain,
  Shield,
  Activity,
  Eye,
  Gavel,
  Cpu
} from 'lucide-react';

const AgentIcon = ({ tag, className }: { tag: string, className?: string }) => {
  switch (tag) {
    case 'LEAD': return <Bot className={className} />;
    case 'PRO': return <Activity className={className} />;
    case 'CONTRA': return <Brain className={className} />;
    case 'AUDIT': return <Eye className={className} />;
    case 'EXEC': return <Gavel className={className} />;
    case 'SYNTH': return <Layers className={className} />;
    default: return <Bot className={className} />;
  }
};
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
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Stepper */}
      <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
          <span>Strategy Canvas</span>
          <div className="flex items-center gap-2 text-green-500">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full bg-green-500",
              isStreaming ? "animate-pulse shadow-sm" : "opacity-50"
            )} /> 
            {isStreaming ? `Live: ${currentAgent}` : 'Idle'}
          </div>
        </div>

        <div className="flex items-center justify-between relative max-w-4xl mx-auto w-full px-4 sm:px-12 overflow-x-auto hide-scrollbar scroll-smooth">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-divider -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-4 sm:left-12 w-[50%] h-[1px] bg-violet-500 -translate-y-1/2 transition-all"
          />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative z-10 shrink-0 min-w-[60px] sm:min-w-0">
              <div className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all bg-background",
                step.completed ? "bg-violet-600 border-violet-600 text-white" : 
                step.active ? "border-violet-500 text-violet-500 scale-110 sm:scale-125 shadow-sm" :
                "border-divider text-text-muted"
              )}>
                {step.completed ? (
                  <svg className="w-3.5 h-3.5 sm:w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="text-[10px] sm:text-xs">{i + 1}</span>
                )}
              </div>
              <span className={cn(
                "text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em] absolute -bottom-6 sm:-bottom-8 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all whitespace-nowrap",
                step.active ? "text-violet-500 bg-violet-500/10" : "text-text-muted"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 sm:px-6 min-h-0 overflow-y-auto gpu-scroll hide-scrollbar">
        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 flex flex-col gap-4 overflow-y-auto gpu-scroll hide-scrollbar py-4 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full relative overflow-hidden min-h-[400px]">
               {/* Outer Rotating Ring */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                 className="absolute w-64 h-64 sm:w-80 sm:h-80 border-2 border-violet-500/20 rounded-full border-dashed"
               />
               {/* Inner Counter-Rotating Ring */}
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute w-48 h-48 sm:w-56 sm:h-56 border border-emerald-500/20 rounded-full border-dotted"
               />
               {/* Center Pulsing Core */}
               <motion.div 
                 animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 whileHover={{ scale: 1.15, rotate: 90 }}
                 className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.2)] backdrop-blur-md z-10 cursor-pointer"
               >
                 <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-violet-400" />
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="mt-10 sm:mt-12 text-center z-10 pointer-events-none"
               >
                 <h3 className="text-lg sm:text-xl font-bold text-text-main mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-emerald-400">Arena Standby Mode</h3>
                 <p className="text-xs sm:text-sm text-text-muted">Agents are idle. Provide instructions to begin the simulation.</p>
               </motion.div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                key={i} 
                className={cn(
                  "p-5 rounded-3xl border border-divider bg-card hover:border-violet-500/20 shadow-sm hover:shadow-violet-900/10 transition-all w-full max-w-4xl mx-auto",
                  msg.color
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-divider shadow-sm bg-black/5 dark:bg-slate-800 flex items-center justify-center text-text-main shrink-0">
                    <AgentIcon tag={msg.tag} className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-bold text-text-main tracking-tight">{msg.agent}</span>
                        <span className={cn("text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-black tracking-[0.1em]", msg.tagColor)}>{msg.tag}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-text-muted tracking-tighter">{msg.time}</span>
                    </div>
                    <div className="text-xs sm:text-[13px] text-text-main leading-relaxed font-normal selection:bg-violet-500/30 whitespace-pre-wrap prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 hidden sm:flex flex-col gap-3 transition-opacity">
                    <Quote className="w-4 h-4 text-text-muted hover:text-violet-500 cursor-pointer transition-colors" />
                    <Paperclip className="w-4 h-4 text-slate-600 hover:text-violet-400 cursor-pointer transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Debate Timeline (Bottom) */}
      <div className="px-4 sm:px-6 pt-2 pb-0">
        <div className="w-full bg-card/60 backdrop-blur-md rounded-2xl border border-divider p-4 flex flex-col gap-4 shadow-sm">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Debate Timeline</span>
              </div>
              <div className="text-[10px] font-mono text-text-muted bg-black/10 dark:bg-white/5 px-2 py-1 rounded-md">
                 LIVE: {messages.length > 0 ? messages[messages.length-1].time : '00:00'}
              </div>
           </div>

           <div className="relative h-20 w-full flex items-center mt-2 group overflow-x-auto hide-scrollbar">
              <div className="absolute top-1/2 left-0 w-[200%] h-0.5 bg-divider -translate-y-1/2" />
              <div className="absolute top-1/2 left-0 h-0.5 bg-violet-500 -translate-y-1/2 transition-all" style={{ width: '100%' }} />
              
              <div className="absolute inset-0 flex items-center gap-4 px-4 min-w-max">
                 {messages.map((msg, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group/node">
                       <div className={cn(
                          "w-3 h-3 rounded-full border-2 bg-background transition-transform group-hover/node:scale-150",
                          msg.agent.includes('PRO') ? 'border-green-500' : msg.agent.includes('CONTRA') ? 'border-red-500' : 'border-violet-500'
                       )} />
                       <div className="absolute top-6 flex flex-col items-center opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap bg-card border border-divider p-2 rounded-lg shadow-xl z-50 pointer-events-none">
                          <span className="text-[9px] font-black uppercase text-text-main">{msg.agent.replace(/\(PRO\)|\(CONTRA\)/i, '').trim()}</span>
                          <span className="text-[8px] text-text-muted font-mono">{msg.time}</span>
                       </div>
                    </div>
                 ))}
                 {isStreaming && (
                    <div className="flex flex-col items-center gap-2 relative z-10">
                       <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-background animate-ping" />
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 mt-auto">
        <div className="bg-card/80 dark:bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-divider p-1.5 sm:p-2 flex flex-col gap-1.5 sm:gap-2 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border-b border-divider">
             <MessageSquare className="w-3.5 h-3.5 sm:w-4 h-4 text-text-muted" />
             <input 
               type="text" 
               placeholder="Provide steering instructions..."
               className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-text-main placeholder:text-text-muted"
               disabled={isStreaming}
             />
             <div className="flex items-center gap-2">
               <Paperclip className="w-3.5 h-3.5 sm:w-4 h-4 text-text-muted cursor-pointer hover:text-text-main" />
               <Send className="w-4 h-4 sm:w-5 h-5 text-violet-500 cursor-pointer hover:text-violet-400" />
             </div>
          </div>
          <div className="flex flex-wrap items-center justify-between px-1.5 sm:px-2 py-1 gap-3">
             <div className="flex items-center gap-2">
               <button 
                 onClick={onContinue}
                 disabled={isStreaming}
                 className="px-4 sm:px-6 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-violet-600 text-white text-[11px] sm:text-sm font-bold flex items-center gap-2 hover:bg-violet-500 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isStreaming ? (
                   <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                 ) : (
                   <><Play className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" /> Execute Strategy</>
                 )}
               </button>
               <button className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-divider bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main transition-colors">
                 <Pause className="w-4 h-4 sm:w-5 h-5" />
               </button>
             </div>
             <button 
               onClick={() => {
                 const content = `# Strategic Intelligence Brief\n\n` + 
                   messages.map(m => `### ${m.agent} (${m.tag})\n${m.text}\n\n---\n\n`).join('');
                 const blob = new Blob([content], { type: 'text/markdown' });
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `Strategy_Brief_${new Date().toISOString().slice(0,10)}.md`;
                 a.click();
               }}
               className="px-3 sm:px-4 h-8 sm:h-10 rounded-xl sm:rounded-2xl border border-divider bg-black/5 dark:bg-white/5 text-[10px] sm:text-xs font-bold text-text-muted flex items-center gap-2 hover:text-text-main transition-colors"
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
