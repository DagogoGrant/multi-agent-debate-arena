import React from 'react';
import { Mic, Globe, Settings2, PlayCircle } from 'lucide-react';

const Header = ({ currentTab, setTab, topic, setTopic, onExecute }) => {
    return (
        <header className="fixed top-0 z-50 flex justify-between items-center w-full px-12 h-16 bg-[#0E0E0E] border-b border-outline-variant/10">
            <div className="flex items-center gap-8">
                <span className="text-xl font-bold tracking-tighter text-[#E5E2E1] font-headline">Stitch Research</span>
                <nav className="flex gap-6 items-center">
                    {['Arena', 'Lab', 'Archives'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setTab(tab)}
                            className={`font-headline tracking-tight text-sm pb-1 transition-all duration-200 ${currentTab === tab
                                    ? 'text-[#4285F4] border-b-2 border-[#4285F4]'
                                    : 'text-[#E5E2E1]/60 hover:bg-[#1C1B1B] px-2 py-1 rounded'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 max-w-2xl px-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">search</span>
                    </div>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-surface-container-highest/30 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/50 placeholder:text-on-surface-variant/50 transition-all text-on-surface"
                        placeholder="Topic: The Ethical Implications of Synthetic Sentience"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-4 border-r border-outline-variant/20 pr-4">
                    <button className="p-2 rounded-full hover:bg-[#1C1B1B] text-[#E5E2E1]/60 transition-colors">
                        <Mic size={18} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[#1C1B1B] text-[#E5E2E1]/60 transition-colors">
                        <Globe size={18} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[#1C1B1B] text-[#E5E2E1]/60 transition-colors">
                        <Settings2 size={18} />
                    </button>
                </div>
                <button
                    onClick={onExecute}
                    className="bg-[#4285F4] text-white px-6 py-2 rounded-full font-headline font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
                >
                    <PlayCircle size={16} />
                    Execute Session
                </button>
            </div>
        </header>
    );
};

export default Header;
