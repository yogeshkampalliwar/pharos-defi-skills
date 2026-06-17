import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface OrchestratorFeedProps {
  logs: LogEntry[];
}

export const OrchestratorFeed = ({ logs }: OrchestratorFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-neon-blue';
      case 'error': return 'text-casper-red';
      case 'warning': return 'text-yellow-400';
      default: return 'text-white/70';
    }
  };

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute right-6 top-24 bottom-28 w-80 glass-panel flex flex-col z-10"
    >
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Activity size={18} className="text-neon-blue" />
        <h3 className="font-sans font-semibold text-sm tracking-wider text-white uppercase">Orchestrator Feed</h3>
        <div className="ml-auto w-2 h-2 rounded-full bg-neon-blue animate-pulse"></div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
      >
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-mono break-words"
            >
              <span className="text-white/40 mr-2">
                [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]
              </span>
              <span className={`${getColor(log.type)}`}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
