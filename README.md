# @pinax/token-api

Pinax Token API - Power your apps & AI agents with real-time token data.

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

#### EVM Networks

| Network | ID |
|---------|-----|
| Ethereum Mainnet | `mainnet` |
| Base | `base` |
| Arbitrum One | `arbitrum-one` |
| BNB Smart Chain | `bsc` |
| Polygon | `polygon` |
| Optimism | `optimism` |
| Avalanche | `avalanche` |
| Unichain | `unichain` |

#### SVM Networks

| Network | ID |
|---------|-----|
| Solana | `solana` |

#### TVM Networks

| Network | ID |
|---------|-----|
| Tron | `tron` |

## Quick Start

### Installation

```bash
# Using Bun (recommended)
bun add @pinax/token-api

# Using npm
npm install @pinax/token-api

# Using yarn
yarn add @pinax/token-api

# Using pnpm
pnpm add @pinax/token-api
```

### Authentication

Get your API key from [The Graph Market](https://thegraph.market).

The SDK automatically loads environment variables from `.env` files using [dotenv](https://github.com/motdotla/dotenv). You can configure authentication via:

**Option 1: Environment variables (recommended)**

Create a `.env` file in your project root:

```env
PINAX_BEARER_TOKEN=your-token
```

**Option 2: Direct configuration**

Pass the bearer token directly to the SDK:

```typescript
const sdk = new PinaxSDK({
  bearerToken: "your-token",
});
```

**Supported environment variables:**

| Variable | Description |
|----------|-------------|
| `PINAX_BEARER_TOKEN` | Bearer token for authentication |
| `PINAX_BASE_URL` | Custom base URL for the API |

### Basic Usage

```typescript
import { PinaxSDK } from "@pinax/token-api";

// Initialize the SDK (uses PINAX_BEARER_TOKEN from .env automatically)
const sdk = new PinaxSDK();

// Get EVM token transfers
const transfers = await sdk.evm.tokens.getTransfers({
  network: "mainnet",
  limit: 10,
});

console.log(transfers.data);
```

## Examples

### Get EVM Transfers

Retrieve ERC-20 and native token transfers for a specific address:

```typescript
import { PinaxSDK } from "@pinax/token-api";

// Uses PINAX_API_KEY from .env automatically
const sdk = new PinaxSDK();

// Get transfers to Vitalik's address
const transfers = await sdk.evm.tokens.getTransfers({
  network: "mainnet",
  to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
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
import { PinaxSDK } from "@pinax/token-api";

const sdk = new PinaxSDK();

// Get swaps from the USDC/WETH pool
const swaps = await sdk.evm.dexs.getSwaps({
  network: "mainnet",
  pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
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
import { PinaxSDK } from "@pinax/token-api";

const sdk = new PinaxSDK();

// Get token balances for a wallet
const balances = await sdk.evm.tokens.getBalances({
  network: "mainnet",
  owner: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
});

for (const balance of balances.data ?? []) {
  console.log(`${balance.symbol}: ${balance.value}`);
}
```

### Get Token Prices

```typescript
import { PinaxSDK } from "@pinax/token-api";

const sdk = new PinaxSDK();

// Get token prices
const prices = await sdk.evm.tokens.getPrices({
  network: "mainnet",
  contract: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
});

for (const price of prices.data ?? []) {
  console.log(`${price.symbol}: $${price.price_usd}`);
}
```

## Advanced Usage

### Using the Low-Level Client

For more control, you can use the underlying `openapi-fetch` client:

```typescript
import { createPinaxClient } from "@pinax/token-api";

// Uses PINAX_BEARER_TOKEN from .env, or pass explicitly
const client = createPinaxClient();

// Direct API call with full type safety
const { data, error, response } = await client.GET("/v1/evm/transfers", {
  params: {
    query: {
      network: "mainnet",
      to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      limit: 10,
    },
  },
});

if (error) {
  console.error("Error:", error);
} else {
  console.log("Transfers:", data?.data);
}
```

### Custom Base URL

```typescript
const sdk = new PinaxSDK({
  bearerToken: "your-token",
  baseUrl: "https://your-custom-endpoint.com",
});
```

## API Reference

### SDK Structure

The SDK is organized by blockchain type (EVM, SVM, TVM) and category (tokens, dexs, nfts):

```typescript
sdk.evm.tokens     // EVM token operations
sdk.evm.dexs       // EVM DEX operations
sdk.evm.nfts       // EVM NFT operations

sdk.svm.tokens     // SVM token operations
sdk.svm.dexs       // SVM DEX operations
sdk.svm.nfts       // SVM NFT operations

sdk.tvm.tokens     // TVM token operations
sdk.tvm.dexs       // TVM DEX operations
sdk.tvm.nfts       // TVM NFT operations
```

### EVM Tokens Methods

| Method | Description |
|--------|-------------|
| `sdk.evm.tokens.getTransfers(params?)` | Get ERC-20 and native token transfers |
| `sdk.evm.tokens.getTokens(params?)` | Get token metadata |
| `sdk.evm.tokens.getBalances(params)` | Get token balances for a wallet |
| `sdk.evm.tokens.getHolders(params)` | Get token holders |
| `sdk.evm.tokens.getPrices(params?)` | Get current token prices |
| `sdk.evm.tokens.getOhlc(params)` | Get OHLCV candlestick data |

### EVM DEXs Methods

| Method | Description |
|--------|-------------|
| `sdk.evm.dexs.getSwaps(params?)` | Get DEX swap transactions |
| `sdk.evm.dexs.getPools(params?)` | Get DEX liquidity pools |

### System Methods (Root Level)

| Method | Description |
|--------|-------------|
| `sdk.getHealth()` | Check API health status |
| `sdk.getVersion()` | Get API version information |
| `sdk.getNetworks()` | Get list of supported networks |

## Types

All types are exported for TypeScript users:

```typescript
import type {
  Transfer,
  Swap,
  Token,
  Balance,
  Holder,
  Price,
  Ohlc,
  Pool,
  EvmNetwork,
  SvmNetwork,
  TvmNetwork,
  DexProtocol,
  OhlcInterval,
} from "@pinax/token-api";
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/pinax-network/pinax-token-api-sdk.git
cd pinax-token-api-sdk

# Install dependencies
bun install

# Generate types from OpenAPI spec
bun run generate

# Build the package
bun run build
```

### Running Type Checks

```bash
bun run typecheck
```

## Related Resources

- [Token API Documentation](https://thegraph.com/docs/en/token-api/quick-start/)
- [The Graph Market](https://thegraph.market) - Get your API key
- [Token API Repository](https://github.com/pinax-network/token-api)

## License

Apache 2.0 - see [LICENSE](LICENSE) for details.
