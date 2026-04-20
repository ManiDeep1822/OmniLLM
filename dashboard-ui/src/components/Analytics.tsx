import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { PieChart as PieIcon, BarChart3, Calendar } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export const Analytics: React.FC = () => {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const barData = [
    { name: 'Claude', cost: range === 'daily' ? 1.24 : range === 'weekly' ? 8.42 : 34.12, color: '#8b5cf6' },
    { name: 'GPT-4o', cost: range === 'daily' ? 0.85 : range === 'weekly' ? 12.11 : 52.85, color: '#10b981' },
    { name: 'Gemini', cost: range === 'daily' ? 0.12 : range === 'weekly' ? 1.45 : 6.12, color: '#3b82f6' },
  ];

  const pieData = [
    { name: 'Anthropic', value: 35, color: '#8b5cf6' },
    { name: 'OpenAI', value: 55, color: '#10b981' },
    { name: 'Google', value: 10, color: '#3b82f6' },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <BarChart3 size={20} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight">Cost Analytics</h3>
        </div>

        <div className="flex p-1 bg-slate-950/20 rounded-xl border border-slate-700/30 self-start lg:self-auto">
          {(['daily', 'weekly', 'monthly'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                range === r ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="h-[250px] w-full">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
            <Calendar size={12} /> Spending by Provider ($)
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]} barSize={40}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[250px] w-full flex flex-col items-center">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2 self-start">
            <PieIcon size={12} /> Market Share (%)
          </p>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)', fontSize: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="text-[10px] font-bold text-slate-500">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
