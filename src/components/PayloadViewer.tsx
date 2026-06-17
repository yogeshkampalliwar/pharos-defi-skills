import React, { useState, useEffect } from 'react';

interface PayloadViewerProps {
  isVisible: boolean;
  deployHash?: string | null;
}

const MOCK_PAYLOAD = `{
  "network": "casper-test",
  "contract_package_hash": "hash-8f8b...32e1",
  "entry_point": "deposit",
  "payment_amount": "1500000",
  "args": {
    "amount": "50000000000",
    "pool_id": "u32_14"
  },
  "signatures": [
    "0x01a3...4f2b"
  ]
}`;

export const PayloadViewer: React.FC<PayloadViewerProps> = ({ isVisible, deployHash }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(MOCK_PAYLOAD.slice(0, i));
      i += 5; // typing speed
      if (i > MOCK_PAYLOAD.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-6 left-6 w-[400px] h-[300px] bg-space-950/80 backdrop-blur-xl border border-[#00F0FF]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)] flex flex-col z-10">
      <div className="bg-[#00F0FF]/10 px-4 py-2 border-b border-[#00F0FF]/30 flex justify-between items-center">
        <span className="text-[#00F0FF] font-mono text-xs font-bold tracking-widest">RAW ODRA PAYLOAD</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <pre className="text-[#00F0FF] font-mono text-xs leading-relaxed">
          {displayedText}
          <span className="animate-pulse">_</span>
        </pre>
        {deployHash && displayedText.length >= MOCK_PAYLOAD.length && (
          <div className="mt-4 pt-4 border-t border-[#00F0FF]/20 text-[#00F0FF] font-mono text-xs">
            <span className="text-white">STATUS:</span> BROADCASTED<br/>
            <span className="text-white">HASH:</span> {deployHash}
          </div>
        )}
      </div>
    </div>
  );
};
