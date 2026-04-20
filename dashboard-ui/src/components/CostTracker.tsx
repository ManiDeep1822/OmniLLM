import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign } from 'lucide-react';

export const CostTracker: React.FC = () => {
  // Mock data for now
  const data = [
    { name: 'Claude', cost: 1.24, color: '#3b82f6' },
    { name: 'GPT-4o', cost: 0.85, color: '#10b981' },
    { name: 'Gemini', cost: 0.12, color: '#8b5cf6' },
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={18} className="text-yellow-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Cost Analytics</h2>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>DAILY TOTAL</span>
          <span className="text-lg font-bold text-slate-50">$2.21</span>
        </div>
      </div>
    </div>
  );
};
