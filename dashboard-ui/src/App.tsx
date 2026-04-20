import React from 'react';
import { Layout, Shield, Cpu, Activity, Settings, Zap } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { LiveFeed } from './components/LiveFeed';
import { CostTracker } from './components/CostTracker';
import { CallHistory } from './components/CallHistory';
import { ChainVisualizer } from './components/ChainVisualizer';

function App() {
  const { events, isConnected } = useSocket();
  const [health, setHealth] = React.useState<any>(null);

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch (e) {
        setHealth({ status: 'unhealthy' });
      }
    };
    checkHealth();
    const timer = setInterval(checkHealth, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
            <Shield className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-slate-50 uppercase">LLM GateWay <span className="text-emerald-500">v1.0</span></h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest">AUTONOMOUS MULTI-MODEL ROUTER</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">System Status</span>
              <span className={`text-sm font-mono flex items-center gap-1 ${
                health?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}></span> 
                {health?.status === 'healthy' ? 'OPERATIONAL' : 'DEGRADED'}
              </span>
            </div>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors">
            <Settings size={20} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1">
        
        {/* Left Column - Streaming & Visualizer */}
        <div className="col-span-8 flex flex-col gap-6">
          <LiveFeed events={events} isConnected={isConnected} />
          <ChainVisualizer events={events} />
          <CallHistory />
        </div>

        {/* Right Column - Stats & Settings */}
        <div className="col-span-4 flex flex-col gap-6">
          
          {/* Active Model Info */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-5 border border-slate-700 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={18} className="text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Provider Health</h2>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Anthropic Claude', latency: '124ms', status: 'online', color: 'bg-claude' },
                  { name: 'OpenAI GPT-4o', latency: '85ms', status: 'online', color: 'bg-openai' },
                  { name: 'Google Gemini Pro', latency: '210ms', status: 'busy', color: 'bg-yellow-500' }
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${p.color}`}></div>
                       <span className="text-xs font-semibold">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-mono text-slate-500">{p.latency}</span>
                       <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                         p.status === 'online' ? 'text-emerald-400' : 'text-yellow-400'
                       }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          <CostTracker />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold mb-1">TOTAL TOKENS</div>
                <div className="text-xl font-mono text-slate-50">1.2M</div>
             </div>
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold mb-1">REQ / HOUR</div>
                <div className="text-xl font-mono text-slate-50">42</div>
             </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-4">
             <Zap size={24} className="text-emerald-500" />
             <div className="text-xs text-slate-400 leading-tight">
               <strong className="text-slate-100 block mb-1">AUTO-ROUTER ENGINE</strong>
               Currently routing 85% of traffic to <span className="text-emerald-400 font-bold">GPT-4o Mini</span> to optimize carbon footprint and cost.
             </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-[10px] font-mono tracking-widest pt-4 border-t border-slate-900">
        POWERED BY MODEL CONTEXT PROTOCOL & GOOGLE ANTIGRAVITY — 2026
      </footer>
    </div>
  );
}

export default App;
