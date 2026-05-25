import React from 'react';
import { ChevronLeft, ChevronRight, Play, Database, History, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecentDebatesProps {
  onLoadDebate?: (id: string) => void;
  fullView?: boolean;
}

export default function RecentDebates({ onLoadDebate, fullView = false }: RecentDebatesProps) {
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:9000/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Failed to fetch history:", err));
  }, []);

  return (
    <section className={cn(
      "flex flex-col gap-6 overflow-hidden transition-all",
      fullView ? "h-full bg-transparent" : "h-48 border-t border-divider bg-background px-6 py-4"
    )}>
      {!fullView && (
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> Recent Debates
            <span className="text-[8px] text-text-muted hover:text-text-main cursor-pointer flex items-center gap-1 transition-colors ml-4">
              View Archive <ChevronRight className="w-3 h-3" />
            </span>
          </h3>
          <div className="flex items-center gap-2">
             <button className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-divider text-text-muted hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
             </button>
             <button className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-divider text-text-muted hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}


      <div className={cn(
        "flex-1 gap-4 lg:gap-6 hide-scrollbar pb-2",
        fullView ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 overflow-y-auto" : "flex overflow-x-auto"
      )}>
        {history.length === 0 ? (
          <div className="text-sm text-text-muted italic py-8 flex items-center gap-3 justify-center w-full col-span-full border border-dashed border-divider rounded-2xl bg-black/5 dark:bg-white/[0.01]">
            <Database className="w-5 h-5 opacity-50" /> No history found. Run a debate to populate the archive.
          </div>
        ) : (
          history.map((debate, i) => (
            <div 
              key={i}
              onClick={() => onLoadDebate?.(debate.id)}
              className={cn(
                "rounded-2xl border border-divider bg-card p-5 flex flex-col justify-between group cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.05] hover:border-violet-500/30 transition-all shadow-sm relative overflow-hidden",
                fullView ? "h-48" : "flex-none w-72 h-full"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
              
              <h4 className={cn(
                "font-bold text-text-main line-clamp-3 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors relative z-10",
                fullView ? "text-sm sm:text-base" : "text-xs"
              )}>
                {debate.topic}
              </h4>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-divider relative z-10">
                <span className="text-[10px] text-text-muted flex items-center gap-1.5 bg-black/5 dark:bg-black/20 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3" /> {debate.date.slice(0,4)}-{debate.date.slice(4,6)}-{debate.date.slice(6,8)}
                </span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> COMPLETED
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
