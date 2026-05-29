import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Target, AlertTriangle, Lightbulb, ShieldCheck, Loader2 } from 'lucide-react';
import { Message } from '../App';

interface ExecutiveBriefProps {
  messages: Message[];
  isStreaming: boolean;
}

export default function ExecutiveBrief({ messages, isStreaming }: ExecutiveBriefProps) {
  // Find the SYNTH agent's message, or the last message if SYNTH hasn't spoken
  const synthMessage = useMemo(() => {
    return messages.findLast(m => m.tag === 'SYNTH');
  }, [messages]);

  if (!synthMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full">
        {isStreaming ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm font-medium tracking-wide">Synthesizing Executive Brief...</p>
            <p className="text-xs text-slate-600">Waiting for final debate conclusions.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Target className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-medium tracking-wide">No Executive Brief Available</p>
            <p className="text-xs text-slate-600">Run a complete debate to generate the brief.</p>
          </div>
        )}
      </div>
    );
  }

  // Attempt to parse out structured data if it exists, otherwise fallback to raw markdown rendering
  const parseConfidence = (text: string) => {
    const match = text.match(/confidence:?\s*(\d+)%/i);
    return match ? match[1] + '%' : 'Pending';
  };

  const confidence = parseConfidence(synthMessage.text);
  
  // Split the text into sections if possible, otherwise just show the whole thing in a nice container
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 h-full bg-[#050505]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 bg-violet-500/10 border border-violet-500/20 rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400">Final Verdict</h3>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-2">
              Strategic Recommendation
            </h1>
            <p className="text-sm text-violet-200/60 mt-2">
              Based on the synthesized analysis of all agent arguments.
            </p>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Overall Confidence</div>
            <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{confidence}</div>
            <div className="w-full h-1.5 bg-emerald-500/20 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: confidence === 'Pending' ? '0%' : confidence }} 
              />
            </div>
          </div>
        </div>

        {/* Raw Content Fallback (Since SYNTH format is variable right now) */}
        <div className="bg-card border border-divider rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-divider pb-4">
            <Lightbulb className="w-5 h-5 text-text-muted" />
            <h2 className="text-lg font-bold text-text-main">Synthesis Report</h2>
          </div>
          <div className="prose prose-invert prose-violet max-w-none prose-sm sm:prose-base leading-relaxed">
            <ReactMarkdown>{synthMessage.text}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}
