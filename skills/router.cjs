const { getWalletBalance, getMultiBalance } = require("./balance.cjs");
const { getTokenPrice } = require("./price.cjs");
const { executeSwap, getSwapHistory } = require("./swap.cjs");

const SKILLS = {
  balance: {
    name: "Wallet Balance",
    description: "Get native or ERC20 token balances",
    handler: async (provider, params) => getMultiBalance(provider, params.wallet, params.tokens || [])
  },
  price: {
    name: "On-chain Price Feed",
    description: "Get real-time token prices from DEX",
    handler: async (provider, params) => getTokenPrice(provider, params.tokenA, params.tokenB)
  },
  swap: {
    name: "Token Swap",
    description: "Execute token swap via smart contract",
    handler: async (provider, params) => executeSwap(params.signer, params.tokenIn, params.tokenOut, params.amountIn, params.slippage)
  },
  history: {
    name: "Swap History",
    description: "Get on-chain swap history for wallet",
    handler: async (provider, params) => getSwapHistory(provider, params.wallet)
  }
};

async function routeSkill(provider, intent, params) {
  console.log(`\n[Router] Intent: "${intent}"`);
  const i = intent.toLowerCase();
  const skillKey =
    i.includes("history") || i.includes("past") ? "history" :
    i.includes("balance") || i.includes("wallet") ? "balance" :
    i.includes("price") || i.includes("rate") ? "price" :
    i.includes("swap") || i.includes("trade") ? "swap" : null;

  if (!skillKey) return { error: "Unknown intent", available: Object.keys(SKILLS) };

  const skill = SKILLS[skillKey];
  console.log(`[Router] → ${skill.name}`);
  const start = Date.now();
  const result = await skill.handler(provider, params);
  return { skill: skillKey, skillName: skill.name, result, executionTime: `${Date.now()-start}ms`, timestamp: new Date().toISOString() };
}

function listSkills() {
  return Object.entries(SKILLS).map(([key, s]) => ({ key, name: s.name, description: s.description }));
}

module.exports = { routeSkill, listSkills };
