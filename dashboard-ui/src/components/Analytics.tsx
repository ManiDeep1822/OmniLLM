import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import axios from 'axios';
import type { AnalyticsData } from '../types/dashboard';

import { getApiUrl } from '../utils/api-client';

export const Analytics: React.FC = () => {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [data, setData] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const url = await getApiUrl(`/api/analytics?period=${range}`);
        const res = await axios.get<AnalyticsData[]>(url);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      }
    };
    fetchAnalytics();
  }, [range]);

  const pieData = [
    { name: 'Claude', value: data.length > 0 ? 400 : 0, color: '#8b5cf6' },
    { name: 'GPT-4o', value: data.length > 0 ? 300 : 0, color: '#10b981' },
    { name: 'Gemini', value: data.length > 0 ? 200 : 0, color: '#3b82f6' },
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Bar Chart */}
      <div className="col-span-12 xl:col-span-8 glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-indigo-500/10">
              <BarChart3 size={17} className="text-indigo-500" />
            </div>
            <h2 className="heading-lg">Usage Trends</h2>
          </div>

          <div className="flex p-0.5 rounded-[10px] bg-[var(--input-bg)] border border-[var(--border-color)]">
            {(['daily', 'weekly', 'monthly'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3.5 py-1.5 rounded-[8px] text-[11px] font-semibold capitalize transition-all ${
                  range === r
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 500 }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: 'var(--surface-hover)' }}
                contentStyle={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  boxShadow: 'var(--shadow-glass)',
                  padding: '8px 12px',
                }}
              />
              <Bar dataKey="cost" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="col-span-12 xl:col-span-4 glass-card rounded-2xl p-6 flex flex-col">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-pink-500/10">
            <PieIcon size={17} className="text-pink-500" />
          </div>
          <h2 className="heading-lg">Provider Split</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Active</span>
            <span className="block text-lg font-bold text-[var(--text-primary)]">Traffic</span>
          </div>

          <div className="w-full mt-5 space-y-2.5">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] font-medium text-[var(--text-secondary)]">{item.name}</span>
                </div>
                <span className="mono text-[12px] text-[var(--text-primary)] opacity-60 group-hover:opacity-100 transition-opacity">
                  {data.length > 0 ? (item.value / 9).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
