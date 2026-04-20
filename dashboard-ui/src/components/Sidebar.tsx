import React from 'react';
import { LayoutDashboard, History, PieChart, Settings, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/useTheme';

export const Sidebar: React.FC = () => {
  const items = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: History, label: 'History', active: false },
    { icon: PieChart, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-20 lg:w-64 flex flex-col glass-card border-r border-slate-700/50 h-screen sticky top-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-xl border border-primary/50">
          <ShieldCheck className="text-primary" size={24} />
        </div>
        <span className="font-black text-xl tracking-tighter hidden lg:block uppercase">OmniLLM</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              item.active 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'hover:bg-primary/10 text-slate-500 hover:text-primary'
            }`}
          >
            <item.icon size={20} className={item.active ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
            <span className="font-bold text-sm hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto">
         <div className="hidden lg:block p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Plan</p>
            <p className="text-xs font-black uppercase text-primary">Enterprise Pro</p>
         </div>
      </div>
    </div>
  );
};
