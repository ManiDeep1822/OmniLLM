import React, { useState, useEffect } from 'react';
import { Settings, Check, Zap, Server, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface ModelInfo {
  provider: string;
  model: string;
}

interface ProviderConfig {
  name: string;
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
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSwitch = async (provider: string, model: string) => {
    setSwitching(model);
    try {
      const res = await fetch('/api/models/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model }),
      });

      if (!res.ok) throw new Error('Failed to switch model');
      
      // Success is handled by socket event, but we can optimistically update or just wait
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwitching(null);
    }
  };

  if (loading) return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded"></div>)}
      </div>
    </div>
  );

  if (!data) return null;

  const providers = [
    { id: 'gemini', icon: <Zap size={18} className="text-blue-400" />, color: 'bg-blue-400' },
    { id: 'claude', icon: <ShieldCheck size={18} className="text-purple-400" />, color: 'bg-purple-400' },
    { id: 'openai', icon: <Server size={18} className="text-green-400" />, color: 'bg-green-400' }
  ];

  return (
    <div className="glass-card p-6 border border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <Settings size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold text-white/90">Model Configuration</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {providers.map((p) => {
          const config = data.available[p.id];
          if (!config) return null;
          
          const isActiveProvider = data.current.provider === p.id;
          
          return (
            <div 
              key={p.id} 
              className={`p-4 rounded-xl transition-all duration-300 ${
                isActiveProvider 
                  ? 'bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.color} shadow-[0_0_8px_${p.color}80]`}></div>
                  <span className="font-medium text-white/80">{config.name}</span>
                  {!config.configured && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase tracking-wider">
                      No API Key
                    </span>
                  )}
                  {isActiveProvider && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider flex items-center gap-1">
                      <Check size={10} /> Active
                    </span>
                  )}
                </div>
              </div>

              {config.configured && (
                <div className="flex gap-2">
                  <select 
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
                    value={isActiveProvider ? data.current.model : config.models[0]}
                    onChange={() => {
                       // Optional: intermediate state
                    }}

                    id={`select-${p.id}`}
                  >
                    {config.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                        const select = document.getElementById(`select-${p.id}`) as HTMLSelectElement;
                        handleSwitch(p.id, select.value);
                    }}
                    disabled={switching === p.id}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActiveProvider 
                        ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:bg-blue-600' 
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    {switching ? '...' : isActiveProvider ? 'Updated' : 'Switch'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSwitcher;
