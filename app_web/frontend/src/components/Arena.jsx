import React, { useEffect, useRef } from 'react';
import { Gavel, ShieldCheck, UserPlus, Info } from 'lucide-react';

const Arena = ({ messages, topic, isThinking, currentAgent }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    return (
        <section className="flex-1 bg-surface flex flex-col p-12 overflow-hidden ml-80 mr-80">
            <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
                {/* Arena Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">The Arena</h1>
                    <p className="text-sm text-on-surface-variant font-medium">Topic: {topic}</p>
                </div>

                {/* Argumentation Feed */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-12 pr-6 pb-20 custom-scrollbar"
                >
                    {messages.map((msg, idx) => (
                        <MessageBubble key={idx} role={msg.role} content={msg.content} />
                    ))}

                    {isThinking && (
                        <div className="flex gap-6 items-center py-4">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-75"></div>
                                <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150"></div>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                                {currentAgent} is analyzing...
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const MessageBubble = ({ role, content }) => {
    const isMod = role === 'Moderator';
    const isPro = role.includes('PRO');
    const isCon = role.includes('CONTRA');
    const isFact = role === 'Fact-Checker';

    const icon = isMod ? <Gavel size={16} /> :
        isFact ? <ShieldCheck size={16} /> :
            isPro ? <UserPlus size={16} /> :
                <ShieldCheck size={16} />;

    const color = isMod ? 'text-primary' :
        isFact ? 'text-primary' :
            isPro ? 'text-secondary' :
                'text-error';

    const bgColor = isMod ? 'bg-surface-container-low border-l-2 border-primary' :
        isFact ? 'bg-surface-container-low border-l-2 border-primary' :
            isPro ? '' : '';

    return (
        <div className="flex gap-6 items-start">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${isPro ? 'bg-secondary/20' : isCon ? 'bg-error/20' : 'bg-surface-container-highest'} flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="flex-1 pt-1">
                <div className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${color}`}>
                    {role} Response
                </div>
                <div className={`text-on-surface/90 text-sm leading-relaxed ${bgColor} ${isMod || isFact ? 'p-6 rounded-xl' : 'space-y-4'}`}>
                    {content}
                </div>
            </div>
        </div>
    );
};

export default Arena;
