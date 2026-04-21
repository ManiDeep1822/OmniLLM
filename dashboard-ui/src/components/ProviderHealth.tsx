import React, { useEffect, useState } from 'react';
import { HeartPulse, TrendingUp, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import type { ProviderStatus } from '../types/dashboard';

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'healthy') return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (status === 'degraded') return <AlertTriangle size={14} className="text-amber-500" />;
  if (status === 'unconfigured') return <XCircle size={14} className="text-slate-500" />;
  return <XCircle size={14} className="text-red-500" />;
};

export const ProviderHealth: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get<ProviderStatus[]>('http://localhost:3000/api/providers/health');
        setProviders(res.data);
      } catch (err) {
        console.error('Failed to fetch providers', err);
      }
    };
    fetchProviders();
    const interval = setInterval(fetchProviders, 10000);
    return () => clearInterval(interval);
  }, []);

  const providerColors: Record<string, string> = {
    'Anthropic': 'from-violet-500 to-purple-600',
    'OpenAI': 'from-emerald-500 to-green-600',
    'Google': 'from-blue-500 to-indigo-600',
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-rose-500/10">
            <HeartPulse size={17} className="text-rose-500" />
          </div>
          <h2 className="heading-lg">Provider Health</h2>
        </div>
        <span className="label">Auto-refreshing · 10s</span>
      </div>

      {providers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative rounded-xl p-4 bg-[var(--input-bg)] border border-[var(--border-color)] hover:border-primary/30 transition-all ${p.status === 'unconfigured' ? 'opacity-70' : ''}`}
            >
              {/* Top gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r ${p.status === 'unconfigured' ? 'from-slate-500 to-slate-700' : (providerColors[p.name] || 'from-gray-400 to-gray-500')}`} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">{p.name}</span>
                <div className="flex items-center gap-2">
                  {p.status === 'unconfigured' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 font-medium uppercase tracking-wider">No API Key</span>
                  )}
                  <StatusIcon status={p.status} />
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-3 ${p.status === 'unconfigured' ? 'grayscale opacity-50' : ''}`}>
                <div>
                  <p className="label text-[10px] mb-0.5">Latency</p>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-[var(--text-tertiary)]" />
                    <span className="mono text-[12px] text-[var(--text-primary)]">{p.latency}ms</span>
                  </div>
                </div>
                <div>
                  <p className="label text-[10px] mb-0.5">Uptime</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-[var(--text-tertiary)]" />
                    <span className="mono text-[12px] text-emerald-500">{p.uptime}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
