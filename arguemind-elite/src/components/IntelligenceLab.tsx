import React from 'react';
import { 
  TrendingUp, 
  Search, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { cn } from '../lib/utils';

const sentimentData = [
  { R: 'R1', Pro: 40, Contra: 30 },
  { R: 'R2', Pro: 35, Contra: 45 },
  { R: 'R3', Pro: 55, Contra: 50 },
  { R: 'R4', Pro: 60, Contra: 55 },
  { R: 'R5', Pro: 65, Contra: 42 },
];

const factChecks = [
  { item: 'AI reduces human error in critical systems.', status: 'Verified', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { item: 'AI lacks moral responsibility.', status: 'Needs Evidence', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { item: 'Public trust in AI is increasing globally.', status: 'Weak Logic', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const evidence = [
  { name: 'OECD AI Principles', size: '2.1 MB', verified: true },
  { name: 'EU AI Act (Full Text)', size: '1.7 MB', verified: true },
  { name: 'Stanford AI Index 2025', size: '3.4 MB', verified: true },
];

interface IntelligenceLabProps {
  metrics?: {
    persuasion: { pro: number, contra: number },
    sentimentHistory: any[],
    factChecks: any[],
    summary?: any,
    logicMap?: any[]
  };
  onClose?: () => void;
}

export default function IntelligenceLab({ metrics, onClose }: IntelligenceLabProps) {
  const currentSentiment = metrics?.sentimentHistory || [];
  const persuasion = metrics?.persuasion || { pro: 50, contra: 50 };
  const currentFactChecks = metrics?.factChecks || [];
  const summary = metrics?.summary || null;
  const logicMap = metrics?.logicMap || [];

  return (
    <aside className="w-full sm:w-[420px] h-full flex flex-col border-l border-white/10 bg-[#080a0f] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto gpu-scroll hide-scrollbar p-5 sm:p-8 gap-10 shrink-0 relative z-20">
      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-violet-500/20 to-transparent" />
      {onClose && (
        <button onClick={onClose} className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-400 self-end">
          Close
        </button>
      )}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center justify-between">
          Intelligence Lab
          <TrendingUp className="w-4 h-4 text-violet-400/50" />
        </h3>

        <div className="space-y-12">
          {/* Persuasion Probability */}
          <div className="space-y-5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-400 border border-violet-500/20">1</div>
                   <span className="text-[11px] font-bold text-slate-200 tracking-tight">Persuasion Probability</span>
                </div>
                <span className="text-[9px] text-green-400 animate-pulse uppercase font-black tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Live
                </span>
             </div>
             
             <div className="space-y-4 px-1">
               <div>
                  <div className="flex justify-between text-[10px] mb-2 font-medium">
                    <span className="text-slate-500 uppercase tracking-tighter">Pro <span className="text-[8px] opacity-40">(Affirmative)</span></span>
                    <span className="text-slate-100 font-bold">{Math.round(persuasion?.pro || 0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div className="h-full bg-violet-600 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]" style={{ width: `${persuasion?.pro || 0}%` }} />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] mb-2 font-medium">
                    <span className="text-slate-500 uppercase tracking-tighter">Contra <span className="text-[8px] opacity-40">(Negative)</span></span>
                    <span className="text-slate-100 font-bold">{Math.round(persuasion?.contra || 0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${persuasion?.contra || 0}%` }} />
                  </div>
               </div>
             </div>
             <div className="flex justify-between text-[8px] text-slate-600 font-mono uppercase tracking-[0.2em] px-2 pt-1">
               <span>Confidence Interval</span>
               <span>±4.2%</span>
             </div>
          </div>

          {/* Tone / Sentiment */}
          <div className="space-y-5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-400 border border-violet-500/20">2</div>
                   <span className="text-[11px] font-bold text-slate-200 tracking-tight">Tone / Sentiment Over Time</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-[2px] bg-emerald-400 rounded-full" />
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Pro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-[2px] bg-red-400 rounded-full" />
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Contra</span>
                  </div>
                </div>
             </div>
             
             <div className="h-32 w-full -ml-8 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentSentiment.length > 0 ? currentSentiment : [{R: 'R0', Pro: 50, Contra: 50}]}>
                    <XAxis dataKey="R" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                      itemStyle={{ padding: '0px' }}
                    />
                    <Line type="monotone" dataKey="Pro" stroke="#34d399" strokeWidth={2.5} dot={false} isAnimationActive={true} />
                    <Line type="monotone" dataKey="Contra" stroke="#f87171" strokeWidth={2.5} dot={false} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
             <div className="flex justify-between text-[8px] text-slate-600 font-mono uppercase tracking-[0.3em] px-5">
               <span>R1</span>
               <span>R2</span>
               <span>R3</span>
               <span>R4</span>
             </div>
          </div>

          {/* Fact Check Queue */}
          <div className="space-y-5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-400 border border-violet-500/20">3</div>
                   <span className="text-[11px] font-bold text-slate-200 tracking-tight">Fact Check Queue</span>
                </div>
                <button className="text-[9px] text-slate-600 hover:text-white transition-colors uppercase font-bold tracking-widest flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
             </div>
             
             <div className="space-y-2.5">
                {currentFactChecks.length > 0 ? currentFactChecks.map((check: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.015] border border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-violet-400/50 transition-colors" />
                      <span className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate">{check.item}</span>
                    </div>
                    <span className={cn("text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-[0.05em]", 
                      check.status === 'Verified' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 
                      check.status === 'Weak Logic' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                      'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    )}>
                      {check.status}
                    </span>
                  </div>
                )) : (
                  <div className="text-[10px] text-slate-600 italic px-2">Waiting for Fact-Checker analysis...</div>
                )}
              </div>
          </div>

          {/* Logic Map Link */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-bold text-violet-400">4</div>
                   <span className="text-[11px] font-bold text-slate-200">Logic Map</span>
                </div>
                <button className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest">Expand</button>
             </div>
              <div className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center overflow-x-auto overflow-y-hidden hide-scrollbar px-4 gap-5">
                {metrics?.logicMap && metrics.logicMap.length > 0 ? metrics.logicMap.map((node: any, i: number) => (
                  <div key={i} className={cn(
                    "min-w-[180px] p-4 rounded-2xl border flex flex-col gap-2 transition-all animate-in slide-in-from-right-4 duration-500 hover:bg-white/[0.03] cursor-help",
                    node.type === 'pro' ? "bg-green-500/10 border-green-500/20" : 
                    node.type === 'con' ? "bg-blue-500/10 border-blue-500/20" : 
                    "bg-red-500/10 border-red-500/20"
                  )}>
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-[0.1em]",
                      node.type === 'pro' ? "text-green-400" : 
                      node.type === 'con' ? "text-blue-400" : 
                      "text-red-400"
                    )}>{node.label}</div>
                    <div className="text-[10px] text-slate-200 leading-snug font-medium line-clamp-3">{node.text}</div>
                  </div>
                )) : (
                  <div className="w-full text-center text-[10px] text-slate-600 italic">Waiting for structured arguments...</div>
                )}
              </div>
          </div>

          {/* Strategic Summary */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-bold text-violet-400">5</div>
                <span className="text-[11px] font-bold text-slate-200">Strategic Summary</span>
             </div>
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                {summary ? (
                  <>
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                       <p className="text-[10px] text-slate-400 leading-relaxed"><span className="text-green-400 font-bold">Strongest Argument (Pro):</span> {summary.proStrong}</p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                       <p className="text-[10px] text-slate-400 leading-relaxed"><span className="text-amber-400 font-bold">Weakest Link (Contra):</span> {summary.conWeak}</p>
                    </div>
                    <div className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                       <p className="text-[10px] text-slate-400 leading-relaxed"><span className="text-blue-300 font-bold">Key Insight:</span> {summary.insight}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-slate-600 italic">Analysis will generate after the debate concludes...</div>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Evidence Library */}
      <div className="mt-4">
         <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
           Evidence Library
           <button className="text-[10px] text-slate-500 flex items-center gap-1 hover:text-slate-300 transition-colors uppercase tracking-widest">Open Library <ExternalLink className="w-3 h-3" /></button>
         </h3>
         <div className="space-y-2">
            {evidence.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] cursor-pointer transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-violet-400 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-200 truncate">{doc.name}</div>
                    <div className="text-[8px] text-slate-600 font-mono">PDF • {doc.size}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                  <span className="text-[8px] text-green-500 uppercase font-bold tracking-widest">Verified</span>
                </div>
              </div>
             ))}
          </div>
      </div>

      {/* System Telemetry Debug (Collapsible) */}
      <details className="mt-10 group border-t border-white/5 pt-6">
         <summary className="list-none cursor-pointer flex items-center gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] hover:text-slate-400 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-open:bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            System Telemetry
         </summary>
         <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[8px] text-slate-500 overflow-x-auto whitespace-pre">
            {JSON.stringify(metrics, null, 2)}
         </div>
      </details>
    </aside>
  );
}
