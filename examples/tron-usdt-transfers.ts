/**
 * Tron Transfers Example - Latest USDT Transfers
 *
 * This example retrieves the latest USDT (TRC-20) transfers on the Tron network.
 * USDT Contract on Tron: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
 *
 * Note: This example uses the low-level client to demonstrate the API pattern
 * for TVM networks. The endpoint will be available when the Token API adds
 * full support for Tron token operations.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { createPinaxClient } from "@pinax/sdk";

// USDT Token Contract Address on Tron Network
const TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

async function main() {
  // Initialize the low-level client with your bearer token
  const client = createPinaxClient({
    bearerToken: process.env.PINAX_BEARER_TOKEN,
  });

  console.log("Fetching latest USDT transfers on Tron network...\n");

  // Get transfers using the low-level client
  // Note: Using type assertion because the TVM endpoint follows the same pattern as EVM
  // The "/v1/tvm/transfers" endpoint will be available when TVM support is fully released
  const { data, error } = await client.GET("/v1/tvm/transfers" as "/v1/evm/transfers", {
    params: {
      query: {
        contract: TRON_USDT_CONTRACT,
        limit: 10,
        order: "DESC",
      },
    },
  });

  if (error) {
    console.error("Error fetching transfers:", error);
    return;
  }

  console.log(`Found ${data?.data?.length ?? 0} USDT transfers:\n`);

  for (const transfer of data?.data ?? []) {
    console.log(`
      Block: ${transfer.block_num}
      Time: ${transfer.datetime}
      From: ${transfer.from}
      To: ${transfer.to}
      Amount: ${transfer.value} ${transfer.symbol}
      Transaction: ${transfer.transaction_id}
    `);
  }
}

main().catch(console.error);
