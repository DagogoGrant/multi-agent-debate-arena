import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Target } from 'lucide-react';

interface Node {
  id: string;
  agent: string;
  text: string;
  type: 'pro' | 'contra' | 'mod';
  confidence: number;
  isAttack: boolean;
}

interface LogicMapProps {
  messages: any[];
  topic?: string;
}

export default function LogicMap({ messages, topic = "Strategic Intelligence Protocol" }: LogicMapProps) {
  // Extract key claims from the messages
  const nodes = useMemo(() => {
    const extractedNodes: Node[] = [];
    const seen = new Set();

    messages.forEach((m, i) => {
      if (!m.agent.includes('PRO') && !m.agent.includes('CONTRA') && !m.agent.includes('Speaker')) return;

      let claim = m.text.match(/CLAIM:\s*(.*)/i)?.[1];
      let attack = m.text.match(/ATTACK:\s*(.*)/i)?.[1];

      if (!claim && !attack) {
         const sentences = m.text.split(/[.!?]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 30);
         if (sentences.length > 0) claim = sentences[0];
         if (sentences.length > 1) attack = sentences[1];
      }

      const type = m.agent.includes('PRO') ? 'pro' : m.agent.includes('CONTRA') ? 'contra' : 'mod';
      const confidence = Math.floor(Math.random() * 30) + 60; // Mock confidence score 60-90

      if (claim && !seen.has(claim)) {
        extractedNodes.push({ id: `node-${i}-c`, agent: m.agent, text: claim.replace(/\[|\]/g, '').replace(/^[*+\-•\d.]+|FACT_ITEM:|\*\*|Fact:|-/gi, ''), type, isAttack: false, confidence });
        seen.add(claim);
      }
      if (attack && !seen.has(attack)) {
        extractedNodes.push({ id: `node-${i}-a`, agent: m.agent, text: attack.replace(/\[|\]/g, '').replace(/^[*+\-•\d.]+|FACT_ITEM:|\*\*|Fact:|-/gi, ''), type, isAttack: true, confidence });
        seen.add(attack);
      }
    });

    return extractedNodes.slice(-8); // Limit to 8 nodes to avoid crowding the radial layout
  }, [messages]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden bg-background">
      <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 opacity-50 m-auto">
            <div className="w-12 h-12 rounded-full border border-divider flex items-center justify-center bg-black/5 dark:bg-white/5">
              <Target className="w-5 h-5 text-text-muted" />
            </div>
            <div className="text-sm font-bold text-text-muted">Awaiting Logic Nodes</div>
            <p className="text-xs text-text-muted max-w-[200px]">Strategic arguments will branch out here as the session progresses.</p>
          </div>
        ) : (
          <>
            {/* Central Node */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute z-20 flex flex-col items-center justify-center p-6 rounded-2xl border border-divider bg-card/90 backdrop-blur-xl shadow-2xl max-w-[240px] text-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <Target className="w-5 h-5 text-violet-500" />
              </div>
              <h3 className="text-sm font-bold text-text-main leading-snug">{topic}</h3>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-violet-500">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                Live Analysis
              </div>
            </motion.div>

            {/* Satellite Nodes */}
            {nodes.map((node, i) => {
              const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2; // Start from top (-90 deg)
              const radius = window.innerWidth > 1024 ? 320 : window.innerWidth > 768 ? 260 : 180; // Responsive radius
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              const isPro = node.type === 'pro';
              
              // Determine line coordinates from center (0,0) to node center
              return (
                <React.Fragment key={node.id}>
                  {/* SVG Connecting Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                    <motion.line 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      x1="50%" y1="50%" 
                      x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      className="text-white/10 dark:text-white/5"
                    />
                  </svg>

                  {/* Satellite Node */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, opacity: 1, x, y }}
                    transition={{ delay: 0.2 + (i * 0.1), type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute z-10"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className={cn(
                      "w-[220px] p-4 rounded-xl border bg-card/90 dark:bg-black/80 backdrop-blur-xl shadow-lg relative -translate-x-1/2 -translate-y-1/2 cursor-crosshair hover:scale-105 transition-transform",
                      isPro ? 'border-green-500/30' : 'border-red-500/30',
                      node.isAttack ? 'border-dashed border-2' : ''
                    )}>
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                        <div className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                          isPro ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        )}>
                          {node.agent.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted truncate">
                          {node.agent.replace(/\(PRO\)|\(CONTRA\)/i, '').trim()}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-text-main leading-relaxed font-medium mb-3 line-clamp-3">
                        {node.text}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold">Confidence</span>
                        <span className={cn(
                           "text-[9px] font-black",
                           isPro ? "text-green-500" : "text-red-500"
                        )}>{node.confidence}%</span>
                      </div>
                      <div className="h-1 w-full bg-black/10 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", isPro ? "bg-green-500" : "bg-red-500")}
                          style={{ width: `${node.confidence}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
