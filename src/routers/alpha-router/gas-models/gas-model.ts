import { BigNumber } from '@ethersproject/bignumber';
import {
  ChainId,
  CurrencyAmount as CurrencyAmountRaw,
  Token,
} from 'lampros-core';
import { Pool } from 'lampros-v3';

import { ProviderConfig } from '../../../providers/provider';
import {
  DAI_MODE,
  USDC_MODE,
  USDT_MODE,
} from '../../../providers/token-provider';
import {
  ArbitrumGasData,
  IL2GasDataProvider,
} from '../../../providers/v3/gas-data-provider';
import { WRAPPED_NATIVE_CURRENCY } from '../../../util';
import { CurrencyAmount } from '../../../util/amounts';
import {
  RouteWithValidQuote,
  V3RouteWithValidQuote,
} from '../entities/route-with-valid-quote';

// When adding new usd gas tokens, ensure the tokens are ordered
// from tokens with highest decimals to lowest decimals. For example,
// DAI_AVAX has 18 decimals and comes before USDC_AVAX which has 6 decimals.
export const usdGasTokensByChain: { [chainId in ChainId]?: Token[] } = {
  [ChainId.MODE]: [DAI_MODE, USDC_MODE, USDT_MODE],
};

export type L1ToL2GasCosts = {
  gasUsedL1: BigNumber;
  gasUsedL1OnL2: BigNumber;
  gasCostL1USD: CurrencyAmount;
  gasCostL1QuoteToken: CurrencyAmount;
};

export type GasModelProviderConfig = ProviderConfig & {
  /*
   * Any additional overhead to add to the gas estimate
   */
  additionalGasOverhead?: BigNumber;

  gasToken?: Token;
};

export type BuildOnChainGasModelFactoryType = {
  chainId: ChainId;
  gasPriceWei: BigNumber;
  pools: LiquidityCalculationPools;
  amountToken: Token;
  quoteToken: Token;
  l2GasDataProvider?: IL2GasDataProvider<ArbitrumGasData>;
  providerConfig?: GasModelProviderConfig;
};

export type BuildV2GasModelFactoryType = {
  chainId: ChainId;
  gasPriceWei: BigNumber;
  token: Token;
  l2GasDataProvider?: IL2GasDataProvider<ArbitrumGasData>;
  providerConfig?: GasModelProviderConfig;
};

export type LiquidityCalculationPools = {
  usdPool: Pool;
  nativeAndQuoteTokenV3Pool: Pool | null;
  nativeAndAmountTokenV3Pool: Pool | null;
  nativeAndSpecifiedGasTokenV3Pool: Pool | null;
};

export type GasModelType = {
  v3GasModel: IGasModel<V3RouteWithValidQuote>;
};

/**
 * Contains functions for generating gas estimates for given routes.
 *
 * We generally compute gas estimates off-chain because
 *  1/ Calling eth_estimateGas for a swaps requires the caller to have
 *     the full balance token being swapped, and approvals.
 *  2/ Tracking gas used using a wrapper contract is not accurate with Multicall
 *     due to EIP-2929
 *  3/ For V2 we simulate all our swaps off-chain so have no way to track gas used.
 *
 * Generally these models should be optimized to return quickly by performing any
 * long running operations (like fetching external data) outside of the functions defined.
 * This is because the functions in the model are called once for every route and every
 * amount that is considered in the algorithm so it is important to minimize the number of
 * long running operations.
 */
export type IGasModel<TRouteWithValidQuote extends RouteWithValidQuote> = {
  estimateGasCost(routeWithValidQuote: TRouteWithValidQuote): {
    gasEstimate: BigNumber;
    gasCostInToken: CurrencyAmount;
    gasCostInUSD: CurrencyAmount;
    gasCostInGasToken?: CurrencyAmount;
  };
  calculateL1GasFees?(routes: TRouteWithValidQuote[]): Promise<L1ToL2GasCosts>;
};

/**
 * Factory for building gas models that can be used with any route to generate
 * gas estimates.
 *
 * Factory model is used so that any supporting data can be fetched once and
 * returned as part of the model.
 *
 * @export
 * @abstract
 * @class IOnChainGasModelFactory
 */
export abstract class IOnChainGasModelFactory {
  public abstract buildGasModel({
    chainId,
    gasPriceWei,
    pools,
    amountToken,
    quoteToken,
    l2GasDataProvider,
    providerConfig,
  }: BuildOnChainGasModelFactoryType): Promise<
    IGasModel<V3RouteWithValidQuote>
  >;
}

// Determines if native currency is token0
// Gets the native price of the pool, dependent on 0 or 1
// quotes across the pool
export const getQuoteThroughNativePool = (
  chainId: ChainId,
  nativeTokenAmount: CurrencyAmountRaw<Token>,
  nativeTokenPool: Pool
): CurrencyAmount => {
  const nativeCurrency = WRAPPED_NATIVE_CURRENCY[chainId];
  const isToken0 = nativeTokenPool.token0.equals(nativeCurrency);
  // returns mid price in terms of the native currency (the ratio of token/nativeToken)
  const nativeTokenPrice = isToken0
    ? nativeTokenPool.token0Price
    : nativeTokenPool.token1Price;
  // return gas cost in terms of the non native currency
  return nativeTokenPrice.quote(nativeTokenAmount) as CurrencyAmount;
};
