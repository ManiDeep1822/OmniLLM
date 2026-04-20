import React from 'react';
import { Network, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChainVisualizerProps {
  events: any[];
}

export const ChainVisualizer: React.FC<ChainVisualizerProps> = ({ events }) => {
  const chainEvents = events.filter(e => e.type === 'chain_step');
  const lastEvent = events[0];
  const isCurrentlyChaining = lastEvent?.type === 'chain_step' || (lastEvent?.type === 'token' && lastEvent.model === 'chain');

  return (
    <div className="glass-card rounded-2xl p-6 transition-all h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
          <Network size={20} />
        </div>
        <h2 className="text-sm font-black uppercase tracking-tight">Chain Visualizer</h2>
      </div>

      <div className="flex items-center justify-start gap-4 overflow-x-auto py-8 px-2 min-h-[140px] custom-scrollbar">
        {chainEvents.reverse().map((event, index) => (
          <React.Fragment key={index}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              className={`min-w-[140px] p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                index === chainEvents.length - 1 && isCurrentlyChaining 
                    ? 'border-primary bg-primary/10 shadow-[0_0_20px_-5px_#6c3dd3]' 
                    : 'border-slate-700/50 bg-slate-950/40'
              }`}
            >
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">STEP {event.data.step}</div>
              <div className="text-xs text-center truncate w-full font-bold text-slate-200">{event.data.prompt}</div>
              {index === chainEvents.length - 1 && isCurrentlyChaining ? (
                <Loader2 size={16} className="text-primary animate-spin" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-400" />
              )}
            </motion.div>
            {index < chainEvents.length - 1 && (
              <ArrowRight size={16} className="text-slate-700 shrink-0" />
            )}
          </React.Fragment>
        ))}
        {chainEvents.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-slate-500 italic text-xs font-medium">
            No active multi-step reasoning sequence.
          </div>
        )}
      </div>
    </div>
  );
};
