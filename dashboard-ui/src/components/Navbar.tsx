import React from 'react';
import { Sun, Moon, Search, Bell, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../context/useTheme';

interface NavbarProps {
  healthStatus: 'healthy' | 'unhealthy' | 'degraded';
}

export const Navbar: React.FC<NavbarProps> = ({ healthStatus }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 glass-card border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Search */}
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-[10px] bg-[var(--input-bg)] border border-[var(--border-color)] w-full max-w-sm transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]">
        <Search size={15} className="text-[var(--text-tertiary)] shrink-0" />
        <input
          type="text"
          placeholder="Search models, providers, logs…"
          className="bg-transparent border-none outline-none text-[13px] w-full text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--border-color)] rounded-[5px]">⌘K</kbd>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Health Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)]">
          {healthStatus === 'healthy' ? (
            <Wifi size={13} className="text-emerald-500" />
          ) : (
            <WifiOff size={13} className="text-red-500" />
          )}
          <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
            {healthStatus === 'healthy' ? 'Live' : 'Offline'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${
            healthStatus === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          }`} />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border-color)]" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-[var(--glass-bg)]" />
        </button>
      </div>
    </header>
  );
};
