# Token API `@pinax/token-api`

> Power your apps & AI agents with real-time token data.

[![npm version](https://img.shields.io/npm/v/@pinax/token-api.svg)](https://www.npmjs.com/package/@pinax/token-api)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

The `@pinax/token-api` provides a type-safe TypeScript client for [The Graph's Token API](https://thegraph.com/docs/en/token-api/quick-start/). Access blockchain token information including:

- **Token Transfers** - ERC-20 and native token transfers
- **DEX Swaps** - Uniswap and other DEX swap events
- **Token Metadata** - Symbol, name, decimals, supply
- **Balances** - Real-time token holdings
- **Prices** - Current USD prices and OHLCV data
- **Liquidity Pools** - DEX pool information

### Supported Networks

The SDK provides typed chain constants for type-safe network selection:

- **EVM Chains**: Ethereum, ArbitrumOne, Unichain, Base, Optimism, Polygon, BNB Chain & Avalanche.
- **Solana**: Mainnet.
- **Tron**: Mainnet.

## Quick Start

### Installation

```bash
npm install @pinax/token-api
```

### Authentication

Get your API key from [The Graph Market](https://thegraph.market).

```typescript
const client = new TokenAPI({
  apiToken: "YOUR_API_KEY_HERE" // or set TOKENAPI_KEY in your environment
});
```

### Basic Usage

```typescript
import { TokenAPI, EVMChains } from "@pinax/token-api";

const client = new TokenAPI({
  apiToken: "YOUR_API_KEY_HERE"
});

// Get EVM token transfers using chain constants
const transfers = await client.evm.tokens.getTransfers({
  network: EVMChains.Ethereum,
  limit: 10,
});

console.log(transfers.data);
```

## Examples

### Get EVM Transfers

Retrieve ERC-20 and native token transfers for a specific address:

```typescript
// Get transfers to Vitalik's address
const transfers = await client.evm.tokens.getTransfers({
  network: EVMChains.Ethereum,
  to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // Vitalik's address
  limit: 10,
});

for (const transfer of transfers.data ?? []) {
  console.log(`
    Block: ${transfer.block_num}
    From: ${transfer.from}
    To: ${transfer.to}
    Token: ${transfer.symbol} (${transfer.contract})
    Amount: ${transfer.value}
  `);
}
```

### Get EVM Swaps

Retrieve DEX swap events from Uniswap and other protocols:

```typescript
// Get swaps from the USDC/WETH pool
const swaps = await client.evm.dexs.getSwaps({
  network: EVMChains.Ethereum,
  pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // Uniswap V3 USDC/WETH pool
  limit: 10,
});

for (const swap of swaps.data ?? []) {
  console.log(`
    Block: ${swap.block_num}
    Pool: ${swap.pool}
    Input: ${swap.input_value} ${swap.input_token?.symbol}
    Output: ${swap.output_value} ${swap.output_token?.symbol}
    Protocol: ${swap.protocol}
    Summary: ${swap.summary}
  `);
}
```

### Get Token Balances

```typescript
// Get token balances for a wallet
const balances = await client.evm.tokens.getBalances({
  network: EVMChains.Ethereum,
  address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // Vitalik's address
});

for (const balance of balances.data ?? []) {
  console.log(`${balance.symbol}: ${balance.value}`);
}
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/pinax-network/token-api-sdk.git
cd token-api-sdk

# Install dependencies
bun install

# Generate types from OpenAPI spec
bun run generate

# Build the package
bun run build
```

## Related Resources

- [Token API Documentation](https://thegraph.com/docs/en/token-api/quick-start/)
- [The Graph Market](https://thegraph.market) - Get your API key
- [Token API Repository](https://github.com/pinax-network/token-api)

## License

Apache 2.0 - see [LICENSE](LICENSE) for details.
