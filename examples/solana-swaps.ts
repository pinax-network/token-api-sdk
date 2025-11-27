/**
 * Solana Swaps Example - 100 Most Recent Swaps
 *
 * This example retrieves the 100 most recent swap transactions on Solana.
 *
 * Note: This example uses the low-level client to demonstrate the API pattern
 * for SVM networks. The endpoint will be available when the Token API adds
 * full support for Solana DEX operations.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { createPinaxClient } from "@pinax/sdk";

async function main() {
  // Initialize the low-level client with your API key
  const client = createPinaxClient({
    apiKey: process.env.PINAX_API_KEY,
  });

  console.log("Fetching 100 most recent swaps on Solana...\n");

  // Get swaps using the low-level client
  // This demonstrates the expected API pattern for SVM swaps
  const { data, error } = await client.GET("/v1/svm/swaps" as "/v1/evm/swaps", {
    params: {
      query: {
        limit: 100,
        order: "DESC",
      },
    },
  });

  if (error) {
    console.error("Error fetching swaps:", error);
    return;
  }

  console.log(`Found ${data?.data?.length ?? 0} swaps:\n`);

  for (const swap of data?.data ?? []) {
    console.log(`
      Block: ${swap.block_num}
      Time: ${swap.datetime}
      Pool: ${swap.pool}
      Input: ${swap.input_value} ${swap.input_token?.symbol}
      Output: ${swap.output_value} ${swap.output_token?.symbol}
      Protocol: ${swap.protocol}
      Transaction: ${swap.transaction_id}
    `);
  }
}

main().catch(console.error);
