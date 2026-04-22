import React, { useEffect, useState } from 'react';
import { Database, Zap, Activity, DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../types/dashboard';



export const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<DashboardStats>('/api/stats');
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
      value: stats ? formatTokens(stats.totalTokens) : '—',
      change: '+12.3%',
      icon: Database,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      up: true
    },
    {
      label: 'Est. Cost',
      value: stats ? `$${stats.totalCost.toFixed(2)}` : '—',
      change: '+4.1%',
      icon: DollarSign,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      up: true
    },
    {
      label: 'Avg. Latency',
      value: stats ? `${stats.avgLatency}ms` : '—',
      change: '-8.2%',
      icon: Zap,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      up: false
    },
    {
      label: 'Active Sessions',
      value: stats ? stats.activeSessions.toString() : '—',
      change: 'Stable',
      icon: Activity,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      up: true
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, duration: 0.3 }}
          className="glass-card stat-card group cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 flex items-center justify-center rounded-[10px] ${card.iconBg}`}>
              <card.icon size={17} className={card.iconColor} />
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${
              card.label === 'Avg. Latency'
                ? (card.up ? 'text-red-500' : 'text-emerald-500')
                : (card.up ? 'text-emerald-500' : 'text-red-500')
            }`}>
              {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.change}
            </div>
          </div>

          <p className="label mb-1">{card.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{card.value}</span>
            <ArrowUpRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
