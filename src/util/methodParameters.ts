import {
  // MixedRouteSDK,
  Protocol,
  SwapRouter as SwapRouter02,
  Trade,
} from 'routersdk18';
import { Currency, TradeType } from 'sdkcore18';
import {
  SwapRouter as UniveralRouter,
  UNIVERSAL_ROUTER_ADDRESS,
} from 'universalroutersdk18';
// import { Route as V1RouteRaw } from '@pollum-io/v1-sdk';
import { Route as V3RouteRaw } from 'v3sdk18';
import _ from 'lodash';

import {
  ChainId,
  CurrencyAmount,
  MethodParameters,
  // MixedRouteWithValidQuote,
  RouteWithValidQuote,
  SWAP_ROUTER_02_ADDRESSES,
  SwapOptions,
  SwapType,
  // V1RouteWithValidQuote,
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
  // const v2RouteAmounts = _.filter(
  //   routeAmounts,
  //   (routeAmount) => routeAmount.protocol === Protocol.V1
  // );
  // const mixedRouteAmounts = _.filter(
  //   routeAmounts,
  //   (routeAmount) => routeAmount.protocol === Protocol.MIXED
  // );

  const v2Routes = _.map<
    V3RouteWithValidQuote,
    {
      routev2: V3RouteRaw<Currency, Currency>;
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
          routev2: routeRaw,
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
          routev2: routeCurrency,
          inputAmount: quoteCurrency,
          outputAmount: amountCurrency,
        };
      }
    }
  );

  // const v1Routes = _.map<
  //   V1RouteWithValidQuote,
  //   {
  //     routev1: V1RouteRaw<Currency, Currency>;
  //     inputAmount: CurrencyAmount;
  //     outputAmount: CurrencyAmount;
  //   }
  // >(
  //   v2RouteAmounts as V1RouteWithValidQuote[],
  //   (routeAmount: V1RouteWithValidQuote) => {
  //     const { route, amount, quote } = routeAmount;

  //     // The route, amount and quote are all in terms of wrapped tokens.
  //     // When constructing the Trade object the inputAmount/outputAmount must
  //     // use native currencies if specified by the user. This is so that the Trade knows to wrap/unwrap.
  //     if (tradeType == TradeType.EXACT_INPUT) {
  //       const amountCurrency = CurrencyAmount.fromFractionalAmount(
  //         tokenInCurrency,
  //         amount.numerator,
  //         amount.denominator
  //       );
  //       const quoteCurrency = CurrencyAmount.fromFractionalAmount(
  //         tokenOutCurrency,
  //         quote.numerator,
  //         quote.denominator
  //       );

  //       const routeV2SDK = new V1RouteRaw(
  //         route.pairs,
  //         amountCurrency.currency,
  //         quoteCurrency.currency
  //       );

  //       return {
  //         routev1: routeV2SDK,
  //         inputAmount: amountCurrency,
  //         outputAmount: quoteCurrency,
  //       };
  //     } else {
  //       const quoteCurrency = CurrencyAmount.fromFractionalAmount(
  //         tokenInCurrency,
  //         quote.numerator,
  //         quote.denominator
  //       );

  //       const amountCurrency = CurrencyAmount.fromFractionalAmount(
  //         tokenOutCurrency,
  //         amount.numerator,
  //         amount.denominator
  //       );

  //       const routeV2SDK = new V1RouteRaw(
  //         route.pairs,
  //         quoteCurrency.currency,
  //         amountCurrency.currency
  //       );

  //       return {
  //         routev1: routeV2SDK,
  //         inputAmount: quoteCurrency,
  //         outputAmount: amountCurrency,
  //       };
  //     }
  //   }
  // );

  // const mixedRoutes = _.map<
  //   MixedRouteWithValidQuote,
  //   {
  //     mixedRoute: MixedRouteSDK<Currency, Currency>;
  //     inputAmount: CurrencyAmount;
  //     outputAmount: CurrencyAmount;
  //   }
  // >(
  //   mixedRouteAmounts as MixedRouteWithValidQuote[],
  //   (routeAmount: MixedRouteWithValidQuote) => {
  //     const { route, amount, quote } = routeAmount;

  //     if (tradeType != TradeType.EXACT_INPUT) {
  //       throw new Error(
  //         'Mixed routes are only supported for exact input trades'
  //       );
  //     }

  //     // The route, amount and quote are all in terms of wrapped tokens.
  //     // When constructing the Trade object the inputAmount/outputAmount must
  //     // use native currencies if specified by the user. This is so that the Trade knows to wrap/unwrap.
  //     const amountCurrency = CurrencyAmount.fromFractionalAmount(
  //       tokenInCurrency,
  //       amount.numerator,
  //       amount.denominator
  //     );
  //     const quoteCurrency = CurrencyAmount.fromFractionalAmount(
  //       tokenOutCurrency,
  //       quote.numerator,
  //       quote.denominator
  //     );

  //     const routeRaw = new MixedRouteSDK(
  //       route.pools,
  //       amountCurrency.currency,
  //       quoteCurrency.currency
  //     );

  //     return {
  //       mixedRoute: routeRaw,
  //       inputAmount: amountCurrency,
  //       outputAmount: quoteCurrency,
  //     };
  //   }
  // );

  const trade = new Trade({ v2Routes, tradeType });

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
