import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { LiveFeed } from './components/LiveFeed';
import { ProviderHealth } from './components/ProviderHealth';
import { Analytics } from './components/Analytics';
import { HistoryTable } from './components/HistoryTable';
import { AutoRouterCard } from './components/AutoRouterCard';
import { ChainVisualizer } from './components/ChainVisualizer';
import { useSocket } from './hooks/useSocket';
import { motion } from 'framer-motion';

function AppContent() {
  const { events, isConnected } = useSocket();
  const [health, setHealth] = useState<'healthy' | 'unhealthy' | 'degraded'>('healthy');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/health');
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

  return (
    <div className="flex bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar healthStatus={health} />
        
        <div className="p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full custom-scrollbar">
          {/* Welcome & Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-3xl font-black uppercase tracking-tight">System Dashboard</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">Monitoring OmniLLM Gateway Instance</p>
          </motion.div>

          <StatsOverview />

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Top Row: Live Feed & Auto Router */}
            <div className="col-span-12 xl:col-span-8 h-[500px]">
              <LiveFeed events={events} isConnected={isConnected} />
            </div>
            <div className="col-span-12 xl:col-span-4 h-[500px]">
              <AutoRouterCard />
            </div>

            {/* Middle Row: Health & Chaining */}
            <div className="col-span-12">
               <ProviderHealth />
            </div>

            <div className="col-span-12">
               <ChainVisualizer events={events} />
            </div>

            {/* Bottom Row: Analytics & History */}
            <div className="col-span-12 xl:col-span-12">
              <Analytics />
            </div>

            <div className="col-span-12">
               <HistoryTable />
            </div>
          </div>

          <footer className="pt-8 pb-12 border-t border-slate-700/30 text-center">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em]">
               OmniLLM Dashboard — Advanced Model Context Protocol Gateway — 2026
             </p>
          </footer>
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
