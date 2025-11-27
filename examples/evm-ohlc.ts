/**
 * EVM OHLC Example - USDT/ETH Uniswap V3 Price Data
 *
 * This example retrieves OHLC (Open, High, Low, Close) candlestick data
 * for the USDT/ETH trading pair from Uniswap V3.
 *
 * Pool Contract: 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36 (USDT/ETH Uniswap V3)
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { PinaxSDK } from "@pinax/sdk";

// USDT/ETH Uniswap V3 Pool Contract Address
const USDT_ETH_POOL = "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36";

async function main() {
  // Initialize the SDK with your API key
  const sdk = new PinaxSDK({
    apiKey: process.env.PINAX_API_KEY,
  });

  console.log("Fetching OHLC data for USDT/ETH Uniswap V3 pool...\n");

  // Get OHLC candlestick data
  const ohlc = await sdk.evm.tokens.getOhlc({
    network: "mainnet",
    contract: USDT_ETH_POOL,
    interval: "1h", // 1 hour candles
    limit: 24, // Last 24 hours
  });

  console.log(`Found ${ohlc.data?.length ?? 0} OHLC candles:\n`);

  for (const candle of ohlc.data ?? []) {
    console.log(`
      Time: ${candle.datetime}
      Open:  $${candle.open}
      High:  $${candle.high}
      Low:   $${candle.low}
      Close: $${candle.close}
      Volume: ${candle.volume}
    `);
  }
}

main().catch(console.error);
