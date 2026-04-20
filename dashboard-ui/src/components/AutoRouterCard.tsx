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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Zap size={20} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight">Auto-Router Engine</h3>
        </div>
        <div className="group relative">
           <Info size={16} className="text-slate-500 cursor-help" />
           <div className="absolute right-0 top-6 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              Automatically routes traffic based on carbon footprint, cost, and task complexity.
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 w-full space-y-3">
          {data.map((item) => (
            <div key={item.name}>
               <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>{item.name}</span>
                  <span className="text-slate-400">{item.value}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-950/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></motion.div>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/30 text-[10px] text-slate-500 italic text-center">
        Engine optimized 2 mins ago for Carbon Efficiency
      </div>
    </div>
  );
};
