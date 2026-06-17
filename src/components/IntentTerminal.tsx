import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Send } from 'lucide-react';

interface IntentTerminalProps {
  onSubmit: (intent: string) => void;
}

const MagneticButton = ({ children, disabled, className, ...props }: any) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = wrapperRef.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.4, y: middleY * 0.4 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={`relative flex items-center justify-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      {/* Invisible absolute hit area that is larger than the button to prevent mouse-leave loops when the button shifts */}
      <div className="absolute -inset-6 z-10" />
      
      <motion.button
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.2 }}
        whileTap={disabled ? {} : { scale: 0.9 }}
        disabled={disabled}
        className={className}
        style={{ pointerEvents: disabled ? 'none' : 'auto' }} // Prevent disabled button from swallowing mouse events
        {...props}
      >
        {/* Parallax inner element for extra depth */}
        <motion.div
          animate={{ x: position.x * 0.3, y: position.y * 0.3 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.button>
    </div>
  );
};

export const IntentTerminal = ({ onSubmit }: IntentTerminalProps) => {
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;
    onSubmit(intent);
    setIntent('');
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl z-20"
    >
      <form onSubmit={handleSubmit} className="glass-panel-glow p-2 flex items-center gap-3 rounded-2xl">
        <div className="pl-3 text-neon-blue">
          <Terminal size={20} />
        </div>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Enter your intent... (e.g., 'Stake 50% of my CSPR into the vault')"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 font-mono text-sm py-3"
        />
        <MagneticButton
          type="submit"
          disabled={!intent.trim()}
          className="bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue p-3 rounded-xl border border-neon-blue/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] cursor-pointer"
        >
          <Send size={18} />
        </MagneticButton>
      </form>
    </motion.div>
  );
};
