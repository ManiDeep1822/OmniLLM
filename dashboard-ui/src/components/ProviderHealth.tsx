import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, ShieldAlert, Zap, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface ProviderStatus {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  uptime: number;
  history: number[];
}

export const ProviderHealth: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get<ProviderStatus[]>('http://localhost:3000/api/providers/health');
        setProviders(res.data);
      } catch (err) {
        console.error('Failed to fetch provider health', err);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy': return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Operational' };
      case 'degraded': return { icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Degraded' };
      case 'unhealthy': return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' };
      default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Offline' };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 transition-all h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Activity size={20} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-tight">Provider Network Health</h2>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/40 px-3 py-1 rounded-full border border-slate-700/30 font-mono italic">
               Update Every 15s
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => {
          const config = getStatusConfig(p.status);
          return (
            <motion.div 
              key={p.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 rounded-2xl bg-slate-950/40 border border-slate-700/30 flex flex-col gap-5 hover:border-slate-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${config.bg} ${config.color}`}>
                    <config.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-tight text-slate-200">{p.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className={`text-[10px] font-bold uppercase ${config.color}`}>{config.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                    <Zap size={10} />
                    <span className="text-[10px] font-black uppercase">Latency</span>
                  </div>
                  <span className="text-sm font-black text-slate-200 font-mono italic">{p.latency}ms</span>
                </div>
                <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                    <BarChart3 size={10} />
                    <span className="text-[10px] font-black uppercase">Uptime</span>
                  </div>
                  <span className="text-sm font-black text-slate-200 font-mono italic">{p.uptime}%</span>
                </div>
              </div>

              <div className="flex items-end gap-1 h-12 pt-2">
                {p.history.map((val, i) => {
                  const height = Math.min(100, (val / 5000) * 100);
                  return (
                    <div 
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary transition-all relative group"
                      style={{ height: `${Math.max(10, height)}%` }}
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 whitespace-nowrap z-10 font-bold">
                            {val}ms
                        </div>
                    </div>
                  );
                })}
                {p.history.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-black uppercase tracking-widest italic opacity-50">
                        Insufficient Data
                    </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {providers.length === 0 && (
            <div className="col-span-3 py-10 text-center text-slate-500 italic text-xs font-black uppercase tracking-widest">
                No provider data available...
            </div>
        )}
      </div>
    </div>
  );
};
