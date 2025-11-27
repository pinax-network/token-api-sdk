/**
 * Tron Transfers Example - Latest USDT Transfers
 *
 * This example retrieves the latest USDT (TRC-20) transfers on the Tron network.
 * USDT Contract on Tron: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { PinaxSDK } from "@pinax/token-api";

// USDT Token Contract Address on Tron Network
const TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

async function main() {
  // Initialize the SDK with your bearer token
  const sdk = new PinaxSDK({
    bearerToken: process.env.PINAX_BEARER_TOKEN,
  });

  console.log("Fetching latest USDT transfers on Tron network...\n");

  // Get transfers using the high-level SDK
  const data = await sdk.tvm.tokens.getTransfers({
    network: "tron",
    contract: TRON_USDT_CONTRACT,
    limit: 10,
  });

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
