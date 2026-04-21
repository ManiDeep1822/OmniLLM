import React, { useState, useEffect } from 'react';
import { Settings, Check, Zap, AlertCircle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelInfo {
  provider: string;
  model: string;
}

interface ProviderConfig {
  configured: boolean;
  models: string[];
}

interface ModelsResponse {
  current: ModelInfo;
  available: {
    [key: string]: ProviderConfig;
  };
}

const ModelSwitcher: React.FC = () => {
  const { socket } = useSocket();
  const [data, setData] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (!res.ok) throw new Error('Failed to fetch models');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();

    if (socket) {
      socket.on('model_switched', (event: any) => {
        setData(prev => prev ? {
          ...prev,
          current: { provider: event.provider, model: event.model }
        } : null);
      });
    }

    return () => {
      if (socket) socket.off('model_switched');
    };
  }, [socket]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSwitch = async (provider: string, model: string) => {
    // Optimistic update
    if (data) {
       setData({ ...data, current: { provider, model } });
    }
    setToast(`Switched to ${model}`);

    try {
      const res = await fetch('/api/models/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model }),
      });

      if (!res.ok) throw new Error('Failed to switch model');
    } catch (err: any) {
      setError(err.message);
      // Rollback on error if needed, but usually socket will sync us back
      fetchModels(); 
    }
  };

  if (loading) return (
    <div className="glass-card p-6 animate-pulse border border-white/5">
      <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl"></div>)}
      </div>
    </div>
  );

  if (!data) return null;

  const providers = [
    { id: 'gemini', label: 'Google Gemini', dotColor: 'bg-blue-400', glowColor: 'rgba(96,165,250,0.5)' },
    { id: 'claude', label: 'Anthropic Claude', dotColor: 'bg-purple-400', glowColor: 'rgba(192,132,252,0.5)' },
    { id: 'openai', label: 'OpenAI', dotColor: 'bg-emerald-400', glowColor: 'rgba(52,211,153,0.5)' }
  ];

  return (
    <div className="relative">
      <div className="glass-card p-6 border border-white/10 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Settings size={20} />
          </div>
          <h2 className="text-lg font-bold text-white/90">Model Configuration</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {providers.map((p) => {
            const config = data.available[p.id];
            if (!config) return null;
            
            const isConfigured = config.configured;

            return (
              <div 
                key={p.id} 
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  isConfigured 
                    ? 'bg-black/20 border-white/5 hover:border-white/10' 
                    : 'bg-black/10 border-transparent opacity-60 grayscale cursor-not-allowed'
                }`}
              >
                {/* Provider Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.dotColor} shadow-[0_0_10px_${p.glowColor}]`} />
                    <span className="font-bold text-sm tracking-tight text-white/70 uppercase">{p.label}</span>
                    {!isConfigured && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white/5 text-white/30 border border-white/5 uppercase tracking-tighter ml-2">
                        No API Key
                      </span>
                    )}
                  </div>
                </div>

                {/* Model Pills Row */}
                <div className="flex flex-wrap gap-2">
                  {config.models.map(m => {
                    const isActive = data.current.provider === p.id && data.current.model === m;
                    
                    return (
                      <button
                        key={m}
                        disabled={!isConfigured}
                        onClick={() => handleSwitch(p.id, m)}
                        className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/10 text-white border-2 border-transparent' 
                            : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/8 hover:text-white/60'
                        }`}
                        style={isActive ? { 
                          boxShadow: `0 0 15px -3px ${p.glowColor}`,
                          borderColor: p.glowColor 
                        } : {}}
                      >
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 20 }}
                          >
                            <Check size={12} className="text-white" />
                          </motion.div>
                        )}
                        <span className={isActive ? 'font-bold' : ''}>{m}</span>
                        
                        {/* Hover Highlight Effect */}
                        {!isActive && isConfigured && (
                          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instant Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-blue-500 rounded-2xl shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] border border-blue-400/50 flex items-center gap-3 text-white font-bold text-sm"
          >
            <div className="p-1 bg-white/20 rounded-full">
              <Zap size={14} fill="white" />
            </div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSwitcher;
