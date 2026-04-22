import React, { useEffect, useState } from 'react';


import { useTheme } from '../context/useTheme';
import {
  Server, Database, Zap, Key, Moon, Sun, ExternalLink, RefreshCw,
  CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import axios from 'axios';


interface ConfigKey {

  key: string;
  label: string;
  set: boolean;
  value?: string;
}

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [configKeys, setConfigKeys] = useState<ConfigKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get<{ keys: ConfigKey[] }>('/api/config');
        setConfigKeys(res.data.keys);
      } catch {
        setConfigKeys([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const configuredKeys = configKeys.filter(k => k.set);
  const missingKeys = configKeys.filter(k => !k.set);
  const activePort = configKeys.find(k => k.key === 'PORT')?.value || '4321';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">
          Gateway Configuration & Preferences
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">



        {/* Appearance */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Sun size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight">Appearance</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/30 border border-slate-700/30">
            <div>
              <p className="text-sm font-bold text-slate-200">Dark / Light Mode</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-medium italic">
                Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/40 rounded-xl text-xs font-black uppercase hover:bg-primary/30 transition-all"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              Toggle
            </button>
          </div>
        </div>

        {/* Environment Variables — live from server */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                <Key size={20} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-tight">API Keys</h2>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
              Live from .env
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-bold">Loading config...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {configKeys.length === 0 && (
                <p className="text-xs text-red-400 italic text-center py-4 font-bold">
                  Could not reach server. Is the MCP gateway running?
                </p>
              )}
              {configKeys.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-700/30"
                >
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-300">{item.key}</p>
                    <p className="text-[10px] text-slate-500 italic">{item.label}{item.value ? ` · Port ${item.value}` : ''}</p>
                  </div>
                  {item.set ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={10} />
                      Configured
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle size={10} />
                      Missing
                    </div>
                  )}
                </div>
              ))}

              {/* Summary */}
              {configKeys.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-emerald-400">{configuredKeys.length} Configured</span>
                  {missingKeys.length > 0 && (
                    <span className="text-red-400">{missingKeys.length} Missing</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Endpoints */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Server size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight">API Endpoints</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Health Check', path: '/api/health' },
              { label: 'Call History', path: '/api/history' },
              { label: 'Provider Health', path: '/api/providers/health' },
              { label: 'Usage Analytics', path: '/api/analytics' },
              { label: 'Config Status', path: '/api/config' },
            ].map((ep) => (
              <div key={ep.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-700/30">
                <div>
                  <p className="text-xs font-bold text-slate-300">{ep.label}</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    localhost:{activePort}<span className="text-primary">{ep.path}</span>
                  </p>
                </div>
                <button
                  onClick={async () => {
                    window.open(ep.path, '_blank');
                  }}
                  className="p-1.5 text-slate-500 hover:text-primary transition-colors"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={async () => {
                window.open('/api/health', '_blank');
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-950/30 border border-slate-700/30 hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
            >
              <RefreshCw size={16} className="text-slate-500 group-hover:text-primary transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-300">Check Gateway Health</p>
                <p className="text-[10px] text-slate-500 italic">Opens /api/health in new tab</p>
              </div>
            </button>
            <a
              href="https://github.com/ManiDeep1822/OmniLLM"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-950/30 border border-slate-700/30 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <Database size={16} className="text-slate-500 group-hover:text-primary transition-colors" />
              <div>
                <p className="text-xs font-bold text-slate-300">View GitHub Repository</p>
                <p className="text-[10px] text-slate-500 italic">github.com/ManiDeep1822/OmniLLM</p>
              </div>
            </a>
          </div>
        </div>

      </div>

      <footer className="pt-8 pb-12 border-t border-slate-700/30 text-center">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em]">
          OmniLLM Dashboard — v1.0.0 — MIT License — 2026
        </p>
      </footer>
    </div>
  );
};
