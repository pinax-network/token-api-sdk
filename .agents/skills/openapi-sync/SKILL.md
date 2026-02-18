---
name: openapi-sync
description: Sync the SDK wrapper (index.ts) and tests (index.spec.ts) with the latest OpenAPI spec (openapi.d.ts). Run after `npm run generate` to ensure full alignment, 100% test coverage, and type safety.
---

# OpenAPI Sync

Ensures `src/index.ts` and `src/index.spec.ts` stay aligned with the auto-generated `src/openapi.d.ts` types.

## When to Use

- After running `npm run generate` to regenerate `src/openapi.d.ts`
- When adding, removing, or modifying SDK wrapper methods
- Before any release or PR merge
- When the build or typecheck fails due to spec drift

## Steps

1. **Regenerate types** — Run `npm run generate` to update `src/openapi.d.ts`. Never edit this file manually.

2. **Typecheck** — Run `bun run typecheck`. Fix any type errors in `index.ts`.

3. **Compare endpoints** — Every path in `openapi.d.ts` `paths` must have a corresponding SDK method in `index.ts`. Add wrapper methods for new endpoints. Remove methods for deleted endpoints.

4. **Compare query parameters** — For each operation in `openapi.d.ts`, compare its query parameters against the wrapper method's params type in `index.ts`:
   - Required vs optional must match.
   - Types must match (e.g. `string` vs `string | string[]`).
   - Enum values must match (e.g. intervals, protocols, token standards).
   - No extra parameters in the wrapper that aren't in the spec.
   - No missing parameters — every param in the spec must be exposed.

5. **Check type aliases** — `components.schemas` may be `never` (all types inline). Do not create type aliases referencing `components['schemas']['...']` if schemas is `never`. Derive response types from method return types instead.

6. **Check network/enum types** — Verify these types match the spec enums:
   - `EvmNetwork`, `SvmNetwork`, `TvmNetwork`
   - `EvmDexProtocol`, `TvmDexProtocol`
   - `SvmTokenProgramId`, `SvmDexProgramId`
   - `EVMChains`, `SVMChains`, `TVMChains` constants

7. **Update tests** — Every public method must have at least one test in the `API methods with mocked fetch` describe block that:
   - Calls the method with valid params.
   - Asserts the correct API endpoint path is in the request URL.
   - Asserts key query parameters are forwarded.

8. **Verify 100% coverage** — Run `bun test --coverage`. Must report **100% function and line coverage** on `src/index.ts`.

## Conventions

- Tests use a mocked global `fetch` that captures the `Request` object. No real API calls.
- Test runner is `bun:test`.
- The SDK uses `openapi-fetch` with `createClient<paths>()`.
- Wrapper methods call `this.client.GET(path, { params: { query: params } })` and return via `handleResponse(data, error)`.
