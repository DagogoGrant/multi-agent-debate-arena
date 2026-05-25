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
  Tooltip,
  CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { cn } from '../lib/utils';

const radarData = [
  { subject: 'Regulation', score: 66 },
  { subject: 'Market', score: 72 },
  { subject: 'Risks', score: 64 },
  { subject: 'Legal', score: 68 },
  { subject: 'Competition', score: 72 },
];

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



interface IntelligenceLabProps {
  metrics?: {
    persuasion: { pro: number, contra: number },
    sentimentHistory: any[],
    factChecks: any[],
    summary?: any,
    logicMap?: any[],
    radarData?: any[]
  };
  onClose?: () => void;
}

export default function IntelligenceLab({ metrics, onClose }: IntelligenceLabProps) {
  const [isFactExpanded, setIsFactExpanded] = React.useState(false);
  
  const currentSentiment = metrics?.sentimentHistory || [];
  const persuasion = metrics?.persuasion || { pro: 50, contra: 50 };
  const currentFactChecks = metrics?.factChecks || [];
  const summary = metrics?.summary || null;
  const logicMap = metrics?.logicMap || [];
  const dynamicRadarData = metrics?.radarData || [
    { subject: 'Regulation', score: 0 },
    { subject: 'Market', score: 0 },
    { subject: 'Risks', score: 0 },
    { subject: 'Legal', score: 0 },
    { subject: 'Competition', score: 0 },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto gpu-scroll hide-scrollbar p-6 sm:p-10">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-10">
      {onClose && (
        <button onClick={onClose} className="lg:hidden p-2 rounded-lg bg-black/5 dark:bg-white/5 text-text-muted self-end">
          Close
        </button>
      )}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-8 flex items-center justify-between">
          Intelligence Lab
          <TrendingUp className="w-4 h-4 text-violet-400/50" />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT COLUMN */}
          <div className="space-y-12">
            {/* Confidence Heatmap */}
            <div className="space-y-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                     <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-500 border border-violet-500/20">1</div>
                     <span className="text-[11px] font-bold text-text-main tracking-tight">Confidence Heatmap</span>
                  </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicRadarData}>
                      <PolarGrid stroke="#ffffff20" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Confidence" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '10px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Fact Check Queue */}
            <div className="space-y-5">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-500 border border-violet-500/20">2</div>
                      <span className="text-[11px] font-bold text-text-main tracking-tight">Fact Check Queue</span>
                   </div>
                   {currentFactChecks.length > 3 && (
                     <button onClick={() => setIsFactExpanded(!isFactExpanded)} className="text-[9px] text-text-muted hover:text-text-main transition-colors uppercase font-bold tracking-widest flex items-center gap-1">
                       {isFactExpanded ? 'Show less' : 'View all'} <ChevronRight className={cn("w-3 h-3 transition-transform", isFactExpanded && "rotate-90")} />
                     </button>
                   )}
                </div>
                
                <div className="space-y-2.5">
                   {currentFactChecks.length > 0 ? (isFactExpanded ? currentFactChecks : currentFactChecks.slice(0, 3)).map((check: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/[0.015] border border-divider hover:bg-black/10 dark:hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-700 group-hover:bg-violet-500 transition-colors" />
                        <span className="text-[10px] text-text-muted font-medium max-w-[200px] truncate">{check.item}</span>
                      </div>
                      <span className={cn("text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-[0.05em]", 
                        check.status === 'Verified' ? 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20' : 
                        check.status === 'Weak Logic' ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' : 
                        'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                      )}>
                        {check.status}
                      </span>
                    </div>
                  )) : (
                    <div className="text-[10px] text-text-muted italic px-2">Waiting for Compliance Auditor analysis...</div>
                  )}
                </div>
            </div>
            
            {/* Strategic Summary */}
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-bold text-violet-500">3</div>
                  <span className="text-[11px] font-bold text-text-main">Investigation Summary</span>
               </div>
                <div className="space-y-3 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-divider">
                  {summary ? (
                    <>
                      <div className="flex gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                         <p className="text-[10px] text-text-muted leading-relaxed"><span className="text-green-600 dark:text-green-400 font-bold">Strongest Argument (Pro):</span> {summary.proStrong}</p>
                      </div>
                      <div className="flex gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                         <p className="text-[10px] text-text-muted leading-relaxed"><span className="text-amber-600 dark:text-amber-400 font-bold">Weakest Link (Contra):</span> {summary.conWeak}</p>
                      </div>
                      <div className="flex gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                         <p className="text-[10px] text-text-muted leading-relaxed"><span className="text-blue-600 dark:text-blue-400 font-bold">Key Insight:</span> {summary.insight}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-text-muted italic">Analysis will generate after the session concludes...</div>
                  )}
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-12">
            {/* Persuasion Probability */}
            <div className="space-y-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                     <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-500 border border-violet-500/20">4</div>
                     <span className="text-[11px] font-bold text-text-main tracking-tight">Persuasion Probability</span>
                  </div>
                  <span className="text-[9px] text-green-500 animate-pulse uppercase font-black tracking-widest flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" /> Live
                  </span>
               </div>
             
             <div className="space-y-4 px-1">
               <div>
                  <div className="flex justify-between text-[10px] mb-2 font-medium">
                    <span className="text-text-muted uppercase tracking-tighter">Pro <span className="text-[8px] opacity-40">(Affirmative)</span></span>
                    <span className="text-text-main font-bold">{Math.round(persuasion?.pro || 0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/5 dark:bg-white/[0.03] rounded-full overflow-hidden border border-divider p-[1px]">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: `${persuasion?.pro || 0}%` }} />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] mb-2 font-medium">
                    <span className="text-text-muted uppercase tracking-tighter">Contra <span className="text-[8px] opacity-40">(Negative)</span></span>
                    <span className="text-text-main font-bold">{Math.round(persuasion?.contra || 0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/5 dark:bg-white/[0.03] rounded-full overflow-hidden border border-divider p-[1px]">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${persuasion?.contra || 0}%` }} />
                  </div>
               </div>
             </div>
             <div className="flex justify-between text-[8px] text-text-muted uppercase tracking-[0.2em] px-2 pt-1">
               <span>Confidence Interval</span>
               <span>±4.2%</span>
             </div>
          </div>

           {/* Logic Map Link */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center text-[10px] font-bold text-violet-500">5</div>
                    <span className="text-[11px] font-bold text-text-main">Top Evidence Sources</span>
                 </div>
              </div>
              <div className="space-y-2">
                 {metrics?.factChecks && metrics.factChecks.filter((c: any) => c.status === 'Verified').length > 0 ? (
                   metrics.factChecks.filter((c: any) => c.status === 'Verified').map((check: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-divider group hover:bg-black/10 dark:hover:bg-white/[0.04] cursor-pointer transition-all">
                       <div className="flex items-center gap-3 min-w-0">
                         <div className="p-2 rounded-lg bg-black/10 dark:bg-slate-800 text-text-muted group-hover:text-violet-500 transition-colors">
                           <FileText className="w-4 h-4" />
                         </div>
                         <div className="min-w-0">
                           <div className="text-[10px] font-bold text-text-main truncate">Extract: {check.item.substring(0, 30)}...</div>
                           <div className="text-[8px] text-text-muted">TEXT • VERIFIED</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                         <span className="text-[8px] text-green-600 dark:text-green-500 uppercase font-bold tracking-widest">High</span>
                       </div>
                     </div>
                    ))
                 ) : (
                   <div className="p-6 rounded-2xl border border-dashed border-divider bg-black/5 dark:bg-white/[0.01] flex flex-col items-center justify-center text-center gap-3">
                     <Search className="w-6 h-6 text-text-muted opacity-50" />
                     <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Awaiting Evidence Ingestion</div>
                   </div>
                 )}
               </div>
           </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-divider">
        <div className="space-y-5">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                   <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center text-[9px] font-black text-violet-500 border border-violet-500/20">6</div>
                   <span className="text-[11px] font-bold text-text-main tracking-tight">Tone / Sentiment Over Time</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-[2px] bg-emerald-500 rounded-full" />
                    <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Pro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-[2px] bg-red-500 rounded-full" />
                    <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Contra</span>
                  </div>
                </div>
             </div>
             
             <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentSentiment.length > 0 ? currentSentiment : [{R: 'R0', Pro: 50, Contra: 50}]}>
                    <XAxis dataKey="R" stroke="#ffffff20" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#ffffff20" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ padding: '0px' }}
                    />
                    <Line type="monotone" dataKey="Pro" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={true} />
                    <Line type="monotone" dataKey="Contra" stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
        </div>
      </div>

      {/* System Telemetry Debug (Collapsible) */}
      <details className="mt-10 group border-t border-divider pt-6">
         <summary className="list-none cursor-pointer flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-[0.2em] hover:text-text-main transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-800 group-open:bg-green-500 transition-colors" />
            System Telemetry
         </summary>
         <div className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-divider text-[8px] text-text-muted overflow-x-auto whitespace-pre">
            {JSON.stringify(metrics, null, 2)}
         </div>
      </details>
      </div>
    </div>
  );
}
