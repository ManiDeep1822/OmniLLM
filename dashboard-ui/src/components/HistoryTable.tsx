import React, { useEffect, useState } from 'react';
import { History, Search, ChevronLeft, ChevronRight, Database, Zap, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface CallRecord {
  id: string;
  timestamp: string;
  modelProvider: string;
  modelName: string;
  tokenCount: number;
  latencyMs: number;
  costEstimate: number;
}

export const HistoryTable: React.FC = () => {
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get<CallRecord[]>('http://localhost:3000/api/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistory = history.filter(item => 
    item.modelProvider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentData = filteredHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getLatencyColor = (latency: number) => {
    if (latency < 1000) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (latency < 3000) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full transition-all">
      <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <History size={20} />
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight">Call History</h3>
        </div>

        <div className="flex bg-slate-950/20 px-4 py-2 rounded-xl border border-slate-700/30 w-full max-w-xs transition-all focus-within:border-primary">
          <Search size={16} className="text-slate-500 mt-0.5" />
          <input 
            type="text" 
            placeholder="Search provider or model..." 
            className="bg-transparent border-none outline-none text-xs w-full ml-2 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-700/50">
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Tokens</th>
              <th className="px-6 py-4">Latency</th>
              <th className="px-6 py-4 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            <AnimatePresence mode="popLayout">
              {currentData.map((call, idx) => (
                <motion.tr 
                  key={call.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Clock size={12} className="text-slate-600" />
                      {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      call.modelProvider === 'anthropic' ? 'text-claude' :
                      call.modelProvider === 'openai' ? 'text-openai' : 'text-blue-400'
                    }`}>
                      {call.modelProvider}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-950/40 px-2 py-1 rounded border border-slate-800">
                      {call.modelName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Database size={12} className="text-slate-600" />
                      {call.tokenCount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold ${getLatencyColor(call.latencyMs)}`}>
                      <Zap size={10} />
                      {call.latencyMs}ms
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-emerald-400">${call.costEstimate?.toFixed(4)}</span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {currentData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-500 italic text-xs font-medium">
                  No records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-950/10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Showing {currentData.length} of {filteredHistory.length} calls
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black text-slate-400 px-3">
            PAGE {page} / {totalPages || 1}
          </span>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
