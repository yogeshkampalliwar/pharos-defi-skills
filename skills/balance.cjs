const { ethers } = require("ethers");
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function getWalletBalance(provider, wallet, token=null) {
  try {
    if (!token) {
      const b = await provider.getBalance(wallet);
      return { token: "PHRS", balance: ethers.formatEther(b), type: "native" };
    }
    const c = new ethers.Contract(token, ERC20_ABI, provider);
    const [b, d, s] = await Promise.all([c.balanceOf(wallet), c.decimals(), c.symbol()]);
    return { token: s, balance: ethers.formatUnits(b, d), address: token };
  } catch (err) {
    return { token: token, error: err.shortMessage || err.message };
  }
}

async function getMultiBalance(provider, wallet, tokens=[]) {
  const r = [await getWalletBalance(provider, wallet)];
  for (const t of tokens) r.push(await getWalletBalance(provider, wallet, t));
  return r;
}

module.exports = { getWalletBalance, getMultiBalance };
