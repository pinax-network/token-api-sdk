/**
 * Solana Swaps Example - 100 Most Recent Swaps
 *
 * This example retrieves the 100 most recent swap transactions on Solana.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { PinaxSDK } from "@pinax/token-api";

async function main() {
  // Initialize the SDK with your bearer token
  const sdk = new PinaxSDK({
    bearerToken: process.env.PINAX_BEARER_TOKEN,
  });

  console.log("Fetching 100 most recent swaps on Solana...\n");

  // Get swaps using the high-level SDK
  const data = await sdk.svm.dexs.getSwaps({
    network: "solana",
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
