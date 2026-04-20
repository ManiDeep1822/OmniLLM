import React, { useEffect, useState } from 'react';
import { History, Clock, Zap, Database } from 'lucide-react';
import axios from 'axios';

export const CallHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };

    fetchHistory();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <History size={18} className="text-indigo-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Call History</h2>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-700">
              <th className="pb-2">Timestamp</th>
              <th className="pb-2">Provider</th>
              <th className="pb-2">Model</th>
              <th className="pb-2">Tokens</th>
              <th className="pb-2">Latency</th>
              <th className="pb-2">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {history.map((call) => (
              <tr key={call.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="py-2 text-slate-400 font-mono">
                  {new Date(call.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    call.modelProvider === 'anthropic' ? 'bg-claude/20 text-claude' :
                    call.modelProvider === 'openai' ? 'bg-openai/20 text-openai' : 'bg-gemini/20 text-gemini'
                  }`}>
                    {call.modelProvider}
                  </span>
                </td>
                <td className="py-2 text-slate-300">{call.modelName}</td>
                <td className="py-2 font-mono flex items-center gap-1">
                  <Database size={10} className="text-slate-500" />
                  {call.tokenCount}
                </td>
                <td className="py-2 font-mono flex items-center gap-1">
                  <Zap size={10} className="text-yellow-500" />
                  {call.latencyMs}ms
                </td>
                <td className="py-2 text-emerald-400 font-mono">${call.costEstimate?.toFixed(4)}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500 italic">No calls recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
