import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, BarChart2, PieChart, Landmark, Rocket, Scale, HeartPulse, SquareTerminal, Infinity, Shield, CheckCircle, Zap, Network, Database, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <Infinity className="w-8 h-8 text-violet-500" strokeWidth={1.5} />
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold">Strategic<br/>Intelligence</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#capabilities" className="hover:text-white transition-colors">Core Capabilities</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <button onClick={onLaunch} className="hover:text-white transition-colors">Launch App</button>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onLaunch} className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-sm hover:bg-violet-500 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            Initialize Arena
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        
        {/* HERO SECTION */}
        <section className="flex flex-col xl:flex-row items-center justify-between gap-16 mb-32">
          
          {/* Hero Left */}
          <div className="flex-1 max-w-2xl">
            <div className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-bold mb-8">
              Multi-Agent Debate Arena
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-medium tracking-tight mb-8 leading-[1.1] text-white">
              The Engine for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-emerald-400">Bulletproof<br />Reasoning.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg text-zinc-400 mb-10 max-w-xl leading-relaxed">
              Deploy a coalition of the world's most advanced AI models to dissect your most complex problems. Pit GPT-4, Claude, Gemini, Grok, and local models against each other in real-time to shatter echo chambers and forge bulletproof strategies.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={onLaunch} className="w-full sm:w-auto px-6 py-4 bg-violet-600 text-white rounded-sm font-semibold flex items-center justify-center gap-3 hover:bg-violet-500 transition-colors group shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                Launch Debate Canvas
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-6 py-4 bg-transparent text-white border border-white/20 rounded-sm font-medium flex items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                <SquareTerminal className="w-4 h-4" />
                View Architecture
              </button>
            </motion.div>
          </div>

          {/* Hero Right - UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="flex-1 w-full max-w-[700px] bg-[#0A0A0A] border border-violet-500/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] relative">
             {/* Mockup Header */}
             <div className="flex items-center p-4 border-b border-white/10">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-white/20" />
                 <div className="w-3 h-3 rounded-full bg-white/20" />
                 <div className="w-3 h-3 rounded-full bg-white/20" />
               </div>
               <div className="mx-auto flex items-center gap-3">
                 <span className="text-xs text-white/50">Universal Basic Income</span>
                 <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   Live Debate
                 </span>
               </div>
             </div>
             {/* Mockup Body */}
             <div className="p-8 flex flex-col gap-6 relative">
               <div className="flex gap-6">
                 {/* Confidence Ring */}
                 <div className="w-1/3 p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                   <div className="text-xs text-white/50 mb-4">Confidence Score</div>
                   <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center relative">
                     <span className="text-2xl font-bold">68%</span>
                   </div>
                 </div>
                 {/* Stats lines */}
                 <div className="w-2/3 flex flex-col justify-center gap-4">
                    {[
                      { label: "Economic Viability", val: "72%" },
                      { label: "Social Impact", val: "64%" },
                      { label: "Implementation Risk", val: "58%" }
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-[10px] text-white/50 mb-1">
                          <span>{s.label}</span><span>{s.val}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                           <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: s.val }} />
                        </div>
                      </div>
                    ))}
                 </div>
               </div>

               {/* Mock Agents */}
               <div className="mt-4">
                 <div className="text-[10px] text-white/50 mb-3">Active Agents</div>
                 <div className="flex gap-3">
                   {['Proponent', 'Analyst', 'Skeptic', 'Ethicist'].map((agent, i) => (
                     <div key={agent} className="flex-1 bg-white/5 border border-white/5 p-3 rounded-lg text-xs">
                        <div className="font-semibold mb-1">{agent}</div>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> {i === 2 ? <span className="text-red-400">Disagree</span> : 'Agree'}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Fake blur over mockup to look premium */}
               <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
             </div>
          </motion.div>
        </section>

        {/* TRUSTED BY / POWERED BY */}
        <section id="architecture" className="border-t border-b border-white/10 py-12 mb-32">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-bold mb-8 text-center">
            Powered by multi-provider intelligence
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 opacity-40 grayscale">
            <span className="text-2xl font-bold tracking-tighter">OPENAI</span>
            <span className="text-xl font-medium tracking-widest uppercase">Anthropic</span>
            <span className="text-2xl font-black tracking-tight">GEMINI</span>
            <span className="text-xl font-bold tracking-widest uppercase">xAI Grok</span>
            <span className="text-2xl font-bold tracking-tighter">OLLAMA</span>
            <span className="text-2xl font-black tracking-tight">React</span>
            <span className="text-xl font-bold tracking-widest uppercase">FastAPI</span>
          </div>
        </section>

        {/* USE CASES */}
        <section id="capabilities" className="mb-32">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-bold mb-4">Core Capabilities</div>
              <h2 className="text-4xl font-medium tracking-tight">Engineered for Analysis</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Scale, title: "Shatter Echo Chambers", desc: "By forcing models from different providers (OpenAI vs. Anthropic vs. xAI) to argue, you actively eliminate algorithmic bias." },
              { icon: Rocket, title: "Pressure-Test Logic", desc: "Watch as rigorous Skeptic agents brutally tear down weak assumptions before you ever make a critical business decision." },
              { icon: HeartPulse, title: "Synthesize Truth", desc: "A dedicated local Fact Checker continuously monitors the crossfire, ensuring that hallucinations are caught and corrected instantly." },
              { icon: BarChart2, title: "Sentiment Telemetry", desc: "Live polling from the simulated Audience agent measures persuasion over time." },
              { icon: Network, title: "Logic Network Mapping", desc: "Visualize the entire argument structure with branching attack vectors and claims." },
              { icon: Database, title: "Evidence Library", desc: "Automatically extracts and archives verified factual statements into an interactive ledger." }
            ].map((uc, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i} 
                className="p-8 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-violet-500/30 hover:bg-violet-500/[0.02] transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 text-zinc-400 mb-6 group-hover:text-violet-400 transition-colors">
                  {typeof uc.icon === 'function' ? <uc.icon /> : <uc.icon className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-medium mb-3 group-hover:text-violet-200 transition-colors">{uc.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-8">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="mb-32">
          <div className="text-center mb-16">
             <div className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-bold mb-4">How it works</div>
             <h2 className="text-4xl font-medium tracking-tight">From Question to Decision</h2>
          </div>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-0 right-0 h-px bg-white/10 hidden lg:block" />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
              {[
                { step: "01", icon: SquareTerminal, title: "Assemble Your Roster", desc: "Choose your battleground. Assign specific roles (Proponent, Skeptic) and equip them with specific models—like Claude for creative opposition and GPT-4 for structured defense." },
                { step: "02", icon: Zap, title: "The Arena Ignites", desc: "Launch the debate and watch as the models go head-to-head. They will actively listen, counter-argue, and expose logical fallacies in each other's reasoning." },
                { step: "03", icon: Shield, title: "Extract Intelligence", desc: "The chaos is distilled. Our extraction engine maps the multi-model crossfire into a clean, actionable Logic Network of verified conclusions." },
                { step: "04", icon: BarChart2, title: "Insights & Confidence", desc: "Get key insights with confidence scores and reasoning trees." },
                { step: "05", icon: CheckCircle, title: "Decide & Track", desc: "Make decisions with full audit trails and memory persistence." }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#0A0A0A] border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] flex items-center justify-center mb-6">
                    <step.icon className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium text-sm mb-2"><span className="text-zinc-500 mr-2">{step.step}</span> {step.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-t border-b border-white/10 py-20 mb-32 flex flex-col md:flex-row gap-12">
           <div className="flex-1">
             <div className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-bold mb-6">Multi-Provider Orchestration</div>
             <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
               Maximum intelligence.<br/>Zero echo chambers.
             </h2>
           </div>
           <div className="flex-1 grid grid-cols-2 gap-y-12 gap-x-8">
             <div>
               <div className="text-5xl font-medium mb-2">5+</div>
               <div className="text-xs text-zinc-500">Supported LLM Providers</div>
             </div>
             <div>
               <div className="text-5xl font-medium mb-2">Multi</div>
               <div className="text-xs text-zinc-500">Agent Cross-Debate</div>
             </div>
             <div>
               <div className="text-5xl font-medium mb-2">Live</div>
               <div className="text-xs text-zinc-500">Streaming Telemetry</div>
             </div>
             <div>
               <div className="text-5xl font-medium mb-2">∞</div>
               <div className="text-xs text-zinc-500">Logical Tree Branches</div>
             </div>
           </div>
        </section>

        {/* HORIZON CTA */}
        <section className="relative w-full h-[400px] flex items-center justify-between rounded-3xl overflow-hidden px-12 bg-black border border-violet-500/20">
           {/* Fake Earth Horizon Glow */}
           <div className="absolute -bottom-64 left-1/2 -translate-x-1/2 w-[150%] h-[400px] bg-violet-600/20 rounded-[100%] blur-[80px]" />
           
           <div className="relative z-10 max-w-xl">
             <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight mb-6">
               Initialize your first<br/>Debate Arena today.
             </h2>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative z-10 bg-[#0A0A0A] p-8 rounded-2xl border border-violet-500/20 w-full max-w-md shadow-[0_0_30px_rgba(139,92,246,0.15)]"
           >
              <h3 className="text-lg font-medium mb-2">Start the Simulation</h3>
              <p className="text-sm text-zinc-400 mb-6">Launch the canvas and type your first strategic prompt into the system.</p>
              <button onClick={onLaunch} className="w-full px-6 py-4 bg-violet-600 text-white rounded-sm font-semibold flex items-center justify-center gap-3 hover:bg-violet-500 transition-colors group shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                Enter Arena
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
           </motion.div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 pt-16 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6">
            <Infinity className="w-6 h-6 text-violet-500" strokeWidth={2} />
            <span className="text-[9px] tracking-[0.2em] uppercase font-semibold">Strategic<br/>Intelligence</span>
          </div>
          <p className="text-xs text-zinc-600">Debate. Analyze. Verify. Decide.</p>
        </div>
        
        <div className="flex gap-16 text-xs text-zinc-500">
          <div className="flex flex-col gap-4">
            <span className="text-white font-medium mb-2">Application</span>
            <button onClick={onLaunch} className="hover:text-white transition-colors text-left">Debate Canvas</button>
            <button onClick={onLaunch} className="hover:text-white transition-colors text-left">Intelligence Lab</button>
            <button onClick={onLaunch} className="hover:text-white transition-colors text-left">Logic Network</button>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-white font-medium mb-2">Engines</span>
            <span className="text-zinc-500">OpenAI (GPT-4)</span>
            <span className="text-zinc-500">Anthropic (Claude)</span>
            <span className="text-zinc-500">Google (Gemini)</span>
            <span className="text-zinc-500">xAI (Grok)</span>
            <span className="text-zinc-500">Ollama (Local)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
