const { ethers } = require("ethers");

const CONTRACT_ADDRESS = "0x6E7454907D72bd5eff1e93b4f37CD57Dc527D809";

const DEFI_SKILL_ABI = [
  "function executeSwap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) external returns (uint256)",
  "function getSwapHistory(address user) view returns (tuple(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 timestamp)[])",
  "function getSwapCount() view returns (uint256)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function executeSwap(signer, tokenIn, tokenOut, amountIn, slippage = 0.5) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DEFI_SKILL_ABI, signer);
    const token = new ethers.Contract(tokenIn, ERC20_ABI, signer);
    const amount = ethers.parseEther(amountIn.toString());
    const amountOutMin = amount * BigInt(Math.floor((1 - slippage/100) * 1000)) / 1000n;
    const allowance = await token.allowance(signer.address, CONTRACT_ADDRESS);
    if (allowance < amount) {
      const approveTx = await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();
    }
    const tx = await contract.executeSwap(tokenIn, tokenOut, amount, amountOutMin);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash, amountIn: amountIn.toString() };
  } catch (err) {
    return { success: false, error: err.shortMessage || err.message };
  }
}

async function getSwapHistory(provider, userAddress) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DEFI_SKILL_ABI, provider);
    const history = await contract.getSwapHistory(userAddress);
    return history.map(h => ({
      tokenIn: h.tokenIn, tokenOut: h.tokenOut,
      amountIn: ethers.formatEther(h.amountIn), amountOut: ethers.formatEther(h.amountOut),
      timestamp: new Date(Number(h.timestamp) * 1000).toISOString()
    }));
  } catch (err) {
    return { error: err.shortMessage || err.message };
  }
}

module.exports = { executeSwap, getSwapHistory };
