import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface LiveFeedProps {
  events: any[];
  isConnected: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ events, isConnected }) => {
  const [streamText, setStreamText] = useState("");
  const [activeModel, setActiveModel] = useState<string | null>(null);

  useEffect(() => {
    const lastEvent = events[0];
    if (lastEvent?.type === 'token') {
      setStreamText((prev) => prev + lastEvent.text);
      setActiveModel(lastEvent.provider);
    } else if (lastEvent?.type === 'complete') {
        // Just keep it or reset after a delay
    }
  }, [events]);

  const getProviderColor = (provider?: string) => {
    if (!provider) return 'text-slate-400';
    const p = provider.toLowerCase();
    if (p.includes('anthropic') || p.includes('claude')) return 'text-orange-400';
    if (p.includes('openai') || p.includes('gpt')) return 'text-emerald-400';
    if (p.includes('google') || p.includes('gemini')) return 'text-blue-400';
    return 'text-slate-400';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 h-[400px] flex flex-col shadow-xl border border-slate-700">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        <Terminal size={18} className="text-emerald-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Live Streaming Feed</h2>
        
        <div className="flex items-center gap-2 ml-4">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-mono text-slate-500">{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
        </div>

        {activeModel && (
          <span className={`ml-auto text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 ${getProviderColor(activeModel)}`}>
            {activeModel}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto font-mono text-sm leading-relaxed p-2 bg-slate-900 rounded border border-slate-800">
        <span className={getProviderColor(activeModel)}>{streamText}</span>
        {activeModel && <span className="streaming-cursor"></span>}
        {!activeModel && <span className="text-slate-500 italic">Waiting for connection...</span>}
      </div>

      <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
        <span>STATUS: {isConnected ? 'READY' : 'OFFLINE'}</span>
        <span>TOKENS: {streamText.length > 0 ? streamText.split(/\s+/).length : 0}</span>
      </div>
    </div>
  );
};
