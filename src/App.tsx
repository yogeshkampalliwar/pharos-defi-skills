import { useState } from 'react';
import { SwarmVisualizer } from './components/SwarmVisualizer';
import { IntentTerminal } from './components/IntentTerminal';
import { OrchestratorFeed, type LogEntry } from './components/OrchestratorFeed';
import { AssetHUD } from './components/AssetHUD';
import { RiskModal } from './components/RiskModal';
import { PayloadViewer } from './components/PayloadViewer';
import { motion } from 'framer-motion';

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      message: 'Pharos DeFAI Swarm initialized. Awaiting intents...',
      type: 'info'
    }
  ]);

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [currentIntent, setCurrentIntent] = useState('');
  const [isPayloadViewerVisible, setIsPayloadViewerVisible] = useState(false);
  const [deployHash, setDeployHash] = useState<string | null>(null);

  const addLog = (message: string, type: LogEntry['type']) => {
    setLogs((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), timestamp: new Date(), message, type }
    ]);
  };

  const handleIntent = async (intent: string, action: string = 'execute') => {
    if (action === 'execute') {
      addLog(`Intent Received: "${intent}"`, 'info');
      setIsPayloadViewerVisible(false);
      setDeployHash(null);
    }
    
    try {
      const response = await fetch('https://pharos-defai-swarm.vercel.app/api/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: intent,
          address: '0x1234567890abcdef1234567890abcdef12345678', // Mock connected wallet
          action: action
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to orchestrator API');
      }

      const data = await response.json();
      const messages = data.messages || [];
      
      messages.forEach((msg: any, index: number) => {
        setTimeout(() => {
          let type: LogEntry['type'] = 'info';
          if (msg.content.includes('✅') || msg.content.toLowerCase().includes('successful') || msg.content.includes('confirmed')) type = 'success';
          else if (msg.content.includes('❌') || msg.content.toLowerCase().includes('error') || msg.content.toLowerCase().includes('failed')) type = 'error';
          
          addLog(msg.content, type);

          if (msg.content.includes('Contract payload generated')) {
            setIsPayloadViewerVisible(true);
          }
        }, (index + 1) * 800);
      });

      if (data.status === 'requires_confirmation') {
         setTimeout(() => {
             setCurrentIntent(intent);
             setIsRiskModalOpen(true);
         }, messages.length * 800 + 500);
      } else if (data.status === 'executed') {
         setTimeout(() => {
             setDeployHash(data.deploy_hash);
         }, messages.length * 800);
      }
      
    } catch (error: any) {
      addLog(`API Connection Error: ${error.message}`, 'error');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-space-900 font-sans text-white">
      {/* 3D Background Visualizer */}
      <SwarmVisualizer />

      {/* Title / Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none"
      >
        <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-glow-blue mb-2 shadow-cyan-500/50">
          PHAROS DeFAI SWARM
        </h1>
        <p className="text-sm font-mono text-white/50 tracking-widest uppercase">
          Autonomous AI Agent Network • Pharos Testnet
        </p>
      </motion.div>

      {/* Floating UI Overlays */}
      <AssetHUD />
      <OrchestratorFeed logs={logs} />
      <IntentTerminal onSubmit={(intent) => handleIntent(intent, 'execute')} />
      
      {/* Hacker Data Streams */}
      <PayloadViewer isVisible={isPayloadViewerVisible} deployHash={deployHash} />
      
      {/* Human In The Loop Risk Modal */}
      <RiskModal 
        isOpen={isRiskModalOpen} 
        intent={currentIntent}
        onConfirm={() => {
          setIsRiskModalOpen(false);
          handleIntent(currentIntent, 'confirm');
        }}
        onCancel={() => {
          setIsRiskModalOpen(false);
          addLog('Transaction aborted by user.', 'error');
        }}
      />
    </div>
  );
}

export default App;
