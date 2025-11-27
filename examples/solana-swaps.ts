/**
 * Solana Swaps Example - 100 Most Recent Swaps
 *
 * This example retrieves the 100 most recent swap transactions on Solana.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { createPinaxClient } from "@pinax/sdk";

async function main() {
  // Initialize the low-level client with your bearer token
  const client = createPinaxClient({
    bearerToken: process.env.PINAX_BEARER_TOKEN,
  });

  console.log("Fetching 100 most recent swaps on Solana...\n");

  // Get swaps using the low-level client
  const { data, error } = await client.GET("/v1/svm/swaps", {
    params: {
      query: {
        network: "solana",
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
