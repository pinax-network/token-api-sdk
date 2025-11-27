# Pinax SDK Examples

This folder contains TypeScript examples demonstrating how to use the `@pinax/sdk` to access blockchain token data.

## Prerequisites

1. Get your API key from [The Graph Market](https://thegraph.market)
2. Set your API key as an environment variable:
   ```bash
   export PINAX_API_KEY="your-api-key"
   ```

## Available Examples

### EVM Examples

#### [evm-usdc-holders.ts](./evm-usdc-holders.ts)
Get the top holders of USDC on Ethereum mainnet.
```bash
bun run examples/evm-usdc-holders.ts
```

#### [evm-ohlc.ts](./evm-ohlc.ts)
Get OHLC (candlestick) price data for the USDT/ETH Uniswap V3 pool.
```bash
bun run examples/evm-ohlc.ts
```

### Tron Examples

#### [tron-usdt-transfers.ts](./tron-usdt-transfers.ts)
Get the latest USDT (TRC-20) transfers on the Tron network.
```bash
bun run examples/tron-usdt-transfers.ts
```

### Solana Examples

#### [solana-swaps.ts](./solana-swaps.ts)
Get the 100 most recent swap transactions on Solana.
```bash
bun run examples/solana-swaps.ts
```

## Running Examples

You can run any example using Bun, Node.js with tsx, or any TypeScript runtime:

```bash
# Using Bun (recommended)
bun run examples/<example-name>.ts

# Using Node.js with tsx
npx tsx examples/<example-name>.ts
```

## Notes

- EVM examples (Ethereum, Base, Arbitrum, etc.) are fully supported
- Tron and Solana examples demonstrate the intended API patterns for TVM and SVM networks
