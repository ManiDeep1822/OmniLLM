import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface AnalyticsData {
  date: string;
  cost: number;
  tokens: number;
}

export const Analytics: React.FC = () => {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [data, setData] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get<AnalyticsData[]>(`http://localhost:3000/api/analytics?period=${range}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      }
    };
    fetchAnalytics();
  }, [range]);

  const pieData = [
    { name: 'Claude', value: data.length > 0 ? 400 : 0, color: '#6C3DD3' },
    { name: 'GPT-4o', value: data.length > 0 ? 300 : 0, color: '#10B981' },
    { name: 'Gemini', value: data.length > 0 ? 200 : 0, color: '#3B82F6' },
  ];

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Cost Trends */}
      <div className="col-span-12 xl:col-span-8 glass-card rounded-2xl p-6 transition-all">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight">Usage Trends</h2>
          </div>

          <div className="flex bg-slate-950/20 p-1 rounded-xl border border-slate-700/30">
            {['daily', 'weekly', 'monthly'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r as any)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  range === r ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C3DD3" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6C3DD3" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(108, 61, 211, 0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#0F0F1A', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                }}
              />
              <Bar 
                dataKey="cost" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Distribution */}
      <div className="col-span-12 xl:col-span-4 glass-card rounded-2xl p-6 transition-all flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
            <PieIcon size={20} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-tight">Provider Distribution</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
            <span className="block text-xl font-black text-slate-100 italic">Traffic</span>
          </div>

          <div className="w-full mt-6 space-y-3">
             {pieData.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-200 opacity-60 group-hover:opacity-100 transition-opacity">
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
