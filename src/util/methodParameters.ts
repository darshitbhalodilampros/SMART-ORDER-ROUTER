import { ChainId, Currency, TradeType } from 'lampros-core';
import { Protocol, SwapRouter as SwapRouter02, Trade } from 'lampros-router';
import {
  SwapRouter as UniveralRouter,
  UNIVERSAL_ROUTER_ADDRESS,
} from 'lampros-universal';
import { Route as V3RouteRaw } from 'lampros-v3';
import _ from 'lodash';

import {
  CurrencyAmount,
  MethodParameters,
  RouteWithValidQuote,
  SWAP_ROUTER_02_ADDRESSES,
  SwapOptions,
  SwapType,
  V3RouteWithValidQuote,
} from '..';

export function buildTrade<TTradeType extends TradeType>(
  tokenInCurrency: Currency,
  tokenOutCurrency: Currency,
  tradeType: TTradeType,
  routeAmounts: RouteWithValidQuote[]
): Trade<Currency, Currency, TTradeType> {
  /// Removed partition because of new mixedRoutes
  const v3RouteAmounts = _.filter(
    routeAmounts,
    (routeAmount) => routeAmount.protocol === Protocol.V3
  );

  const v3Routes = _.map<
    V3RouteWithValidQuote,
    {
      routev3: V3RouteRaw<Currency, Currency>;
      inputAmount: CurrencyAmount;
      outputAmount: CurrencyAmount;
    }
  >(
    v3RouteAmounts as V3RouteWithValidQuote[],
    (routeAmount: V3RouteWithValidQuote) => {
      const { route, amount, quote } = routeAmount;

      // The route, amount and quote are all in terms of wrapped tokens.
      // When constructing the Trade object the inputAmount/outputAmount must
      // use native currencies if specified by the user. This is so that the Trade knows to wrap/unwrap.
      if (tradeType == TradeType.EXACT_INPUT) {
        const amountCurrency = CurrencyAmount.fromFractionalAmount(
          tokenInCurrency,
          amount.numerator,
          amount.denominator
        );
        const quoteCurrency = CurrencyAmount.fromFractionalAmount(
          tokenOutCurrency,
          quote.numerator,
          quote.denominator
        );

        const routeRaw = new V3RouteRaw(
          route.pools,
          amountCurrency.currency,
          quoteCurrency.currency
        );

        return {
          routev3: routeRaw,
          inputAmount: amountCurrency,
          outputAmount: quoteCurrency,
        };
      } else {
        const quoteCurrency = CurrencyAmount.fromFractionalAmount(
          tokenInCurrency,
          quote.numerator,
          quote.denominator
        );

        const amountCurrency = CurrencyAmount.fromFractionalAmount(
          tokenOutCurrency,
          amount.numerator,
          amount.denominator
        );

        const routeCurrency = new V3RouteRaw(
          route.pools,
          quoteCurrency.currency,
          amountCurrency.currency
        );

        return {
          routev3: routeCurrency,
          inputAmount: quoteCurrency,
          outputAmount: amountCurrency,
        };
      }
    }
  );

  const trade = new Trade({ v3Routes, tradeType });

  return trade;
}

export function buildSwapMethodParameters(
  trade: Trade<Currency, Currency, TradeType>,
  swapConfig: SwapOptions,
  chainId: ChainId
): MethodParameters {
  if (swapConfig.type == SwapType.UNIVERSAL_ROUTER) {
    return {
      ...UniveralRouter.swapERC20CallParameters(trade, swapConfig),
      to: UNIVERSAL_ROUTER_ADDRESS(chainId),
    };
  } else if (swapConfig.type == SwapType.SWAP_ROUTER_02) {
    const { recipient, slippageTolerance, deadline, inputTokenPermit } =
      swapConfig;

    return {
      ...SwapRouter02.swapCallParameters(trade, {
        recipient,
        slippageTolerance,
        deadlineOrPreviousBlockhash: deadline,
        inputTokenPermit,
      }),
      to: SWAP_ROUTER_02_ADDRESSES(chainId),
    };
  }

  throw new Error(`Unsupported swap type ${swapConfig}`);
}
