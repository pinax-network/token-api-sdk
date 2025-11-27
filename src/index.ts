/**
 * @pinax/sdk - Pinax SDK for Token API
 *
 * Power your apps & AI agents with real-time token data.
 *
 * @see https://thegraph.com/docs/en/token-api/quick-start/
 * @license Apache-2.0
 */

import createClient, { type Middleware } from "openapi-fetch";
import type { paths, components } from "./openapi.d.ts";

// Re-export types
export type * from "./openapi.d.ts";

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

export type DexProtocol = "uniswap_v2" | "uniswap_v3";

export type OhlcInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

/**
 * Configuration options for the Pinax SDK client
 */
export interface PinaxClientOptions {
  /**
   * API key for authentication
   * Get your API key at https://thegraph.market
   */
  apiKey?: string;

  /**
   * Bearer token for authentication (alternative to API key)
   */
  bearerToken?: string;

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
 * Create a middleware that adds authentication headers
 */
function createAuthMiddleware(options: PinaxClientOptions): Middleware {
  return {
    async onRequest({ request }) {
      if (options.bearerToken) {
        request.headers.set("Authorization", `Bearer ${options.bearerToken}`);
      } else if (options.apiKey) {
        request.headers.set("X-Api-Key", options.apiKey);
      }
      return request;
    },
  };
}

/**
 * Create a Pinax SDK client for accessing the Token API
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
  const baseUrl = options.baseUrl ?? "https://token-api.thegraph.com";

  const client = createClient<paths>({
    baseUrl,
    fetch: options.fetch,
  });

  // Add authentication middleware
  client.use(createAuthMiddleware(options));

  return client;
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
 * // Get transfers
 * const transfers = await sdk.getTransfers({
 *   network: "mainnet",
 *   to_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
 * });
 *
 * // Get swaps
 * const swaps = await sdk.getSwaps({
 *   network: "mainnet",
 *   pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
 * });
 * ```
 */
export class PinaxSDK {
  private client: ReturnType<typeof createPinaxClient>;

  constructor(options: PinaxClientOptions = {}) {
    this.client = createPinaxClient(options);
  }

  /**
   * Get the underlying openapi-fetch client for advanced usage
   */
  getClient() {
    return this.client;
  }

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
    const { data, error, response } = await this.client.GET("/v1/evm/transfers", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
  }

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
    const { data, error, response } = await this.client.GET("/v1/evm/swaps", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
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
    const { data, error, response } = await this.client.GET("/v1/evm/tokens", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
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
    const { data, error, response } = await this.client.GET("/v1/evm/balances", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
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
    const { data, error, response } = await this.client.GET("/v1/evm/holders", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
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
    const { data, error, response } = await this.client.GET("/v1/evm/prices", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
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
    const { data, error, response } = await this.client.GET("/v1/evm/ohlc", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
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
    const { data, error, response } = await this.client.GET("/v1/evm/pools", {
      params: { query: params },
    });

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
  }

  /**
   * Check API health status
   */
  async getHealth() {
    const { data, error, response } = await this.client.GET("/health");

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
  }

  /**
   * Get API version information
   */
  async getVersion() {
    const { data, error, response } = await this.client.GET("/version");

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
  }

  /**
   * Get list of supported networks
   */
  async getNetworks() {
    const { data, error, response } = await this.client.GET("/networks");

    if (error) {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return data;
  }
}

// Default export
export default PinaxSDK;
