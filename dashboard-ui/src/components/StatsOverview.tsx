import React, { useEffect, useState } from 'react';
import { Database, Zap, Activity, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  totalCalls: number;
  activeSessions: number;
}

export const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<DashboardStats>('http://localhost:3000/api/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const cards = [
    { 
      label: 'Total Tokens', 
      value: stats ? formatTokens(stats.totalTokens) : '...', 
      change: '+1.2%', 
      icon: Database, 
      color: 'text-emerald-400',
      up: true 
    },
    { 
      label: 'Est. Cost', 
      value: stats ? `$${stats.totalCost.toFixed(2)}` : '...', 
      change: '+0.4%', 
      icon: DollarSign, 
      color: 'text-blue-400',
      up: true 
    },
    { 
      label: 'Avg. Latency', 
      value: stats ? `${stats.avgLatency}ms` : '...', 
      change: '-12%', 
      icon: Zap, 
      color: 'text-yellow-400',
      up: false 
    },
    { 
      label: 'Active Sessions', 
      value: stats ? stats.activeSessions.toString() : '...', 
      change: 'Stable', 
      icon: Activity, 
      color: 'text-purple-400',
      up: true 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-slate-950/40 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${
              card.label === 'Avg. Latency' ? (card.up ? 'text-red-400' : 'text-emerald-400') : (card.up ? 'text-emerald-400' : 'text-red-400')
            }`}>
              {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.change}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{card.label}</span>
            <span className="text-2xl font-black text-slate-100">{card.value}</span>
          </div>

          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <card.icon size={100} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
