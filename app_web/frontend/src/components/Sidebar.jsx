import React from 'react';

const Sidebar = ({ config, setConfig }) => {
    const updateTrait = (agent, trait, value) => {
        if (agent === 'PRO') {
            setConfig({ ...config, pro_traits: { ...config.pro_traits, [trait]: value } });
        } else {
            setConfig({ ...config, con_traits: { ...config.con_traits, [trait]: value } });
        }
    };

    return (
        <aside className="w-80 bg-surface-container-lowest flex flex-col overflow-y-auto px-6 py-8 border-r border-outline-variant/10 mt-16 fixed left-0 h-[calc(100vh-64px)]">
            <div className="mb-8">
                <h2 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-6">Persona Architecture</h2>

                {/* Moderator */}
                <AgentCard
                    name="Moderator"
                    role="System Orchestrator"
                    icon="gavel"
                    color="text-primary"
                    model={config.pro_model}
                    onModelChange={(m) => setConfig({ ...config, pro_model: m })}
                >
                    <TraitSlider label="Analytical Depth" value={0.85} color="bg-primary" />
                </AgentCard>

                {/* PRO Agent */}
                <AgentCard
                    name="PRO Agent"
                    role="Affirmative Logic"
                    icon="add_moderator"
                    color="text-secondary"
                    model={config.pro_model}
                    onModelChange={(m) => setConfig({ ...config, pro_model: m })}
                >
                    <TraitSlider
                        label="Aggressiveness"
                        value={config.pro_traits.aggressiveness}
                        color="bg-secondary"
                        onChange={(v) => updateTrait('PRO', 'aggressiveness', v)}
                    />
                    <TraitSlider
                        label="Formality"
                        value={config.pro_traits.formality}
                        color="bg-secondary"
                        onChange={(v) => updateTrait('PRO', 'formality', v)}
                    />
                </AgentCard>

                {/* CONTRA Agent */}
                <AgentCard
                    name="CONTRA Agent"
                    role="Dialectical Friction"
                    icon="security"
                    color="text-error"
                    model={config.con_model}
                    onModelChange={(m) => setConfig({ ...config, con_model: m })}
                >
                    <TraitSlider
                        label="Aggressiveness"
                        value={config.con_traits.aggressiveness}
                        color="bg-error"
                        onChange={(v) => updateTrait('CON', 'aggressiveness', v)}
                    />
                    <TraitSlider
                        label="Formality"
                        value={config.con_traits.formality}
                        color="bg-error"
                        onChange={(v) => updateTrait('CON', 'formality', v)}
                    />
                </AgentCard>
            </div>
        </aside>
    );
};

const AgentCard = ({ name, role, icon, color, model, onModelChange, children }) => (
    <div className="mb-10 group">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <div className="text-sm font-bold font-headline text-on-surface">{name}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{role}</div>
            </div>
        </div>
        <div className="space-y-4 px-1">
            {children}
            <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full bg-surface-container-high border-none text-xs rounded-lg py-2 focus:ring-1 focus:ring-primary/40 text-on-surface"
            >
                <option value="llama3.2:3b">Llama 3.2 3B</option>
                <option value="llama3:8b">Llama 3 8B</option>
                <option value="phi3">Phi-3 Mini</option>
            </select>
        </div>
    </div>
);

const TraitSlider = ({ label, value, color, onChange }) => (
    <div>
        <div className="flex justify-between text-[10px] mb-2 uppercase tracking-wide text-on-surface-variant">
            <span>{label}</span>
            <span className="text-on-surface">{Math.round(value * 100)}%</span>
        </div>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
            className={`h-[2px] w-full bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary`}
        />
    </div>
);

export default Sidebar;
