import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Node {
  id: string;
  agent: string;
  text: string;
  type: 'pro' | 'contra' | 'mod';
}

interface LogicMapProps {
  messages: any[];
}

export default function LogicMap({ messages }: LogicMapProps) {
  // Extract key claims from the messages
  const nodes = useMemo(() => {
    const extractedNodes: Node[] = [];
    const seen = new Set();

    messages.forEach((m, i) => {
      if (m.text.length > 20 && m.text.length < 150) {
        const id = `node-${i}`;
        const type = m.agent.includes('PRO') ? 'pro' : m.agent.includes('CONTRA') ? 'contra' : 'mod';
        if (!seen.has(m.text)) {
          extractedNodes.push({ id, agent: m.agent, text: m.text, type });
          seen.add(m.text);
        }
      }
    });

    return extractedNodes.slice(-5); // Only show the last 5 relevant claims
  }, [messages]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Connection Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-20">
            {nodes.map((node, i) => {
              if (i === 0) return null;
              const prevNode = nodes[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1="50%"
                  y1={`${10 + i * 20}%`}
                  x2="50%"
                  y2={`${10 + (i - 1) * 20}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  className={cn(
                    node.type === 'pro' ? 'text-green-500' : 'text-red-500'
                  )}
                />
              );
            })}
          </svg>
        </div>

        {/* Nodes */}
        <div className="relative z-10 space-y-4">
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-3 rounded-xl border glass-dark max-w-[200px] shadow-xl",
                node.type === 'pro' ? 'border-green-500/30' : 
                node.type === 'contra' ? 'border-red-500/30' : 
                'border-violet-500/30'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  node.type === 'pro' ? 'bg-green-400' : 
                  node.type === 'contra' ? 'bg-red-400' : 
                  'bg-violet-400'
                )} />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  {node.agent}
                </span>
              </div>
              <p className="text-[10px] text-slate-200 leading-tight font-medium italic">
                "{node.text.slice(0, 80)}..."
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
