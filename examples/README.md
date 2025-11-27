# Token API Examples

This folder contains TypeScript examples demonstrating how to use the `@pinax/token-api` to access blockchain token data.

## Prerequisites

1. Get your API key from [The Graph Market](https://thegraph.market)
2. Set your API key as an environment variable:

   ```bash
   export PINAX_API_KEY="your-api-key"
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
