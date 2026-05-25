import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Network, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingHero({ onEnter }: { onEnter: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            x: mousePosition.x * 50,
            y: mousePosition.y * 50,
          }}
          transition={{ type: 'spring', damping: 50, stiffness: 50 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -50,
            y: mousePosition.y * -50,
          }}
          transition={{ type: 'spring', damping: 50, stiffness: 50 }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              y: Math.random() * window.innerHeight,
              x: Math.random() * window.innerWidth 
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-semibold tracking-wide uppercase shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tighter mb-6"
        >
          ArgueMind <span className="text-violet-500 font-display">Elite</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-2xl text-text-muted max-w-2xl mb-12 leading-relaxed"
        >
          Orchestrate complex strategic debates between autonomous AI personas to uncover blindspots, stress-test ideas, and formulate bulletproof plans.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-white to-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-600" />
              Initialize Simulation
            </span>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/10 group-hover:bg-black/20 transition-colors">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-divider pt-12 w-full"
        >
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/30">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-lg">Multi-Agent Topology</h3>
            <p className="text-text-muted text-sm leading-relaxed">Watch custom AI personas construct, deconstruct, and defend strategic logic nodes in real-time.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-lg">Live Fact Verification</h3>
            <p className="text-text-muted text-sm leading-relaxed">Integrated audit agents instantly cross-reference claims against external web sources.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-lg">Model Agnostic</h3>
            <p className="text-text-muted text-sm leading-relaxed">Mix and match GPT-4, Claude, Gemini, and local Ollama models in a single debate arena.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
