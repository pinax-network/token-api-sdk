/**
 * Token API Client Tests
 *
 * Unit tests for the @pinax/token-api SDK using Bun Test runner.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  TokenAPI,
  createAPIClient,
  DEFAULT_BASE_URL,
  EVMChains,
  SVMChains,
  TVMChains,
} from './index';

describe('createAPIClient', () => {
  it('should create a client with default base URL', () => {
    const client = createAPIClient();
    expect(client).toBeDefined();
    expect(typeof client.GET).toBe('function');
    expect(typeof client.POST).toBe('function');
  });

  it('should create a client with custom base URL', () => {
    const customUrl = 'https://custom-api.example.com';
    const client = createAPIClient({ baseUrl: customUrl });
    expect(client).toBeDefined();
  });

  it('should create a client with API token', () => {
    const client = createAPIClient({ apiToken: 'test-token' });
    expect(client).toBeDefined();
  });
});

describe('TokenAPI', () => {
  describe('constructor', () => {
    it('should create a TokenAPI instance with default options', () => {
      const client = new TokenAPI();
      expect(client).toBeInstanceOf(TokenAPI);
      expect(client.evm).toBeDefined();
      expect(client.svm).toBeDefined();
      expect(client.tvm).toBeDefined();
    });

    it('should create a TokenAPI instance with custom options', () => {
      const client = new TokenAPI({
        apiToken: 'test-token',
        baseUrl: 'https://custom.example.com',
      });
      expect(client).toBeInstanceOf(TokenAPI);
    });

    it('should expose getClient method', () => {
      const client = new TokenAPI();
      const internalClient = client.getClient();
      expect(internalClient).toBeDefined();
      expect(typeof internalClient.GET).toBe('function');
    });
  });

  describe('EVM API structure', () => {
    let client: TokenAPI;

    beforeEach(() => {
      client = new TokenAPI();
    });

    it('should expose evm.tokens API', () => {
      expect(client.evm.tokens).toBeDefined();
      expect(typeof client.evm.tokens.getTransfers).toBe('function');
      expect(typeof client.evm.tokens.getTokenMetadata).toBe('function');
      expect(typeof client.evm.tokens.getBalances).toBe('function');
      expect(typeof client.evm.tokens.getHolders).toBe('function');
      expect(typeof client.evm.tokens.getNativeBalances).toBe('function');
      expect(typeof client.evm.tokens.getHistoricalBalances).toBe('function');
    });

    it('should expose evm.dexs API', () => {
      expect(client.evm.dexs).toBeDefined();
      expect(typeof client.evm.dexs.getSwaps).toBe('function');
      expect(typeof client.evm.dexs.getPools).toBe('function');
      expect(typeof client.evm.dexs.getDexes).toBe('function');
      expect(typeof client.evm.dexs.getPoolOHLC).toBe('function');
    });

    it('should expose evm.nfts API', () => {
      expect(client.evm.nfts).toBeDefined();
      expect(typeof client.evm.nfts.getCollections).toBe('function');
      expect(typeof client.evm.nfts.getHolders).toBe('function');
      expect(typeof client.evm.nfts.getItems).toBe('function');
      expect(typeof client.evm.nfts.getOwnerships).toBe('function');
      expect(typeof client.evm.nfts.getSales).toBe('function');
      expect(typeof client.evm.nfts.getTransfers).toBe('function');
    });
  });

  describe('SVM API structure', () => {
    let client: TokenAPI;

    beforeEach(() => {
      client = new TokenAPI();
    });

    it('should expose svm.tokens API', () => {
      expect(client.svm.tokens).toBeDefined();
      expect(typeof client.svm.tokens.getTransfers).toBe('function');
      expect(typeof client.svm.tokens.getTokenMetadata).toBe('function');
      expect(typeof client.svm.tokens.getBalances).toBe('function');
      expect(typeof client.svm.tokens.getNativeBalances).toBe('function');
      expect(typeof client.svm.tokens.getHolders).toBe('function');
      expect(typeof client.svm.tokens.getAccountOwner).toBe('function');
    });

    it('should expose svm.dexs API', () => {
      expect(client.svm.dexs).toBeDefined();
      expect(typeof client.svm.dexs.getSwaps).toBe('function');
      expect(typeof client.svm.dexs.getPools).toBe('function');
      expect(typeof client.svm.dexs.getDexes).toBe('function');
      expect(typeof client.svm.dexs.getPoolOHLC).toBe('function');
    });

    it('should expose svm.nfts API (placeholder)', () => {
      expect(client.svm.nfts).toBeDefined();
    });
  });

  describe('TVM API structure', () => {
    let client: TokenAPI;

    beforeEach(() => {
      client = new TokenAPI();
    });

    it('should expose tvm.tokens API', () => {
      expect(client.tvm.tokens).toBeDefined();
      expect(typeof client.tvm.tokens.getTransfers).toBe('function');
      expect(typeof client.tvm.tokens.getNativeTransfers).toBe('function');
      expect(typeof client.tvm.tokens.getTokenMetadata).toBe('function');
      expect(typeof client.tvm.tokens.getNativeTokenMetadata).toBe('function');
    });

    it('should expose tvm.dexs API', () => {
      expect(client.tvm.dexs).toBeDefined();
      expect(typeof client.tvm.dexs.getSwaps).toBe('function');
      expect(typeof client.tvm.dexs.getDexes).toBe('function');
      expect(typeof client.tvm.dexs.getPools).toBe('function');
      expect(typeof client.tvm.dexs.getPoolOHLC).toBe('function');
    });

    it('should expose tvm.nfts API (placeholder)', () => {
      expect(client.tvm.nfts).toBeDefined();
    });
  });

  describe('System methods', () => {
    let client: TokenAPI;

    beforeEach(() => {
      client = new TokenAPI();
    });

    it('should expose getHealth method', () => {
      expect(typeof client.getHealth).toBe('function');
    });

    it('should expose getVersion method', () => {
      expect(typeof client.getVersion).toBe('function');
    });

    it('should expose getNetworks method', () => {
      expect(typeof client.getNetworks).toBe('function');
    });
  });
});

describe('Constants', () => {
  it('should export DEFAULT_BASE_URL', () => {
    expect(DEFAULT_BASE_URL).toBe('https://token-api.thegraph.com');
  });

  describe('EVMChains', () => {
    it('should export EVMChains constant', () => {
      expect(EVMChains).toBeDefined();
    });

    it('should have Ethereum aliased to mainnet', () => {
      expect(EVMChains.Ethereum).toBe('mainnet');
    });

    it('should have all EVM chain values', () => {
      expect(EVMChains.Ethereum).toBe('mainnet');
      expect(EVMChains.Base).toBe('base');
      expect(EVMChains.ArbitrumOne).toBe('arbitrum-one');
      expect(EVMChains.BSC).toBe('bsc');
      expect(EVMChains.Polygon).toBe('polygon');
      expect(EVMChains.Optimism).toBe('optimism');
      expect(EVMChains.Avalanche).toBe('avalanche');
      expect(EVMChains.Unichain).toBe('unichain');
    });
  });

  describe('SVMChains', () => {
    it('should export SVMChains constant', () => {
      expect(SVMChains).toBeDefined();
    });

    it('should have Solana chain value', () => {
      expect(SVMChains.Solana).toBe('solana');
    });
  });

  describe('TVMChains', () => {
    it('should export TVMChains constant', () => {
      expect(TVMChains).toBeDefined();
    });

    it('should have Tron chain value', () => {
      expect(TVMChains.Tron).toBe('tron');
    });
  });
});

describe('API methods with mocked fetch', () => {
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
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_results: 0,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call the correct endpoint for EVM transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getTransfers({
      network: 'mainnet',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/transfers');
    expect(capturedRequest!.url).toContain('network=mainnet');
  });

  it('should call the correct endpoint for EVM swaps', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.dexs.getSwaps({
      network: 'mainnet',
      limit: 5,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/swaps');
    expect(capturedRequest!.url).toContain('network=mainnet');
  });

  it('should include protocol filter for EVM pools', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.dexs.getPools({
      network: 'mainnet',
      protocol: 'uniswap_v3',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/pools');
    expect(capturedRequest!.url).toContain('protocol=uniswap_v3');
  });

  it('should call the correct endpoint for SVM transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getTransfers({
      network: 'solana',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/transfers');
    expect(capturedRequest!.url).toContain('network=solana');
  });

  it('should include amm_pool filter for SVM pools', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.dexs.getPools({
      network: 'solana',
      amm_pool: 'pool-address',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/pools');
    expect(capturedRequest!.url).toContain('amm_pool=pool-address');
  });

  it('should call the correct endpoint for TVM transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.tokens.getTransfers({
      network: 'tron',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/transfers');
    expect(capturedRequest!.url).toContain('network=tron');
  });

  it('should include protocol filter for TVM pools', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.dexs.getPools({
      network: 'tron',
      protocol: 'sunpump',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/pools');
    expect(capturedRequest!.url).toContain('protocol=sunpump');
  });

  it('should work with EVMChains.Ethereum constant', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getTransfers({
      network: EVMChains.Ethereum,
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/transfers');
    expect(capturedRequest!.url).toContain('network=mainnet');
  });

  it('should work with SVMChains.Solana constant', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getTransfers({
      network: SVMChains.Solana,
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/transfers');
    expect(capturedRequest!.url).toContain('network=solana');
  });

  it('should work with TVMChains.Tron constant', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.tokens.getTransfers({
      network: TVMChains.Tron,
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/transfers');
    expect(capturedRequest!.url).toContain('network=tron');
  });

  it('should include authorization header when API token is provided', async () => {
    const client = new TokenAPI({ apiToken: 'my-test-token' });

    await client.evm.tokens.getTransfers({
      network: 'mainnet',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.get('Authorization')).toBe(
      'Bearer my-test-token',
    );
  });

  it('should include referrer header in all requests', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getTransfers({
      network: 'mainnet',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.get('User-Agent')).toBe('@pinax/token-api');
  });

  it('should use custom base URL when provided', async () => {
    const customUrl = 'https://custom-api.example.com';
    const client = new TokenAPI({
      apiToken: 'test-token',
      baseUrl: customUrl,
    });

    await client.evm.tokens.getTransfers({
      network: 'mainnet',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain(customUrl);
  });

  it('should call health endpoint', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.getHealth();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/health');
  });

  it('should call version endpoint', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.getVersion();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/version');
  });

  it('should call networks endpoint', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.getNetworks();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/networks');
  });

  it('should call networks endpoint with filter', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.getNetworks({ network: 'mainnet' });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/networks');
    expect(capturedRequest!.url).toContain('network=mainnet');
  });

  // --- EVM Tokens: uncovered methods ---

  it('should call the correct endpoint for EVM native transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getNativeTransfers({
      network: 'mainnet',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/transfers/native');
    expect(capturedRequest!.url).toContain('network=mainnet');
  });

  it('should call the correct endpoint for EVM token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getTokenMetadata({
      network: 'mainnet',
      contract: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/tokens');
    expect(capturedRequest!.url).toContain('contract=');
  });

  it('should support array of contracts for EVM token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getTokenMetadata({
      network: 'mainnet',
      contract: ['0xaaa', '0xbbb'],
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/tokens');
  });

  it('should call the correct endpoint for EVM balances', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getBalances({
      network: 'mainnet',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/balances');
    expect(capturedRequest!.url).toContain('address=');
  });

  it('should call the correct endpoint for EVM holders', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getHolders({
      network: 'mainnet',
      contract: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/holders');
    expect(capturedRequest!.url).toContain('contract=');
  });

  it('should call the correct endpoint for EVM native holders', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getNativeHolders({
      network: 'mainnet',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/holders/native');
  });

  it('should call the correct endpoint for EVM native balances', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getNativeBalances({
      network: 'mainnet',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/balances/native');
  });

  it('should call the correct endpoint for EVM historical balances', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getHistoricalBalances({
      network: 'mainnet',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      interval: '1d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/balances/historical');
    expect(capturedRequest!.url).not.toContain('/native');
  });

  it('should call the correct endpoint for EVM historical native balances', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getHistoricalNativeBalances({
      network: 'mainnet',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      interval: '1d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/balances/historical/native');
  });

  it('should call the correct endpoint for EVM native token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.tokens.getNativeTokenMetadata({
      network: 'mainnet',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/tokens/native');
  });

  // --- EVM DEXs: uncovered methods ---

  it('should call the correct endpoint for EVM dexes', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.dexs.getDexes({
      network: 'mainnet',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/dexes');
  });

  it('should call the correct endpoint for EVM pool OHLC', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.dexs.getPoolOHLC({
      network: 'mainnet',
      pool: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
      interval: '1h',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/pools/ohlc');
    expect(capturedRequest!.url).toContain('pool=');
    expect(capturedRequest!.url).toContain('interval=1h');
  });

  // --- EVM NFTs: all methods ---

  it('should call the correct endpoint for NFT collections', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getCollections({
      network: 'mainnet',
      contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/collections');
    expect(capturedRequest!.url).toContain('contract=');
  });

  it('should call the correct endpoint for NFT holders', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getHolders({
      network: 'mainnet',
      contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/holders');
  });

  it('should call the correct endpoint for NFT items', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getItems({
      network: 'mainnet',
      contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      token_id: '1234',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/items');
    expect(capturedRequest!.url).toContain('token_id=1234');
  });

  it('should call the correct endpoint for NFT ownerships', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getOwnerships({
      network: 'mainnet',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/ownerships');
    expect(capturedRequest!.url).toContain('address=');
  });

  it('should include new params for NFT ownerships', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getOwnerships({
      network: 'mainnet',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      token_standard: 'ERC721',
      include_null_balances: true,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('token_standard=ERC721');
    expect(capturedRequest!.url).toContain('include_null_balances=true');
  });

  it('should call the correct endpoint for NFT sales', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getSales({
      network: 'mainnet',
      contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/sales');
  });

  it('should call the correct endpoint for NFT transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getTransfers({
      network: 'mainnet',
      contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/transfers');
  });

  it('should include type and address params for NFT transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.evm.nfts.getTransfers({
      network: 'mainnet',
      type: 'MINT',
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/evm/nft/transfers');
    expect(capturedRequest!.url).toContain('type=MINT');
    expect(capturedRequest!.url).toContain('address=');
  });

  // --- SVM Tokens: uncovered methods ---

  it('should call the correct endpoint for SVM token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getTokenMetadata({
      network: 'solana',
      mint: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/tokens');
    expect(capturedRequest!.url).toContain('mint=');
  });

  it('should support array of mints for SVM token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getTokenMetadata({
      network: 'solana',
      mint: ['mintA', 'mintB'],
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/tokens');
  });

  it('should call the correct endpoint for SVM balances', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getBalances({
      network: 'solana',
      owner: 'So11111111111111111111111111111111111111112',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/balances');
    expect(capturedRequest!.url).not.toContain('/native');
  });

  it('should call the correct endpoint for SVM native balances', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getNativeBalances({
      network: 'solana',
      address: 'So11111111111111111111111111111111111111112',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/balances/native');
  });

  it('should call the correct endpoint for SVM holders', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getHolders({
      network: 'solana',
      mint: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/holders');
    expect(capturedRequest!.url).toContain('mint=');
  });

  it('should call the correct endpoint for SVM account owner', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.tokens.getAccountOwner({
      network: 'solana',
      account: 'So11111111111111111111111111111111111111112',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/owner');
    expect(capturedRequest!.url).toContain('account=');
  });

  // --- SVM DEXs: uncovered methods ---

  it('should call the correct endpoint for SVM swaps', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.dexs.getSwaps({
      network: 'solana',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/swaps');
  });

  it('should call the correct endpoint for SVM dexes', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.dexs.getDexes({
      network: 'solana',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/dexes');
  });

  it('should call the correct endpoint for SVM pool OHLC', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.svm.dexs.getPoolOHLC({
      network: 'solana',
      amm_pool: 'pool-address',
      interval: '1d',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/svm/pools/ohlc');
    expect(capturedRequest!.url).toContain('amm_pool=pool-address');
  });

  // --- TVM Tokens: uncovered methods ---

  it('should call the correct endpoint for TVM native transfers', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.tokens.getNativeTransfers({
      network: 'tron',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/transfers/native');
  });

  it('should call the correct endpoint for TVM token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.tokens.getTokenMetadata({
      network: 'tron',
      contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/tokens');
    expect(capturedRequest!.url).toContain('contract=');
  });

  it('should support array of contracts for TVM token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.tokens.getTokenMetadata({
      network: 'tron',
      contract: ['TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR'],
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/tokens');
  });

  it('should call the correct endpoint for TVM native token metadata', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.tokens.getNativeTokenMetadata({
      network: 'tron',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/tokens/native');
  });

  // --- TVM DEXs: uncovered methods ---

  it('should call the correct endpoint for TVM swaps', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.dexs.getSwaps({
      network: 'tron',
      limit: 10,
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/swaps');
  });

  it('should call the correct endpoint for TVM dexes', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.dexs.getDexes({
      network: 'tron',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/dexes');
  });

  it('should call the correct endpoint for TVM pool OHLC', async () => {
    const client = new TokenAPI({ apiToken: 'test-token' });

    await client.tvm.dexs.getPoolOHLC({
      network: 'tron',
      pool: 'pool-address',
      interval: '1h',
    });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain('/v1/tvm/pools/ohlc');
    expect(capturedRequest!.url).toContain('pool=pool-address');
  });
});

describe('Error handling', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should throw error when API returns an error', async () => {
    globalThis.fetch = ((_request: Request) => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid API token',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }) as typeof fetch;

    const client = new TokenAPI({ apiToken: 'invalid-token' });

    await expect(
      client.evm.tokens.getTransfers({ network: 'mainnet' }),
    ).rejects.toThrow('API Error');
  });

  it('should throw error when null data is returned', async () => {
    globalThis.fetch = ((_request: Request) => {
      return Promise.resolve(
        new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }) as typeof fetch;

    const client = new TokenAPI({ apiToken: 'test-token' });

    await expect(
      client.evm.tokens.getTransfers({ network: 'mainnet' }),
    ).rejects.toThrow('API Error: No data returned');
  });
});
