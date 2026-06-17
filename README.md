# Pharos DeFi AI Skills

Modular AI Agent Skill framework for the Pharos ecosystem.

## Overview

This project has two parts: a working on-chain AI agent and a visual swarm dashboard.

1. AI Skills Agent (agent/, skills/) - real Node.js agent connecting to Pharos Atlantic Testnet for wallet balances, network stats, and swap history.

2. Pharos DeFAI Swarm (src/) - React + Three.js visual dashboard simulating an autonomous AI agent network.

## Features

- Wallet Balance Skill - native PHRS and ERC20 token balances
- On-chain Price Feed Skill - block number, gas price, network stats
- Token Swap Skill - swap execution via smart contract
- Swap History Skill - on-chain activity tracking
- AI Routing Logic - routes intent to correct skill
- Visual Swarm Dashboard - animated multi-agent network UI

## Network

Network: Pharos Atlantic Testnet
Chain ID: 688689

## Smart Contract

Contract Address: 0x6E7454907D72bd5eff1e93b4f37CD57Dc527D809

## Project Structure

agent - main agent entry point
skills - balance, price, swap, router modules
contracts - deployed Solidity contract and ABI
src - React Three.js dashboard frontend

## Run the Agent

npm install
node agent/index.cjs

## Run the Dashboard

npm install
npm run dev

Live demo: https://pharos-swarm.vercel.app

## Built For

Pharos Skill-to-Agent Hackathon 2026
