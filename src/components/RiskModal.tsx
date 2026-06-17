import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskModalProps {
  isOpen: boolean;
  intent: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RiskModal: React.FC<RiskModalProps> = ({ isOpen, intent, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-space-900/90 border border-red-500/50 rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,42,42,0.3)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400">Risk Threshold Exceeded</h2>
                <p className="text-sm text-space-300">Human-in-the-Loop Required</p>
              </div>
            </div>
            
            <div className="bg-space-950 p-4 rounded-lg border border-white/5 mb-6">
              <p className="text-sm text-space-400 mb-2">Requested Intent:</p>
              <p className="font-mono text-white">"{intent}"</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-space-400">Flag Reason:</span>
                <span className="text-red-400 font-bold">Unusually large transaction volume</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-space-400">Protocol Risk:</span>
                <span className="text-yellow-400">Medium (New Vault)</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-lg border border-space-700 text-white hover:bg-space-800 transition-colors font-mono text-sm"
              >
                ABORT
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-mono text-sm shadow-[0_0_15px_rgba(255,42,42,0.4)]"
              >
                AUTHORIZE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
