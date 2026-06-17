const { ethers } = require("ethers");

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)"
];

const FACTORY_ADDRESS = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";

async function getTokenPrice(provider, tokenA, tokenB) {
  try {
    if (!tokenA || !tokenB) return { error: "Token addresses required" };
    const tA = ethers.getAddress(tokenA);
    const tB = ethers.getAddress(tokenB);

    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    const pairAddress = await factory.getPair(tA, tB);
    if (!pairAddress || pairAddress === ethers.ZeroAddress) {
      return { tokenA: tA, tokenB: tB, price: "N/A", error: "No liquidity pair" };
    }

    const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
    const [reserves, token0] = await Promise.all([pair.getReserves(), pair.token0()]);
    const price = token0.toLowerCase() === tA.toLowerCase()
      ? Number(reserves[1]) / Number(reserves[0])
      : Number(reserves[0]) / Number(reserves[1]);

    return { tokenA: tA, tokenB: tB, price: price.toFixed(8), pairAddress, timestamp: Date.now() };
  } catch (err) {
    return { error: err.shortMessage || err.message };
  }
}

module.exports = { getTokenPrice };
