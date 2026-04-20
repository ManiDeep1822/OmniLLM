import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Clock, Trash2, Database, Zap, MousePointer2 as Cursor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamSession {
  id: string;
  provider: string;
  model: string;
  text: string;
  isComplete: boolean;
  timestamp: Date;
  tokenCount?: number;
  latency?: number;
}

interface LiveFeedProps {
  events: any[];
  isConnected: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ events, isConnected }) => {
  const [sessions, setSessions] = useState<StreamSession[]>([]);
  const lastProcessedRef = useRef<any>(null);

  useEffect(() => {
    const event = events[0];
    if (!event || event === lastProcessedRef.current) return;
    lastProcessedRef.current = event;

    if (event.type === 'token') {
      setSessions((prev) => {
        const current = prev[0];
        if (!current || current.isComplete) {
          // Start a new session
          const newSession: StreamSession = {
            id: Math.random().toString(36).substr(2, 9),
            provider: event.provider || 'Unknown',
            model: event.model || 'Unknown',
            text: event.text,
            isComplete: false,
            timestamp: new Date(),
          };
          return [newSession, ...prev].slice(0, 5);
        } else {
          // Update current session
          const updated = { ...current, text: current.text + event.text };
          return [updated, ...prev.slice(1)];
        }
      });
    } else if (event.type === 'complete') {
      setSessions((prev) => {
        const current = prev[0];
        if (current && !current.isComplete) {
          const updated = { 
            ...current, 
            isComplete: true, 
            tokenCount: event.tokenCount, 
            latency: event.latencyMs 
          };
          return [updated, ...prev.slice(1)];
        }
        return prev;
      });
    }
  }, [events]);

  const clearAll = () => setSessions([]);

  const getProviderColor = (provider?: string) => {
    if (!provider) return 'bg-slate-500';
    const p = provider.toLowerCase();
    if (p.includes('anthropic') || p.includes('claude')) return 'bg-purple-500';
    if (p.includes('openai') || p.includes('gpt')) return 'bg-emerald-500';
    if (p.includes('google') || p.includes('gemini')) return 'bg-blue-500';
    return 'bg-slate-500';
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-5 flex flex-col h-full border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <Terminal size={20} className={isConnected ? 'text-emerald-400' : 'text-red-400'} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-100 flex items-center gap-2">
              Live Streaming Feed
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] text-slate-500 font-mono italic">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </h2>
          </div>
        </div>
        
        {sessions.length > 0 && (
          <button 
            onClick={clearAll}
            className="p-1.5 hover:bg-red-500/10 rounded-md transition-all group border border-transparent hover:border-red-500/20"
            title="Clear all streams"
          >
            <Trash2 size={16} className="text-slate-500 group-hover:text-red-400" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              layout
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative overflow-hidden bg-slate-950/40 rounded-xl border-2 transition-all p-4 ${
                !session.isComplete 
                  ? 'border-blue-500/40 shadow-[0_0_20px_-5px_var(--tw-shadow-color)] shadow-blue-500/20 animate-in' 
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded text-white ${getProviderColor(session.provider)}`}>
                    {session.provider}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{session.model}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                         <Clock size={10} />
                         {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
              </div>

              <div className="max-h-[150px] overflow-y-auto pr-2 font-mono text-sm leading-relaxed text-slate-200 bg-slate-950/20 p-2 rounded-lg border border-slate-800/50">
                {session.text}
                {!session.isComplete && <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse rounded-sm align-middle" />}
              </div>

              {session.isComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-2"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <Database size={10} className="text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{session.tokenCount || 0} TOKENS</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} className="text-yellow-500" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{session.latency || 0}MS</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-emerald-400/80 uppercase italic">STREAM COMPLETE</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {sessions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20 bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
            <Cursor size={32} className="text-slate-700 mb-3 animate-bounce" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Waiting for streams...</p>
            <p className="text-[10px] text-slate-700 italic mt-1 text-center px-10">
              Trigger a tool call in Antigravity to see live output here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
