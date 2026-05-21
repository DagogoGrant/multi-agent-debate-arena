import React from 'react';
import { Cpu, Zap, Radar, AlertTriangle } from 'lucide-react';

const Telemetry = ({ vitals, fallacies, persuasion }) => {
    return (
        <aside className="w-80 bg-surface-container-low h-[calc(100vh-64px)] fixed right-0 top-16 flex flex-col font-body border-l border-outline-variant/10">
            <div className="p-6 border-b border-outline-variant/10">
                <h3 className="text-sm font-bold tracking-widest text-[#E5E2E1] uppercase mb-4">Live Telemetry</h3>
                <div className="space-y-4">
                    <div className="bg-surface-container-high rounded p-3">
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-on-surface/60">INFERENCE THROUGHPUT</span>
                            <span className="text-primary font-mono">{vitals.tps?.toFixed(1) || 0} t/s</span>
                        </div>
                        <div className="h-8 flex items-end gap-0.5">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 bg-primary/20 ${i % 3 === 0 ? 'h-[60%]' : i % 2 === 0 ? 'h-[40%]' : 'h-[80%]'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-surface-container-high rounded p-3">
                            <span className="text-[9px] text-on-surface/40 block">LATENCY</span>
                            <span className="text-xl font-bold font-headline">{vitals.latency?.toFixed(0) || 0} ms</span>
                        </div>
                        <div className="bg-surface-container-high rounded p-3">
                            <span className="text-[9px] text-on-surface/40 block">CONTEXT</span>
                            <span className="text-xl font-bold font-headline">98%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-b border-outline-variant/10">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Persuasion Gauge</h3>
                    <span className="text-xs font-headline text-secondary tracking-tight">Alignment: {persuasion.toFixed(0)}%</span>
                </div>
                <div className="relative h-24 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="w-48 h-48 rounded-full border-[12px] border-surface-variant border-b-transparent rotate-45"></div>
                        <div
                            className="absolute w-48 h-48 rounded-full border-[12px] border-primary border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(77,142,254,0.3)] transition-all duration-1000"
                            style={{ transform: `rotate(${persuasion * 1.8 - 90}deg)` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                <h4 className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">Fallacy Ticker</h4>
                <div className="space-y-2">
                    {fallacies.map((f, i) => (
                        <div key={i} className={`bg-surface-container-lowest p-3 rounded border-l ${f.type === 'Critical' ? 'border-error/50' : 'border-tertiary/50'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9px] font-bold uppercase ${f.type === 'Critical' ? 'text-error' : 'text-tertiary'}`}>{f.label}</span>
                                <span className="text-[8px] text-on-surface-variant">{f.agent} | {f.time}</span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant line-clamp-2">{f.description}</p>
                        </div>
                    ))}
                    {fallacies.length === 0 && <p className="text-[10px] text-on-surface-variant italic">No fallacies identified.</p>}
                </div>
            </div>

            <div className="mt-auto p-6 bg-surface-container-highest/30">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">System Broadcast</span>
                    <Radar size={14} className="text-primary animate-pulse" />
                </div>
                <div className="font-mono text-[9px] text-on-surface/60 space-y-1">
                    <p>&gt; [09:41:22] NODE_NEXUS_READY</p>
                    <p>&gt; [09:41:28] DEBATE_SYNC_OK</p>
                </div>
            </div>
        </aside>
    );
};

export default Telemetry;
