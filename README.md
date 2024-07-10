# Pegasys Smart Order Router

This repository contains routing logic for the Pegasys V3 protocol.

It searches for the most efficient way to swap token A for token B, considering splitting swaps across multiple routes and gas costs.

## Testing

### Unit Tests

First make sure you have run `npm install` and `npm run build`.

```
npm run test
```

### CLI

The package can be run as a CLI for testing purposes.

Then from the root directory you can execute the CLI.

## Examples

Some examples to use for manual CLI testing.

### Rollux

```
./bin/cli quote --tokenIn 0x28c9c7Fb3fE3104d2116Af26cC8eF7905547349c --tokenOut 0x4200000000000000000000000000000000000006 --amount 1 --exactIn --recipient 0xc84633Af14e43F00D5aaa7A47B8d0864eE6a46FB --protocols v1

Best Route:
[V1] 100.00% = USDT -- [0x35F86987E9be51D950DFa747fE2A18603297b2ee] --> WSYS
	Raw Quote Exact In:
		2.83
	Gas Adjusted Quote In:
		2.83

Gas Used Quote Token: 0.000000
Gas Used USD: 0.000000
estimatedGasUsed: "135000"
gasPriceWei: "50"
Total ticks crossed: 1

```

```
./bin/cli quote --tokenIn 0x28c9c7Fb3fE3104d2116Af26cC8eF7905547349c --tokenOut 0x4200000000000000000000000000000000000006 --amount 1 --exactIn --recipient 0xc84633Af14e43F00D5aaa7A47B8d0864eE6a46FB --protocols v1,v3,mixed

Best Route:
[V3] 100.00% = USDT -- 0.05% [0x197e0865E759235699A758c5428944964627Cde1] --> USDC -- 0.3% [0x391Bca3c3C5a71E369D284b0CD81A7Fe8C097e20] --> WSYS
	Raw Quote Exact In:
		4.99
	Gas Adjusted Quote In:
		4.99

Gas Used Quote Token: 0.000000
Gas Used USD: 0.000000
blockNumber: "13692691"
estimatedGasUsed: "196000"
gasPriceWei: "50"
Total ticks crossed: 1

```

## Adding a new Chain

The main components to complete are:

- Deploy contracts on chain, add the pools to subgraph
- Populate v3 providers in `src/providers/v3/subgraph-provider` and `src/providers/v3/static-subgraph-provider`
- Populate chainId and addresses in `src/util/chains.ts` and `src/util/addresses.ts`
- Populate token providers in `src/providers/caching-token-provider` and `src/providers/token-provider.ts`
- Populate gas constants in `src/routers/alpha-router/gas-models/*`
- Populate bases in `src/routers/legacy-router/bases.ts`
- Populate `test/integ/routers/alpha-router/alpha-router.integration.test.ts` and `src/providers/v2/static-subgraph-provider.ts`
- Populate `src/routers/alpha-router/*`
- Add a log to `/CHANGELOG.md`
- Run `npm run integ-test` successfully
