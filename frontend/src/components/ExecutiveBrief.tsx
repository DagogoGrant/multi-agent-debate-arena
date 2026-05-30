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
    // Look for explicit "confidence: X%"
    let match = text.match(/confidence:?\s*(\d+)%/i);
    if (match) return match[1] + '%';
    
    // Look for a score like "85-78" and take the higher one as an approximate confidence
    match = text.match(/\b(\d{2,3})-(\d{2,3})\b/);
    if (match) {
      const score = Math.max(parseInt(match[1]), parseInt(match[2]));
      return score <= 100 ? score + '%' : 'Pending';
    }
    
    // Look for scores like "91/100" or "91/100 vs 21/100"
    const slashMatches = text.match(/\b(\d{1,3})\/100\b/g);
    if (slashMatches) {
      const scores = slashMatches.map(m => parseInt(m.split('/')[0]));
      const maxScore = Math.max(...scores);
      return maxScore <= 100 ? maxScore + '%' : 'Pending';
    }
    
    return 'Pending';
  };

  const confidence = parseConfidence(synthMessage.text);
  
  // Split the text into sections if possible, otherwise just show the whole thing in a nice container
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 h-full bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 bg-violet-500/10 border border-violet-500/20 rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Final Verdict</h3>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-main mt-2">
              Strategic Recommendation
            </h1>
            <p className="text-sm text-violet-800/80 dark:text-violet-200/60 mt-2">
              Based on the synthesized analysis of all agent arguments.
            </p>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Overall Confidence</div>
            <div className="text-4xl sm:text-5xl font-bold text-text-main tracking-tight">{confidence}</div>
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
          <div className="prose dark:prose-invert prose-violet max-w-none prose-sm sm:prose-base leading-relaxed text-text-main">
            <ReactMarkdown>{synthMessage.text}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}
