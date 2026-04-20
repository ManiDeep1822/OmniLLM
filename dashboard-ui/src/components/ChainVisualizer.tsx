import React from 'react';
import { Network, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChainVisualizerProps {
  events: any[];
}

export const ChainVisualizer: React.FC<ChainVisualizerProps> = ({ events }) => {
  // Extract chain steps from events
  const chainEvents = events.filter(e => e.type === 'chain_step');
  const lastEvent = events[0];
  const isCurrentlyChaining = lastEvent?.type === 'chain_step' || (lastEvent?.type === 'token' && lastEvent.model === 'chain');

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Network size={18} className="text-pink-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Chain Visualizer</h2>
      </div>

      <div className="flex items-center justify-start gap-4 overflow-x-auto py-6 px-2 min-h-[120px]">
        {chainEvents.reverse().map((event, index) => (
          <React.Fragment key={index}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`min-w-[120px] p-3 rounded-lg border-2 flex flex-col items-center gap-2 ${
                index === chainEvents.length - 1 && isCurrentlyChaining 
                    ? 'border-claude bg-claude/10 shadow-[0_0_15px_-5px_#3b82f6]' 
                    : 'border-slate-600 bg-slate-900/50'
              }`}
            >
              <div className="text-[10px] text-slate-500 font-bold">STEP {event.data.step}</div>
              <div className="text-xs text-center truncate w-full text-slate-300">{event.data.prompt.substring(0, 20)}...</div>
              {index === chainEvents.length - 1 && isCurrentlyChaining ? (
                <Loader2 size={16} className="text-claude animate-spin mt-1" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-500 mt-1" />
              )}
            </motion.div>
            {index < chainEvents.length - 1 && (
              <ArrowRight size={16} className="text-slate-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
        {chainEvents.length === 0 && (
          <div className="w-full text-center text-slate-500 italic text-sm">No active chaining sequence.</div>
        )}
      </div>
    </div>
  );
};
