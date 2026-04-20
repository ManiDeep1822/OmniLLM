import React from 'react';
import { Cpu, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProviderHealth: React.FC = () => {
  const providers = [
    { name: 'Anthropic Claude', latency: 124, status: 'online', requests: 450, color: 'text-claude', bg: 'bg-claude/10' },
    { name: 'OpenAI GPT-4o', latency: 85, status: 'online', requests: 1200, color: 'text-openai', bg: 'bg-openai/10' },
    { name: 'Google Gemini Pro', latency: 310, status: 'busy', requests: 890, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-emerald-500';
    if (status === 'busy') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {providers.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${p.bg} ${p.color}`}>
                <Cpu size={20} />
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight">{p.name}</h3>
            </div>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(p.status)} ${p.status === 'online' ? 'animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}`}></div>
          </div>

          <div className="space-y-4">
             <div>
                <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Clock size={10} /> Latency
                   </span>
                   <span className={`text-xs font-mono font-bold ${p.latency < 100 ? 'text-emerald-400' : 'text-slate-400'}`}>{p.latency}ms</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950/20 rounded-full overflow-hidden">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((p.latency / 500) * 100, 100)}%` }}
                      className={`h-full rounded-full ${p.latency < 150 ? 'bg-emerald-500' : p.latency < 300 ? 'bg-yellow-500' : 'bg-red-500'}`}
                   ></motion.div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                   <Activity size={10} /> REQ / HOUR
                </span>
                <span className="text-xs font-black">{p.requests}</span>
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
