/**
 * @pinax/token-api - Pinax Token API
 *
 * Power your apps & AI agents with real-time token data.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 * @license Apache-2.0
 */

import createClient, { type Middleware } from 'openapi-fetch';
import type { paths, components } from './openapi.d.ts';

// Re-export types
export type * from './openapi.d.ts';

// Constants
export const DEFAULT_BASE_URL = 'https://token-api.thegraph.com';

// Type aliases for convenience
export type Transfer = components['schemas']['Transfer'];
export type Swap = components['schemas']['Swap'];
export type Token = components['schemas']['Token'];
export type Balance = components['schemas']['Balance'];
export type Holder = components['schemas']['Holder'];
export type Pool = components['schemas']['Pool'];
export type TokenInfo = components['schemas']['TokenInfo'];
export type UsageInfo = components['schemas']['UsageInfo'];
export type PaginationInfo = components['schemas']['PaginationInfo'];

// Response types
export type TransfersResponse = components['schemas']['TransfersResponse'];
export type SwapsResponse = components['schemas']['SwapsResponse'];
export type TokensResponse = components['schemas']['TokensResponse'];
export type BalancesResponse = components['schemas']['BalancesResponse'];
export type HoldersResponse = components['schemas']['HoldersResponse'];
export type PoolsResponse = components['schemas']['PoolsResponse'];

// Network types
export type EvmNetwork =
  | 'mainnet'
  | 'base'
  | 'arbitrum-one'
  | 'bsc'
  | 'polygon'
  | 'optimism'
  | 'avalanche'
  | 'unichain';

export type SvmNetwork = 'solana';

export type TvmNetwork = 'tron';

export type DexProtocol = 'uniswap_v2' | 'uniswap_v3';

/**
 * EVM chain identifiers for network parameter.
 * Use these constants instead of raw strings for type safety.
 *
 * @example
 * ```typescript
 * import { TokenAPI, EVMChains } from "@pinax/token-api";
 *
 * const client = new TokenAPI();
 * const transfers = await client.evm.tokens.getTransfers({
 *   network: EVMChains.Ethereum,
 *   limit: 10,
 * });
 * ```
 */
export const EVMChains = {
  /** Ethereum Mainnet (alias for 'mainnet') */
  Ethereum: 'mainnet',
  /** Base */
  Base: 'base',
  /** Arbitrum One */
  ArbitrumOne: 'arbitrum-one',
  /** BNB Smart Chain */
  BSC: 'bsc',
  /** Polygon */
  Polygon: 'polygon',
  /** Optimism */
  Optimism: 'optimism',
  /** Avalanche */
  Avalanche: 'avalanche',
  /** Unichain */
  Unichain: 'unichain',
} as const satisfies Record<string, EvmNetwork>;

/**
 * SVM (Solana Virtual Machine) chain identifiers for network parameter.
 * Use these constants instead of raw strings for type safety.
 *
 * @example
 * ```typescript
 * import { TokenAPI, SVMChains } from "@pinax/token-api";
 *
 * const client = new TokenAPI();
 * const transfers = await client.svm.tokens.getTransfers({
 *   network: SVMChains.Solana,
 *   limit: 10,
 * });
 * ```
 */
export const SVMChains = {
  /** Solana */
  Solana: 'solana',
} as const satisfies Record<string, SvmNetwork>;

/**
 * TVM (Tron Virtual Machine) chain identifiers for network parameter.
 * Use these constants instead of raw strings for type safety.
 *
 * @example
 * ```typescript
 * import { TokenAPI, TVMChains } from "@pinax/token-api";
 *
 * const client = new TokenAPI();
 * const transfers = await client.tvm.tokens.getTransfers({
 *   network: TVMChains.Tron,
 *   limit: 10,
 * });
 * ```
 */
export const TVMChains = {
  /** Tron */
  Tron: 'tron',
} as const satisfies Record<string, TvmNetwork>;

/**
 * Configuration options for the Pinax SDK client
 */
export interface PinaxClientOptions {
  /**
   * Bearer token for authentication.
   * Get your API token at https://thegraph.market
   *
   * Required for most API endpoints. Some monitoring endpoints
   * like health, version, and networks may work without authentication.
   */
  apiToken?: string;

  /**
   * Base URL for the API (defaults to production)
   */
  baseUrl?: string;

  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;
}

/**
 * Create a middleware that adds authentication headers and referrer
 */
function createAuthMiddleware(options: PinaxClientOptions): Middleware {
  const apiToken = options.apiToken;

  return {
    async onRequest({ request }) {
      if (apiToken) {
        request.headers.set('Authorization', `Bearer ${apiToken}`);
      }
      request.headers.set('Referer', '@pinax/token-api');
      return request;
    },
  };
}

/**
 * Create a Pinax Token API client for accessing the Token API
 *
 * @example
 * ```typescript
 * import { createAPIClient } from "@pinax/token-api";
 *
 * const client = createAPIClient({
 *   apiToken: "your-api-token-jwt"
 * });
 *
 * // Get token transfers
 * const { data, error } = await client.GET("/v1/evm/transfers", {
 *   params: {
 *     query: {
 *       network: "mainnet",
 *       to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
 *       limit: 10
 *     }
 *   }
 * });
 *
 * if (data) {
 *   console.log("Transfers:", data.data);
 * }
 * ```
 */
export function createAPIClient(options: PinaxClientOptions = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  const client = createClient<paths>({
    baseUrl,
    fetch: options.fetch,
  });

  // Add authentication middleware
  client.use(createAuthMiddleware(options));

  return client;
}

/**
 * Helper function to handle API responses and errors
 */
function handleResponse<T>(data: T | undefined | null, error: unknown): T {
  if (error) {
    throw new Error(`API Error: ${JSON.stringify(error)}`);
  }
  if (data === undefined || data === null) {
    throw new Error('API Error: No data returned');
  }
  return data;
}

/**
 * EVM Tokens API - Token operations on EVM networks
 */
class EvmTokens {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get ERC-20 and native token transfers
   */
  async getTransfers(params: {
    network: EvmNetwork;
    transaction_id?: string;
    contract?: string;
    from_address?: string;
    to_address?: string;
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/transfers', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token metadata
   */
  async getTokens(params: {
    network: EvmNetwork;
    contract: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/tokens', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token balances for a wallet address
   */
  async getBalances(params: {
    network: EvmNetwork;
    address: string | string[];
    contract?: string | string[];
    include_null_balances?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/balances', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token holders
   */
  async getHolders(params: {
    network: EvmNetwork;
    contract: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/holders', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get native token balances for wallet addresses
   */
  async getNativeBalances(params: {
    network: EvmNetwork;
    address: string | string[];
    include_null_balances?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/balances/native', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get historical token balance changes over time in OHLCV format
   */
  async getHistoricalBalances(params: {
    network: EvmNetwork;
    address: string;
    contract?: string | string[];
    interval?: '1h' | '4h' | '1d' | '1w';
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET(
      '/v1/evm/balances/historical',
      {
        params: { query: params },
      },
    );

    return handleResponse(data, error);
  }
}

/**
 * EVM DEXs API - Decentralized exchange operations on EVM networks
 */
class EvmDexs {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get DEX swap transactions
   */
  async getSwaps(params: {
    network: EvmNetwork;
    transaction_id?: string;
    pool?: string;
    caller?: string;
    sender?: string;
    recipient?: string;
    protocol?: DexProtocol;
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/swaps', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get DEX liquidity pools
   */
  async getPools(params: {
    network: EvmNetwork;
    pool?: string;
    token0?: string;
    token1?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/pools', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get supported DEXs
   */
  async getDexes(params: { network: EvmNetwork }) {
    const { data, error } = await this.client.GET('/v1/evm/dexes', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get OHLCV price data for liquidity pools
   */
  async getPoolOHLC(params: {
    network: EvmNetwork;
    pool: string;
    interval?: '1h' | '4h' | '1d' | '1w';
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/pools/ohlc', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * EVM NFTs API - NFT operations on EVM networks
 */
class EvmNfts {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get NFT collection metadata and stats
   */
  async getCollections(params: {
    network: EvmNetwork;
    contract: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/nft/collections', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get NFT holders for a collection
   */
  async getHolders(params: {
    network: EvmNetwork;
    contract: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/nft/holders', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get NFT items with metadata
   */
  async getItems(params: {
    network: EvmNetwork;
    contract: string;
    token_id?: string | string[];
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/nft/items', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get NFT ownerships by wallet address
   */
  async getOwnerships(params: {
    network: EvmNetwork;
    address: string | string[];
    contract?: string | string[];
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/nft/ownerships', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get NFT sales data
   */
  async getSales(params: {
    network: EvmNetwork;
    contract?: string | string[];
    token_id?: string | string[];
    buyer?: string | string[];
    seller?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/nft/sales', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get NFT transfers
   */
  async getTransfers(params: {
    network: EvmNetwork;
    transaction_id?: string | string[];
    contract?: string | string[];
    token_id?: string | string[];
    from_address?: string | string[];
    to_address?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/evm/nft/transfers', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * EVM API - Operations on EVM (Ethereum Virtual Machine) networks
 */
class EvmApi {
  public readonly tokens: EvmTokens;
  public readonly dexs: EvmDexs;
  public readonly nfts: EvmNfts;

  constructor(client: ReturnType<typeof createAPIClient>) {
    this.tokens = new EvmTokens(client);
    this.dexs = new EvmDexs(client);
    this.nfts = new EvmNfts(client);
  }
}

/**
 * SVM Tokens API - Token operations on Solana Virtual Machine networks
 */
class SvmTokens {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get SPL token transfers
   */
  async getTransfers(params: {
    network: SvmNetwork;
    signature?: string | string[];
    mint?: string | string[];
    from_address?: string | string[];
    to_address?: string | string[];
    from_owner?: string | string[];
    to_owner?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/transfers', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token metadata
   */
  async getTokens(params: {
    network: SvmNetwork;
    mint: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/tokens', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token balances for a wallet address
   */
  async getBalances(params: {
    network: SvmNetwork;
    owner: string | string[];
    mint?: string | string[];
    include_null_balances?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/balances', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get native SOL balances for wallet addresses
   */
  async getNativeBalances(params: {
    network: SvmNetwork;
    address: string | string[];
    include_null_balances?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/balances/native', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token holders
   */
  async getHolders(params: {
    network: SvmNetwork;
    mint: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/holders', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get account owner lookup
   */
  async getAccountOwner(params: {
    network: SvmNetwork;
    account: string | string[];
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/owner', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * SVM DEXs API - Decentralized exchange operations on Solana Virtual Machine networks
 */
class SvmDexs {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get DEX swap transactions
   */
  async getSwaps(params: {
    network: SvmNetwork;
    signature?: string | string[];
    amm?: string | string[];
    amm_pool?: string | string[];
    user?: string | string[];
    input_mint?: string | string[];
    output_mint?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/swaps', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get DEX liquidity pools
   */
  async getPools(params: {
    network: SvmNetwork;
    amm_pool?: string | string[];
    base_mint?: string | string[];
    quote_mint?: string | string[];
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/pools', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get supported DEXs
   */
  async getDexes(params: { network: SvmNetwork }) {
    const { data, error } = await this.client.GET('/v1/svm/dexes', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get OHLCV price data for liquidity pools
   */
  async getPoolOHLC(params: {
    network: SvmNetwork;
    amm_pool: string;
    interval?: '1h' | '4h' | '1d' | '1w';
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/svm/pools/ohlc', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * SVM NFTs API - NFT operations on Solana Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future NFT functionality on SVM networks (Solana).
 * Methods will be added when the Token API adds support for Solana NFT operations.
 */
class SvmNfts {
  constructor(private client: ReturnType<typeof createAPIClient>) { }
}

/**
 * SVM API - Operations on SVM (Solana Virtual Machine) networks
 */
class SvmApi {
  public readonly tokens: SvmTokens;
  public readonly dexs: SvmDexs;
  public readonly nfts: SvmNfts;

  constructor(client: ReturnType<typeof createAPIClient>) {
    this.tokens = new SvmTokens(client);
    this.dexs = new SvmDexs(client);
    this.nfts = new SvmNfts(client);
  }
}

/**
 * TVM Tokens API - Token operations on Tron Virtual Machine networks
 */
class TvmTokens {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get TRC-20 token transfers
   */
  async getTransfers(params: {
    network: TvmNetwork;
    transaction_id?: string | string[];
    contract?: string | string[];
    from_address?: string | string[];
    to_address?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/tvm/transfers', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get native TRX transfers
   */
  async getNativeTransfers(params: {
    network: TvmNetwork;
    transaction_id?: string | string[];
    from_address?: string | string[];
    to_address?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/tvm/transfers/native', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token metadata
   */
  async getTokens(params: {
    network: TvmNetwork;
    contract: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/tvm/tokens', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * TVM DEXs API - Decentralized exchange operations on Tron Virtual Machine networks
 */
class TvmDexs {
  constructor(private client: ReturnType<typeof createAPIClient>) { }

  /**
   * Get DEX swap transactions
   */
  async getSwaps(params: {
    network: TvmNetwork;
    transaction_id?: string | string[];
    pool?: string | string[];
    caller?: string | string[];
    sender?: string | string[];
    recipient?: string | string[];
    start_time?: string;
    end_time?: string;
    start_block?: number;
    end_block?: number;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/tvm/swaps', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get supported DEXs
   */
  async getDexes(params: { network: TvmNetwork }) {
    const { data, error } = await this.client.GET('/v1/tvm/dexes', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get OHLCV price data for liquidity pools
   */
  async getPoolOHLC(params: {
    network: TvmNetwork;
    pool: string;
    interval?: '1h' | '4h' | '1d' | '1w';
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET('/v1/tvm/pools/ohlc', {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * TVM NFTs API - NFT operations on Tron Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future NFT functionality on TVM networks (Tron).
 * Methods will be added when the Token API adds support for Tron NFT operations.
 */
class TvmNfts {
  constructor(private client: ReturnType<typeof createAPIClient>) { }
}

/**
 * TVM API - Operations on TVM (Tron Virtual Machine) networks
 */
class TvmApi {
  public readonly tokens: TvmTokens;
  public readonly dexs: TvmDexs;
  public readonly nfts: TvmNfts;

  constructor(client: ReturnType<typeof createAPIClient>) {
    this.tokens = new TvmTokens(client);
    this.dexs = new TvmDexs(client);
    this.nfts = new TvmNfts(client);
  }
}

/**
 * High-level wrapper for common Token API operations
 *
 * @example
 * ```typescript
 * import { TokenAPI } from "@pinax/token-api";
 *
 * const client = new TokenAPI({ apiToken: "YOUR_API_KEY_HERE" });
 *
 * // Get EVM transfers
 * const transfers = await client.evm.tokens.getTransfers({
 *   network: "mainnet",
 *   to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
 * });
 *
 * // Get EVM swaps
 * const swaps = await client.evm.dexs.getSwaps({
 *   network: "mainnet",
 *   pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
 * });
 * ```
 */
export class TokenAPI {
  private client: ReturnType<typeof createAPIClient>;

  /**
   * EVM (Ethereum Virtual Machine) API - Ethereum, Base, Arbitrum, etc.
   */
  public readonly evm: EvmApi;

  /**
   * SVM (Solana Virtual Machine) API - Solana
   */
  public readonly svm: SvmApi;

  /**
   * TVM (Tron Virtual Machine) API - Tron
   */
  public readonly tvm: TvmApi;

  constructor(options: PinaxClientOptions = {}) {
    this.client = createAPIClient(options);
    this.evm = new EvmApi(this.client);
    this.svm = new SvmApi(this.client);
    this.tvm = new TvmApi(this.client);
  }

  /**
   * Get the underlying openapi-fetch client for advanced usage
   */
  getClient() {
    return this.client;
  }

  // === Monitoring / System Methods (at root level) ===

  /**
   * Check API health status
   */
  async getHealth() {
    const { data, error } = await this.client.GET('/v1/health', {});

    return handleResponse(data, error);
  }

  /**
   * Get API version information
   */
  async getVersion() {
    const { data, error } = await this.client.GET('/v1/version', {});

    return handleResponse(data, error);
  }

  /**
   * Get list of supported networks
   */
  async getNetworks() {
    const { data, error } = await this.client.GET('/v1/networks', {});

    return handleResponse(data, error);
  }
}

// Default export
export default TokenAPI;

/**
 * @deprecated Use `TokenAPI` instead. `TokenClient` is an alias kept for backward compatibility.
 */
export const TokenClient = TokenAPI;
