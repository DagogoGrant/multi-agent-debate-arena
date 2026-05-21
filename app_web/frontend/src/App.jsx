import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Arena from './components/Arena';
import Telemetry from './components/Telemetry';

function App() {
  const [activeTab, setActiveTab] = useState('Arena');
  const [topic, setTopic] = useState('The Ethical Implications of Synthetic Sentience');
  const [config, setConfig] = useState({
    rounds: 2,
    web_grounding: true,
    pro_traits: { aggressiveness: 0.5, formality: 0.8 },
    con_traits: { aggressiveness: 0.7, formality: 0.6 },
    pro_model: 'llama3.2:3b',
    con_model: 'llama3.2:3b'
  });

  const [messages, setMessages] = useState([]);
  const [vitals, setVitals] = useState({ tps: 0, latency: 0 });
  const [fallacies, setFallacies] = useState([]);
  const [persuasion, setPersuasion] = useState(50);
  const [isThinking, setIsThinking] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');

  // Robust SSE Streaming Parser
  const handleStream = async () => {
    setMessages([]);
    setFallacies([]);
    setPersuasion(50);
    setIsThinking(true);
    setCurrentAgent('System (Synthesizing Strategy)');

    try {
      const response = await fetch('http://localhost:9000/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, topic })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentRoleResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // Keep the potentially partial last chunk in buffer

        for (const part of parts) {
          if (!part.trim()) continue;

          const lines = part.split('\n');
          const eventLine = lines.find(l => l.startsWith('event: '));
          const dataLine = lines.find(l => l.startsWith('data: '));

          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace('event: ', '').trim();
          const data = dataLine.replace('data: ', '').trim();

          switch (event) {
            case 'agent_start':
              setIsThinking(true);
              setCurrentAgent(data);
              currentRoleResponse = "";
              break;

            case 'delta':
              const deltaPayload = JSON.parse(data);
              currentRoleResponse += deltaPayload.text;
              updateMessage(deltaPayload.agent, currentRoleResponse);
              // Simulated dynamic telemetry based on stream density
              setVitals({
                tps: Math.random() * 40 + 120,
                latency: Math.random() * 10 + 12
              });
              break;

            case 'agent_end':
              setIsThinking(false);
              const endPayload = JSON.parse(data);
              if (endPayload.metadata) {
                const s = endPayload.metadata.sentiment;
                setPersuasion(prev => {
                  const shift = endPayload.agent.includes('PRO') ? s * 12 : -s * 12;
                  return Math.min(95, Math.max(5, prev + shift));
                });
              }
              break;

            case 'status':
              setCurrentAgent(data);
              break;

            case 'research':
              const res = JSON.parse(data);
              // Optional: Add research to a specific UI section
              break;

            case 'error':
              updateMessage('System', `🚨 RECOVERY ERROR: ${data}`);
              setIsThinking(false);
              break;

            case 'complete':
              setIsThinking(false);
              setCurrentAgent('Session Resolved');
              break;

            default:
              console.log('Unhandled SSE Event:', event, data);
          }
        }
      }
    } catch (error) {
      console.error("Critical Stream Failure:", error);
      updateMessage('System', `🚨 CRITICAL: Unable to reach research backend. Ensure port 8088 is open. (${error.message})`);
      setIsThinking(false);
    }
  };

  const updateMessage = (role, content) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        return [...prev.slice(0, -1), { role, content }];
      }
      return [...prev, { role, content }];
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface selection:bg-primary/30">
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        topic={topic}
        setTopic={setTopic}
        onExecute={handleStream}
      />

      <main className="flex flex-1 overflow-hidden">
        <Sidebar config={config} setConfig={setConfig} />

        {activeTab === 'Arena' ? (
          <Arena
            messages={messages}
            topic={topic}
            isThinking={isThinking}
            currentAgent={currentAgent}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant font-headline uppercase tracking-[0.2em] opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
            {activeTab} Module · Virtualized Environment Pending
          </div>
        )}

        <Telemetry
          vitals={vitals}
          fallacies={fallacies}
          persuasion={persuasion}
        />
      </main>
    </div>
  );
}

export default App;
