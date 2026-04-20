import React from 'react';
import { Database, DollarSign, Activity, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatsOverview: React.FC = () => {
  const stats = [
    { label: 'Total Tokens', value: '1.2M', icon: Database, color: 'text-primary', bg: 'bg-primary/10', change: '+12%', up: true },
    { label: 'Total Cost', value: '$254.32', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '-2.4%', up: false },
    { label: 'Requests Today', value: '4,281', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+18.2%', up: true },
    { label: 'Avg Latency', value: '124ms', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', change: '-5ms', up: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
              stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {stat.change}
            </div>
          </div>
          
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black">{stat.value}</h3>
          </div>
          
          <div className={`absolute bottom-0 right-0 w-24 h-24 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 transition-opacity ${stat.bg} opacity-20 group-hover:opacity-40`}></div>
        </motion.div>
      ))}
    </div>
  );
};
