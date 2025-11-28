/**
 * Tron Transfers Example - USDT Transfers
 *
 * This example retrieves USDT (TRC-20) transfers on the Tron network.
 * USDT Contract on Tron: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 */

import { TokenAPI } from '@pinax/token-api';

// USDT Token Contract Address on Tron Network
const TRON_USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

async function main() {
  // Initialize the client with your bearer token
  const client = new TokenAPI({
    apiToken: process.env.GRAPH_API_TOKEN,
  });

  console.log('Fetching USDT transfers on Tron network...\n');

  // Get transfers using the high-level client
  const data = await client.tvm.tokens.getTransfers({
    network: 'tron',
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
