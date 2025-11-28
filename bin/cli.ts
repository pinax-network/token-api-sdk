#!/usr/bin/env node
/**
 * @pinax/token-api CLI
 *
 * Command line interface for the Pinax Token API.
 *
 * Usage:
 *   @pinax/token-api evm tokens transfers --network mainnet --from 0x123 --limit 10
 *   @pinax/token-api svm tokens transfers --network solana --limit 10
 *   @pinax/token-api tvm tokens transfers --network tron --limit 10
 *   @pinax/token-api monitoring health
 */

import 'dotenv/config';
import { Command } from 'commander';
import PQueue from 'p-queue';
import { TokenAPI } from '../src/index.js';

const program = new Command();

// Initialize client with environment variable support
const client = new TokenAPI({
  apiToken: process.env.TOKENAPI_KEY,
  baseUrl: process.env.TOKEN_API_BASE_URL,
});

// Global configuration for retry and pagination
interface GlobalOptions {
  maxRetries: number;
  timeoutMs: number;
  autoPaginate: boolean;
}

// Get global options from parent command chain
function getGlobalOptions(cmd: Command): GlobalOptions {
  const opts = cmd.optsWithGlobals();
  return {
    maxRetries: parseInt(opts.maxRetries, 10) || 3,
    timeoutMs: parseInt(opts.timeoutMs, 10) || 10000,
    autoPaginate: opts.autoPaginate || false,
  };
}

// Create a queue with concurrency of 1 for sequential requests
const queue = new PQueue({ concurrency: 1 });

// Helper function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Execute API request with retry logic
async function executeWithRetry<T>(
  apiCall: () => Promise<T>,
  globalOptions: GlobalOptions,
): Promise<T> {
  const { maxRetries, timeoutMs } = globalOptions;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add request to queue to ensure sequential execution
      const result = await queue.add(async () => {
        // Add timeout between requests (except for first request)
        if (attempt > 0) {
          await delay(timeoutMs);
        }
        return apiCall();
      });
      return result as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        console.error(
          `Request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${lastError.message}. Retrying in ${timeoutMs}ms...`,
        );
        await delay(timeoutMs);
      }
    }
  }

  throw lastError || new Error('Request failed after all retry attempts');
}

// Helper interface for paginated responses
interface PaginatedResponse {
  data: unknown[];
  pagination?: {
    current_page?: number;
    total_pages?: number;
    total_results?: number;
  };
}

// Execute API request with auto-pagination support
async function executeWithAutoPagination<T extends PaginatedResponse>(
  apiCall: (page: number) => Promise<T>,
  globalOptions: GlobalOptions,
  limit: number | undefined,
): Promise<T> {
  const { autoPaginate, timeoutMs } = globalOptions;

  if (!autoPaginate || !limit) {
    // If auto-paginate is disabled or no limit specified, just execute once
    return executeWithRetry(() => apiCall(1), globalOptions);
  }

  const allData: unknown[] = [];
  let currentPage = 1;
  let lastResponse: T | null = null;

  while (true) {
    const result = await executeWithRetry(
      () => apiCall(currentPage),
      globalOptions,
    );
    lastResponse = result;

    if (result.data && Array.isArray(result.data)) {
      allData.push(...result.data);

      // Check if we should continue paginating
      // Continue if results count equals limit (more data might be available)
      if (result.data.length < limit) {
        // No more data to fetch
        break;
      }

      // Add delay between pagination requests
      await delay(timeoutMs);
      currentPage++;
    } else {
      break;
    }
  }

  // Return combined response with all data
  return {
    ...lastResponse,
    data: allData,
    pagination: {
      ...lastResponse?.pagination,
      current_page: 1,
      total_results: allData.length,
    },
  } as T;
}

// Helper function to output JSON response
function outputJSON(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

// Helper function to handle errors
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
  } else {
    console.error(JSON.stringify({ error: String(error) }, null, 2));
  }
  process.exit(1);
}

// ============================================================================
// Main Program Setup
// ============================================================================
program
  .name('@pinax/token-api')
  .description(
    'Pinax Token API - Power your apps & AI agents with real-time token data',
  )
  .version('0.1.2')
  .option(
    '--max-retries <number>',
    'Maximum number of retry attempts for failed API requests.',
    process.env.MAX_RETRIES || '3',
  )
  .option(
    '--timeout-ms <number>',
    'Timeout in milliseconds between API requests.',
    process.env.TIMEOUT_MS || '10000',
  )
  .option(
    '--auto-paginate',
    'Automatically paginate through all results until less than limit are returned.',
  );

// ============================================================================
// EVM Commands
// ============================================================================
const evm = program
  .command('evm')
  .description('EVM (Ethereum Virtual Machine) operations');

// EVM Tokens subgroup
const evmTokens = evm
  .command('tokens')
  .description('Token operations on EVM networks');

evmTokens
  .command('transfers')
  .description('Get ERC-20 and native token transfers')
  .requiredOption(
    '--network <network>',
    'EVM network (mainnet, base, arbitrum-one, bsc, polygon, optimism, avalanche, unichain)',
  )
  .option('--transaction-id <id>', 'Filter by transaction ID')
  .option('--contract <address>', 'Filter by token contract address')
  .option('--from <address>', 'Filter by sender address')
  .option('--to <address>', 'Filter by recipient address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.tokens.getTransfers({
            network: options.network,
            transaction_id: options.transactionId,
            contract: options.contract,
            from_address: options.from,
            to_address: options.to,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmTokens
  .command('metadata')
  .description('Get token metadata')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--contract <address>', 'Token contract address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.tokens.getTokens({
            network: options.network,
            contract: options.contract,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmTokens
  .command('balances')
  .description('Get token balances for a wallet address')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--address <address>', 'Wallet address')
  .option('--contract <address>', 'Filter by token contract address')
  .option('--include-null-balances', 'Include zero balances')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.tokens.getBalances({
            network: options.network,
            address: options.address,
            contract: options.contract,
            include_null_balances: options.includeNullBalances,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmTokens
  .command('holders')
  .description('Get token holders')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--contract <address>', 'Token contract address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.tokens.getHolders({
            network: options.network,
            contract: options.contract,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmTokens
  .command('native-balances')
  .description('Get native token balances')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--address <address>', 'Wallet address')
  .option('--include-null-balances', 'Include zero balances')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.tokens.getNativeBalances({
            network: options.network,
            address: options.address,
            include_null_balances: options.includeNullBalances,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmTokens
  .command('historical-balances')
  .description('Get historical token balance changes in OHLCV format')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--address <address>', 'Wallet address')
  .option('--contract <address>', 'Filter by token contract address')
  .option('--interval <interval>', 'Time interval (1h, 4h, 1d, 1w)')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.tokens.getHistoricalBalances({
            network: options.network,
            address: options.address,
            contract: options.contract,
            interval: options.interval,
            start_time: options.startTime,
            end_time: options.endTime,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// EVM DEXs subgroup
const evmDexs = evm
  .command('dexs')
  .description('DEX operations on EVM networks');

evmDexs
  .command('swaps')
  .description('Get DEX swap transactions')
  .requiredOption('--network <network>', 'EVM network')
  .option('--transaction-id <id>', 'Filter by transaction ID')
  .option('--pool <address>', 'Filter by pool address')
  .option('--caller <address>', 'Filter by caller address')
  .option('--sender <address>', 'Filter by sender address')
  .option('--recipient <address>', 'Filter by recipient address')
  .option(
    '--protocol <protocol>',
    'Filter by DEX protocol (uniswap_v2, uniswap_v3)',
  )
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.dexs.getSwaps({
            network: options.network,
            transaction_id: options.transactionId,
            pool: options.pool,
            caller: options.caller,
            sender: options.sender,
            recipient: options.recipient,
            protocol: options.protocol,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmDexs
  .command('pools')
  .description('Get DEX liquidity pools')
  .requiredOption('--network <network>', 'EVM network')
  .option('--pool <address>', 'Filter by pool address')
  .option('--token0 <address>', 'Filter by token0 address')
  .option('--token1 <address>', 'Filter by token1 address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.dexs.getPools({
            network: options.network,
            pool: options.pool,
            token0: options.token0,
            token1: options.token1,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmDexs
  .command('list')
  .description('Get supported DEXs')
  .requiredOption('--network <network>', 'EVM network')
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithRetry(
        () =>
          client.evm.dexs.getDexes({
            network: options.network,
          }),
        globalOptions,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmDexs
  .command('ohlc')
  .description('Get OHLCV price data for liquidity pools')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--pool <address>', 'Pool address')
  .option('--interval <interval>', 'Time interval (1h, 4h, 1d, 1w)')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.dexs.getPoolOHLC({
            network: options.network,
            pool: options.pool,
            interval: options.interval,
            start_time: options.startTime,
            end_time: options.endTime,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// EVM NFTs subgroup
const evmNfts = evm
  .command('nfts')
  .description('NFT operations on EVM networks');

evmNfts
  .command('collections')
  .description('Get NFT collection metadata and stats')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--contract <address>', 'NFT contract address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.nfts.getCollections({
            network: options.network,
            contract: options.contract,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmNfts
  .command('holders')
  .description('Get NFT holders for a collection')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--contract <address>', 'NFT contract address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.nfts.getHolders({
            network: options.network,
            contract: options.contract,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmNfts
  .command('items')
  .description('Get NFT items with metadata')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--contract <address>', 'NFT contract address')
  .option('--token-id <id>', 'Filter by token ID')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.nfts.getItems({
            network: options.network,
            contract: options.contract,
            token_id: options.tokenId,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmNfts
  .command('ownerships')
  .description('Get NFT ownerships by wallet address')
  .requiredOption('--network <network>', 'EVM network')
  .requiredOption('--address <address>', 'Wallet address')
  .option('--contract <address>', 'Filter by NFT contract address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.nfts.getOwnerships({
            network: options.network,
            address: options.address,
            contract: options.contract,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmNfts
  .command('sales')
  .description('Get NFT sales data')
  .requiredOption('--network <network>', 'EVM network')
  .option('--contract <address>', 'Filter by NFT contract address')
  .option('--token-id <id>', 'Filter by token ID')
  .option('--buyer <address>', 'Filter by buyer address')
  .option('--seller <address>', 'Filter by seller address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.nfts.getSales({
            network: options.network,
            contract: options.contract,
            token_id: options.tokenId,
            buyer: options.buyer,
            seller: options.seller,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

evmNfts
  .command('transfers')
  .description('Get NFT transfers')
  .requiredOption('--network <network>', 'EVM network')
  .option('--transaction-id <id>', 'Filter by transaction ID')
  .option('--contract <address>', 'Filter by NFT contract address')
  .option('--token-id <id>', 'Filter by token ID')
  .option('--from <address>', 'Filter by sender address')
  .option('--to <address>', 'Filter by recipient address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.evm.nfts.getTransfers({
            network: options.network,
            transaction_id: options.transactionId,
            contract: options.contract,
            token_id: options.tokenId,
            from_address: options.from,
            to_address: options.to,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// ============================================================================
// SVM Commands
// ============================================================================
const svm = program
  .command('svm')
  .description('SVM (Solana Virtual Machine) operations');

// SVM Tokens subgroup
const svmTokens = svm
  .command('tokens')
  .description('Token operations on SVM networks');

svmTokens
  .command('transfers')
  .description('Get SPL token transfers')
  .requiredOption('--network <network>', 'SVM network (solana)')
  .option('--signature <signature>', 'Filter by transaction signature')
  .option('--mint <address>', 'Filter by token mint address')
  .option('--from <address>', 'Filter by sender address')
  .option('--to <address>', 'Filter by recipient address')
  .option('--from-owner <address>', 'Filter by sender owner address')
  .option('--to-owner <address>', 'Filter by recipient owner address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.tokens.getTransfers({
            network: options.network,
            signature: options.signature,
            mint: options.mint,
            from_address: options.from,
            to_address: options.to,
            from_owner: options.fromOwner,
            to_owner: options.toOwner,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmTokens
  .command('metadata')
  .description('Get token metadata')
  .requiredOption('--network <network>', 'SVM network')
  .requiredOption('--mint <address>', 'Token mint address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.tokens.getTokens({
            network: options.network,
            mint: options.mint,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmTokens
  .command('balances')
  .description('Get token balances for a wallet address')
  .requiredOption('--network <network>', 'SVM network')
  .requiredOption('--owner <address>', 'Wallet owner address')
  .option('--mint <address>', 'Filter by token mint address')
  .option('--include-null-balances', 'Include zero balances')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.tokens.getBalances({
            network: options.network,
            owner: options.owner,
            mint: options.mint,
            include_null_balances: options.includeNullBalances,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmTokens
  .command('native-balances')
  .description('Get native SOL balances')
  .requiredOption('--network <network>', 'SVM network')
  .requiredOption('--address <address>', 'Wallet address')
  .option('--include-null-balances', 'Include zero balances')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.tokens.getNativeBalances({
            network: options.network,
            address: options.address,
            include_null_balances: options.includeNullBalances,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmTokens
  .command('holders')
  .description('Get token holders')
  .requiredOption('--network <network>', 'SVM network')
  .requiredOption('--mint <address>', 'Token mint address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.tokens.getHolders({
            network: options.network,
            mint: options.mint,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmTokens
  .command('owner')
  .description('Get account owner lookup')
  .requiredOption('--network <network>', 'SVM network')
  .requiredOption('--account <address>', 'Account address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.tokens.getAccountOwner({
            network: options.network,
            account: options.account,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// SVM DEXs subgroup
const svmDexs = svm
  .command('dexs')
  .description('DEX operations on SVM networks');

svmDexs
  .command('swaps')
  .description('Get DEX swap transactions')
  .requiredOption('--network <network>', 'SVM network')
  .option('--signature <signature>', 'Filter by transaction signature')
  .option('--amm <address>', 'Filter by AMM address')
  .option('--amm-pool <address>', 'Filter by AMM pool address')
  .option('--user <address>', 'Filter by user address')
  .option('--input-mint <address>', 'Filter by input mint address')
  .option('--output-mint <address>', 'Filter by output mint address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.dexs.getSwaps({
            network: options.network,
            signature: options.signature,
            amm: options.amm,
            amm_pool: options.ammPool,
            user: options.user,
            input_mint: options.inputMint,
            output_mint: options.outputMint,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmDexs
  .command('pools')
  .description('Get DEX liquidity pools')
  .requiredOption('--network <network>', 'SVM network')
  .option('--amm-pool <address>', 'Filter by AMM pool address')
  .option('--base-mint <address>', 'Filter by base mint address')
  .option('--quote-mint <address>', 'Filter by quote mint address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.dexs.getPools({
            network: options.network,
            amm_pool: options.ammPool,
            base_mint: options.baseMint,
            quote_mint: options.quoteMint,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmDexs
  .command('list')
  .description('Get supported DEXs')
  .requiredOption('--network <network>', 'SVM network')
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithRetry(
        () =>
          client.svm.dexs.getDexes({
            network: options.network,
          }),
        globalOptions,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

svmDexs
  .command('ohlc')
  .description('Get OHLCV price data for liquidity pools')
  .requiredOption('--network <network>', 'SVM network')
  .requiredOption('--amm-pool <address>', 'AMM pool address')
  .option('--interval <interval>', 'Time interval (1h, 4h, 1d, 1w)')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.svm.dexs.getPoolOHLC({
            network: options.network,
            amm_pool: options.ammPool,
            interval: options.interval,
            start_time: options.startTime,
            end_time: options.endTime,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// ============================================================================
// TVM Commands
// ============================================================================
const tvm = program
  .command('tvm')
  .description('TVM (Tron Virtual Machine) operations');

// TVM Tokens subgroup
const tvmTokens = tvm
  .command('tokens')
  .description('Token operations on TVM networks');

tvmTokens
  .command('transfers')
  .description('Get TRC-20 token transfers')
  .requiredOption('--network <network>', 'TVM network (tron)')
  .option('--transaction-id <id>', 'Filter by transaction ID')
  .option('--contract <address>', 'Filter by token contract address')
  .option('--from <address>', 'Filter by sender address')
  .option('--to <address>', 'Filter by recipient address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.tvm.tokens.getTransfers({
            network: options.network,
            transaction_id: options.transactionId,
            contract: options.contract,
            from_address: options.from,
            to_address: options.to,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

tvmTokens
  .command('native-transfers')
  .description('Get native TRX transfers')
  .requiredOption('--network <network>', 'TVM network')
  .option('--transaction-id <id>', 'Filter by transaction ID')
  .option('--from <address>', 'Filter by sender address')
  .option('--to <address>', 'Filter by recipient address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.tvm.tokens.getNativeTransfers({
            network: options.network,
            transaction_id: options.transactionId,
            from_address: options.from,
            to_address: options.to,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

tvmTokens
  .command('metadata')
  .description('Get token metadata')
  .requiredOption('--network <network>', 'TVM network')
  .requiredOption('--contract <address>', 'Token contract address')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.tvm.tokens.getTokens({
            network: options.network,
            contract: options.contract,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// TVM DEXs subgroup
const tvmDexs = tvm
  .command('dexs')
  .description('DEX operations on TVM networks');

tvmDexs
  .command('swaps')
  .description('Get DEX swap transactions')
  .requiredOption('--network <network>', 'TVM network')
  .option('--transaction-id <id>', 'Filter by transaction ID')
  .option('--pool <address>', 'Filter by pool address')
  .option('--caller <address>', 'Filter by caller address')
  .option('--sender <address>', 'Filter by sender address')
  .option('--recipient <address>', 'Filter by recipient address')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--start-block <block>', 'Start block number', parseInt)
  .option('--end-block <block>', 'End block number', parseInt)
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.tvm.dexs.getSwaps({
            network: options.network,
            transaction_id: options.transactionId,
            pool: options.pool,
            caller: options.caller,
            sender: options.sender,
            recipient: options.recipient,
            start_time: options.startTime,
            end_time: options.endTime,
            start_block: options.startBlock,
            end_block: options.endBlock,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

tvmDexs
  .command('list')
  .description('Get supported DEXs')
  .requiredOption('--network <network>', 'TVM network')
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithRetry(
        () =>
          client.tvm.dexs.getDexes({
            network: options.network,
          }),
        globalOptions,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

tvmDexs
  .command('ohlc')
  .description('Get OHLCV price data for liquidity pools')
  .requiredOption('--network <network>', 'TVM network')
  .requiredOption('--pool <address>', 'Pool address')
  .option('--interval <interval>', 'Time interval (1h, 4h, 1d, 1w)')
  .option('--start-time <time>', 'Start time (ISO 8601)')
  .option('--end-time <time>', 'End time (ISO 8601)')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(async function (options) {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithAutoPagination(
        (page) =>
          client.tvm.dexs.getPoolOHLC({
            network: options.network,
            pool: options.pool,
            interval: options.interval,
            start_time: options.startTime,
            end_time: options.endTime,
            page: options.page ?? page,
            limit: options.limit,
          }),
        globalOptions,
        options.limit,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// ============================================================================
// Monitoring Commands
// ============================================================================
const monitoring = program
  .command('monitoring')
  .description('API monitoring and status');

monitoring
  .command('health')
  .description('Check API health status')
  .action(async function () {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithRetry(
        () => client.getHealth(),
        globalOptions,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

monitoring
  .command('version')
  .description('Get API version information')
  .action(async function () {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithRetry(
        () => client.getVersion(),
        globalOptions,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

monitoring
  .command('networks')
  .description('Get list of supported networks')
  .action(async function () {
    const globalOptions = getGlobalOptions(this);
    try {
      const result = await executeWithRetry(
        () => client.getNetworks(),
        globalOptions,
      );
      outputJSON(result);
    } catch (error) {
      handleError(error);
    }
  });

// ============================================================================
// Parse CLI arguments
// ============================================================================
program.parse(process.argv);
