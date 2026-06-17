import { motion } from 'framer-motion';
import { Wallet, Lock, Activity } from 'lucide-react';

const cardVariants = {
  rest: { 
    scale: 1, 
    x: 0,
    boxShadow: "0px 0px 0px rgba(0,240,255,0)",
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(10, 15, 30, 0.4)"
  },
  hover: { 
    scale: 1.03, 
    x: 8,
    boxShadow: "0px 15px 35px rgba(0,240,255,0.15)",
    borderColor: "rgba(0,240,255,0.4)",
    backgroundColor: "rgba(10, 15, 30, 0.7)",
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

const healthCardVariants = {
  rest: { 
    scale: 1, 
    x: 0,
    boxShadow: "0px 0px 15px rgba(0,240,255,0.1)",
    borderColor: "rgba(0,240,255,0.3)",
    backgroundColor: "rgba(0, 240, 255, 0.05)"
  },
  hover: { 
    scale: 1.05, 
    x: 10,
    boxShadow: "0px 20px 50px rgba(0,240,255,0.4)",
    borderColor: "rgba(0,240,255,0.8)",
    backgroundColor: "rgba(0, 240, 255, 0.15)",
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
}

const iconVariants = {
  rest: { rotate: 0, scale: 1, color: "rgba(255,255,255,0.7)" },
  hover: { rotate: 15, scale: 1.2, color: "#00F0FF" }
};

const bgIconVariants = {
  rest: { scale: 1, opacity: 0.1, rotate: 0 },
  hover: { scale: 1.4, opacity: 0.25, rotate: -15, transition: { type: "spring" as const, stiffness: 200, damping: 20 } }
};

export const AssetHUD = () => {
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute left-6 top-24 flex flex-col gap-4 z-10"
    >
      {/* Wallet Balance */}
      <motion.div 
        className="glass-panel p-4 w-64 cursor-default rounded-xl border backdrop-blur-md"
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div variants={iconVariants}>
            <Wallet size={16} />
          </motion.div>
          <span className="text-xs uppercase tracking-wider font-semibold text-white/70 transition-colors duration-300 group-hover:text-neon-blue">Available Balance</span>
        </div>
        <div className="text-2xl font-mono text-white text-glow-blue transition-all duration-300">
          12,450 <span className="text-sm text-neon-blue">CSPR</span>
        </div>
      </motion.div>

      {/* Staked Assets */}
      <motion.div 
        className="glass-panel p-4 w-64 cursor-default rounded-xl border backdrop-blur-md"
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div variants={iconVariants}>
            <Lock size={16} />
          </motion.div>
          <span className="text-xs uppercase tracking-wider font-semibold text-white/70 transition-colors duration-300 group-hover:text-neon-blue">Staked Assets</span>
        </div>
        <div className="text-2xl font-mono text-white text-glow-blue transition-all duration-300">
          50,000 <span className="text-sm text-neon-blue">CSPR</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-white/50">APR</span>
          <span className="text-green-400">10.5%</span>
        </div>
      </motion.div>

      {/* Vault Health */}
      <motion.div 
        className="glass-panel-glow p-4 w-64 relative overflow-hidden cursor-default rounded-xl border backdrop-blur-md"
        variants={healthCardVariants}
        initial="rest"
        whileHover="hover"
      >
        <motion.div 
            className="absolute top-0 right-0 p-2 pointer-events-none text-neon-blue"
            variants={bgIconVariants}
        >
          <Activity size={64} />
        </motion.div>
        
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <motion.div variants={{ rest: { rotate: 0 }, hover: { rotate: 180, scale: 1.2 } }} transition={{ duration: 0.5 }}>
             <Activity size={16} className="text-neon-blue" />
          </motion.div>
          <span className="text-xs uppercase tracking-wider font-semibold text-neon-blue">System Health</span>
        </div>
        <div className="text-2xl font-mono text-white relative z-10">
          99.9%
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs font-mono relative z-10">
          <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
          <span className="text-neon-blue">Swarm Active</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
