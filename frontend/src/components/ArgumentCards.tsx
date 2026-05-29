import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Bot, Activity, Brain, Eye, Gavel, Layers } from 'lucide-react';
import { Message } from '../App';
import { cn } from '../lib/utils';

interface ArgumentCardsProps {
  messages: Message[];
}

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

const ArgumentCard = ({ msg, index, allMessages }: { msg: Message, index: number, allMessages: Message[] }) => {
  const [expanded, setExpanded] = useState(false);

  // Heuristic parsers to extract structured data from raw text
  const extractClaim = (text: string) => {
    // Try to find the first sentence or first bullet point
    const firstLine = text.split('\n').find(line => line.trim().length > 10);
    if (firstLine) {
      return firstLine.replace(/^#+\s*/, '').replace(/^-\s*/, '').slice(0, 120) + '...';
    }
    return "Argument presented...";
  };

  const extractConfidence = (text: string) => {
    const match = text.match(/confidence:?\s*(\d+)%/i);
    return match ? match[1] + '%' : 'N/A';
  };

  const findAttackers = () => {
    // If this is PRO, look ahead for the next CONTRA or AUDIT that mentions this
    const attackers = new Set<string>();
    for (let i = index + 1; i < allMessages.length; i++) {
      const nextMsg = allMessages[i];
      if (nextMsg.tag !== msg.tag && ['PRO', 'CONTRA', 'AUDIT'].includes(nextMsg.tag)) {
        attackers.add(nextMsg.agent);
      }
      if (attackers.size > 0) break; // just get the immediate next rebuttal
    }
    return Array.from(attackers);
  };

  const claim = extractClaim(msg.text);
  const confidence = extractConfidence(msg.text);
  const attackers = findAttackers();

  return (
    <div className="bg-card border border-divider rounded-2xl overflow-hidden hover:border-violet-500/50 transition-colors shadow-sm">
      <div className="p-5 border-b border-divider bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full border border-divider bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
            <AgentIcon tag={msg.tag} className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <h3 className="font-bold text-text-main">{msg.agent}</h3>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">{msg.tag}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-violet-600 dark:text-violet-400 font-bold mb-1">Core Claim</div>
            <p className="text-sm text-text-main font-medium">{claim}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Confidence</div>
              <span className={cn("text-sm font-bold", confidence !== 'N/A' ? "text-emerald-600 dark:text-emerald-400" : "text-text-muted")}>
                {confidence}
              </span>
            </div>
            {attackers.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Attacked By</div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{attackers.join(', ')}</span>
              </div>
            )}
            <div className="ml-auto">
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Status</div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">Under Review</span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-center gap-2 text-xs font-bold text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        {expanded ? (
          <><ChevronUp className="w-4 h-4" /> Collapse Argument</>
        ) : (
          <><ChevronDown className="w-4 h-4" /> View Full Argument</>
        )}
      </button>

      {expanded && (
        <div className="p-5 border-t border-divider bg-black/[0.03] dark:bg-black/40">
          <div className="prose dark:prose-invert max-w-none prose-sm leading-relaxed text-text-main">
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ArgumentCards({ messages }: ArgumentCardsProps) {
  // Filter out LEAD and SYNTH to focus on the actual debaters
  const debaterMessages = messages.filter(m => !['LEAD', 'SYNTH'].includes(m.tag));

  if (debaterMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 h-full">
        <p>No arguments presented yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 h-full bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main mb-2">Structured Arguments</h1>
          <p className="text-text-muted text-sm">Expand individual cards to read the full context and evidence.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {debaterMessages.map((msg, i) => (
            <ArgumentCard key={i} msg={msg} index={i} allMessages={messages} />
          ))}
        </div>
      </div>
    </div>
  );
}
