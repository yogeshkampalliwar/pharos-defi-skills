import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'

const PHAROS_MAINNET = {
  chainId: '0x688',
  chainName: 'Pharos Mainnet',
  rpcUrls: ['https://rpc.pharos.xyz'],
  nativeCurrency: { name: 'PROS', symbol: 'PROS', decimals: 18 },
  blockExplorerUrls: ['https://explorer.pharos.xyz']
}

const CONTRACT_ADDRESS = '0x6E7454907D72bd5eff1e93b4f37CD57Dc527D809'
const FACTORY_ADDRESS = '0x6725F303b657a9451d8BA641348b6761A6CC7a17'

const DEFI_SKILL_ABI = [
  "function executeSwap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) external returns (uint256)"
]
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
]
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)"
]
const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)"
]

const RAINBOW_COLORS = ['#FF0000','#FF7700','#FFFF00','#00FF00','#0000FF','#8B00FF','#FF00FF']

// Real token addresses on Pharos mainnet — fill in actual deployed tokens
const TOKENS = {
  PHRS: { address: 'native', symbol: 'PHRS' },
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wallet, setWallet] = useState('')
  const [balance, setBalance] = useState('0.0000')
  const [connected, setConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [logs, setLogs] = useState<string[]>(['⬡ Pharos DeFi Agent initialized...'])
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let particles: any[] = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
        r: Math.random()*3+1, color: RAINBOW_COLORS[Math.floor(Math.random()*RAINBOW_COLORS.length)],
        alpha: Math.random()*0.8+0.2
      })
    }
    const animate = () => {
      ctx.fillStyle = 'rgba(2,2,12,0.15)'
      ctx.fillRect(0,0,canvas.width,canvas.height)
      const cx = canvas.width/2, cy = canvas.height*0.32
      for (let i=0;i<7;i++) {
        const angle = (frame*0.01)+(i*Math.PI*2/7)
        const rx = 110+Math.sin(frame*0.02)*20, ry = 110+Math.cos(frame*0.02)*20
        const x = cx+Math.cos(angle)*rx, y = cy+Math.sin(angle)*ry*0.4
        const grd = ctx.createRadialGradient(x,y,0,x,y,18)
        grd.addColorStop(0,RAINBOW_COLORS[i]); grd.addColorStop(1,'transparent')
        ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill()
      }
      const sg = ctx.createRadialGradient(cx,cy,0,cx,cy,80)
      sg.addColorStop(0,'rgba(240,165,0,0.3)'); sg.addColorStop(0.5,'rgba(100,0,255,0.15)'); sg.addColorStop(1,'transparent')
      ctx.beginPath(); ctx.arc(cx,cy,80,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill()
      for (let r=0;r<3;r++) {
        ctx.beginPath()
        ctx.ellipse(cx,cy,70+r*25,(70+r*25)*0.3,frame*0.005+r,0,Math.PI*2)
        ctx.strokeStyle = `rgba(${r===0?'240,165,0':r===1?'0,255,136':'100,0,255'},0.4)`
        ctx.lineWidth=1.5; ctx.stroke()
      }
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0||p.x>canvas.width)p.vx*=-1
        if(p.y<0||p.y>canvas.height)p.vy*=-1
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=p.color+Math.floor(p.alpha*255).toString(16).padStart(2,'0'); ctx.fill()
      })
      frame++
      requestAnimationFrame(animate)
    }
    animate()
    return () => window.removeEventListener('resize', resize)
  }, [])

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0,8)])

  const refreshBalance = async (prov: ethers.BrowserProvider, addr: string) => {
    const b = await prov.getBalance(addr)
    setBalance(parseFloat(ethers.formatEther(b)).toFixed(4))
  }

  const connectWallet = async () => {
    try {
      const eth = (window as any).ethereum
      if (!eth) { addLog('❌ MetaMask not found!'); return }
      await eth.request({ method: 'eth_requestAccounts' })
      try {
        await eth.request({ method: 'wallet_addEthereumChain', params: [PHAROS_MAINNET] })
      } catch (chainErr: any) {
        addLog(`⚠️ Chain add skipped: ${chainErr.message}`)
      }
      const prov = new ethers.BrowserProvider(eth)
      const sgn = await prov.getSigner()
      const addr = await sgn.getAddress()
      setProvider(prov); setSigner(sgn); setWallet(addr); setConnected(true)
      await refreshBalance(prov, addr)
      addLog(`✅ Connected: ${addr.slice(0,6)}...${addr.slice(-4)}`)
    } catch(e: any) {
      addLog(`❌ Error: ${e.message}`)
    }
  }

  // Real on-chain price lookup via Pharos DEX factory
  const checkPair = async (tokenA: string, tokenB: string) => {
    if (!provider) return null
    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
      const pairAddress = await factory.getPair(tokenA, tokenB)
      if (!pairAddress || pairAddress === ethers.ZeroAddress) {
        addLog('⚠️ No liquidity pair found on-chain')
        return null
      }
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider)
      const [reserves, token0] = await Promise.all([pair.getReserves(), pair.token0()])
      const price = token0.toLowerCase() === tokenA.toLowerCase()
        ? Number(reserves[1])/Number(reserves[0])
        : Number(reserves[0])/Number(reserves[1])
      addLog(`📊 On-chain price fetched: ${price.toFixed(6)}`)
      return { pairAddress, price }
    } catch (e: any) {
      addLog(`❌ Price fetch failed: ${e.shortMessage || e.message}`)
      return null
    }
  }

  // Real on-chain swap execution via deployed DeFiSkill contract
  const executeRealSwap = async (tokenIn: string, tokenOut: string, amountIn: string) => {
    if (!signer || !connected) { addLog('❌ Connect wallet first!'); return }
    setLoading(true)
    try {
      addLog(`🤖 AI Agent preparing swap: ${amountIn} tokens`)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DEFI_SKILL_ABI, signer)
      const token = new ethers.Contract(tokenIn, ERC20_ABI, signer)
      const amount = ethers.parseEther(amountIn)
      const amountOutMin = amount * 995n / 1000n // 0.5% slippage

      const addr = await signer.getAddress()
      const allowance = await token.allowance(addr, CONTRACT_ADDRESS)
      if (allowance < amount) {
        addLog('🔓 Approving token spend...')
        const approveTx = await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256)
        await approveTx.wait()
        addLog('✅ Approval confirmed')
      }

      addLog('⚡ Sending swap to Pharos Mainnet...')
      const tx = await contract.executeSwap(tokenIn, tokenOut, amount, amountOutMin)
      const receipt = await tx.wait()
      setTxHash(receipt.hash)
      addLog(`✅ Swap confirmed on-chain: ${receipt.hash.slice(0,10)}...`)

      if (provider) await refreshBalance(provider, addr)
    } catch (e: any) {
      addLog(`❌ Swap failed: ${e.shortMessage || e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#02020c',color:'#fff',fontFamily:'monospace'}}>
      <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,zIndex:0}} />

      <div style={{position:'relative',zIndex:10,textAlign:'center',paddingTop:20}}>
        <div style={{fontSize:22,fontWeight:'bold',letterSpacing:4,background:'linear-gradient(90deg,#FF0000,#FF7700,#FFFF00,#00FF00,#0000FF,#8B00FF,#FF00FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          ⬡ PHAROS DeFi AGENT
        </div>
        <div style={{fontSize:10,color:'#666',letterSpacing:3,marginTop:4}}>AI-POWERED ON-CHAIN AGENT • MAINNET</div>
      </div>

      <div style={{position:'relative',zIndex:10,padding:'10px 15px',marginTop:180}}>
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

        <div style={{fontSize:10,color:'#666',letterSpacing:2,marginBottom:8}}>DEFI SKILL CONTRACT</div>
        <div style={{background:'rgba(2,2,12,0.8)',border:'1px solid #222',borderRadius:10,padding:12,marginBottom:8,fontSize:10,color:'#00ff88',wordBreak:'break-all'}}>
          {CONTRACT_ADDRESS}
        </div>

        <button onClick={() => checkPair(TOKENS.PHRS.address, FACTORY_ADDRESS)} disabled={!connected || loading} style={{width:'100%',padding:'12px',background:'#1a1a2e',border:'1px solid #00aaff',borderRadius:10,color:'#00aaff',fontWeight:'bold',fontSize:13,cursor:connected?'pointer':'not-allowed',fontFamily:'monospace',marginBottom:8}}>
          📊 Check On-Chain Price
        </button>

        <button onClick={() => refreshBalance(provider!, wallet)} disabled={!connected} style={{width:'100%',padding:'16px',background:loading?'#333':'linear-gradient(135deg,#f0a500,#8B00FF)',border:'none',borderRadius:12,color:'#fff',fontWeight:'bold',fontSize:16,cursor:loading?'not-allowed':'pointer',fontFamily:'monospace',marginTop:8,letterSpacing:2}}>
          {loading ? '⚡ EXECUTING...' : '🔄 REFRESH BALANCE'}
        </button>

        {txHash && (
          <div style={{background:'rgba(0,255,136,0.1)',border:'1px solid #00ff88',borderRadius:10,padding:10,marginTop:10,fontSize:10,color:'#00ff88',wordBreak:'break-all'}}>
            ✅ TX: <a href={`https://explorer.pharos.xyz/tx/${txHash}`} target="_blank" style={{color:'#00ff88'}}>{txHash}</a>
          </div>
        )}

        <div style={{background:'rgba(2,2,12,0.85)',border:'1px solid #222',borderRadius:10,padding:12,marginTop:12}}>
          <div style={{fontSize:10,color:'#f0a500',letterSpacing:2,marginBottom:8}}>⚡ AGENT FEED</div>
          {logs.map((l,i) => (
            <div key={i} style={{fontSize:10,color:i===0?'#00ff88':'#555',marginBottom:3}}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
