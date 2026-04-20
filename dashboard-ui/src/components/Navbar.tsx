import React from 'react';
import { Sun, Moon, Search, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  healthStatus: 'healthy' | 'unhealthy' | 'degraded';
}

export const Navbar: React.FC<NavbarProps> = ({ healthStatus }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-20 lg:h-24 glass-card border-b border-slate-700/50 flex items-center justify-between px-8 sticky top-0 z-50 transition-all duration-300">
      <div className="flex items-center gap-4 bg-slate-950/20 px-4 py-2 rounded-xl border border-slate-700/30 w-full max-w-md">
        <Search size={18} className="text-slate-500" />
        <input 
          type="text" 
          placeholder="Search models, providers, or logs..." 
          className="bg-transparent border-none outline-none text-sm w-full font-medium"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/20 border border-slate-700/30">
          <div className={`w-2 h-2 rounded-full ${
            healthStatus === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            System {healthStatus === 'healthy' ? 'Operational' : 'Issue Detected'}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-700/50 pl-6">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all bg-slate-950/20 border border-slate-700/30 hover:border-primary text-slate-500 hover:text-primary"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="p-2.5 rounded-xl transition-all bg-slate-950/20 border border-slate-700/30 hover:border-primary text-slate-500 hover:text-primary relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-slate-900"></span>
          </button>
        </div>
      </div>
    </div>
  );
};
