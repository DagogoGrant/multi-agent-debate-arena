import React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecentDebatesProps {
  onLoadDebate?: (id: string) => void;
}

export default function RecentDebates({ onLoadDebate }: RecentDebatesProps) {
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:9000/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Failed to fetch history:", err));
  }, []);

  return (
    <section className="h-48 border-t border-white/5 bg-[#05070a] px-6 py-4 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          Recent Debates
          <span className="text-[8px] text-slate-600 hover:text-slate-400 cursor-pointer flex items-center gap-1 transition-colors ml-4">
            View Archive <ChevronRight className="w-3 h-3" />
          </span>
        </h3>
        <div className="flex items-center gap-2">
           <button className="p-1 rounded bg-white/5 border border-white/10 text-slate-500 hover:text-slate-200 transition-colors">
              <ChevronLeft className="w-4 h-4" />
           </button>
           <button className="p-1 rounded bg-white/5 border border-white/10 text-slate-500 hover:text-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {history.length === 0 ? (
          <div className="text-[10px] text-slate-600 italic py-4">No history found.</div>
        ) : (
          history.map((debate, i) => (
            <div 
              key={i}
              onClick={() => onLoadDebate?.(debate.id)}
              className="flex-none w-72 h-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.04] transition-all"
            >
              <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-violet-400 transition-colors">
                {debate.topic}
              </h4>
              
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-[9px] text-slate-500 font-mono">
                  {debate.date.slice(0,4)}-{debate.date.slice(4,6)}-{debate.date.slice(6,8)}
                </span>
                <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  COMPLETED
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
