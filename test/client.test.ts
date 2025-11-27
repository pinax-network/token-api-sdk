/**
 * Token API Client Tests
 *
 * Unit tests for the @pinax/token-api SDK using Bun Test runner.
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  TokenClient,
  createTokenClient,
  DEFAULT_BASE_URL,
} from "../src/index";

describe("createTokenClient", () => {
  it("should create a client with default base URL", () => {
    const client = createTokenClient();
    expect(client).toBeDefined();
    expect(typeof client.GET).toBe("function");
    expect(typeof client.POST).toBe("function");
  });

  it("should create a client with custom base URL", () => {
    const customUrl = "https://custom-api.example.com";
    const client = createTokenClient({ baseUrl: customUrl });
    expect(client).toBeDefined();
  });

  it("should create a client with API token", () => {
    const client = createTokenClient({ apiToken: "test-token" });
    expect(client).toBeDefined();
  });
});

describe("TokenClient", () => {
  describe("constructor", () => {
    it("should create a TokenClient instance with default options", () => {
      const client = new TokenClient();
      expect(client).toBeInstanceOf(TokenClient);
      expect(client.evm).toBeDefined();
      expect(client.svm).toBeDefined();
      expect(client.tvm).toBeDefined();
    });

    it("should create a TokenClient instance with custom options", () => {
      const client = new TokenClient({
        apiToken: "test-token",
        baseUrl: "https://custom.example.com",
      });
      expect(client).toBeInstanceOf(TokenClient);
    });

    it("should expose getClient method", () => {
      const client = new TokenClient();
      const internalClient = client.getClient();
      expect(internalClient).toBeDefined();
      expect(typeof internalClient.GET).toBe("function");
    });
  });

  describe("EVM API structure", () => {
    let client: TokenClient;

    beforeEach(() => {
      client = new TokenClient();
    });

    it("should expose evm.tokens API", () => {
      expect(client.evm.tokens).toBeDefined();
      expect(typeof client.evm.tokens.getTransfers).toBe("function");
      expect(typeof client.evm.tokens.getTokens).toBe("function");
      expect(typeof client.evm.tokens.getBalances).toBe("function");
      expect(typeof client.evm.tokens.getHolders).toBe("function");
      expect(typeof client.evm.tokens.getNativeBalances).toBe("function");
      expect(typeof client.evm.tokens.getHistoricalBalances).toBe("function");
    });

    it("should expose evm.dexs API", () => {
      expect(client.evm.dexs).toBeDefined();
      expect(typeof client.evm.dexs.getSwaps).toBe("function");
      expect(typeof client.evm.dexs.getPools).toBe("function");
      expect(typeof client.evm.dexs.getDexes).toBe("function");
      expect(typeof client.evm.dexs.getPoolOHLC).toBe("function");
    });

    it("should expose evm.nfts API", () => {
      expect(client.evm.nfts).toBeDefined();
      expect(typeof client.evm.nfts.getCollections).toBe("function");
      expect(typeof client.evm.nfts.getHolders).toBe("function");
      expect(typeof client.evm.nfts.getItems).toBe("function");
      expect(typeof client.evm.nfts.getOwnerships).toBe("function");
      expect(typeof client.evm.nfts.getSales).toBe("function");
      expect(typeof client.evm.nfts.getTransfers).toBe("function");
    });
  });

  describe("SVM API structure", () => {
    let client: TokenClient;

    beforeEach(() => {
      client = new TokenClient();
    });

    it("should expose svm.tokens API", () => {
      expect(client.svm.tokens).toBeDefined();
      expect(typeof client.svm.tokens.getTransfers).toBe("function");
      expect(typeof client.svm.tokens.getTokens).toBe("function");
      expect(typeof client.svm.tokens.getBalances).toBe("function");
      expect(typeof client.svm.tokens.getNativeBalances).toBe("function");
      expect(typeof client.svm.tokens.getHolders).toBe("function");
      expect(typeof client.svm.tokens.getAccountOwner).toBe("function");
    });

    it("should expose svm.dexs API", () => {
      expect(client.svm.dexs).toBeDefined();
      expect(typeof client.svm.dexs.getSwaps).toBe("function");
      expect(typeof client.svm.dexs.getPools).toBe("function");
      expect(typeof client.svm.dexs.getDexes).toBe("function");
      expect(typeof client.svm.dexs.getPoolOHLC).toBe("function");
    });

    it("should expose svm.nfts API (placeholder)", () => {
      expect(client.svm.nfts).toBeDefined();
    });
  });

  describe("TVM API structure", () => {
    let client: TokenClient;

    beforeEach(() => {
      client = new TokenClient();
    });

    it("should expose tvm.tokens API", () => {
      expect(client.tvm.tokens).toBeDefined();
      expect(typeof client.tvm.tokens.getTransfers).toBe("function");
      expect(typeof client.tvm.tokens.getNativeTransfers).toBe("function");
      expect(typeof client.tvm.tokens.getTokens).toBe("function");
    });

    it("should expose tvm.dexs API", () => {
      expect(client.tvm.dexs).toBeDefined();
      expect(typeof client.tvm.dexs.getSwaps).toBe("function");
      expect(typeof client.tvm.dexs.getDexes).toBe("function");
      expect(typeof client.tvm.dexs.getPoolOHLC).toBe("function");
    });

    it("should expose tvm.nfts API (placeholder)", () => {
      expect(client.tvm.nfts).toBeDefined();
    });
  });

  describe("System methods", () => {
    let client: TokenClient;

    beforeEach(() => {
      client = new TokenClient();
    });

    it("should expose getHealth method", () => {
      expect(typeof client.getHealth).toBe("function");
    });

    it("should expose getVersion method", () => {
      expect(typeof client.getVersion).toBe("function");
    });

    it("should expose getNetworks method", () => {
      expect(typeof client.getNetworks).toBe("function");
    });
  });
});

describe("Constants", () => {
  it("should export DEFAULT_BASE_URL", () => {
    expect(DEFAULT_BASE_URL).toBe("https://token-api.thegraph.com");
  });
});

describe("API methods with mocked fetch", () => {
  let originalFetch: typeof globalThis.fetch;
  let capturedRequest: Request | null = null;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    capturedRequest = null;
    globalThis.fetch = ((request: Request) => {
      capturedRequest = request;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: [],
            pagination: { current_page: 1, total_pages: 1, total_results: 0 },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should call the correct endpoint for EVM transfers", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.evm.tokens.getTransfers({
      network: "mainnet",
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/evm/transfers");
    expect(capturedRequest!.url).toContain("network=mainnet");
  });

  it("should call the correct endpoint for EVM swaps", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.evm.dexs.getSwaps({
      network: "mainnet",
      limit: 5,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/evm/swaps");
    expect(capturedRequest!.url).toContain("network=mainnet");
  });

  it("should call the correct endpoint for SVM transfers", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.svm.tokens.getTransfers({
      network: "solana",
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/svm/transfers");
    expect(capturedRequest!.url).toContain("network=solana");
  });

  it("should call the correct endpoint for TVM transfers", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.tvm.tokens.getTransfers({
      network: "tron",
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/tvm/transfers");
    expect(capturedRequest!.url).toContain("network=tron");
  });

  it("should include authorization header when API token is provided", async () => {
    const client = new TokenClient({ apiToken: "my-test-token" });

    await client.evm.tokens.getTransfers({
      network: "mainnet",
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.get("Authorization")).toBe("Bearer my-test-token");
  });

  it("should use custom base URL when provided", async () => {
    const customUrl = "https://custom-api.example.com";
    const client = new TokenClient({
      apiToken: "test-token",
      baseUrl: customUrl,
    });

    await client.evm.tokens.getTransfers({
      network: "mainnet",
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain(customUrl);
  });

  it("should call health endpoint", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.getHealth();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/health");
  });

  it("should call version endpoint", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.getVersion();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/version");
  });

  it("should call networks endpoint", async () => {
    const client = new TokenClient({ apiToken: "test-token" });

    await client.getNetworks();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/networks");
  });
});

describe("Error handling", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should throw error when API returns an error", async () => {
    globalThis.fetch = ((_request: Request) => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            error: "Unauthorized",
            message: "Invalid API token",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }) as typeof fetch;

    const client = new TokenClient({ apiToken: "invalid-token" });

    await expect(
      client.evm.tokens.getTransfers({ network: "mainnet" })
    ).rejects.toThrow("API Error");
  });

  it("should throw error when null data is returned", async () => {
    globalThis.fetch = ((_request: Request) => {
      return Promise.resolve(
        new Response(JSON.stringify(null), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    }) as typeof fetch;

    const client = new TokenClient({ apiToken: "test-token" });

    await expect(
      client.evm.tokens.getTransfers({ network: "mainnet" })
    ).rejects.toThrow("API Error: No data returned");
  });
});
