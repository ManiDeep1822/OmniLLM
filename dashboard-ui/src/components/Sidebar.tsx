import React from 'react';
import { LayoutDashboard, History, PieChart, Settings, ShieldCheck } from 'lucide-react';

export type Page = 'dashboard' | 'history' | 'analytics' | 'settings';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const items: { icon: React.ElementType; label: string; page: Page }[] = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: History, label: 'History', page: 'history' },
    { icon: PieChart, label: 'Analytics', page: 'analytics' },
    { icon: Settings, label: 'Settings', page: 'settings' },
  ];

  return (
    <aside className="w-[72px] lg:w-60 flex flex-col bg-[var(--bg-elevated)] border-r border-[var(--border-color)] h-screen sticky top-0 transition-all duration-200">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[var(--border-color)]">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white shrink-0">
          <ShieldCheck size={17} strokeWidth={2.5} />
        </div>
        <span className="heading-lg text-[var(--text-primary)] hidden lg:block tracking-tight">OmniLLM</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="label px-3 mb-2 hidden lg:block">Navigation</p>
        {items.map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all text-[13px] font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
              <span className="hidden lg:block truncate">{item.label}</span>
              {isActive && (
                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="hidden lg:flex flex-col gap-1 p-3 rounded-[10px] bg-[var(--input-bg)]">
          <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Plan</span>
          <span className="text-[12px] font-semibold text-primary">Enterprise Pro</span>
        </div>
      </div>
    </aside>
  );
};
