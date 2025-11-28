/**
 * Solana Swaps Example - 100 Most Recent Swaps
 *
 * This example retrieves the 100 most recent swap transactions on Solana.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { TokenAPI } from '@pinax/token-api';

async function main() {
  // Initialize the client with your bearer token
  const client = new TokenAPI({
    apiToken: process.env.TOKENAPI_KEY,
  });

  console.log('Fetching 100 most recent swaps on Solana...\n');

  // Get swaps using the high-level client
  const data = await client.svm.dexs.getSwaps({
    network: 'solana',
    limit: 10,
  });

  console.log(`Found ${data?.data?.length ?? 0} swaps:\n`);

  for (const swap of data?.data ?? []) {
    console.log(`
      Block: ${swap.block_num}
      Time: ${swap.datetime}
      Pool: ${swap.amm_pool}
      Input: ${swap.input_amount} ${swap.input_mint}
      Output: ${swap.output_amount} ${swap.output_mint}
      Signature: ${swap.signature}
    `);
  }
}

main().catch(console.error);
