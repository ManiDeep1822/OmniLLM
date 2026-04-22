import React, { useEffect, useState } from 'react';
import { Clock, Search, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import type { CallRecord } from '../types/dashboard';

const providerBadge = (provider: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    anthropic: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
    openai: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    google: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  };
  const style = map[provider.toLowerCase()] || { bg: 'bg-gray-500/10', text: 'text-gray-400' };
  return (
    <span className={`badge ${style.bg} ${style.text} border-0`}>
      {provider}
    </span>
  );
};



export const HistoryTable: React.FC = () => {
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get<CallRecord[]>('/api/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = history.filter((r) =>
    r.modelProvider.toLowerCase().includes(search.toLowerCase()) ||
    r.modelName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-cyan-500/10">
            <Clock size={17} className="text-cyan-500" />
          </div>
          <h2 className="heading-lg">Call History</h2>
          <span className="badge badge-info">{filtered.length} records</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[var(--input-bg)] border border-[var(--border-color)] w-56 focus-within:border-primary transition-colors">
          <Search size={14} className="text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Filter by provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-[12px] w-full text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--input-bg)]">
              {['Provider', 'Model', 'Tokens', 'Latency', 'Cost', 'Time'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-default">
                    {h}
                    <ChevronDown size={10} className="opacity-40" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[13px] text-[var(--text-tertiary)]">
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 25).map((record, idx) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors group"
                  >
                    <td className="px-4 py-3">{providerBadge(record.modelProvider)}</td>
                    <td className="px-4 py-3 mono text-[12px] text-[var(--text-primary)]">{record.modelName}</td>
                    <td className="px-4 py-3 mono text-[12px] text-[var(--text-secondary)]">{record.tokenCount.toLocaleString()}</td>
                    <td className="px-4 py-3 mono text-[12px] text-[var(--text-secondary)]">{record.latencyMs}ms</td>
                    <td className="px-4 py-3 mono text-[12px] text-emerald-500">${record.costEstimate.toFixed(4)}</td>
                    <td className="px-4 py-3 text-[12px] text-[var(--text-tertiary)]">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
