import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Activity, Brain, Eye, Gavel, Layers, Loader2, Infinity } from 'lucide-react';
import { cn } from '../lib/utils';
import { Message } from '../App';

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

export default function SharedDebate({ shareId }: { shareId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
    fetch(`${API_BASE}/api/share/${shareId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setTopic(data.topic);
          setMessages(data.transcript.map((t: any) => ({
            agent: t[0],
            text: t[1],
            time: '',
            tag: 'ARCHIVE',
            color: t[0].includes('PRO') ? 'border-green-500/20' : 'border-red-500/20',
            tagColor: 'bg-slate-800 text-slate-400'
          })));
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load shared debate.");
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold">Debate Not Found</h2>
        <p className="text-zinc-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Infinity className="w-8 h-8 text-violet-500" strokeWidth={1.5} />
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold">Strategic<br/>Intelligence</span>
        </div>
        <div className="text-xs text-zinc-500 border border-white/10 px-3 py-1 rounded-full bg-white/5">
          Public Read-Only View
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 pt-12 flex flex-col gap-8">
        <div className="text-center mb-8">
          <div className="text-[10px] tracking-[0.2em] text-violet-500 uppercase font-bold mb-4">Research Topic</div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white leading-tight">
            {topic}
          </h1>
        </div>

        <div className="flex flex-col gap-6 pb-24">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "p-6 rounded-3xl border border-white/5 bg-[#0A0A0A] shadow-sm w-full",
                msg.color
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                  <AgentIcon tag={msg.tag} className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <span className="text-sm font-bold tracking-tight text-white/90">{msg.agent}</span>
                  </div>
                  <div className="text-[13px] text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap prose prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
