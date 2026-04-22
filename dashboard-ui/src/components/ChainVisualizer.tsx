import React, { useState, useEffect } from 'react';
import { Network, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

interface ChainStep {
  step: number;
  total: number;
  prompt: string;
  response: string;
  status: 'complete' | 'processing';
  timestamp: string;
}

export const ChainVisualizer: React.FC = () => {
  const { socket } = useSocket();
  const [chainSteps, setChainSteps] = useState<ChainStep[]>([]);
  const [isChaining, setIsChaining] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('chain_start', (data) => {
      setChainSteps([]);
      setIsChaining(true);
      setTotalSteps(data.totalSteps);
    });

    socket.on('chain_step', (data) => {
      setChainSteps(prev => [...prev, {
        step: data.step,
        total: data.total,
        prompt: data.prompt,
        response: data.response,
        status: 'complete',
        timestamp: data.timestamp
      }]);
    });

    socket.on('chain_complete', () => {
      setIsChaining(false);
    });

    return () => {
      socket.off('chain_start');
      socket.off('chain_step');
      socket.off('chain_complete');
    };
  }, [socket]);

  const truncate = (text: string, len: number) => {
    if (!text) return '';
    return text.length > len ? text.substring(0, len) + '...' : text;
  };

  return (
    <div className="glass-card rounded-2xl p-6 transition-all h-full flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
            <Network size={20} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">Chain Visualizer</h2>
        </div>
        {isChaining && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Loader2 size={12} className="text-primary animate-spin" />
            <span className="text-[10px] font-bold text-primary uppercase">Chaining Active</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-start gap-4 overflow-x-auto py-4 px-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {chainSteps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, x: -20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                className="min-w-[220px] max-w-[220px] p-4 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] shadow-sm flex flex-col gap-2 relative group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest">
                    Step {step.step} of {step.total}
                  </span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-tighter mb-0.5">Prompt</p>
                    <p className="text-[11px] text-[var(--text-primary)] font-medium line-clamp-2 leading-snug">
                      {step.prompt}
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mb-0.5">Response</p>
                    <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
                      {truncate(step.response, 80)}
                    </p>
                  </div>
                </div>
              </motion.div>
              {index < totalSteps - 1 && (
                <ArrowRight size={18} className="text-[var(--border-color)] shrink-0" />
              )}
            </React.Fragment>
          ))}

          {isChaining && chainSteps.length < totalSteps && (
             <React.Fragment key="active-step">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="min-w-[220px] max-w-[220px] p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3 h-[140px]"
                >
                  <Loader2 size={24} className="text-primary animate-spin" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">
                    Processing Step {chainSteps.length + 1}...
                  </span>
                </motion.div>
             </React.Fragment>
          )}

          {chainSteps.length === 0 && !isChaining && (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] gap-2 py-10">
              <Network size={32} className="opacity-20" />
              <p className="text-xs font-medium italic">No active chain. Use multi-step-chain tool to start</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
