import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import type { Page } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { LiveFeed } from './components/LiveFeed';
import { ProviderHealth } from './components/ProviderHealth';
import { Analytics } from './components/Analytics';
import { HistoryTable } from './components/HistoryTable';
import { AutoRouterCard } from './components/AutoRouterCard';
import { ChainVisualizer } from './components/ChainVisualizer';
import { SettingsPage } from './components/SettingsPage';

import { useSocket } from './hooks/useSocket';

import { motion, AnimatePresence } from 'framer-motion';

const PAGE_FADE = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

function DashboardView({ events, isConnected }: { events: any[]; isConnected: boolean }) {
  return (
    <motion.div key="dashboard" {...PAGE_FADE} className="space-y-6">
      <div>
        <h1 className="heading-xl text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">Monitor your OmniLLM Gateway in real time</p>
      </div>

      <StatsOverview />



      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8 h-[480px]">
          <LiveFeed events={events} isConnected={isConnected} />
        </div>
        <div className="col-span-12 xl:col-span-4 h-[480px]">
          <AutoRouterCard />
        </div>
        <div className="col-span-12">
          <ProviderHealth />
        </div>
        <div className="col-span-12">
          <ChainVisualizer events={events} />
        </div>
      </div>
    </motion.div>
  );
}

function HistoryView() {
  return (
    <motion.div key="history" {...PAGE_FADE} className="space-y-6">
      <div>
        <h1 className="heading-xl text-[var(--text-primary)]">Call History</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">All LLM requests processed by the gateway</p>
      </div>
      <HistoryTable />
    </motion.div>
  );
}

function AnalyticsView() {
  return (
    <motion.div key="analytics" {...PAGE_FADE} className="space-y-6">
      <div>
        <h1 className="heading-xl text-[var(--text-primary)]">Analytics</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">Cost trends, usage metrics, and provider distribution</p>
      </div>
      <StatsOverview />
      <Analytics />
      <ProviderHealth />
    </motion.div>
  );
}

import { findServerPort } from './utils/api-client';

function AppContent() {
  const { events, isConnected } = useSocket();
  const [health, setHealth] = useState<'healthy' | 'unhealthy' | 'degraded'>('healthy');
  const [activePage, setActivePage] = useState<Page>('dashboard');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const port = await findServerPort();
        const res = await fetch(`http://localhost:${port}/api/health`);
        if (res.ok) {
          const data = await res.json();
          setHealth(data.status);
        } else {
          setHealth('unhealthy');
        }
      } catch {
        setHealth('unhealthy');
      }
    };
    checkHealth();
    const timer = setInterval(checkHealth, 5000);
    return () => clearInterval(timer);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView events={events} isConnected={isConnected} />;
      case 'history':
        return <HistoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return (
          <motion.div key="settings" {...PAGE_FADE}>
            <SettingsPage />
          </motion.div>
        );
      default:
        return <DashboardView events={events} isConnected={isConnected} />;
    }
  };

  return (
    <div className="flex bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar healthStatus={health} />

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full custom-scrollbar">
          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
