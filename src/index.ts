/**
 * @pinax/sdk - Pinax SDK for Token API
 *
 * Power your apps & AI agents with real-time token data.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 * @license Apache-2.0
 */

import "dotenv/config";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths, components } from "./openapi.d.ts";

// Re-export types
export type * from "./openapi.d.ts";

// Constants
export const DEFAULT_BASE_URL = "https://token-api.thegraph.com";

// Type aliases for convenience
export type Transfer = components["schemas"]["Transfer"];
export type Swap = components["schemas"]["Swap"];
export type Token = components["schemas"]["Token"];
export type Balance = components["schemas"]["Balance"];
export type Holder = components["schemas"]["Holder"];
export type Price = components["schemas"]["Price"];
export type Ohlc = components["schemas"]["Ohlc"];
export type Pool = components["schemas"]["Pool"];
export type TokenInfo = components["schemas"]["TokenInfo"];
export type UsageInfo = components["schemas"]["UsageInfo"];
export type PaginationInfo = components["schemas"]["PaginationInfo"];

// Response types
export type TransfersResponse = components["schemas"]["TransfersResponse"];
export type SwapsResponse = components["schemas"]["SwapsResponse"];
export type TokensResponse = components["schemas"]["TokensResponse"];
export type BalancesResponse = components["schemas"]["BalancesResponse"];
export type HoldersResponse = components["schemas"]["HoldersResponse"];
export type PricesResponse = components["schemas"]["PricesResponse"];
export type OhlcResponse = components["schemas"]["OhlcResponse"];
export type PoolsResponse = components["schemas"]["PoolsResponse"];

// Network types
export type EvmNetwork =
  | "mainnet"
  | "base"
  | "arbitrum-one"
  | "bsc"
  | "polygon"
  | "optimism"
  | "avalanche"
  | "unichain";

export type SvmNetwork = "solana";

export type TvmNetwork = "tron";

export type DexProtocol = "uniswap_v2" | "uniswap_v3";

export type OhlcInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

/**
 * Configuration options for the Pinax SDK client
 *
 * Environment variables are automatically loaded from `.env` files via dotenv.
 * Options can be set via environment variables:
 * - `PINAX_API_KEY` - API key for authentication
 * - `PINAX_BEARER_TOKEN` - Bearer token for authentication
 * - `PINAX_BASE_URL` - Custom base URL for the API
 */
export interface PinaxClientOptions {
  /**
   * API key for authentication
   * Get your API key at https://thegraph.market
   * Falls back to `PINAX_API_KEY` environment variable
   */
  apiKey?: string;

  /**
   * Bearer token for authentication (alternative to API key)
   * Falls back to `PINAX_BEARER_TOKEN` environment variable
   */
  bearerToken?: string;

  /**
   * Base URL for the API (defaults to production)
   * Falls back to `PINAX_BASE_URL` environment variable
   */
  baseUrl?: string;

  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;
}

/**
 * Create a middleware that adds authentication headers
 */
function createAuthMiddleware(options: PinaxClientOptions): Middleware {
  const bearerToken = options.bearerToken ?? process.env.PINAX_BEARER_TOKEN;
  const apiKey = options.apiKey ?? process.env.PINAX_API_KEY;

  return {
    async onRequest({ request }) {
      if (bearerToken) {
        request.headers.set("Authorization", `Bearer ${bearerToken}`);
      } else if (apiKey) {
        request.headers.set("X-Api-Key", apiKey);
      }
      return request;
    },
  };
}

/**
 * Create a Pinax SDK client for accessing the Token API
 *
 * Environment variables are automatically loaded from `.env` files.
 * Supported environment variables:
 * - `PINAX_API_KEY` - API key for authentication
 * - `PINAX_BEARER_TOKEN` - Bearer token for authentication
 * - `PINAX_BASE_URL` - Custom base URL for the API
 *
 * @example
 * ```typescript
 * import { createPinaxClient } from "@pinax/sdk";
 *
 * const client = createPinaxClient({
 *   apiKey: "your-api-key"
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
export function createPinaxClient(options: PinaxClientOptions = {}) {
  const baseUrl = options.baseUrl ?? process.env.PINAX_BASE_URL ?? DEFAULT_BASE_URL;

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
    throw new Error("API Error: No data returned");
  }
  return data;
}

/**
 * EVM Tokens API - Token operations on EVM networks
 */
class EvmTokens {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}

  /**
   * Get ERC-20 and native token transfers
   */
  async getTransfers(params?: {
    network?: EvmNetwork;
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
    order?: "ASC" | "DESC";
  }) {
    const { data, error } = await this.client.GET("/v1/evm/transfers", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token metadata
   */
  async getTokens(params?: {
    network?: EvmNetwork;
    contract?: string;
    symbol?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET("/v1/evm/tokens", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token balances for a wallet address
   */
  async getBalances(params: {
    owner: string;
    network?: EvmNetwork;
    contract?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET("/v1/evm/balances", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get token holders
   */
  async getHolders(params: {
    contract: string;
    network?: EvmNetwork;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET("/v1/evm/holders", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get current token prices in USD
   */
  async getPrices(params?: {
    network?: EvmNetwork;
    contract?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET("/v1/evm/prices", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get OHLCV candlestick data
   */
  async getOhlc(params: {
    contract: string;
    network?: EvmNetwork;
    interval?: OhlcInterval;
    start_time?: string;
    end_time?: string;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET("/v1/evm/ohlc", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * EVM DEXs API - Decentralized exchange operations on EVM networks
 */
class EvmDexs {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}

  /**
   * Get DEX swap transactions
   */
  async getSwaps(params?: {
    network?: EvmNetwork;
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
    order?: "ASC" | "DESC";
  }) {
    const { data, error } = await this.client.GET("/v1/evm/swaps", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }

  /**
   * Get DEX liquidity pools
   */
  async getPools(params?: {
    network?: EvmNetwork;
    pool?: string;
    token0?: string;
    token1?: string;
    page?: number;
    limit?: number;
  }) {
    const { data, error } = await this.client.GET("/v1/evm/pools", {
      params: { query: params },
    });

    return handleResponse(data, error);
  }
}

/**
 * EVM NFTs API - NFT operations on EVM networks
 *
 * @remarks
 * This class is a placeholder for future NFT functionality on EVM networks.
 * Methods will be added when the Token API adds support for NFT operations.
 *
 * Planned features include:
 * - NFT transfers and ownership history
 * - NFT metadata and collection information
 * - NFT holders and balances
 */
class EvmNfts {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * EVM API - Operations on EVM (Ethereum Virtual Machine) networks
 */
class EvmApi {
  public readonly tokens: EvmTokens;
  public readonly dexs: EvmDexs;
  public readonly nfts: EvmNfts;

  constructor(client: ReturnType<typeof createPinaxClient>) {
    this.tokens = new EvmTokens(client);
    this.dexs = new EvmDexs(client);
    this.nfts = new EvmNfts(client);
  }
}

/**
 * SVM Tokens API - Token operations on Solana Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future token functionality on SVM networks (Solana).
 * Methods will be added when the Token API adds support for Solana token operations.
 *
 * Planned features include:
 * - SPL token transfers
 * - Token metadata and balances
 * - Token holders and prices
 */
class SvmTokens {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * SVM DEXs API - Decentralized exchange operations on Solana Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future DEX functionality on SVM networks (Solana).
 * Methods will be added when the Token API adds support for Solana DEX operations.
 *
 * Planned features include:
 * - Swap events from Raydium, Orca, and other Solana DEXs
 * - Liquidity pool information
 */
class SvmDexs {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * SVM NFTs API - NFT operations on Solana Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future NFT functionality on SVM networks (Solana).
 * Methods will be added when the Token API adds support for Solana NFT operations.
 *
 * Planned features include:
 * - Metaplex NFT transfers and metadata
 * - NFT collection information
 * - NFT holders and ownership history
 */
class SvmNfts {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * SVM API - Operations on SVM (Solana Virtual Machine) networks
 */
class SvmApi {
  public readonly tokens: SvmTokens;
  public readonly dexs: SvmDexs;
  public readonly nfts: SvmNfts;

  constructor(client: ReturnType<typeof createPinaxClient>) {
    this.tokens = new SvmTokens(client);
    this.dexs = new SvmDexs(client);
    this.nfts = new SvmNfts(client);
  }
}

/**
 * TVM Tokens API - Token operations on Tron Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future token functionality on TVM networks (Tron).
 * Methods will be added when the Token API adds support for Tron token operations.
 *
 * Planned features include:
 * - TRC-20 token transfers
 * - Token metadata and balances
 * - Token holders and prices
 */
class TvmTokens {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * TVM DEXs API - Decentralized exchange operations on Tron Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future DEX functionality on TVM networks (Tron).
 * Methods will be added when the Token API adds support for Tron DEX operations.
 *
 * Planned features include:
 * - Swap events from SunSwap and other Tron DEXs
 * - Liquidity pool information
 */
class TvmDexs {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * TVM NFTs API - NFT operations on Tron Virtual Machine networks
 *
 * @remarks
 * This class is a placeholder for future NFT functionality on TVM networks (Tron).
 * Methods will be added when the Token API adds support for Tron NFT operations.
 *
 * Planned features include:
 * - TRC-721 NFT transfers and metadata
 * - NFT collection information
 * - NFT holders and ownership history
 */
class TvmNfts {
  constructor(private client: ReturnType<typeof createPinaxClient>) {}
}

/**
 * TVM API - Operations on TVM (Tron Virtual Machine) networks
 */
class TvmApi {
  public readonly tokens: TvmTokens;
  public readonly dexs: TvmDexs;
  public readonly nfts: TvmNfts;

  constructor(client: ReturnType<typeof createPinaxClient>) {
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
 * import { PinaxSDK } from "@pinax/sdk";
 *
 * const sdk = new PinaxSDK({ apiKey: "your-api-key" });
 *
 * // Get EVM transfers
 * const transfers = await sdk.evm.tokens.getTransfers({
 *   network: "mainnet",
 *   to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
 * });
 *
 * // Get EVM swaps
 * const swaps = await sdk.evm.dexs.getSwaps({
 *   network: "mainnet",
 *   pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
 * });
 * ```
 */
export class PinaxSDK {
  private client: ReturnType<typeof createPinaxClient>;

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
    this.client = createPinaxClient(options);
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
    const { data, error } = await this.client.GET("/health");

    return handleResponse(data, error);
  }

  /**
   * Get API version information
   */
  async getVersion() {
    const { data, error } = await this.client.GET("/version");

    return handleResponse(data, error);
  }

  /**
   * Get list of supported networks
   */
  async getNetworks() {
    const { data, error } = await this.client.GET("/networks");

    return handleResponse(data, error);
  }
}

// Default export
export default PinaxSDK;
