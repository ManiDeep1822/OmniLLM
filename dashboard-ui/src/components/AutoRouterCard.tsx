import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const AutoRouterCard: React.FC = () => {
  const data = [
    { name: 'GPT-4o Mini', value: 85, color: '#10b981' },
    { name: 'Claude 3.5 Sonnet', value: 10, color: '#8b5cf6' },
    { name: 'Gemini Flash', value: 5, color: '#3b82f6' },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-primary to-blue-500" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-emerald-500/10">
            <Zap size={17} className="text-emerald-500" />
          </div>
          <h3 className="heading-lg">Auto-Router</h3>
        </div>
        <div className="group relative">
          <Info size={14} className="text-[var(--text-tertiary)] cursor-help" />
          <div className="absolute right-0 top-6 w-52 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-[11px] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none shadow-lg leading-relaxed">
            Routes traffic based on cost, latency, and task complexity to the optimal provider.
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 w-full space-y-2.5">
          {data.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-[var(--text-secondary)]">{item.name}</span>
                <span className="mono text-[var(--text-primary)]">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-center">
        <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
          Last optimized 2 min ago · Cost Priority
        </span>
      </div>
    </div>
  );
};
