import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Currency } from 'lampros-core';

import { V3Route } from '../../../router';

// Cost for crossing an uninitialized tick.
export const COST_PER_UNINIT_TICK = BigNumber.from(0);

//l2 execution fee on optimism is roughly the same as mainnet
export const BASE_SWAP_COST = (id: ChainId): BigNumber => {
  switch (id) {
    case ChainId.MODE:
      return BigNumber.from(5000);
  }
};
export const COST_PER_INIT_TICK = (id: ChainId): BigNumber => {
  switch (id) {
    case ChainId.MODE:
      return BigNumber.from(31000);
  }
};

export const COST_PER_HOP = (id: ChainId): BigNumber => {
  switch (id) {
    case ChainId.MODE:
      return BigNumber.from(80000);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SINGLE_HOP_OVERHEAD = (_id: ChainId): BigNumber => {
  return BigNumber.from(15000);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TOKEN_OVERHEAD = (_id: ChainId, _route: V3Route): BigNumber => {
  const overhead = BigNumber.from(0);
  return overhead;
};

// TODO: change per chain
export const NATIVE_WRAP_OVERHEAD = (id: ChainId): BigNumber => {
  switch (id) {
    default:
      return BigNumber.from(27938);
  }
};

export const NATIVE_UNWRAP_OVERHEAD = (id: ChainId): BigNumber => {
  switch (id) {
    default:
      return BigNumber.from(36000);
  }
};

export const NATIVE_OVERHEAD = (
  chainId: ChainId,
  amount: Currency,
  quote: Currency
): BigNumber => {
  if (amount.isNative) {
    // need to wrap eth in
    return NATIVE_WRAP_OVERHEAD(chainId);
  }
  if (quote.isNative) {
    // need to unwrap eth out
    return NATIVE_UNWRAP_OVERHEAD(chainId);
  }
  return BigNumber.from(0);
};
