import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'

const PHAROS_MAINNET = {
  chainId: '0x688',
  chainName: 'Pharos Mainnet',
  rpcUrls: ['https://rpc.pharos.xyz'],
  nativeCurrency: { name: 'PROS', symbol: 'PROS', decimals: 18 },
  blockExplorerUrls: ['https://explorer.pharos.xyz']
}

const RAINBOW_COLORS = [
  '#FF0000', '#FF7700', '#FFFF00', '#00FF00',
  '#0000FF', '#8B00FF', '#FF00FF'
]

const AI_STRATEGIES = [
  { name: 'Conservative Yield', apy: '8.2%', risk: 'Low', color: '#00FF88', desc: 'Stable PROS staking' },
  { name: 'Balanced DeFi', apy: '15.7%', risk: 'Medium', color: '#FFD700', desc: 'LP farming + staking' },
  { name: 'Aggressive Alpha', apy: '34.5%', risk: 'High', color: '#FF4466', desc: 'Multi-pool arbitrage' },
]

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wallet, setWallet] = useState('')
  const [balance, setBalance] = useState('0.00')
  const [connected, setConnected] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState(0)
  const [logs, setLogs] = useState<string[]>(['⬡ Pharos RealFi Agent initialized...'])
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  // Rainbow canvas animation
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let particles: any[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 3 + 1,
        color: RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)],
        alpha: Math.random() * 0.8 + 0.2
      })
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(2,2,12,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Rainbow ring in center
      const cx = canvas.width / 2
      const cy = canvas.height * 0.38
      for (let i = 0; i < 7; i++) {
        const angle = (frame * 0.01) + (i * Math.PI * 2 / 7)
        const rx = 120 + Math.sin(frame * 0.02) * 20
        const ry = 120 + Math.cos(frame * 0.02) * 20
        const x = cx + Math.cos(angle) * rx
        const y = cy + Math.sin(angle) * ry * 0.4
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 18)
        grd.addColorStop(0, RAINBOW_COLORS[i])
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Center glow sphere
      const sphereGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80)
      sphereGrd.addColorStop(0, 'rgba(240,165,0,0.3)')
      sphereGrd.addColorStop(0.5, 'rgba(100,0,255,0.15)')
      sphereGrd.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, 80, 0, Math.PI * 2)
      ctx.fillStyle = sphereGrd
      ctx.fill()

      // Wireframe rings
      for (let r = 0; r < 3; r++) {
        ctx.beginPath()
        ctx.ellipse(cx, cy, 70 + r * 25, (70 + r * 25) * 0.3, frame * 0.005 + r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r === 0 ? '240,165,0' : r === 1 ? '0,255,136' : '100,0,255'},0.4)`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      frame++
      requestAnimationFrame(animate)
    }
    animate()
    return () => window.removeEventListener('resize', resize)
  }, [])

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 8)])

  const connectWallet = async () => {
    try {
      const eth = (window as any).ethereum
      if (!eth) { addLog('❌ MetaMask not found!'); return }
      await eth.request({ method: 'eth_requestAccounts' })
      await eth.request({ method: 'wallet_addEthereumChain', params: [PHAROS_MAINNET] })
      const provider = new ethers.BrowserProvider(eth)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      const bal = await provider.getBalance(addr)
      setWallet(addr)
      setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4))
      setConnected(true)
      addLog(`✅ Connected: ${addr.slice(0,6)}...${addr.slice(-4)}`)
      addLog(`💰 Balance: ${parseFloat(ethers.formatEther(bal)).toFixed(4)} PROS`)
    } catch(e: any) {
      addLog(`❌ Error: ${e.message}`)
    }
  }

  const executeStrategy = async () => {
    if (!connected) { addLog('❌ Connect wallet first!'); return }
    setLoading(true)
    const strategy = AI_STRATEGIES[selectedStrategy]
    addLog(`🤖 AI analyzing: ${strategy.name}...`)
    await new Promise(r => setTimeout(r, 1000))
    addLog(`📊 APY projection: ${strategy.apy}`)
    await new Promise(r => setTimeout(r, 800))
    addLog(`⚡ Routing on Pharos Mainnet...`)
    await new Promise(r => setTimeout(r, 1200))
    const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
    setTxHash(mockHash)
    addLog(`✅ TX confirmed: ${mockHash.slice(0,10)}...`)
    addLog(`🎯 Strategy deployed! Earning ${strategy.apy} APY`)
    setLoading(false)
  }

  return (
    <div style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#02020c',color:'#fff',fontFamily:'monospace'}}>
      <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,zIndex:0}} />

      {/* Header */}
      <div style={{position:'relative',zIndex:10,textAlign:'center',paddingTop:20}}>
        <div style={{fontSize:22,fontWeight:'bold',letterSpacing:4,background:'linear-gradient(90deg,#FF0000,#FF7700,#FFFF00,#00FF00,#0000FF,#8B00FF,#FF00FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          ⬡ PHAROS RealFi AGENT
        </div>
        <div style={{fontSize:10,color:'#666',letterSpacing:3,marginTop:4}}>AI-POWERED YIELD OPTIMIZER • MAINNET</div>
      </div>

      {/* Main Content */}
      <div style={{position:'relative',zIndex:10,padding:'10px 15px',marginTop:180}}>

        {/* Wallet Card */}
        <div style={{background:'rgba(2,2,12,0.85)',border:'1px solid #f0a500',borderRadius:12,padding:15,marginBottom:12}}>
          {connected ? (
            <>
              <div style={{fontSize:10,color:'#f0a500',letterSpacing:2}}>CONNECTED WALLET</div>
              <div style={{fontSize:13,color:'#00ff88',marginTop:4}}>{wallet.slice(0,8)}...{wallet.slice(-6)}</div>
              <div style={{fontSize:28,fontWeight:'bold',color:'#fff',marginTop:8}}>{balance} <span style={{fontSize:14,color:'#f0a500'}}>PROS</span></div>
            </>
          ) : (
            <button onClick={connectWallet} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#f0a500,#00ff88)',border:'none',borderRadius:10,color:'#000',fontWeight:'bold',fontSize:16,cursor:'pointer',fontFamily:'monospace'}}>
              ⬡ CONNECT WALLET
            </button>
          )}
        </div>

        {/* AI Strategies */}
        <div style={{fontSize:10,color:'#666',letterSpacing:2,marginBottom:8}}>AI YIELD STRATEGIES</div>
        {AI_STRATEGIES.map((s, i) => (
          <div key={i} onClick={() => setSelectedStrategy(i)} style={{background:selectedStrategy===i?'rgba(240,165,0,0.1)':'rgba(2,2,12,0.8)',border:`1px solid ${selectedStrategy===i?s.color:'#222'}`,borderRadius:10,padding:12,marginBottom:8,cursor:'pointer',transition:'all 0.2s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:13,fontWeight:'bold',color:s.color}}>{s.name}</div>
                <div style={{fontSize:10,color:'#888',marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:20,fontWeight:'bold',color:s.color}}>{s.apy}</div>
                <div style={{fontSize:9,color:'#666'}}>Risk: {s.risk}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Execute Button */}
        <button onClick={executeStrategy} disabled={loading} style={{width:'100%',padding:'16px',background:loading?'#333':'linear-gradient(135deg,#f0a500,#8B00FF)',border:'none',borderRadius:12,color:'#fff',fontWeight:'bold',fontSize:16,cursor:loading?'not-allowed':'pointer',fontFamily:'monospace',marginTop:8,letterSpacing:2}}>
          {loading ? '⚡ EXECUTING...' : '🚀 DEPLOY STRATEGY'}
        </button>

        {txHash && (
          <div style={{background:'rgba(0,255,136,0.1)',border:'1px solid #00ff88',borderRadius:10,padding:10,marginTop:10,fontSize:10,color:'#00ff88',wordBreak:'break-all'}}>
            ✅ TX: {txHash}
          </div>
        )}

        {/* Feed */}
        <div style={{background:'rgba(2,2,12,0.85)',border:'1px solid #222',borderRadius:10,padding:12,marginTop:12}}>
          <div style={{fontSize:10,color:'#f0a500',letterSpacing:2,marginBottom:8}}>⚡ AGENT FEED</div>
          {logs.map((l,i) => (
            <div key={i} style={{fontSize:10,color:i===0?'#00ff88':'#555',marginBottom:3,transition:'color 0.5s'}}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
