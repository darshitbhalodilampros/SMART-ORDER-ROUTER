import { BigNumber } from '@ethersproject/bignumber';

import { ChainId } from '../../../..';

// Cost for crossing an uninitialized tick.
export const COST_PER_UNINIT_TICK = BigNumber.from(0);

//l2 execution fee on optimism is roughly the same as mainnet
export const BASE_SWAP_COST = (id: ChainId): BigNumber => {
  switch (id) {
    case ChainId.MODE:
      // case ChainId.ROLLUX_TANENBAUM:
      return BigNumber.from(5000);
  }
};
export const COST_PER_INIT_TICK = (id: ChainId): BigNumber => {
  switch (id) {
    case ChainId.MODE:
      // case ChainId.ROLLUX_TANENBAUM:
      return BigNumber.from(31000);
  }
};

export const COST_PER_HOP = (id: ChainId): BigNumber => {
  switch (id) {
    case ChainId.MODE:
      // case ChainId.ROLLUX_TANENBAUM:
      return BigNumber.from(80000);
  }
};
