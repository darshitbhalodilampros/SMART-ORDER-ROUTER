/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Token } from 'lampros-core';

import {
  DAI_MODE,
  // DAI_ROLLUX_TANENBAUM,
  ITokenProvider,
  USDC_MODE,
  // USDC_ROLLUX_TANENBAUM,
  USDT_MODE,
  // USDT_ROLLUX_TANENBAUM,
} from '../../providers/token-provider';
import { ChainId, WRAPPED_NATIVE_CURRENCY } from '../../util/chains';

type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

export const BASES_TO_CHECK_TRADES_AGAINST = (
  _tokenProvider: ITokenProvider
): ChainTokenList => {
  return {
    [ChainId.MODE]: [
      WRAPPED_NATIVE_CURRENCY[ChainId.MODE]!,
      DAI_MODE,
      USDC_MODE,
      USDT_MODE,
    ],
    // [ChainId.ROLLUX_TANENBAUM]: [
    //   WRAPPED_NATIVE_CURRENCY[ChainId.ROLLUX_TANENBAUM]!,
    //   USDC_ROLLUX_TANENBAUM,
    //   USDT_ROLLUX_TANENBAUM,
    //   DAI_ROLLUX_TANENBAUM,
    // ],
  };
};

// const getBasePairByAddress = async (
//   tokenProvider: ITokenProvider,
//   _chainId: ChainId,
//   fromAddress: string,
//   toAddress: string
// ): Promise<{ [tokenAddress: string]: Token[] }> => {
//   const accessor = await tokenProvider.getTokens([toAddress]);
//   const toToken: Token | undefined = accessor.getTokenByAddress(toAddress);

//   if (!toToken) return {};

//   return {
//     [fromAddress]: [toToken],
//   };
// };

export const ADDITIONAL_BASES = async (
  _tokenProvider: ITokenProvider
): Promise<{
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] };
}> => {
  return {};
};

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES = async (
  _tokenProvider: ITokenProvider
): Promise<{
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] };
}> => {
  return {};
};
