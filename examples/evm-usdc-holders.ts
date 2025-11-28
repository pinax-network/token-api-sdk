/**
 * EVM Balances Example - Top holders of USDC
 *
 * This example retrieves the top holders of the USDC token on Ethereum mainnet.
 * USDC Contract: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { TokenAPI } from '@pinax/token-api';

// USDC Token Contract Address on Ethereum Mainnet
const USDC_CONTRACT = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

async function main() {
  // Initialize the client with your bearer token
  const client = new TokenAPI({
    apiToken: process.env.TOKENAPI_KEY,
  });

  console.log('Fetching top USDC holders on Ethereum mainnet...\n');

  // Get top holders of USDC
  const holders = await client.evm.tokens.getHolders({
    network: 'mainnet',
    contract: USDC_CONTRACT,
    limit: 10,
  });

  console.log(`Found ${holders.data?.length ?? 0} top USDC holders:\n`);

  for (const holder of holders.data ?? []) {
    console.log(`
      Address: ${holder.address}
      Balance: ${holder.value} ${holder.symbol}
      Contract: ${holder.contract}
    `);
  }
}

main().catch(console.error);
